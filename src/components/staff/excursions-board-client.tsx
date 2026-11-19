"use client";

import { useCallback, useState } from "react";
import { deleteManagedExcursionAction } from "@/actions/excursions";
import {
  ExcursionDialog,
  type ExcursionDialogLabels,
} from "@/components/staff/excursion-dialog";
import type { ExcursionRegion } from "@/lib/content/excursions";
import type { ManagedExcursion } from "@/lib/content/managed-excursion";

type Labels = ExcursionDialogLabels & {
  boardTitle: string;
  empty: string;
  add: string;
  edit: string;
  delete: string;
  routeColumn: string;
  regionColumn: string;
  priceColumn: string;
};

export function ExcursionsBoardClient({
  excursions,
  labels,
}: {
  excursions: ManagedExcursion[];
  labels: Labels;
}) {
  const [dialog, setDialog] = useState<
    { mode: "add"; excursion: null } | { mode: "edit"; excursion: ManagedExcursion } | null
  >(null);

  const closeDialog = useCallback(() => setDialog(null), []);

  const regionLabel = (region: ExcursionRegion) => {
    if (region === "latvia") return labels.regionLatvia;
    if (region === "estonia") return labels.regionEstonia;
    if (region === "lithuania") return labels.regionLithuania;
    if (region === "france") return labels.regionFrance;
    if (region === "belgium") return labels.regionBelgium;
    if (region === "baltics") return labels.regionBaltics;
    return labels.regionGermany;
  };

  const regionsLabel = (regions: ExcursionRegion[]) =>
    regions.length > 0 ? regions.map(regionLabel).join(", ") : "—";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setDialog({ mode: "add", excursion: null })}
          className="rounded-full bg-burgundy px-4 py-2 text-sm font-medium text-staff-on-accent hover:bg-burgundy-deep"
        >
          {labels.add}
        </button>
      </div>

      {excursions.length === 0 ? (
        <p className="rounded-2xl border border-line bg-card px-5 py-6 text-sm text-mist">
          {labels.empty}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-staff-subtle text-mist">
              <tr>
                <th className="px-4 py-3 font-medium">{labels.boardTitle}</th>
                <th className="px-4 py-3 font-medium">{labels.routeColumn}</th>
                <th className="px-4 py-3 font-medium">{labels.regionColumn}</th>
                <th className="px-4 py-3 font-medium">{labels.priceColumn}</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {excursions.map((excursion) => (
                <tr
                  key={excursion.id}
                  className="border-t border-line align-middle hover:bg-staff-hover"
                >
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setDialog({ mode: "edit", excursion })}
                      className="text-left font-medium text-ivory underline-offset-2 hover:underline"
                    >
                      {excursion.title.lv || excursion.title.en}
                    </button>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-mist">
                    {excursion.route.lv || excursion.route.en}
                  </td>
                  <td className="px-4 py-3 text-mist">{regionsLabel(excursion.regions)}</td>
                  <td className="px-4 py-3 text-mist">
                    {excursion.price != null ? `€${excursion.price}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDialog({ mode: "edit", excursion })}
                        aria-label={labels.edit}
                        title={labels.edit}
                        className="grid size-8 place-items-center rounded-md bg-staff-success-solid text-staff-on-accent hover:bg-leaf-deep"
                      >
                        <EditIcon />
                      </button>
                      <form action={deleteManagedExcursionAction}>
                        <input type="hidden" name="id" value={excursion.id} />
                        <button
                          type="submit"
                          aria-label={labels.delete}
                          title={labels.delete}
                          className="grid size-8 place-items-center rounded-md bg-staff-danger-solid text-staff-on-accent hover:bg-burgundy-deep"
                        >
                          <DeleteIcon />
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

      {dialog ? (
        <ExcursionDialog
          mode={dialog.mode}
          excursion={dialog.excursion}
          labels={labels}
          onClose={closeDialog}
        />
      ) : null}
    </div>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden="true" fill="none">
      <path
        d="M3.5 14.5v2h2l8.2-8.2-2-2L3.5 14.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="m11.2 5.8 2 2 1.4-1.4a1.2 1.2 0 0 0 0-1.7l-.3-.3a1.2 1.2 0 0 0-1.7 0L11.2 5.8Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden="true" fill="none">
      <path
        d="M5 6.5h10M8 6.5V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M7 6.5v8a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
