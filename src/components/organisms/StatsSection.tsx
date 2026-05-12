import { StatCard } from "@/components/molecules/StatCard";
import { BenefitCard } from "@/components/molecules/BenefitCard";

const stats = [
  { value: "0.02", valueAccent: "ms", accentColor: "text-primary", label: "Processing Latency" },
  { value: "128", valueAccent: "PB", accentColor: "text-tertiary", label: "Storage Capacity" },
  { value: "99.9", valueAccent: "%", accentColor: "text-primary", label: "Platform Uptime" },
  { value: "2.4", valueAccent: "k", accentColor: "text-primary", label: "Research Labs" },
];

const benefits = [
  {
    title: "Integrated Multi-Omics",
    description:
      "Combine genomics, transcriptomics, and proteomics data into a single, unified view for holistic biological insight.",
  },
  {
    title: "Secure Collaboration",
    description:
      "HIPAA-compliant data sharing protocols with granular access controls and federated search capabilities.",
  },
  {
    title: "Real-time Visualization",
    description:
      "Interactive genomic browsers that handle millions of reads without stutter or delay, powered by WebGL.",
  },
];

/**
 * StatsSection Organism.
 * Benefits & stats grid.
 * "No-Line" rule: border-y uses outline-variant/15, not default Tailwind border.
 */
const StatsSection = () => (
  <section className="py-24 px-8 max-w-screen-2xl mx-auto">
    {/* Stats row */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-y border-outline-variant/15 py-12">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>

    {/* Benefits grid */}
    <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
      {benefits.map((benefit) => (
        <BenefitCard key={benefit.title} {...benefit} />
      ))}
    </div>
  </section>
);

export { StatsSection };
