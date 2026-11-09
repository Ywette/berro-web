import { Suspense } from "react";
import type { Metadata } from "next";
import { FleetBoard } from "@/components/staff/fleet-board";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.staffDashboard.fleetTitle };
}

export default async function StaffFleetPage() {
  const dictionary = await getDictionary();

  return (
    <Suspense fallback={<p className="text-sm text-mist">{dictionary.drivers.loading}</p>}>
      <FleetBoard />
    </Suspense>
  );
}
