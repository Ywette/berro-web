"use client";

import { useState, type FormEvent } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
import { calculationTotal } from "@/lib/orders/calculation";
import { saveLocalCalculation } from "@/lib/orders/local-calculations";
import type { OrderCalculation, StaffOrder } from "@/types/dashboard";

export function OrderCalculationForm({ order, onSaved, onLockChange }: {
  order: StaffOrder;
  onSaved: (order: StaffOrder) => void;
  onLockChange: (locked: boolean) => void;
}) {
  const dictionary = useDictionary();
  const labels = dictionary.staffDashboard.orderCalculation;
  const [locked, setLocked] = useState(Boolean(order.calculation));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState<Record<keyof OrderCalculation, string>>(() => {
    const saved = order.calculation;
    return {
      travelMinutes: String(saved?.travelMinutes ?? order.routeEstimate?.durationMinutes ?? ""),
      luggageMinutes: String(saved?.luggageMinutes ?? order.passengerCount * 0.5),
      fuelPrice: saved ? String(saved.fuelPrice) : "",
      kilometres: String(saved?.kilometres ?? order.routeEstimate?.distanceKm ?? ""),
      fuelConsumption: saved ? String(saved.fuelConsumption) : "",
      driverCost: saved ? String(saved.driverCost) : "",
      vehicleCost: saved ? String(saved.vehicleCost) : "",
      extraExpenses: saved ? String(saved.extraExpenses) : "0",
    };
  });
  const entries = Object.values(values);
  const valid = entries.every((value) => value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 1_000_000);
  const numeric = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, Number(value)])) as OrderCalculation;
  const price = valid ? calculationTotal(numeric) : null;
  const fields: Array<[keyof OrderCalculation, string]> = [
    ["travelMinutes", labels.travel], ["luggageMinutes", labels.luggage],
    ["fuelPrice", labels.fuelPrice], ["kilometres", labels.distance],
    ["fuelConsumption", labels.consumption], ["driverCost", labels.driver],
    ["vehicleCost", labels.vehicle], ["extraExpenses", labels.extras],
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
              onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))}
              className="mt-1 block w-full rounded-lg border border-line bg-night p-2 text-ivory disabled:opacity-70" />
          </label>
        ))}
      </fieldset>
      <p className="text-xs text-mist">{labels.formula}</p>
      <p className="font-semibold">{labels.total} {price === null ? "—" : new Intl.NumberFormat(dictionary.locale, { style: "currency", currency: "EUR" }).format(price)}</p>
      {error && <p role="alert" className="text-sm text-rose-200">{error}</p>}
      {locked ? <p role="status" className="text-sm text-mist">{labels.saved}</p> : null}
      {locked && <button type="button" onClick={() => { setLocked(false); onLockChange(false); }} className="rounded-lg border border-line px-4 py-2">{labels.edit}</button>}
    </form>
  );
}
