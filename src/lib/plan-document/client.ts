import type { ExtractedPlanFields, PlanDocumentResult } from "@/lib/plan-document/types";

export type PlanDocumentApiError = {
  error?: string;
  message?: string;
};

export async function parsePlanDocument(
  file: File,
  locale: "en" | "lv" = "lv",
): Promise<PlanDocumentResult> {
  const body = new FormData();
  body.set("file", file);
  body.set("locale", locale);

  const response = await fetch("/api/plan-document", {
    method: "POST",
    body,
  });

  const data = (await response.json()) as PlanDocumentResult & PlanDocumentApiError;

  if (!response.ok) {
    const error = new Error(data.message || "Could not read the document.") as Error & {
      code?: string;
    };
    error.code = data.error;
    throw error;
  }

  return {
    fields: data.fields ?? {},
    text: data.text ?? "",
    warnings: data.warnings ?? [],
    summary: data.summary ?? "",
    source: "ai",
  };
}

export function nearestPassengerOption(value: number, options: number[] = [1, 4, 8, 14, 20, 36, 56]) {
  return options.reduce((best, option) =>
    Math.abs(option - value) < Math.abs(best - value) ? option : best,
  );
}

export function hasExtractedFields(fields: ExtractedPlanFields) {
  return Boolean(
    fields.trip ||
      fields.name ||
      fields.email ||
      fields.phone ||
      fields.pickup ||
      fields.dropoff ||
      fields.departure ||
      fields.returnAt ||
      fields.pickupDate ||
      fields.passengers ||
      fields.travelPlan,
  );
}
