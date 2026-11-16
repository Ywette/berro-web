import {
  normalizeCompanyDocument,
  type CompanyDocument,
} from "@/lib/content/company-document";
import { readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import { deleteCompanyDocumentFile } from "@/lib/documents/upload";
import {
  companyDocumentFromRow,
  companyDocumentToRow,
  type CompanyDocumentRow,
} from "@/lib/supabase/company-document-map";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

const STORE_FILE = "company-documents.json";
const TABLE = "company_documents";

async function readDocumentFileFallback(): Promise<CompanyDocument[]> {
  const raw = await readJsonFile(STORE_FILE);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeCompanyDocument)
      .filter((item): item is CompanyDocument => item !== null);
  } catch {
    return [];
  }
}

export async function listCompanyDocuments(): Promise<CompanyDocument[]> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return readDocumentFileFallback();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("title", { ascending: true });

  if (error) {
    console.error("[documents] supabase read failed", error.message);
    return readDocumentFileFallback();
  }

  return ((data ?? []) as CompanyDocumentRow[]).map(companyDocumentFromRow);
}

export async function getCompanyDocumentById(id: string): Promise<CompanyDocument | null> {
  const items = await listCompanyDocuments();
  return items.find((item) => item.id === id) ?? null;
}

export async function insertCompanyDocument(
  document: CompanyDocument,
): Promise<CompanyDocument> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    const items = await readDocumentFileFallback();
    items.unshift(document);
    await writeJsonFile(STORE_FILE, `${JSON.stringify(items, null, 2)}\n`);
    return document;
  }

  const { error } = await supabase.from(TABLE).upsert(companyDocumentToRow(document), {
    onConflict: "id",
  });
  if (error) throw new Error(error.message);
  return document;
}

export async function deleteCompanyDocument(id: string): Promise<boolean> {
  const current = await getCompanyDocumentById(id);
  if (!current) return false;

  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    const items = await readDocumentFileFallback();
    const next = items.filter((item) => item.id !== id);
    if (next.length === items.length) return false;
    await writeJsonFile(STORE_FILE, `${JSON.stringify(next, null, 2)}\n`);
    await deleteCompanyDocumentFile(current.filePath);
    return true;
  }

  const { data, error } = await supabase.from(TABLE).delete().eq("id", id).select("id");
  if (error) throw new Error(error.message);
  if ((data?.length ?? 0) === 0) return false;
  await deleteCompanyDocumentFile(current.filePath);
  return true;
}
