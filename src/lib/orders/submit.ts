import {
  isValidContactEmail,
  isValidContactPhone,
  sanitizeContactPhone,
} from "@/lib/contact/validation";
import { insertOrder } from "@/lib/orders/store";
import type { QuoteOrderInput, QuoteTripMode } from "@/lib/orders/session-orders";
import type { StaffOrder } from "@/types/dashboard";
import { getLocale } from "@/lib/i18n/get-dictionary";
import { parseLocale } from "@/lib/i18n/locale";

export type SubmitQuoteOrderState =
  | { ok: true; order: StaffOrder }
  | { ok: false; error: string };

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

export async function submitQuoteOrderFromFormData(
  formData: FormData,
): Promise<SubmitQuoteOrderState> {
  const tripMode = text(formData, "tripMode");
  const rawPhone = text(formData, "phone");
  const phone = sanitizeContactPhone(rawPhone ?? "").trim() || undefined;
  const email = text(formData, "email")?.trim() || undefined;

  const input: QuoteOrderInput = {
    locale: text(formData, "locale") ? parseLocale(text(formData, "locale")) : await getLocale(),
    trip: text(formData, "trip"),
    tripMode:
      tripMode === "oneWay" || tripMode === "roundTrip"
        ? (tripMode as QuoteTripMode)
        : tripMode,
    name: text(formData, "name"),
    company: text(formData, "company"),
    email,
    phone,
    heardAbout: text(formData, "heardAbout"),
    heardAboutDetail: text(formData, "heardAboutDetail"),
    travelType: text(formData, "travelType"),
    travelTypeDetail: text(formData, "travelTypeDetail"),
    pickupPlace: text(formData, "pickupPlace"),
    dropoffPlace: text(formData, "dropoffPlace"),
    pickup: text(formData, "pickup"),
    dropoff: text(formData, "dropoff"),
    departure: text(formData, "departure"),
    returnAt: text(formData, "returnAt"),
    passengers: text(formData, "passengers"),
    planDocument: text(formData, "planDocument"),
    excursionSlug: text(formData, "excursionSlug"),
    excursionTitle: text(formData, "excursionTitle"),
    stops: text(formData, "stops"),
    otherWaitingMinutes: text(formData, "otherWaitingMinutes"),
    waitingMinutes: text(formData, "waitingMinutes"),
  };

  const fileValue = formData.get("planFile");
  const planFile = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;

  const passengers = Number(input.passengers ?? "");
  if (!Number.isFinite(passengers) || passengers < 1) {
    return { ok: false, error: "Passenger count is required." };
  }
  if (!input.pickup?.trim() && !input.dropoff?.trim()) {
    return { ok: false, error: "Enter a pickup or destination." };
  }
  if (!email && !phone) {
    return { ok: false, error: "Email or phone is required." };
  }
  if (email && !isValidContactEmail(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (rawPhone?.trim() && !isValidContactPhone(phone ?? "", { required: true })) {
    return { ok: false, error: "Enter a phone number using digits only." };
  }

  return insertOrder(input, planFile);
}
