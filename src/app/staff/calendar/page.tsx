import { Suspense } from "react";
import type { Metadata } from "next";
import { CalendarPanel } from "@/components/staff/calendar-panel";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.staffDashboard.calendar };
}

export default async function StaffCalendarPage() {
  const dictionary = await getDictionary();

  return (
    <Suspense fallback={<p className="text-sm text-mist">{dictionary.employees.loading}</p>}>
      <CalendarPanel />
    </Suspense>
  );
}
