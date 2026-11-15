import { Suspense } from "react";
import type { Metadata } from "next";
import { PriceSimulator } from "@/components/pricing/price-simulator";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.staffDashboard.calculation };
}

export default async function StaffCalculationPage() {
  const dictionary = await getDictionary();

  return (
    <Suspense fallback={<p className="text-sm text-mist">{dictionary.drivers.loading}</p>}>
      <PriceSimulator />
    </Suspense>
  );
}
