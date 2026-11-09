import { extractPlanFields } from "@/lib/plan-document/extract";
import {
  PlanDocumentReadError,
  readPlanDocumentFile,
} from "@/lib/plan-document/read-file";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "missing", message: "Upload a document file." },
        { status: 400 },
      );
    }

    const text = await readPlanDocumentFile(file);
    if (!text.trim()) {
      return Response.json(
        { error: "empty", message: "The document had no readable text." },
        { status: 422 },
      );
    }

    const result = extractPlanFields(text);
    return Response.json(result);
  } catch (error) {
    if (error instanceof PlanDocumentReadError) {
      const status =
        error.code === "too_large"
          ? 413
          : error.code === "parse_failed" || error.code === "empty"
            ? 422
            : 400;
      return Response.json({ error: error.code, message: error.message }, { status });
    }

    return Response.json(
      {
        error: "parse_failed",
        message: error instanceof Error ? error.message : "Could not read the document.",
      },
      { status: 500 },
    );
  }
}
