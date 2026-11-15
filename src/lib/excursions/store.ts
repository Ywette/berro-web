import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  normalizeManagedExcursion,
  type ManagedExcursion,
} from "@/lib/content/managed-excursion";
import { excursionSeed } from "@/lib/excursions/seed";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "excursions.json");

async function ensureStore(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.length === 0) {
      await writeFile(STORE_PATH, `${JSON.stringify(excursionSeed, null, 2)}\n`, "utf8");
    }
  } catch {
    await writeFile(STORE_PATH, `${JSON.stringify(excursionSeed, null, 2)}\n`, "utf8");
  }
}

export async function readExcursionStore(): Promise<ManagedExcursion[]> {
  await ensureStore();
  const raw = await readFile(STORE_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...excursionSeed];
    const normalized = parsed
      .map(normalizeManagedExcursion)
      .filter((item): item is ManagedExcursion => item !== null);
    return normalized.length > 0 ? normalized : [...excursionSeed];
  } catch {
    return [...excursionSeed];
  }
}

export async function writeExcursionStore(excursions: ManagedExcursion[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, `${JSON.stringify(excursions, null, 2)}\n`, "utf8");
}

export async function insertManagedExcursion(
  excursion: ManagedExcursion,
): Promise<ManagedExcursion> {
  const excursions = await readExcursionStore();
  excursions.unshift(excursion);
  await writeExcursionStore(excursions);
  return excursion;
}

export async function updateManagedExcursion(
  excursion: ManagedExcursion,
): Promise<ManagedExcursion | null> {
  const excursions = await readExcursionStore();
  const index = excursions.findIndex((item) => item.id === excursion.id);
  if (index < 0) return null;
  excursions[index] = excursion;
  await writeExcursionStore(excursions);
  return excursion;
}

export async function deleteManagedExcursion(id: string): Promise<boolean> {
  const excursions = await readExcursionStore();
  const next = excursions.filter((item) => item.id !== id);
  if (next.length === excursions.length) return false;
  await writeExcursionStore(next);
  return true;
}
