import { Suspense } from "react";
import type { Metadata } from "next";
import { ExcursionsBoard } from "@/components/staff/excursions-board";

/** Staff excursions read cookies + filesystem store. */
export const instant = false;

export const metadata: Metadata = {
  title: "Ekskursijas",
};

export default function StaffExcursionsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-mist">…</p>}>
      <ExcursionsBoard />
    </Suspense>
  );
}
