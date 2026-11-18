"use client";

import { useDictionary } from "@/components/i18n/locale-provider";
import type { FleetVehicle } from "@/lib/content/fleet";
import { intlLocales } from "@/lib/i18n/locale";
import { formatTravelTypeLabel } from "@/lib/quote-travel-types";
import { vehicleLabel } from "@/lib/staff/availability";
import type { StaffOrder } from "@/types/dashboard";

/** Read-only order details: route, dates, customer, assignments and price. */
export function OrderSummary({ order, vehicle }: { order: StaffOrder; vehicle?: FleetVehicle }) {
  const dictionary = useDictionary();
  const staff = dictionary.staffDashboard;
  const estimate = order.routeEstimate;
  const priceFormat = new Intl.NumberFormat(intlLocales[dictionary.locale], { style: "currency", currency: "EUR" });

  const details = [
    [staff.orderPrice, order.price != null ? priceFormat.format(order.price) : staff.orderPage.noPriceYet],
    [staff.passengers, order.passengerCount],
    [dictionary.hero.departureDate, order.departureOn],
    [dictionary.hero.returnDate, order.returnOn],
    [dictionary.quote.travelTypeLabel, order.travelType && formatTravelTypeLabel(
      order.travelType, order.travelTypeDetail, dictionary.quote.travelTypeOptions,
    )],
    [staff.requestor, [order.requestorName, order.requestorCompany, order.requestorEmail, order.requestorPhone].filter(Boolean).join("\n")],
    [staff.assignedDriver, order.assignedDriverName ?? staff.unassigned],
    [staff.assignedVehicle, vehicle ? vehicleLabel(vehicle) : order.assignedVehicleId ?? staff.unassigned],
    [dictionary.pricing.planDocument, order.planDocument],
  ] as const;

  return (
    <div className="space-y-5">
      <section>
        <h3 className="text-sm text-mist">{staff.route}</h3>
        <ol className="my-2 list-decimal space-y-1 pl-5">
          {[order.origin, ...(order.stops ?? []).map((stop) => stop.name), order.destination, order.returnTo]
            .filter(Boolean).map((place, index) => <li key={index}>{place}</li>)}
        </ol>
        {estimate && (
          <a href={estimate.mapsUrl} target="_blank" rel="noreferrer" className="text-sm underline">
            Google Maps · {estimate.distanceKm} km{estimate.durationMinutes !== null && ` · ${estimate.durationMinutes} min`}
          </a>
        )}
      </section>
      <dl className="grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
        {details.map(([label, value]) => value != null && value !== "" && (
          <div key={label} className="min-w-0">
            <dt className="text-sm text-mist">{label}</dt>
            <dd className="whitespace-pre-line break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
