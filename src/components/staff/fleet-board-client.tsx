"use client";

import { useCallback, useState } from "react";
import { deleteFleetTransport } from "@/actions/fleet";
import {
  FleetTransportDialog,
  type FleetTransportDialogLabels,
} from "@/components/staff/fleet-transport-dialog";
import { countryLabel } from "@/lib/content/countries";
import type { FleetVehicle } from "@/lib/content/fleet";
import { formatPostDate } from "@/lib/content/format-date";
import { formatTransportSeats } from "@/lib/content/transport";
import type { Locale } from "@/lib/i18n/locale";
import { dateExpiryState } from "@/types/dashboard";

type Labels = FleetTransportDialogLabels & {
  passengers: string;
  fleetTitle: string;
  fleetEmpty: string;
  addTransport: string;
  deleteTransport: string;
  editTransport: string;
  noExpiry: string;
};

export function FleetBoardClient({
  vehicles,
  locale,
  labels,
}: {
  vehicles: FleetVehicle[];
  locale: Locale;
  labels: Labels;
}) {
  const [dialog, setDialog] = useState<
    { mode: "add"; vehicle: null } | { mode: "edit"; vehicle: FleetVehicle } | null
  >(null);

  const closeDialog = useCallback(() => setDialog(null), []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setDialog({ mode: "add", vehicle: null })}
          className="rounded-full bg-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-burgundy-deep"
        >
          {labels.addTransport}
        </button>
      </div>

      {vehicles.length === 0 ? (
        <p className="rounded-2xl border border-line bg-card px-5 py-6 text-sm text-mist">
          {labels.fleetEmpty}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-white/5 text-mist">
              <tr>
                <th className="px-4 py-3 font-medium">{labels.fleetTitle}</th>
                <th className="px-4 py-3 font-medium">{labels.kind}</th>
                <th className="px-4 py-3 font-medium">{labels.plate}</th>
                <th className="px-4 py-3 font-medium">{labels.capacity}</th>
                <th className="px-4 py-3 font-medium">{labels.insurance}</th>
                <th className="px-4 py-3 font-medium">{labels.inspection}</th>
                <th className="px-4 py-3 font-medium">{labels.availableIn}</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => {
                const insuranceState = dateExpiryState(vehicle.insuranceExpiresOn);
                const inspectionState = dateExpiryState(vehicle.inspectionExpiresOn);
                const kindLabel =
                  vehicle.kind === "coach"
                    ? labels.kindCoach
                    : vehicle.kind === "vip"
                      ? labels.kindVip
                      : vehicle.kind === "retro"
                        ? labels.kindRetro
                        : labels.kindVan;

                return (
                  <tr
                    key={vehicle.id}
                    className="border-t border-line align-middle hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setDialog({ mode: "edit", vehicle })}
                        className="text-left font-medium text-ivory underline-offset-2 hover:underline"
                      >
                        {vehicle.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-mist">{kindLabel}</td>
                    <td className="px-4 py-3 text-mist">{vehicle.plate ?? "—"}</td>
                    <td className="px-4 py-3 text-mist">
                      {formatTransportSeats(vehicle)} {labels.passengers.toLowerCase()}
                    </td>
                    <td className="px-4 py-3">
                      <ExpiryDate
                        value={vehicle.insuranceExpiresOn}
                        state={insuranceState}
                        locale={locale}
                        emptyLabel={labels.noExpiry}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ExpiryDate
                        value={vehicle.inspectionExpiresOn}
                        state={inspectionState}
                        locale={locale}
                        emptyLabel={labels.noExpiry}
                      />
                    </td>
                    <td className="px-4 py-3 text-mist">
                      {vehicle.availableIn.length > 0
                        ? vehicle.availableIn.map((code) => countryLabel(code, locale)).join(", ")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setDialog({ mode: "edit", vehicle })}
                          className="rounded-md border border-white/15 px-2.5 py-1 text-xs text-ivory/85 hover:border-white/40"
                        >
                          {labels.editTransport}
                        </button>
                        <form action={deleteFleetTransport}>
                          <input type="hidden" name="id" value={vehicle.id} />
                          <button
                            type="submit"
                            className="rounded-md border border-white/15 px-2.5 py-1 text-xs text-mist hover:border-rose-300/50 hover:text-rose-200"
                          >
                            {labels.deleteTransport}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {dialog ? (
        <FleetTransportDialog
          key={dialog.mode === "edit" ? dialog.vehicle.id : "new"}
          mode={dialog.mode}
          vehicle={dialog.vehicle}
          locale={locale}
          labels={labels}
          onClose={closeDialog}
        />
      ) : null}
    </div>
  );
}

function ExpiryDate({
  value,
  state,
  locale,
  emptyLabel,
}: {
  value: string | null;
  state: ReturnType<typeof dateExpiryState>;
  locale: Locale;
  emptyLabel: string;
}) {
  if (!value) {
    return <span className="text-mist">{emptyLabel}</span>;
  }

  const label = formatPostDate(value, locale);

  if (state === "attention") {
    return (
      <span className="inline-block border border-red-500 px-1.5 py-0.5 text-rose-200">
        {label}
      </span>
    );
  }

  if (state === "blocked") {
    return <span className="text-rose-300/90 line-through">{label}</span>;
  }

  return <span className="text-ivory/85">{label}</span>;
}
