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
      <p className="rounded-2xl bg-burgundy/15 px-5 py-4 text-sm text-staff-danger" role="alert">
        {message}
      </p>
    );
  }

  return (
    <DocumentsBoardClient
      documents={documents}
      labels={{
        empty: labels.documentsEmpty,
        add: labels.addDocument,
        addTravelLicence: labels.addTravelLicence,
        travelLicenceTitle: dictionary.excursions.tourOperatorLicence,
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
  );
}
