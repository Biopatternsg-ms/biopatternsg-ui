import { Header } from "@/components/organisms/Header";
import { HeroSection } from "@/components/organisms/HeroSection";
import { BentoSection } from "@/components/organisms/BentoSection";
import { StatsSection } from "@/components/organisms/StatsSection";
import { CTASection } from "@/components/organisms/CTASection";
import { Footer } from "@/components/organisms/Footer";

/**
 * Landing Page — Public module
 * Assembles all organisms into the full page layout.
 *
 * Atomic Design hierarchy used:
 *   Atoms   → Button, Input, Label, Badge, NavLink
 *   Molecules → FormField, StatCard, BentoFeatureCard, BentoSideCard, BenefitCard
 *   Organisms → Header, LoginForm, HeroSection, BentoSection, StatsSection, CTASection, Footer
 */
const Landing = () => (
  <div className="bg-background text-on-background font-body min-h-screen">
    {/* Fixed TopNavBar */}
    <Header />

    {/* Page content — offset for fixed nav */}
    <main className="pt-24">
      {/* 1. Hero: asymmetric layout + glassmorphic login */}
      <HeroSection />

      {/* 2. Bento Grid: Analytics Suite preview */}
      <BentoSection />

      {/* 3. Stats + Benefits */}
      <StatsSection />

      {/* 4. CTA: gradient full-bleed block */}
      <CTASection />
    </main>

    {/* Footer */}
    <Footer />
  </div>
);

export default Landing;
