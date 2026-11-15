import { insertOrder } from "@/lib/orders/store";
import type { QuoteOrderInput, QuoteTripMode } from "@/lib/orders/session-orders";
import type { StaffOrder } from "@/types/dashboard";

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
  const input: QuoteOrderInput = {
    trip: text(formData, "trip"),
    tripMode:
      tripMode === "oneWay" || tripMode === "roundTrip"
        ? (tripMode as QuoteTripMode)
        : tripMode,
    name: text(formData, "name"),
    company: text(formData, "company"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    heardAbout: text(formData, "heardAbout"),
    heardAboutDetail: text(formData, "heardAboutDetail"),
    travelType: text(formData, "travelType"),
    travelTypeDetail: text(formData, "travelTypeDetail"),
    pickup: text(formData, "pickup"),
    dropoff: text(formData, "dropoff"),
    departure: text(formData, "departure"),
    returnAt: text(formData, "returnAt"),
    passengers: text(formData, "passengers"),
    planDocument: text(formData, "planDocument"),
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
  if (!input.pickup?.trim() || !input.dropoff?.trim()) {
    return { ok: false, error: "Pickup and destination are required." };
  }

  return insertOrder(input, planFile);
}
