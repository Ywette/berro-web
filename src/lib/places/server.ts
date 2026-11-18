import type { Locale } from "@/lib/i18n/dictionary";
import { countryName, findCatalogPlace, placeName, searchCatalog } from "./catalog";
import type { PlaceSuggestion, TripRoute } from "./types";

const googleKey = () => process.env.GOOGLE_MAPS_API_KEY;
const embedKey = () => process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;

const rigaBias = {
  circle: { center: { latitude: 56.9496, longitude: 24.1052 }, radius: 50000 },
};

// Straight-line distance times a typical road detour, used only until Google Routes is connected.
const roadFactor = 1.25;

type Endpoint = { place?: string; label?: string };

type GoogleAutocomplete = {
  suggestions?: {
    placePrediction?: {
      placeId: string;
      text?: { text: string };
      structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } };
    };
  }[];
};

type GoogleRoutes = {
  routes?: { distanceMeters?: number; duration?: string }[];
};

export async function searchPlaces(query: string, locale: Locale): Promise<PlaceSuggestion[]> {
  const key = googleKey();
  if (key && query.trim().length >= 2) {
    const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      signal: AbortSignal.timeout(4500),
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key },
      body: JSON.stringify({ input: query, languageCode: locale, locationBias: rigaBias }),
    }).catch(() => null);
    if (response?.ok) {
      const data = (await response.json()) as GoogleAutocomplete;
      return (data.suggestions ?? []).flatMap(({ placePrediction: p }) =>
        p
          ? [
              {
                id: `google:${p.placeId}`,
                label: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "",
                secondary: p.structuredFormat?.secondaryText?.text ?? "",
              },
            ]
          : [],
      );
    }
  }

  return searchCatalog(query, locale).map((place) => ({
    id: `local:${place.id}`,
    label: placeName(place, locale),
    secondary: countryName(place, locale),
  }));
}

function parsePlace(id: string | undefined) {
  const match = id?.match(/^(local|google):([A-Za-z0-9_.:-]{1,300})$/);
  if (!match) return null;
  return { source: match[1] as "local" | "google", value: match[2] };
}

type Waypoint =
  | { placeId: string }
  | { location: { latLng: { latitude: number; longitude: number } } }
  | { address: string };

function waypoint({ place, label }: Endpoint): Waypoint | null {
  const parsed = parsePlace(place);
  if (parsed?.source === "google") return { placeId: parsed.value };
  const local = parsed ? findCatalogPlace(parsed.value) : null;
  if (local) return { location: { latLng: { latitude: local.lat, longitude: local.lng } } };
  return label ? { address: label } : null;
}

function mapsQuery({ place, label }: Endpoint) {
  const parsed = parsePlace(place);
  const local = parsed?.source === "local" ? findCatalogPlace(parsed.value) : null;
  const text = local ? `${local.name.en}, ${countryName(local, "en")}` : (label ?? "");
  return { text, placeId: parsed?.source === "google" ? parsed.value : null };
}

function mapsLinks(from: Endpoint, to: Endpoint, stops: Endpoint[]) {
  const origin = mapsQuery(from);
  const destination = mapsQuery(to);

  const link = new URLSearchParams({
    api: "1",
    origin: origin.text,
    destination: destination.text,
    travelmode: "driving",
  });
  if (origin.placeId) link.set("origin_place_id", origin.placeId);
  if (destination.placeId) link.set("destination_place_id", destination.placeId);

  const via = stops.map(mapsQuery);
  if (via.length) {
    link.set("waypoints", via.map((point) => point.text).join("|"));
    if (via.every((point) => point.placeId)) {
      link.set("waypoint_place_ids", via.map((point) => point.placeId).join("|"));
    }
  }
  const key = embedKey();
  const embed = key
    ? new URLSearchParams({
        key,
        origin: origin.placeId ? `place_id:${origin.placeId}` : origin.text,
        destination: destination.placeId ? `place_id:${destination.placeId}` : destination.text,
        mode: "driving",
      })
    : null;

  if (embed && via.length) embed.set("waypoints", via.map((p) => p.placeId ? `place_id:${p.placeId}` : p.text).join("|"));
  return {
    mapsUrl: `https://www.google.com/maps/dir/?${link.toString()}`,
    embedUrl: embed ? `https://www.google.com/maps/embed/v1/directions?${embed.toString()}` : null,
  };
}

function straightLineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export async function computeRoute(from: Endpoint, to: Endpoint, locale: Locale, stops: Endpoint[] = []): Promise<TripRoute | null> {
  const origin = waypoint(from);
  const destination = waypoint(to);
  if (!origin || !destination) return null;

  const links = mapsLinks(from, to, stops);
  const intermediates = stops.map(waypoint);
  if (intermediates.length > 25 || intermediates.some((point) => !point)) return null;
  const key = googleKey();

  if (key) {
    const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      signal: AbortSignal.timeout(4500),
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
      },
      body: JSON.stringify({ origin, destination, intermediates, travelMode: "DRIVE", languageCode: locale }),
    }).catch(() => null);
    if (response?.ok) {
      const route = ((await response.json()) as GoogleRoutes).routes?.[0];
      if (route?.distanceMeters) {
        const seconds = Number.parseInt(route.duration ?? "", 10);
        return {
          distanceKm: Math.round(route.distanceMeters / 1000),
          durationMinutes: Number.isFinite(seconds) ? Math.round(seconds / 60) : null,
          estimated: false,
          ...links,
        };
      }
    }
  }

  if (!stops.length && "location" in origin && "location" in destination) {
    const a = origin.location.latLng;
    const b = destination.location.latLng;
    const km = straightLineKm({ lat: a.latitude, lng: a.longitude }, { lat: b.latitude, lng: b.longitude });
    return { distanceKm: Math.round(km * roadFactor), durationMinutes: null, estimated: true, ...links };
  }

  return { distanceKm: null, durationMinutes: null, estimated: false, ...links };
}
