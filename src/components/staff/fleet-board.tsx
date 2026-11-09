import { listVehicles } from "@/lib/data/vehicles";
import { formatPostDate } from "@/lib/content/format-date";
import { getDictionary, getLocale } from "@/lib/i18n/get-dictionary";
import { hasSupabaseStaffEnv } from "@/lib/supabase/staff";
import { dateExpiryState, vehicleReadiness } from "@/types/dashboard";

export async function FleetBoard() {
  const [dictionary, locale] = await Promise.all([getDictionary(), getLocale()]);
  let vehicles;

  try {
    vehicles = await listVehicles();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : dictionary.staffDashboard.fleetLoadError;
    return (
      <p className="rounded-2xl bg-burgundy/15 px-5 py-4 text-sm text-rose-200" role="alert">
        {message}
      </p>
    );
  }

  const readinessLabel = {
    ready: dictionary.staffDashboard.readinessReady,
    attention: dictionary.staffDashboard.readinessAttention,
    blocked: dictionary.staffDashboard.readinessBlocked,
  } as const;

  const readinessTone = {
    ready: "bg-pine/15 text-pine",
    attention: "bg-burgundy/20 text-rose-200",
    blocked: "bg-white/8 text-mist",
  } as const;

  return (
    <div className="space-y-4">
      {!hasSupabaseStaffEnv() ? (
        <p className="rounded-2xl border border-line bg-card px-4 py-3 text-xs text-mist">
          {dictionary.staffDashboard.demoNote}
        </p>
      ) : null}

      {vehicles.length === 0 ? (
        <p className="rounded-2xl border border-line bg-card px-5 py-6 text-sm text-mist">
          {dictionary.staffDashboard.fleetEmpty}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-white/5 text-mist">
              <tr>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.fleetTitle}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.plate}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.capacity}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.insurance}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.inspection}</th>
                <th className="px-4 py-3 font-medium">{dictionary.staffDashboard.readiness}</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => {
                const readiness = vehicleReadiness(
                  vehicle.insuranceExpiresOn,
                  vehicle.inspectionExpiresOn,
                );
                const insuranceState = dateExpiryState(vehicle.insuranceExpiresOn);
                const inspectionState = dateExpiryState(vehicle.inspectionExpiresOn);

                return (
                  <tr key={vehicle.id} className="border-t border-line align-middle">
                    <td className="px-4 py-3 font-medium text-ivory">{vehicle.name}</td>
                    <td className="px-4 py-3 text-mist">{vehicle.plate ?? "—"}</td>
                    <td className="px-4 py-3 text-mist">
                      {vehicle.passengers} {dictionary.fleet.passengers.toLowerCase()}
                    </td>
                    <td className="px-4 py-3">
                      <ExpiryDate
                        value={vehicle.insuranceExpiresOn}
                        state={insuranceState}
                        locale={locale}
                        emptyLabel={dictionary.staffDashboard.noExpiry}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ExpiryDate
                        value={vehicle.inspectionExpiresOn}
                        state={inspectionState}
                        locale={locale}
                        emptyLabel={dictionary.staffDashboard.noExpiry}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs ${readinessTone[readiness]}`}
                      >
                        {readinessLabel[readiness]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
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
  locale: "lv" | "en";
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
