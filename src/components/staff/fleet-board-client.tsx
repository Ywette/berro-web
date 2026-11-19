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
import { normalizeFleetKind } from "@/lib/fleet/kind";
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
          className="rounded-full bg-burgundy px-4 py-2 text-sm font-medium text-staff-on-accent hover:bg-burgundy-deep"
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
            <thead className="bg-staff-subtle text-mist">
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
                const kind = normalizeFleetKind(vehicle.kind);
                const kindLabel =
                  kind === "coach"
                    ? labels.kindCoach
                    : kind === "vip"
                      ? labels.kindVip
                      : kind === "retro"
                        ? labels.kindRetro
                        : labels.kindVan;

                return (
                  <tr
                    key={vehicle.id}
                    className="border-t border-line align-middle hover:bg-staff-hover"
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setDialog({ mode: "edit", vehicle })}
                        className="text-left font-medium text-ivory underline-offset-2 hover:underline"
                      >
                        {vehicle.name.lv || vehicle.name.en}
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
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDialog({ mode: "edit", vehicle })}
                          aria-label={labels.editTransport}
                          title={labels.editTransport}
                          className="grid size-8 place-items-center rounded-md bg-staff-success-solid text-staff-on-accent hover:bg-leaf-deep"
                        >
                          <EditIcon />
                        </button>
                        <form action={deleteFleetTransport}>
                          <input type="hidden" name="id" value={vehicle.id} />
                          <button
                            type="submit"
                            aria-label={labels.deleteTransport}
                            title={labels.deleteTransport}
                            className="grid size-8 place-items-center rounded-md bg-staff-danger-solid text-staff-on-accent hover:bg-burgundy-deep"
                          >
                            <DeleteIcon />
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
      <span className="inline-block border border-staff-danger-line px-1.5 py-0.5 text-staff-danger">
        {label}
      </span>
    );
  }

  if (state === "blocked") {
    return <span className="text-staff-danger line-through">{label}</span>;
  }

  return <span className="text-ivory">{label}</span>;
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
