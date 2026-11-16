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
          className="rounded-full bg-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-burgundy-deep"
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
            <thead className="bg-white/5 text-mist">
              <tr>
                <th className="px-4 py-3 font-medium">{labels.boardTitle}</th>
                <th className="px-4 py-3 font-medium">{labels.routeColumn}</th>
                <th className="px-4 py-3 font-medium">{labels.regionColumn}</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {excursions.map((excursion) => (
                <tr
                  key={excursion.id}
                  className="border-t border-line align-middle hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setDialog({ mode: "edit", excursion })}
                      className="text-left font-medium text-ivory underline-offset-2 hover:underline"
                    >
                      {excursion.title}
                    </button>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-mist">{excursion.route}</td>
                  <td className="px-4 py-3 text-mist">{regionsLabel(excursion.regions)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDialog({ mode: "edit", excursion })}
                        className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-ivory/85 hover:border-white/40"
                      >
                        {labels.edit}
                      </button>
                      <form action={deleteManagedExcursionAction}>
                        <input type="hidden" name="id" value={excursion.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-rose-400/30 px-3 py-1.5 text-xs text-rose-200 hover:border-rose-300/50"
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
