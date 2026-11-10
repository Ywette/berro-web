export type PlanTripKind = "One-Way" | "Round Trip" | "Hourly Charter";

export type ExtractedPlanFields = {
  trip?: PlanTripKind;
  name?: string;
  email?: string;
  pickup?: string;
  dropoff?: string;
  departure?: string;
  returnAt?: string;
  pickupDate?: string;
  passengers?: number;
  travelPlan?: string;
};

export type PlanDocumentResult = {
  fields: ExtractedPlanFields;
  text: string;
  warnings: string[];
};
