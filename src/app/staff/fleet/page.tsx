import { Suspense } from "react";
import type { Metadata } from "next";
import { FleetBoard } from "@/components/staff/fleet-board";

/** Staff fleet reads cookies + filesystem store; allow blocking until Cache Components migration is complete. */
export const instant = false;

export const metadata: Metadata = {
  title: "Autoparks",
};

export default function StaffFleetPage() {
  return (
    <Suspense fallback={<p className="text-sm text-mist">…</p>}>
      <FleetBoard />
    </Suspense>
  );
}
