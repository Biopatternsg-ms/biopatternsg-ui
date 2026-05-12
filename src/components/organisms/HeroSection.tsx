import { ArrowRight } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { LoginForm } from "@/components/organisms/LoginForm";

/**
 * HeroSection Organism.
 * Editorial asymmetric layout: 7/5 column split.
 */
const HeroSection = () => (
  <section className="relative px-8 py-20 max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
    {/* Left — Editorial copy */}
    <div className="lg:col-span-7 space-y-8">
      {/* Live badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label text-[10px] uppercase tracking-widest font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
        Live Sequencing Active
      </div>

      {/* Heading — tracking-tighter per Typography rule */}
      <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter text-on-surface leading-[0.9]">
        Decipher the{" "}
        <span className="text-primary">Human</span>{" "}
        Blueprint.
      </h1>

      <p className="text-lg md:text-xl text-on-surface-variant max-w-xl leading-relaxed">
        A high-precision clinical lens for genomic researchers. Streamline
        multi-omics analysis with AI-driven pattern recognition and real-time
        sequencing pipelines.
      </p>

      <div className="flex flex-wrap gap-4 pt-4">
        <Button variant="primary" size="lg" className="shadow-lg hover:shadow-primary-glow">
          Get Started
          <ArrowRight className="w-5 h-5" />
        </Button>
        <Button variant="surface" size="lg">
          View Documentation
        </Button>
      </div>
    </div>

    {/* Right — Login form glassmorphism card */}
    <div className="lg:col-span-5">
      <LoginForm />
    </div>
  </section>
);

export { HeroSection };
