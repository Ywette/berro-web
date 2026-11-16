import { DocumentsBoardClient } from "@/components/staff/documents-board-client";
import { listCompanyDocuments } from "@/lib/documents/store";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function DocumentsBoard() {
  const dictionary = await getDictionary();
  const labels = dictionary.staffDashboard;

  let documents;
  try {
    documents = await listCompanyDocuments();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : labels.documentsLoadError;
    return (
      <p className="rounded-2xl bg-burgundy/15 px-5 py-4 text-sm text-rose-200" role="alert">
        {message}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-medium text-ivory">{labels.documentsTitle}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-mist">{labels.documentsBody}</p>
      </div>
      <DocumentsBoardClient
        documents={documents}
        labels={{
          title: labels.documentsTitle,
          body: labels.documentsBody,
          empty: labels.documentsEmpty,
          add: labels.addDocument,
          formTitle: labels.documentFormTitle,
          formDescription: labels.documentFormDescription,
          formDescriptionHint: labels.documentFormDescriptionHint,
          formFile: labels.documentFormFile,
          formFileHint: labels.documentFormFileHint,
          save: labels.saveDocument,
          saving: labels.savingDocument,
          download: labels.downloadDocument,
          delete: labels.deleteDocument,
          close: labels.documentFormClose,
        }}
      />
    </div>
  );
}
