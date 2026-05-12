import { Globe, Terminal } from "lucide-react";

const platformLinks = [
  { label: "Pipeline Management", href: "#" },
  { label: "Cloud Storage", href: "#" },
  { label: "API Reference", href: "#" },
  { label: "Lab Management", href: "#" },
];

const researchLinks = [
  { label: "Case Studies", href: "#" },
  { label: "Whitepapers", href: "#" },
  { label: "Clinical Trials", href: "#" },
  { label: "Open Data", href: "#" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "HIPAA Compliance", href: "#" },
  { label: "Cookie Policy", href: "#" },
];

interface FooterColumnProps {
  heading: string;
  links: Array<{ label: string; href: string }>;
}

const FooterColumn = ({ heading, links }: FooterColumnProps) => (
  <div className="space-y-4">
    <h5 className="font-bold text-white uppercase font-label tracking-widest text-xs">
      {heading}
    </h5>
    <ul className="space-y-2 text-sm text-surface-variant opacity-70">
      {links.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            className="hover:text-white transition-colors"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

/**
 * Footer Organism.
 * Dark surface with "No-Line" rule: border-t at surface-variant/10 opacity.
 */
const Footer = () => (
  <footer className="bg-on-background text-surface py-20 px-8">
    <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      {/* Brand column */}
      <div className="space-y-6">
        <div className="text-3xl font-black tracking-tighter text-white">
          Biopatternsg
        </div>
        <p className="text-sm text-surface-variant opacity-70 leading-relaxed">
          Advancing human longevity through high-precision bioinformatics and
          clinical collaboration.
        </p>
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-surface-variant/20 flex items-center justify-center">
            <Globe className="w-4 h-4 text-surface" />
          </div>
          <div className="w-8 h-8 rounded-full bg-surface-variant/20 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-surface" />
          </div>
        </div>
      </div>

      <FooterColumn heading="Platform" links={platformLinks} />
      <FooterColumn heading="Research" links={researchLinks} />
      <FooterColumn heading="Legal" links={legalLinks} />
    </div>

    {/* Bottom bar — "No-Line" via border-t at 10% opacity */}
    <div className="max-w-screen-2xl mx-auto mt-20 pt-8 border-t border-surface-variant/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-label uppercase tracking-widest opacity-40">
      <p>© 2024 Biopatternsg Research Systems Inc.</p>
      <p>System Status: Optimal</p>
    </div>
  </footer>
);

export { Footer };
