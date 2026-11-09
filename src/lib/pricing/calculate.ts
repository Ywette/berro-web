import pricingData from "../../../database/pricing.json";

export const tripTypeNames = ["Local", "Day excursion", "Long excursion"] as const;

export type TripTypeName = (typeof tripTypeNames)[number];

export type QuoteField =
  | "tripType"
  | "busCode"
  | "passengers"
  | "pickupDate"
  | "pickupLocation"
  | "dropoffLocation"
  | "totalDutyHours"
  | "loadedKm"
  | "deadheadKm"
  | "days"
  | "waitingHours"
  | "nightsAway"
  | "guide"
  | "secondDriver"
  | "borderCrossing"
  | "weekendHoliday"
  | "peakSeason"
  | "lastMinute"
  | "tollsParking";

export type RateCard = {
  busCode: string;
  class: string;
  seats: number;
  hourlyRate: number;
  minHours: number;
  dailyRate: number;
  includedKmPerDay: number;
  extraKmRate: number;
  overtimePerHour: number;
  waitingPerHour: number;
};

export type TripTypeSpec = {
  billing: "hourly" | "daily";
  required: QuoteField[];
  optional: QuoteField[];
};

export type QuoteNumbers = {
  tripType: TripTypeName;
  busCode: string;
  passengers: number;
  totalDutyHours: number;
  loadedKm: number;
  deadheadKm: number;
  days: number;
  waitingHours: number;
  nightsAway: number;
  guide: boolean;
  secondDriver: boolean;
  borderCrossing: boolean;
  weekendHoliday: boolean;
  peakSeason: boolean;
  lastMinute: boolean;
  tollsParking: number;
};

export type QuoteResult = {
  seats: number;
  capacityCheck: "OK" | "TOO MANY PAX";
  drivingHoursPerDay: number;
  euDrivingCheck: "OK" | "2 drivers set" | "Needs 2nd driver / extra day";
  billedHours: number;
  baseCharge: number;
  includedKm: number;
  extraKmCharge: number;
  overtimeCharge: number;
  waitingCharge: number;
  deadheadCharge: number;
  busCharges: number;
  upliftPct: number;
  upliftAmount: number;
  driverOvernight: number;
  secondDriver: number;
  guideCost: number;
  borderFee: number;
  tollsParking: number;
  totalExVat: number;
  vat: number;
  totalInclVat: number;
  pricePerPerson: number;
};

type PricingFile = {
  meta: { currency: string; note: string; source: string };
  settings: {
    avgSpeedKmh: number;
    maxDrivingHoursPerDay: number;
    localIncludedKmPerBilledHour: number;
    standardHoursInDailyRate: number;
    deadheadRatePerKm: number;
    driverOvernightAllowancePerNight: number;
    driverHotelPerNight: number;
    secondDriverCostPerDay: number;
    guideCostPerDay: number;
    borderCrossingFee: number;
    weekendHolidayUplift: number;
    peakSeasonUplift: number;
    lastMinuteUplift: number;
    vat: number;
  };
  rateCard: RateCard[];
  pricingRules: Record<string, string>;
  tripTypes: Record<TripTypeName, TripTypeSpec>;
  scenarios: Array<{
    id: string;
    scenario: string;
    inputs: QuoteNumbers;
    result: QuoteResult;
  }>;
};

export const pricing = pricingData as PricingFile;

export function tripSpec(tripType: TripTypeName) {
  return pricing.tripTypes[tripType];
}

export function fieldApplies(tripType: TripTypeName, field: QuoteField) {
  const spec = tripSpec(tripType);
  return spec.required.includes(field) || spec.optional.includes(field);
}

export function rateFor(busCode: string) {
  return pricing.rateCard.find((rate) => rate.busCode === busCode) ?? null;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateQuote(input: QuoteNumbers): QuoteResult | null {
  const rate = rateFor(input.busCode);
  if (!rate || input.passengers <= 0) {
    return null;
  }

  const settings = pricing.settings;
  const spec = tripSpec(input.tripType);
  const days = fieldApplies(input.tripType, "days") ? Math.max(input.days, 1) : 1;
  const waitingHours = fieldApplies(input.tripType, "waitingHours") ? input.waitingHours : 0;
  const nightsAway = fieldApplies(input.tripType, "nightsAway") ? input.nightsAway : 0;
  const guide = fieldApplies(input.tripType, "guide") ? input.guide : false;
  const secondDriver = fieldApplies(input.tripType, "secondDriver")
    ? input.secondDriver
    : false;
  const borderCrossing = fieldApplies(input.tripType, "borderCrossing")
    ? input.borderCrossing
    : false;
  const weekendHoliday = fieldApplies(input.tripType, "weekendHoliday")
    ? input.weekendHoliday
    : false;
  const peakSeason = fieldApplies(input.tripType, "peakSeason") ? input.peakSeason : false;
  const lastMinute = fieldApplies(input.tripType, "lastMinute") ? input.lastMinute : false;
  const tollsParking = fieldApplies(input.tripType, "tollsParking") ? input.tollsParking : 0;

  let billedHours = input.totalDutyHours;
  let baseCharge = 0;
  let includedKm = 0;
  let overtimeCharge = 0;
  let waitingCharge = 0;

  if (spec.billing === "hourly") {
    billedHours = Math.max(input.totalDutyHours, rate.minHours);
    baseCharge = billedHours * rate.hourlyRate;
    includedKm = billedHours * settings.localIncludedKmPerBilledHour;
    waitingCharge = waitingHours * rate.waitingPerHour;
  } else {
    baseCharge = days * rate.dailyRate;
    includedKm = days * rate.includedKmPerDay;
    const overtimeHours = Math.max(
      0,
      input.totalDutyHours - days * settings.standardHoursInDailyRate,
    );
    overtimeCharge = overtimeHours * rate.overtimePerHour;
  }

  const extraKmCharge = Math.max(0, input.loadedKm - includedKm) * rate.extraKmRate;
  const deadheadCharge = input.deadheadKm * settings.deadheadRatePerKm;
  const busCharges = baseCharge + extraKmCharge + overtimeCharge + waitingCharge + deadheadCharge;
  const upliftPct =
    (weekendHoliday ? settings.weekendHolidayUplift : 0) +
    (peakSeason ? settings.peakSeasonUplift : 0) +
    (lastMinute ? settings.lastMinuteUplift : 0);
  const upliftAmount = busCharges * upliftPct;
  const driverOvernight =
    nightsAway *
    (settings.driverOvernightAllowancePerNight + settings.driverHotelPerNight);
  const secondDriverCost = secondDriver ? days * settings.secondDriverCostPerDay : 0;
  const guideCost = guide ? days * settings.guideCostPerDay : 0;
  const borderFee = borderCrossing ? settings.borderCrossingFee : 0;
  const totalExVat =
    busCharges +
    upliftAmount +
    driverOvernight +
    secondDriverCost +
    guideCost +
    borderFee +
    tollsParking;
  const totalInclVat = totalExVat * (1 + settings.vat);
  const drivingHoursPerDay = input.loadedKm / settings.avgSpeedKmh / days;

  let euDrivingCheck: QuoteResult["euDrivingCheck"] = "OK";
  if (drivingHoursPerDay > settings.maxDrivingHoursPerDay) {
    euDrivingCheck = secondDriver ? "2 drivers set" : "Needs 2nd driver / extra day";
  }

  return {
    seats: rate.seats,
    capacityCheck: input.passengers <= rate.seats ? "OK" : "TOO MANY PAX",
    drivingHoursPerDay: round2(drivingHoursPerDay),
    euDrivingCheck,
    billedHours: round2(billedHours),
    baseCharge: round2(baseCharge),
    includedKm: round2(includedKm),
    extraKmCharge: round2(extraKmCharge),
    overtimeCharge: round2(overtimeCharge),
    waitingCharge: round2(waitingCharge),
    deadheadCharge: round2(deadheadCharge),
    busCharges: round2(busCharges),
    upliftPct: round2(upliftPct),
    upliftAmount: round2(upliftAmount),
    driverOvernight: round2(driverOvernight),
    secondDriver: round2(secondDriverCost),
    guideCost: round2(guideCost),
    borderFee: round2(borderFee),
    tollsParking: round2(tollsParking),
    totalExVat: round2(totalExVat),
    vat: round2(totalExVat * settings.vat),
    totalInclVat: round2(totalInclVat),
    pricePerPerson: round2(round2(totalInclVat) / input.passengers),
  };
}
