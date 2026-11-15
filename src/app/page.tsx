import { Suspense } from "react";
import { FeedbackSection } from "@/components/landing/feedback-section";
import { FleetSection } from "@/components/landing/fleet-section";
import { HeroBooking } from "@/components/landing/hero-booking";
import { SloganHero } from "@/components/landing/hero-scene";
import { ServicesSection } from "@/components/landing/services-section";
import { StatsSection } from "@/components/landing/stats-section";
import { TrustInfoSection } from "@/components/landing/trust-info-section";

export default function HomePage() {
  return (
    <div>
      <SloganHero>
        <Suspense
          fallback={
            <div className="h-12 w-48 animate-pulse rounded-full bg-white/10" />
          }
        >
          <HeroBooking />
        </Suspense>
      </SloganHero>

      <ServicesSection />

      <TrustInfoSection />

      <FleetSection />

      <StatsSection />

      <FeedbackSection />
    </div>
  );
}
