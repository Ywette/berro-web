"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  deleteCompanyDocumentAction,
  saveCompanyDocument,
  type DocumentActionState,
} from "@/actions/documents";
import type { CompanyDocument } from "@/lib/content/company-document";

type Labels = {
  empty: string;
  add: string;
  formTitle: string;
  formDescription: string;
  formDescriptionHint: string;
  formFile: string;
  formFileHint: string;
  save: string;
  saving: string;
  download: string;
  delete: string;
  close: string;
};

const initialState: DocumentActionState = {};

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsBoardClient({
  documents,
  labels,
}: {
  documents: CompanyDocument[];
  labels: Labels;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(saveCompanyDocument, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-burgundy px-4 py-2 text-sm font-medium text-staff-on-accent hover:bg-burgundy-deep"
        >
          {labels.add}
        </button>
      </div>

      {documents.length === 0 ? (
        <p className="rounded-2xl border border-line bg-card px-5 py-6 text-sm text-mist">
          {labels.empty}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-staff-subtle text-mist">
              <tr>
                <th className="px-4 py-3 font-medium">{labels.formTitle}</th>
                <th className="px-4 py-3 font-medium">{labels.formFile}</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr
                  key={document.id}
                  className="border-t border-line align-middle hover:bg-staff-hover"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-ivory">{document.title}</p>
                    {document.description ? (
                      <p className="mt-1 text-xs text-mist">{document.description}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-mist">
                    <p className="truncate">{document.fileName}</p>
                    <p className="mt-1 text-xs">{formatBytes(document.fileSize)}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <a
                        href={`/api/staff/document?id=${encodeURIComponent(document.id)}`}
                        className="rounded-full border border-staff-control px-3 py-1.5 text-xs text-ivory hover:border-staff-focus"
                      >
                        {labels.download}
                      </a>
                      <form action={deleteCompanyDocumentAction}>
                        <input type="hidden" name="id" value={document.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-staff-danger-line px-3 py-1.5 text-xs text-staff-danger hover:border-staff-danger-line"
                        >
                          {labels.delete}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open ? (
        <div
          className="popup-enter-overlay fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-night/85 p-4 sm:p-8"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-dialog-title"
            className="popup-enter my-4 w-full max-w-lg rounded-2xl border border-line bg-card p-5 text-ivory shadow-[0_30px_80px_-24px_rgba(0,0,0,0.9)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="document-dialog-title" className="font-serif text-2xl tracking-wide">
                {labels.add}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={labels.close}
                className="grid h-8 w-8 place-items-center rounded-full text-ivory hover:bg-staff-hover hover:text-ivory"
              >
                ×
              </button>
            </div>

            <form ref={formRef} action={formAction} className="mt-5 grid gap-4">
              <label className="grid gap-1.5 text-[11px] font-medium tracking-wide text-ivory">
                {labels.formTitle}
                <input
                  name="title"
                  required
                  maxLength={160}
                  placeholder="Berro Travel licence"
                  className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ivory outline-none"
                />
              </label>

              <label className="grid gap-1.5 text-[11px] font-medium tracking-wide text-ivory">
                {labels.formDescription}
                <textarea
                  name="description"
                  rows={3}
                  maxLength={500}
                  className="w-full resize-y rounded-lg border border-line bg-card px-3 py-2 text-sm text-ivory outline-none"
                />
                <span className="text-[11px] font-normal text-mist">
                  {labels.formDescriptionHint}
                </span>
              </label>

              <label className="grid gap-1.5 text-[11px] font-medium tracking-wide text-ivory">
                {labels.formFile}
                <input
                  name="file"
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
                  className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ivory outline-none file:mr-3 file:rounded-md file:border-0 file:bg-burgundy file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-staff-on-accent"
                />
                <span className="text-[11px] font-normal text-mist">{labels.formFileHint}</span>
              </label>

              {state.error ? (
                <p role="alert" className="text-xs text-staff-danger">
                  {state.error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-lg bg-burgundy px-4 text-sm font-semibold text-staff-on-accent hover:bg-burgundy-deep disabled:opacity-60"
              >
                {pending ? labels.saving : labels.save}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
