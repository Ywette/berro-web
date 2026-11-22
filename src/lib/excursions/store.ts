import {
  normalizeManagedExcursion,
  type ManagedExcursion,
} from "@/lib/content/managed-excursion";
import { readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import { excursionSeed } from "@/lib/excursions/seed";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { pickLocalizedText } from "@/lib/i18n/localized-content";
import { deleteCompanyDocumentFile } from "@/lib/documents/upload";
import {
  excursionFromRow,
  excursionToRow,
  type ExcursionRow,
} from "@/lib/supabase/excursion-map";

const STORE_FILE = "excursions.json";
const TABLE = "excursions";

async function readExcursionFileFallback(): Promise<ManagedExcursion[]> {
  const raw = await readJsonFile(STORE_FILE);
  if (!raw) return [...excursionSeed];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...excursionSeed];
    if (parsed.length === 0) return [...excursionSeed];
    const normalized = parsed
      .map(normalizeManagedExcursion)
      .filter((item): item is ManagedExcursion => item !== null);
    return normalized.length > 0 ? normalized : [...excursionSeed];
  } catch {
    return [...excursionSeed];
  }
}

export async function readExcursionStore(): Promise<ManagedExcursion[]> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return readExcursionFileFallback();

  const { data, error } = await supabase.from(TABLE).select("*");

  if (error) {
    console.error("[excursions] supabase read failed", error.message);
    return readExcursionFileFallback();
  }

  const rows = (data ?? []) as ExcursionRow[];
  return rows
    .map(excursionFromRow)
    .sort((a, b) =>
      pickLocalizedText(a.title, "lv").localeCompare(pickLocalizedText(b.title, "lv"), "lv"),
    );
}

export async function writeExcursionStore(excursions: ManagedExcursion[]): Promise<void> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    await writeJsonFile(STORE_FILE, `${JSON.stringify(excursions, null, 2)}\n`);
    return;
  }

  const { error: deleteError } = await supabase.from(TABLE).delete().neq("id", "__never__");
  if (deleteError) throw new Error(deleteError.message);

  if (excursions.length === 0) return;
  const { error } = await supabase.from(TABLE).insert(excursions.map(excursionToRow));
  if (error) throw new Error(error.message);
}

export async function insertManagedExcursion(
  excursion: ManagedExcursion,
): Promise<ManagedExcursion> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    const excursions = await readExcursionFileFallback();
    excursions.unshift(excursion);
    await writeJsonFile(STORE_FILE, `${JSON.stringify(excursions, null, 2)}\n`);
    return excursion;
  }

  const { error } = await supabase.from(TABLE).upsert(excursionToRow(excursion), {
    onConflict: "id",
  });
  if (error) throw new Error(error.message);
  return excursion;
}

export async function updateManagedExcursion(
  excursion: ManagedExcursion,
  previousDocumentPath?: string,
): Promise<ManagedExcursion | null> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    const excursions = await readExcursionFileFallback();
    const index = excursions.findIndex((item) => item.id === excursion.id);
    if (index < 0) return null;
    excursions[index] = {
      ...excursion,
      descriptionDocument: excursion.descriptionDocument === undefined
        ? excursions[index].descriptionDocument
        : excursion.descriptionDocument,
    };
    await writeJsonFile(STORE_FILE, `${JSON.stringify(excursions, null, 2)}\n`);
    return excursions[index];
  }

  let query = supabase
    .from(TABLE)
    .update({ ...excursionToRow(excursion), updated_at: new Date().toISOString() })
    .eq("id", excursion.id);
  if (excursion.descriptionDocument !== undefined) {
    query = previousDocumentPath
      ? query.eq("description_document->>filePath", previousDocumentPath)
      : query.is("description_document", null);
  }
  const { data, error } = await query.select("*").maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return excursionFromRow(data as ExcursionRow);
}

export async function deleteManagedExcursion(id: string): Promise<boolean> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    const excursions = await readExcursionFileFallback();
    const next = excursions.filter((item) => item.id !== id);
    if (next.length === excursions.length) return false;
    await writeJsonFile(STORE_FILE, `${JSON.stringify(next, null, 2)}\n`);
    return true;
  }

  const { data, error } = await supabase.from(TABLE).delete().eq("id", id).select("*").maybeSingle();
  if (error) throw new Error(error.message);
  const file = (data as ExcursionRow | null)?.description_document;
  if (file) await deleteCompanyDocumentFile(file.filePath);
  return data !== null;
}
