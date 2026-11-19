import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.staffDashboard.calculation };
}

export default async function StaffCalculationPage() {
  const dictionary = await getDictionary();

  return (
    <section className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
      <p className="text-base text-mist sm:text-lg">
        {dictionary.staffDashboard.calculationComingSoon}
      </p>
    </section>
  );
}
