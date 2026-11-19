import { parseLocale } from "@/lib/i18n/locale";
import { computeRoute } from "@/lib/places/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      from?: string;
      fromPlace?: string;
      to?: string;
      toPlace?: string;
      locale?: string;
      stops?: { label: string; place?: string }[];
    };

    const from = body.from?.trim() ?? "";
    const to = body.to?.trim() ?? "";
    if (!from || !to) {
      return Response.json({ error: "missing", message: "From and to are required." }, { status: 400 });
    }

    const locale = parseLocale(body.locale);
    const stops = body.stops ?? [];
    if (!Array.isArray(stops) || stops.length > 25 || stops.some((stop) =>
      typeof stop?.label !== "string" || !stop.label.trim() ||
      (stop.place !== undefined && typeof stop.place !== "string"),
    )) {
      return Response.json({ error: "invalid_stops" }, { status: 400 });
    }
    const route = await computeRoute(
      { place: body.fromPlace, label: from },
      { place: body.toPlace, label: to },
      locale,
      stops,
    );

    return Response.json({ route });
  } catch (error) {
    return Response.json(
      {
        error: "route_failed",
        message: error instanceof Error ? error.message : "Could not check the route.",
      },
      { status: 500 },
    );
  }
}
