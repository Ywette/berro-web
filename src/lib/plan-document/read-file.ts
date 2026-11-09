import mammoth from "mammoth";

const maxBytes = 4 * 1024 * 1024;
const allowed = new Set([".txt", ".pdf", ".docx"]);

export type ReadFileErrorCode =
  | "missing"
  | "too_large"
  | "unsupported_type"
  | "legacy_doc"
  | "empty"
  | "parse_failed";

export class PlanDocumentReadError extends Error {
  code: ReadFileErrorCode;

  constructor(code: ReadFileErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export async function readPlanDocumentFile(file: File): Promise<string> {
  if (!file || file.size <= 0) {
    throw new PlanDocumentReadError("missing", "No document uploaded.");
  }
  if (file.size > maxBytes) {
    throw new PlanDocumentReadError("too_large", "Document is larger than 4 MB.");
  }

  const extension = extensionOf(file.name);
  if (extension === ".doc") {
    throw new PlanDocumentReadError(
      "legacy_doc",
      "Legacy .doc is not supported. Use .docx, PDF, or text.",
    );
  }
  if (!allowed.has(extension)) {
    throw new PlanDocumentReadError("unsupported_type", "Use a PDF, Word (.docx), or text file.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (extension === ".txt") {
      return buffer.toString("utf8");
    }
    if (extension === ".docx") {
      const result = await mammoth.extractRawText({ buffer });
      return result.value ?? "";
    }
    return await readPdfText(buffer);
  } catch (error) {
    if (error instanceof PlanDocumentReadError) throw error;
    throw new PlanDocumentReadError(
      "parse_failed",
      error instanceof Error ? error.message : "Could not read the document.",
    );
  }
}

async function readPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const parsed = await parser.getText();
    return parsed.text ?? "";
  } finally {
    await parser.destroy();
  }
}

function extensionOf(name: string) {
  const index = name.lastIndexOf(".");
  return index >= 0 ? name.slice(index).toLowerCase() : "";
}
