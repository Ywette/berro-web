import { extractPlanFieldsWithAi } from "@/lib/plan-document/ai-extract";
import {
  PlanDocumentReadError,
  readPlanDocumentFile,
} from "@/lib/plan-document/read-file";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const locale = form.get("locale") === "en" ? "en" : "lv";

    if (!(file instanceof File)) {
      return Response.json(
        { error: "missing", message: "Upload a document file." },
        { status: 400 },
      );
    }

    const text = await readPlanDocumentFile(file);
    if (!text.trim()) {
      return Response.json(
        {
          error: "empty",
          message:
            locale === "en"
              ? "The document had no readable text."
              : "Dokumentā nebija nolasāma teksta.",
        },
        { status: 422 },
      );
    }

    const ai = await extractPlanFieldsWithAi(text, locale);
    if (ai.status !== "ok") {
      const errorCode =
        ai.status === "missing_key"
          ? "ai_missing_key"
          : ai.detail?.includes("credit_balance") || ai.detail?.includes("429")
            ? "ai_no_credits"
            : "ai_unavailable";
      return Response.json(
        {
          error: errorCode,
          message: aiErrorMessage(errorCode, locale),
          aiStatus: ai.status,
          aiDetail: ai.detail,
        },
        { status: ai.status === "missing_key" ? 503 : 502 },
      );
    }

    return Response.json({
      fields: ai.fields ?? {},
      summary: ai.summary,
      text: text.replace(/\u0000/g, "").trim().slice(0, 20_000),
      warnings: [],
      source: "ai",
    });
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

function aiErrorMessage(code: string, locale: "en" | "lv") {
  if (code === "ai_missing_key" || code === "missing_key") {
    return locale === "en"
      ? "Add OPENAI_API_KEY to the server environment, then try again."
      : "Pievienojiet OPENAI_API_KEY servera vidē un mēģiniet vēlreiz.";
  }
  if (code === "ai_no_credits") {
    return locale === "en"
      ? "OpenAI has no credits left. Add billing credits, then try again."
      : "OpenAI kontā nav kredītu. Pievienojiet līdzekļus un mēģiniet vēlreiz.";
  }
  return locale === "en"
    ? "AI could not read the document. Check the OpenAI key and try again."
    : "AI nevarēja nolasīt dokumentu. Pārbaudiet OpenAI atslēgu un mēģiniet vēlreiz.";
}
