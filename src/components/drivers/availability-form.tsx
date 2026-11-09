"use client";

import { useActionState } from "react";
import {
  updateDriverAvailability,
  type AvailabilityState,
} from "@/actions/availability";
import { useDictionary } from "@/components/i18n/locale-provider";
import { DRIVER_STATUSES, type DriverAvailability } from "@/types/staff";

const initialState: AvailabilityState = {};

export function AvailabilityForm({ drivers }: { drivers: DriverAvailability[] }) {
  const dictionary = useDictionary();
  const [state, action, pending] = useActionState(
    updateDriverAvailability,
    initialState,
  );

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-line bg-card p-5">
      <div>
        <h2 className="text-lg font-semibold">{dictionary.drivers.updateTitle}</h2>
        <p className="mt-1 text-sm text-mist">{dictionary.drivers.updateBody}</p>
      </div>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-ivory/80">{dictionary.drivers.driver}</span>
        <select
          name="employeeId"
          required
          defaultValue=""
          className="h-11 rounded-lg border border-black/5 bg-white px-3 text-sm text-neutral-900"
        >
          <option value="" disabled>
            {dictionary.drivers.choose}
          </option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.fullName}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-ivory/80">{dictionary.drivers.status}</span>
        <select
          name="status"
          required
          defaultValue="available"
          className="h-11 rounded-lg border border-black/5 bg-white px-3 text-sm text-neutral-900"
        >
          {DRIVER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {dictionary.statuses[status]}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-ivory/80">{dictionary.drivers.note}</span>
        <input
          name="note"
          maxLength={240}
          className="h-11 rounded-lg border border-black/5 bg-white px-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-burgundy/30"
        />
      </label>
      {state.error ? (
        <p className="rounded-lg bg-burgundy/15 px-3 py-2 text-sm text-rose-200" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-lg bg-pine/15 px-3 py-2 text-sm text-pine" role="status">
          {state.success}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || drivers.length === 0}
        className="h-11 rounded-lg bg-burgundy text-sm font-medium text-white hover:bg-burgundy-deep disabled:opacity-60"
      >
        {pending ? dictionary.drivers.saving : dictionary.drivers.save}
      </button>
    </form>
  );
}
