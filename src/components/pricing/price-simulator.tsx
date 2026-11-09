"use client";

import { useMemo, useState } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
import {
  calculateQuote,
  fieldApplies,
  pricing,
  tripSpec,
  tripTypeNames,
  type QuoteField,
  type QuoteNumbers,
  type QuoteResult,
} from "@/lib/pricing/calculate";
import type { Dictionary } from "@/lib/i18n/dictionary";

type Draft = QuoteNumbers & {
  pickupDate: string;
  pickupLocation: string;
  dropoffLocation: string;
  travelPlan: string;
};

const requestFields = [
  "passengers",
  "pickupDate",
  "pickupLocation",
  "dropoffLocation",
] as const satisfies readonly QuoteField[];

const fieldClass =
  "h-11 w-full rounded-lg border border-black/5 bg-white px-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-burgundy/30";

const openingSample = pricing.scenarios[0];

export function PriceSimulator() {
  const dictionary = useDictionary();
  const labels = dictionary.pricing.fields;
  const [mode, setMode] = useState<"form" | "plan">("form");
  const [sampleId, setSampleId] = useState(openingSample.id);
  const [draft, setDraft] = useState<Draft>(() => draftFromSample(openingSample.id));

  const spec = tripSpec(draft.tripType);
  const result = useMemo(() => calculateQuote(draft), [draft]);
  const agentFields = [...spec.required, ...spec.optional].filter(
    (field) => field !== "tripType" && !requestFields.includes(field as (typeof requestFields)[number]),
  );
  const missing = missingRequestFields(draft, mode, labels);

  function update(patch: Partial<Draft>) {
    setSampleId("");
    setDraft((current) => ({ ...current, ...patch }));
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <form className="grid gap-5 rounded-2xl border border-white/10 bg-card p-5" onSubmit={(event) => event.preventDefault()}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-full border border-white/10 p-1">
            <ModeButton active={mode === "form"} onClick={() => setMode("form")}>
              {dictionary.pricing.usualForm}
            </ModeButton>
            <ModeButton active={mode === "plan"} onClick={() => setMode("plan")}>
              {dictionary.pricing.travelPlan}
            </ModeButton>
          </div>
          <label className="grid gap-1 text-xs text-mist">
            {dictionary.pricing.loadSample}
            <select
              value={sampleId}
              onChange={(event) => {
                const id = event.target.value;
                setSampleId(id);
                if (id) {
                  setDraft(draftFromSample(id));
                }
              }}
              className={fieldClass}
            >
              <option value="">{dictionary.pricing.customTrip}</option>
              {pricing.scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.id} · {scenario.scenario}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className="grid gap-4">
          <div>
            <h2 className="text-lg font-medium">{dictionary.pricing.requestTitle}</h2>
            <p className="mt-1 text-sm leading-6 text-mist">{dictionary.pricing.requestBody}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tripTypeNames.map((tripType) => (
              <button
                key={tripType}
                type="button"
                onClick={() => update({ tripType })}
                className={
                  draft.tripType === tripType
                    ? "rounded-full bg-burgundy px-3 py-1.5 text-sm text-white"
                    : "rounded-full border border-white/10 px-3 py-1.5 text-sm text-ivory/80"
                }
              >
                {dictionary.tripTypes[tripType]}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              label={labels.passengers}
              required={fieldApplies(draft.tripType, "passengers")}
              min={1}
              step={1}
              value={draft.passengers}
              onChange={(passengers) => update({ passengers })}
            />
            <TextField
              label={labels.pickupDate}
              type="date"
              required={fieldApplies(draft.tripType, "pickupDate")}
              value={draft.pickupDate}
              onChange={(pickupDate) => update({ pickupDate })}
            />
            <TextField
              label={labels.pickupLocation}
              required={fieldApplies(draft.tripType, "pickupLocation")}
              value={draft.pickupLocation}
              onChange={(pickupLocation) => update({ pickupLocation })}
            />
            <TextField
              label={labels.dropoffLocation}
              required={fieldApplies(draft.tripType, "dropoffLocation")}
              value={draft.dropoffLocation}
              onChange={(dropoffLocation) => update({ dropoffLocation })}
            />
          </div>
          {mode === "plan" ? (
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-ivory/80">
                {labels.travelPlan} <RequiredMark />
              </span>
              <textarea
                required
                rows={5}
                value={draft.travelPlan}
                onChange={(event) => update({ travelPlan: event.target.value })}
                placeholder={dictionary.pricing.planPlaceholder}
                className="rounded-lg border border-black/5 bg-white px-3 py-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-burgundy/30"
              />
            </label>
          ) : null}
        </section>

        <section className="grid gap-4 border-t border-white/10 pt-5">
          <div>
            <h2 className="text-lg font-medium">{dictionary.pricing.agentTitle}</h2>
            <p className="mt-1 text-sm leading-6 text-mist">
              {spec.billing === "hourly"
                ? dictionary.pricing.hourlyNote(
                    pricing.rateCard.find((rate) => rate.busCode === draft.busCode)?.minHours ?? 0,
                    pricing.settings.localIncludedKmPerBilledHour,
                  )
                : dictionary.pricing.dailyNote(pricing.settings.standardHoursInDailyRate)}
            </p>
          </div>
          <FieldList title={dictionary.pricing.required} fields={spec.required} />
          <FieldList title={dictionary.pricing.optional} fields={spec.optional} />
          <div className="grid gap-4 sm:grid-cols-2">
            {agentFields.map((field) => (
              <AgentField
                key={field}
                field={field}
                required={spec.required.includes(field)}
                draft={draft}
                onChange={update}
              />
            ))}
          </div>
        </section>
      </form>

      <Proposal draft={draft} mode={mode} result={result} missing={missing} sampleId={sampleId} />
    </div>
  );
}

function Proposal({
  draft,
  mode,
  result,
  missing,
  sampleId,
}: {
  draft: Draft;
  mode: "form" | "plan";
  result: QuoteResult | null;
  missing: string[];
  sampleId: string;
}) {
  const dictionary = useDictionary();
  const sample = pricing.scenarios.find((scenario) => scenario.id === sampleId);

  return (
    <aside className="rounded-2xl border border-white/10 bg-panel p-5 lg:sticky lg:top-24">
      <p className="text-xs tracking-[0.18em] text-burgundy uppercase">{dictionary.pricing.kicker}</p>
      <h2 className="mt-2 font-serif text-3xl tracking-wide">{dictionary.pricing.proposal}</h2>
      <p className="mt-2 text-sm leading-6 text-mist">{dictionary.pricing.intro}</p>

      <dl className="mt-5 grid gap-2 text-sm">
        <Row label={dictionary.pricing.trip} value={dictionary.tripTypes[draft.tripType]} />
        <Row label={dictionary.pricing.bus} value={draft.busCode} />
        <Row label={dictionary.pricing.passengers} value={String(draft.passengers)} />
        {mode === "plan" && draft.travelPlan ? (
          <div>
            <dt className="text-mist">{dictionary.pricing.fields.travelPlan}</dt>
            <dd className="mt-1 whitespace-pre-wrap text-ivory">{draft.travelPlan}</dd>
          </div>
        ) : null}
      </dl>

      {missing.length > 0 ? (
        <p className="mt-4 rounded-xl bg-burgundy/15 px-3 py-2 text-sm text-ivory">
          {dictionary.pricing.stillNeeded(missing.join(", "))}
        </p>
      ) : (
        <p className="mt-4 text-sm text-pine">{dictionary.pricing.ready}</p>
      )}

      {result ? <Breakdown result={result} /> : (
        <p className="mt-4 text-sm text-mist">{dictionary.pricing.chooseBus}</p>
      )}

      {sample && result && matchesSample(result, sample.result) ? (
        <p className="mt-4 text-xs text-mist">{dictionary.pricing.matchesSample(sample.id)}</p>
      ) : null}
    </aside>
  );
}

function Breakdown({ result }: { result: QuoteResult }) {
  const dictionary = useDictionary();
  const euro = new Intl.NumberFormat(dictionary.locale === "lv" ? "lv-LV" : "en-IE", {
    style: "currency",
    currency: "EUR",
  });
  const lines = [
    [dictionary.pricing.base, result.baseCharge],
    [dictionary.pricing.extraKm, result.extraKmCharge],
    [dictionary.pricing.overtime, result.overtimeCharge],
    [dictionary.pricing.waiting, result.waitingCharge],
    [dictionary.pricing.deadhead, result.deadheadCharge],
    [dictionary.pricing.uplift(Math.round(result.upliftPct * 100)), result.upliftAmount],
    [dictionary.pricing.overnight, result.driverOvernight],
    [dictionary.pricing.secondDriver, result.secondDriver],
    [dictionary.pricing.guide, result.guideCost],
    [dictionary.pricing.border, result.borderFee],
    [dictionary.pricing.tolls, result.tollsParking],
  ] as const;

  return (
    <div className="mt-5 border-t border-white/10 pt-4">
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <Check
          ok={result.capacityCheck === "OK"}
          label={dictionary.pricing.seatCheck(dictionary.checks[result.capacityCheck])}
        />
        <Check
          ok={result.euDrivingCheck === "OK" || result.euDrivingCheck === "2 drivers set"}
          label={dictionary.checks[result.euDrivingCheck]}
        />
      </div>
      <p className="text-xs text-mist">
        {dictionary.pricing.billed(result.billedHours, result.includedKm, result.drivingHoursPerDay)}
      </p>
      <ul className="mt-3 grid gap-1.5 text-sm">
        {lines.filter(([, amount]) => amount !== 0).map(([label, amount]) => (
          <li key={label} className="flex justify-between gap-4">
            <span className="text-mist">{label}</span>
            <span>{euro.format(amount)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 grid gap-1 border-t border-white/10 pt-3 text-sm">
        <div className="flex justify-between"><span className="text-mist">{dictionary.pricing.exVat}</span><span>{euro.format(result.totalExVat)}</span></div>
        <div className="flex justify-between"><span className="text-mist">{dictionary.pricing.vat(Math.round(pricing.settings.vat * 100))}</span><span>{euro.format(result.vat)}</span></div>
        <p className="mt-2 flex justify-between text-base font-medium">
          <span>{dictionary.pricing.total}</span>
          <span>{euro.format(result.totalInclVat)}</span>
        </p>
        <p className="flex justify-between text-mist">
          <span>{dictionary.pricing.perPerson}</span>
          <span>{euro.format(result.pricePerPerson)}</span>
        </p>
      </div>
    </div>
  );
}

function AgentField({
  field,
  required,
  draft,
  onChange,
}: {
  field: QuoteField;
  required: boolean;
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
}) {
  const dictionary = useDictionary();
  const labels = dictionary.pricing.fields;

  if (field === "busCode") {
    return (
      <label className="grid gap-1.5 text-sm sm:col-span-2">
        <FieldLabel label={labels.busCode} required={required} />
        <select
          value={draft.busCode}
          onChange={(event) => onChange({ busCode: event.target.value })}
          className={fieldClass}
        >
          {pricing.rateCard.map((rate) => (
            <option key={rate.busCode} value={rate.busCode}>
              {rate.busCode} · {rate.class} · {dictionary.pricing.seats(rate.seats)}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (
    field === "guide" ||
    field === "secondDriver" ||
    field === "borderCrossing" ||
    field === "weekendHoliday" ||
    field === "peakSeason" ||
    field === "lastMinute"
  ) {
    return (
      <label className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-3 text-sm sm:col-span-2">
        <input
          type="checkbox"
          checked={draft[field]}
          onChange={(event) => onChange({ [field]: event.target.checked })}
          className="h-4 w-4 accent-burgundy"
        />
        <span>
          {labels[field]}
          {required ? <RequiredMark /> : null}
        </span>
      </label>
    );
  }

  if (field === "totalDutyHours" || field === "waitingHours" || field === "loadedKm" || field === "deadheadKm" || field === "days" || field === "nightsAway" || field === "tollsParking") {
    const step = field === "tollsParking" || field === "totalDutyHours" || field === "waitingHours" ? 0.5 : 1;
    return (
      <NumberField
        label={labels[field]}
        required={required}
        min={0}
        step={step}
        value={draft[field]}
        onChange={(value) => onChange({ [field]: value })}
      />
    );
  }

  return null;
}

function NumberField({
  label,
  required,
  value,
  min,
  step,
  onChange,
}: {
  label: string;
  required: boolean;
  value: number;
  min: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <FieldLabel label={label} required={required} />
      <input
        type="number"
        required={required}
        min={min}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value))}
        className={fieldClass}
      />
    </label>
  );
}

function TextField({
  label,
  value,
  required,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  required: boolean;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <FieldLabel label={label} required={required} />
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClass}
      />
    </label>
  );
}

function FieldLabel({ label, required }: { label: string; required: boolean }) {
  return (
    <span className="font-medium text-ivory/80">
      {label}
      {required ? <RequiredMark /> : null}
    </span>
  );
}

function RequiredMark() {
  return <span className="text-burgundy"> *</span>;
}

function FieldList({ title, fields }: { title: string; fields: QuoteField[] }) {
  const labels = useDictionary().pricing.fields;

  return (
    <p className="text-xs leading-5 text-mist">
      <span className="text-ivory/80">{title}: </span>
      {fields.map((field) => labels[field]).join(", ")}
    </p>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-burgundy px-3 py-1.5 text-sm text-white"
          : "rounded-full px-3 py-1.5 text-sm text-ivory/70"
      }
    >
      {children}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-mist">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={ok ? "rounded-full bg-pine/15 px-2.5 py-1 text-pine" : "rounded-full bg-burgundy/20 px-2.5 py-1 text-ivory"}>
      {label}
    </span>
  );
}

function draftFromSample(id: string): Draft {
  const scenario = pricing.scenarios.find((item) => item.id === id) ?? openingSample;
  return {
    ...scenario.inputs,
    pickupDate: "2026-06-20",
    pickupLocation: "Riga",
    dropoffLocation: scenario.scenario,
    travelPlan: scenario.scenario,
  };
}

function missingRequestFields(
  draft: Draft,
  mode: "form" | "plan",
  labels: Dictionary["pricing"]["fields"],
) {
  const missing: string[] = [];
  if (!draft.pickupDate) missing.push(labels.pickupDate);
  if (!draft.pickupLocation.trim()) missing.push(labels.pickupLocation);
  if (!draft.dropoffLocation.trim()) missing.push(labels.dropoffLocation);
  if (draft.passengers <= 0) missing.push(labels.passengers);
  if (mode === "plan" && !draft.travelPlan.trim()) missing.push(labels.travelPlan);
  return missing;
}

function matchesSample(actual: QuoteResult, expected: QuoteResult) {
  return (Object.keys(expected) as (keyof QuoteResult)[]).every((key) => {
    const left = actual[key];
    const right = expected[key];
    if (typeof left === "number" && typeof right === "number") {
      return Math.abs(left - right) <= 0.011;
    }
    return left === right;
  });
}
