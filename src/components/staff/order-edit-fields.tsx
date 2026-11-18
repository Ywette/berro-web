"use client";

import { useState } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
import { isQuoteTravelType, quoteTravelTypes } from "@/lib/quote-travel-types";
import { ORDER_STATUSES, type StaffOrder } from "@/types/dashboard";

const inputClass = "mt-1 block w-full rounded-lg border border-line bg-night p-2 text-ivory [color-scheme:dark]";

/** Editable order fields shared by the table's edit dialog and the order page. Read them with readOrderEdit. */
export function OrderEditFields({ order, disabled }: { order: StaffOrder; disabled: boolean }) {
  const dictionary = useDictionary();
  const staff = dictionary.staffDashboard;
  const [purpose, setPurpose] = useState(order.travelType ?? "");

  const fields = [
    ["origin", dictionary.pricing.fields.pickupLocation, order.origin, "text"],
    ["destination", dictionary.pricing.fields.dropoffLocation, order.destination, "text"],
    ["departureOn", dictionary.hero.departureDate, order.departureOn, "date"],
    ["returnOn", dictionary.hero.returnDate, order.returnOn, "date"],
    ["passengers", staff.passengers, order.passengerCount, "number"],
    ["price", `${staff.orderPrice} (EUR)`, order.price, "price"],
    ["name", staff.requestor, order.requestorName, "text"],
    ["company", dictionary.hero.companyName, order.requestorCompany, "text"],
    ["email", dictionary.hero.email, order.requestorEmail, "email"],
    ["phone", dictionary.hero.phone, order.requestorPhone, "tel"],
  ] as const;

  return (
    <fieldset disabled={disabled} className="grid gap-3 text-sm sm:grid-cols-2">
      {fields.map(([name, label, value, type]) => (
        <label key={name}>{label}
          <input className={inputClass} name={name} defaultValue={value ?? ""}
            {...(type === "price"
              ? { type: "number", min: 0, step: 0.01, inputMode: "decimal" as const }
              : type === "number"
                ? { type, required: true, min: 1 }
                : { type })} />
        </label>
      ))}
      <label>{staff.state}<select name="status" className={inputClass} defaultValue={order.status}>
        {ORDER_STATUSES.map((status) => <option key={status} value={status}>{staff.orderStates[status]}</option>)}
      </select></label>
      <label>{dictionary.quote.travelTypeLabel}<select className={inputClass} name="travelType" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
        <option value="">—</option>
        {order.travelType && !isQuoteTravelType(order.travelType) && <option>{order.travelType}</option>}
        {quoteTravelTypes.map((type) => <option key={type} value={type}>{dictionary.quote.travelTypeOptions[type]}</option>)}
      </select></label>
      {purpose === "other" && <label>{dictionary.quote.travelTypeOptions.other}<input className={inputClass}
        name="travelTypeDetail" defaultValue={order.travelTypeDetail ?? ""} /></label>}
    </fieldset>
  );
}
