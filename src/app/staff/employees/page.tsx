import { Suspense } from "react";
import type { Metadata } from "next";
import { EmployeesPanel } from "@/components/staff/employees-panel";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.staffDashboard.employeesTitle };
}

export default async function StaffEmployeesPage() {
  const dictionary = await getDictionary();

  return (
    <Suspense fallback={<p className="text-sm text-mist">{dictionary.employees.loading}</p>}>
      <EmployeesPanel />
    </Suspense>
  );
}
