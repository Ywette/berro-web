import type { CompanyDocument } from "@/lib/content/company-document";

export type CompanyDocumentRow = {
  id: string;
  title: string;
  description: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  created_at: string;
};

export function companyDocumentFromRow(row: CompanyDocumentRow): CompanyDocument {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    fileName: row.file_name,
    filePath: row.file_path,
    mimeType: row.mime_type || "application/octet-stream",
    fileSize: row.file_size ?? 0,
    createdAt: row.created_at,
  };
}

export function companyDocumentToRow(document: CompanyDocument): CompanyDocumentRow {
  return {
    id: document.id,
    title: document.title,
    description: document.description,
    file_name: document.fileName,
    file_path: document.filePath,
    mime_type: document.mimeType,
    file_size: document.fileSize,
    created_at: document.createdAt,
  };
}
