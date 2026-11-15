import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * Local JSON persistence with a Vercel-safe fallback.
 * Serverless runtimes cannot mkdir under process.cwd() (/var/task is read-only),
 * so writes fall back to the OS temp directory when needed.
 */
export function resolveDataPaths(filename: string) {
  const primaryDir = path.join(process.cwd(), "data");
  const fallbackDir = path.join(tmpdir(), "berro-web-data");
  return {
    primaryDir,
    primaryPath: path.join(primaryDir, filename),
    fallbackDir,
    fallbackPath: path.join(fallbackDir, filename),
  };
}

export async function readJsonFile(filename: string): Promise<string | null> {
  const { primaryPath, fallbackPath } = resolveDataPaths(filename);
  for (const filePath of [primaryPath, fallbackPath]) {
    try {
      return await readFile(filePath, "utf8");
    } catch {
      // try next location
    }
  }
  return null;
}

export async function writeJsonFile(filename: string, contents: string): Promise<void> {
  const { primaryDir, primaryPath, fallbackDir, fallbackPath } = resolveDataPaths(filename);

  try {
    await mkdir(primaryDir, { recursive: true });
    await writeFile(primaryPath, contents, "utf8");
    return;
  } catch {
    // Vercel / read-only deploy filesystem — use temp dir for this runtime.
  }

  await mkdir(fallbackDir, { recursive: true });
  await writeFile(fallbackPath, contents, "utf8");
}
