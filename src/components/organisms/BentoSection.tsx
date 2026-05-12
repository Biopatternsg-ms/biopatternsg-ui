import { Microscope, Dna, FileText, ArrowRight, Expand } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { BentoFeatureCard } from "@/components/molecules/BentoFeatureCard";
import { BentoSideCard } from "@/components/molecules/BentoSideCard";

/**
 * BentoSection Organism.
 * Preview / Analytics Suite section with bento grid layout.
 * "No-Line" rule: bg-surface-container-low for section separation.
 */
const BentoSection = () => (
  <section className="bg-surface-container-low py-24 px-8">
    <div className="max-w-screen-2xl mx-auto">
      {/* Section header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="space-y-4">
          <span className="font-label text-xs font-bold tracking-[0.3em] text-primary uppercase">
            Analytics Suite
          </span>
          <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter">
            Observational Precision
          </h2>
        </div>
        <p className="max-w-md text-on-surface-variant leading-relaxed">
          Visualize complex genomic interactions through our custom-built
          rendering engine, designed for high-density clinical data.
        </p>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[700px]">
        {/* Large feature card — 8 columns */}
        <BentoFeatureCard
          className="md:col-span-8"
          iconBg="bg-primary-fixed"
          icon={<Microscope className="w-5 h-5 text-primary" />}
          title="Sequence Mapping: SP-442"
          subtitle="Active Experiment Portfolio"
          badgesTop={
            <>
              <Badge variant="success">Valid</Badge>
              <Badge variant="neutral">98% Conf.</Badge>
            </>
          }
        >
          {/* Image with overlay */}
          <div className="flex-grow rounded-xl overflow-hidden bg-surface-container relative">
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgQ5oDbigNroxGYspN-u5N6DDJu0yj15jIG9PX29Jtp2kr3WPlKBVwK301oD3mVc48hbzp-YoCgTb_m0qJmxTdzoq320JxHccu6UoSdeLca_yHvyZRFAgWVGIJ7TyQcEsaLcFa9_yulu3Ve5YCui-n2dpApIAPCSVF03FyGlKg1D8-vw3uVUn6FIeRHjzZZ0EXBwkChDgKPNX3a73j4iOvWN1eZ9v52Bf2_E8LRtUmphpdy8SQPbv0udkwtqtRNfTx2L9QNFpUl9UU"
              alt="High-tech digital genomic sequencing dashboard with glowing data nodes and DNA double helix visualizations in cool blue and violet tones"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div className="space-y-1">
                <p className="font-label text-[10px] text-primary font-bold uppercase tracking-[0.2em]">
                  Live Feed
                </p>
                <p className="text-sm font-medium text-on-surface">
                  Protein Folding Pattern Analysis
                </p>
              </div>
              <div className="bg-white rounded-full p-2 shadow-ambient">
                <Expand className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>
        </BentoFeatureCard>

        {/* Right column — 4 columns, 2 rows */}
        <div className="md:col-span-4 grid grid-rows-2 gap-6">
          {/* Variant Discovery */}
          <BentoSideCard
            icon={<Dna className="w-6 h-6" />}
            iconColor="text-tertiary"
            title="Variant Discovery"
            description="Auto-tagging of clinical variants across global databases."
            footer={
              <div className="flex items-center justify-between">
                <span className="font-label text-[10px] uppercase font-bold text-on-surface-variant">
                  42.8k Samples
                </span>
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
            }
          />

          {/* Audit Logs */}
          <BentoSideCard
            icon={<FileText className="w-6 h-6" />}
            iconColor="text-primary"
            title="Audit Logs"
            description="Immutable tracking for every protocol adjustment and peer review."
            className="border-2 border-primary/5"
            footer={
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsrqVbWMCJaDpwW4QL4pMQ87qOzAyIp_bbEVkwGoDhTUJFcB5zDyPvLkrn8zLub-sNfWuGtxcyVaT3wIJgo0H1iXchIB2MHYsDmJX60dGk60gVY-MimHjTqGn965LVqXMh_TOfscrzGtWImbzHflMnIu0Ptd8na6ROaKIT5Ki2JjpTLkn3Zvx-hL0_vWD13Uwaw6xUW9vd0biBseQcDAfJCeH6N8hQfylaKcLgvzKWEJJSqKrf3lnWgXDoI5TOh_k29fH63JKLtX7J"
                    alt="Portrait of a female medical professional in lab coat"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white overflow-hidden -ml-4">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD30huXHh9ZNV5QdlhOn8s3aQFmkbUnZdAJl4VXjzNu_WVdKolzpvl9sRMNHfF3EC1dL61FGMmTHCcf15g-KEG-js2jBJpwRdaZ0ydbuxHOdvS_ZyQfpaSlmlMXft5e3SQJb8n_KKdIyeSLyZbqOW6PG-DBLiFMvUk5TrJ-NAZF7NB0EdFgDPjMDZFSsDjHJSR1LaEBWFyB79PY52ef32qZcyFeVVl07ti4WaAp-AvkmRISWXBcVAyV0zO8zd4r9cnvS4Z_nlWN2IKg"
                    alt="Portrait of a male doctor with glasses"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary-fixed border-2 border-white flex items-center justify-center text-[10px] font-bold text-primary -ml-4">
                  +12
                </div>
              </div>
            }
          />
        </div>
      </div>
    </div>
  </section>
);

export { BentoSection };
