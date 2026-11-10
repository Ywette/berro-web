export type PlanTripKind = "One-Way" | "Round Trip" | "Hourly Charter";

export type ExtractedPlanStop = {
  name: string;
  waitMinutes?: number;
};

export type ExtractedPlanFields = {
  trip?: PlanTripKind;
  name?: string;
  email?: string;
  phone?: string;
  pickup?: string;
  dropoff?: string;
  departure?: string;
  returnAt?: string;
  pickupDate?: string;
  passengers?: number;
  travelPlan?: string;
  /** Intermediate stops with pause minutes (default 15 when the plan omits a duration). */
  stops?: ExtractedPlanStop[];
  /** Waiting minutes mentioned in the plan that are not tied to a named stop. */
  otherWaitingMinutes?: number;
};

export type PlanDocumentResult = {
  fields: ExtractedPlanFields;
  text: string;
  warnings: string[];
  summary?: string;
  source?: "ai";
};
