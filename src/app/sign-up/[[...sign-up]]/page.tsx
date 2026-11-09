import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] items-center justify-center px-5 py-16">
      <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-2xl bg-card" />}>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-card border border-white/10 shadow-none",
            },
          }}
        />
      </Suspense>
    </section>
  );
}
