export type CompanyDocument = {
  id: string;
  title: string;
  description: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
};

export function normalizeCompanyDocument(raw: unknown): CompanyDocument | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = typeof item.id === "string" ? item.id : "";
  const title = typeof item.title === "string" ? item.title : "";
  const fileName = typeof item.fileName === "string" ? item.fileName : "";
  const filePath = typeof item.filePath === "string" ? item.filePath : "";
  if (!id || !title || !fileName || !filePath) return null;

  return {
    id,
    title,
    description: typeof item.description === "string" ? item.description : "",
    fileName,
    filePath,
    mimeType:
      typeof item.mimeType === "string" && item.mimeType
        ? item.mimeType
        : "application/octet-stream",
    fileSize:
      typeof item.fileSize === "number" && Number.isFinite(item.fileSize)
        ? Math.max(0, Math.round(item.fileSize))
        : 0,
    createdAt:
      typeof item.createdAt === "string" && item.createdAt
        ? item.createdAt
        : new Date().toISOString(),
  };
}
