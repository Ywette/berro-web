import { Suspense } from "react";
import type { Metadata } from "next";
import { EmployeeTable } from "@/components/employees/employee-table";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.employees.title };
}

export default async function EmployeesPage() {
  const dictionary = await getDictionary();

  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-8">
        <p className="text-xs tracking-[0.22em] text-burgundy uppercase">{dictionary.nav.members}</p>
        <h1 className="mt-3 font-serif text-5xl tracking-wide">{dictionary.employees.title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-mist">{dictionary.employees.body}</p>
      </div>
      <Suspense fallback={<p className="text-sm text-mist">{dictionary.employees.loading}</p>}>
        <EmployeeTable />
      </Suspense>
    </section>
  );
}
