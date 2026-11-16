import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export const COMPANY_DOCUMENTS_BUCKET = "company-documents";
export const COMPANY_DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
]);

const EXT_BY_TYPE: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "text/plain": "txt",
};

export type CompanyDocumentUploadError = "type" | "size" | "empty" | "config";

export class CompanyDocumentUploadException extends Error {
  constructor(readonly code: CompanyDocumentUploadError) {
    super(code);
  }
}

export type UploadedCompanyFile = {
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
};

async function ensureCompanyDocumentsBucket(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseClient>>,
) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("[documents] list buckets failed", listError.message);
    return { ok: false as const, error: listError.message };
  }
  if (buckets?.some((bucket) => bucket.name === COMPANY_DOCUMENTS_BUCKET)) {
    return { ok: true as const };
  }

  const { error: createError } = await supabase.storage.createBucket(COMPANY_DOCUMENTS_BUCKET, {
    public: false,
    fileSizeLimit: COMPANY_DOCUMENT_MAX_BYTES,
    allowedMimeTypes: [...ALLOWED_TYPES],
  });

  if (createError && !/already exists|duplicate/i.test(createError.message)) {
    console.error("[documents] create bucket failed", createError.message);
    return {
      ok: false as const,
      error:
        "Storage bucket `company-documents` is missing. Run supabase/migrations/011_company_documents.sql in the Supabase SQL Editor.",
    };
  }

  return { ok: true as const };
}

function sanitizeFileName(name: string): string {
  const base = name.replace(/[/\\?%*:|"<>]/g, "-").trim();
  return base.slice(0, 160) || "document";
}

async function saveLocalFallback(file: File): Promise<UploadedCompanyFile> {
  const publicFolder = "documents/uploads";
  const dir = path.join(process.cwd(), "public", publicFolder);
  await mkdir(dir, { recursive: true });
  const ext = EXT_BY_TYPE[file.type] ?? "bin";
  const safeName = sanitizeFileName(file.name);
  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.byteLength === 0) {
    throw new CompanyDocumentUploadException("empty");
  }
  await writeFile(path.join(dir, filename), bytes);
  return {
    fileName: file.name || `document.${ext}`,
    filePath: `/${publicFolder}/${filename}`,
    mimeType: file.type || "application/octet-stream",
    fileSize: bytes.byteLength,
  };
}

export async function uploadCompanyDocumentFile(file: File): Promise<UploadedCompanyFile> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new CompanyDocumentUploadException("type");
  }
  if (file.size > COMPANY_DOCUMENT_MAX_BYTES) {
    throw new CompanyDocumentUploadException("size");
  }
  if (file.size <= 0) {
    throw new CompanyDocumentUploadException("empty");
  }

  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return saveLocalFallback(file);
  }

  const bucket = await ensureCompanyDocumentsBucket(supabase);
  if (!bucket.ok) {
    throw new Error(bucket.error);
  }

  const ext = EXT_BY_TYPE[file.type] ?? "bin";
  const objectPath = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength === 0) {
    throw new CompanyDocumentUploadException("empty");
  }

  const { error } = await supabase.storage.from(COMPANY_DOCUMENTS_BUCKET).upload(objectPath, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("[documents] upload failed", error.message);
    if (/bucket not found/i.test(error.message)) {
      throw new Error(
        "Storage bucket `company-documents` is missing. Run supabase/migrations/011_company_documents.sql in the Supabase SQL Editor.",
      );
    }
    throw new Error(error.message);
  }

  return {
    fileName: file.name || `document.${ext}`,
    filePath: objectPath,
    mimeType: file.type,
    fileSize: buffer.byteLength,
  };
}

export async function createCompanyDocumentSignedUrl(
  filePath: string,
  expiresInSeconds = 60 * 10,
): Promise<string | null> {
  if (filePath.startsWith("/")) {
    return filePath;
  }

  const supabase = createServiceSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from(COMPANY_DOCUMENTS_BUCKET)
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) {
    console.error("[documents] signed url failed", error.message);
    return null;
  }
  return data.signedUrl;
}

export async function deleteCompanyDocumentFile(filePath: string): Promise<void> {
  if (filePath.startsWith("/")) return;

  const supabase = createServiceSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.storage.from(COMPANY_DOCUMENTS_BUCKET).remove([filePath]);
  if (error) {
    console.error("[documents] delete file failed", error.message);
  }
}
