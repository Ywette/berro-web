"use client";

import { useState, type FormEvent } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
import { calculationTotal } from "@/lib/orders/calculation";
import { saveLocalCalculation } from "@/lib/orders/local-calculations";
import type { OrderCalculation, StaffOrder } from "@/types/dashboard";

export function OrderCalculationForm({ order, onSaved, onLockChange, onDirtyChange }: {
  order: StaffOrder;
  onSaved: (order: StaffOrder) => void;
  onLockChange: (locked: boolean) => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const dictionary = useDictionary();
  const labels = dictionary.staffDashboard.orderCalculation;
  const [locked, setLocked] = useState(Boolean(order.calculation));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState<Record<keyof OrderCalculation, string>>(() => {
    const saved = order.calculation;
    const legacy = saved && "fuelPrice" in saved;
    return {
      vehicleCost: legacy ? String(order.price ?? "") : saved ? String(saved.vehicleCost) : "",
      extraExpenses: legacy ? "0" : saved ? String(saved.extraExpenses) : "",
    };
  });
  const entries = Object.values(values);
  const valid = entries.every((value) => value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 1_000_000);
  const numeric = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, Number(value)])) as OrderCalculation;
  const price = valid ? calculationTotal(numeric) : null;
  const fields: Array<[keyof OrderCalculation, string]> = [
    ["vehicleCost", dictionary.staffDashboard.rentalPrice],
    ["extraExpenses", dictionary.staffDashboard.extraServices],
  ];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked || busy) return;
    if (!valid || price === null) { setError(labels.required); return; }
    setBusy(true);
    setError("");
    try {
      saveLocalCalculation(order.id, numeric, price);
      const updated = { ...order, calculation: numeric, price };
      onSaved(updated);
      setLocked(true);
      onLockChange(true);
      onDirtyChange(false);
    } catch {
      setError(dictionary.staffDashboard.orderEdit.failed);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form id="order-calculation-form" onSubmit={submit} className="space-y-4 pt-4">
      <fieldset disabled={locked || busy} className="grid gap-3 sm:grid-cols-2">
        {fields.map(([name, label]) => (
          <label key={name} className="text-sm">{label}
            <input type="number" min="0" max="1000000" step="any" required value={values[name]}
              onChange={(event) => { setValues((current) => ({ ...current, [name]: event.target.value })); onDirtyChange(true); }}
              className="mt-1 block w-full rounded-lg border border-line bg-night p-2 text-ivory disabled:opacity-70" />
          </label>
        ))}
      </fieldset>
      <p className="font-semibold">{labels.total} {price === null ? "—" : new Intl.NumberFormat(dictionary.locale, { style: "currency", currency: "EUR" }).format(price)}</p>
      {error && <p role="alert" className="text-sm text-rose-200">{error}</p>}
      {locked ? <p role="status" className="text-sm text-mist">{labels.saved}</p> : null}
      {locked && <button type="button" onClick={() => { setLocked(false); onLockChange(false); }} className="rounded-lg border border-line px-4 py-2">{labels.edit}</button>}
    </form>
  );
}
