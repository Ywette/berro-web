import { requireUser } from "@/lib/auth/session";
import { listDriverAvailability } from "@/lib/data/drivers";
import { SetupNotice } from "@/components/layout/setup-notice";
import { AvailabilityForm } from "@/components/drivers/availability-form";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { hasSupabaseStaffEnv } from "@/lib/supabase/staff";
import type { DriverStatus } from "@/types/staff";

const statusTone: Record<DriverStatus, string> = {
  available: "bg-pine/15 text-pine",
  on_trip: "bg-burgundy/20 text-rose-200",
  off_duty: "bg-white/8 text-mist",
  unavailable: "bg-white/5 text-ivory/70",
};

export async function AvailabilityBoard() {
  const dictionary = await getDictionary();

  await requireUser();

  if (!hasSupabaseStaffEnv()) {
    return (
      <SetupNotice title={dictionary.drivers.connectTitle} body={dictionary.drivers.connectBody} />
    );
  }

  let drivers;

  try {
    drivers = await listDriverAvailability();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : dictionary.drivers.loadError;
    return (
      <p className="rounded-2xl bg-burgundy/15 px-5 py-4 text-sm text-rose-200" role="alert">
        {message}
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      {drivers.length === 0 ? (
        <p className="rounded-2xl border border-line bg-card px-5 py-6 text-sm text-mist">
          {dictionary.drivers.empty}
        </p>
      ) : (
        <ul className="grid gap-3">
          {drivers.map((driver) => (
            <li
              key={driver.id}
              className="relative rounded-2xl border border-line bg-card px-4 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{driver.fullName}</p>
                  <p className="text-sm text-mist">{driver.phone ?? dictionary.drivers.noPhone}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone[driver.status]}`}
                >
                  {dictionary.statuses[driver.status]}
                </span>
              </div>
              {driver.note ? (
                <p className="mt-3 text-sm text-mist">{driver.note}</p>
              ) : null}
              {driver.updatedAt ? (
                <p className="mt-2 text-xs text-mist">
                  {dictionary.drivers.updated}{" "}
                  {new Date(driver.updatedAt).toLocaleString(dictionary.locale === "lv" ? "lv-LV" : "en-GB")}
                </p>
              ) : (
                <p className="mt-2 text-xs text-mist">{dictionary.drivers.noStatus}</p>
              )}
            </li>
          ))}
        </ul>
      )}
      <AvailabilityForm drivers={drivers} />
    </div>
  );
}
