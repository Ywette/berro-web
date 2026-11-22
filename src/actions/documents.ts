"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import type { CompanyDocument } from "@/lib/content/company-document";
import { deleteCompanyDocument, insertCompanyDocument } from "@/lib/documents/store";
import {
  CompanyDocumentUploadException,
  deleteCompanyDocumentFile,
  uploadCompanyDocumentFile,
} from "@/lib/documents/upload";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export type DocumentActionState = {
  error?: string;
  success?: string;
};

export async function saveCompanyDocument(
  _prev: DocumentActionState,
  formData: FormData,
): Promise<DocumentActionState> {
  await requireUser();
  const dictionary = await getDictionary();
  const labels = dictionary.staffDashboard;

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const fileEntry = formData.get("file");

  if (!title) return { error: labels.documentFormTitleRequired };
  if (typeof File === "undefined" || !(fileEntry instanceof File) || fileEntry.size <= 0) {
    return { error: labels.documentFormFileRequired };
  }

  let uploaded;
  try {
    uploaded = await uploadCompanyDocumentFile(fileEntry, {
      requirePrivateStorage: formData.get("travelLicence") === "on",
    });
  } catch (error) {
    if (error instanceof CompanyDocumentUploadException) {
      if (error.code === "type") return { error: labels.documentFormFileType };
      if (error.code === "size") return { error: labels.documentFormFileSize };
      if (error.code === "config") return { error: labels.documentStorageUnavailable };
      return { error: labels.documentFormFileInvalid };
    }
    console.error("[documents] upload failed", error);
    return { error: labels.documentStorageUnavailable };
  }

  const document: CompanyDocument = {
    id: `document-${crypto.randomUUID()}`,
    title,
    description,
    fileName: uploaded.fileName,
    filePath: uploaded.filePath,
    mimeType: uploaded.mimeType,
    fileSize: uploaded.fileSize,
    createdAt: new Date().toISOString(),
  };

  try {
    await insertCompanyDocument(document);
  } catch (error) {
    await deleteCompanyDocumentFile(document.filePath);
    console.error("[documents] save failed", error);
    return { error: labels.documentStorageUnavailable };
  }
  revalidatePath("/staff/documents");
  return { success: labels.documentFormSaved };
}

export async function deleteCompanyDocumentAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await deleteCompanyDocument(id);
  revalidatePath("/staff/documents");
}
