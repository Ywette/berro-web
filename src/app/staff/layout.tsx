import { Suspense, type ReactNode } from "react";
import { requireUser } from "@/lib/auth/session";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-5 py-12" />}>
      <StaffShell>{children}</StaffShell>
    </Suspense>
  );
}

async function StaffShell({ children }: { children: ReactNode }) {
  await requireUser();

  return <section className="mx-auto max-w-7xl px-5 py-10 sm:py-12">{children}</section>;
}
