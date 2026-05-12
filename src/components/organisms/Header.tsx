import { NavLink } from "@/components/atoms/NavLink";
import { Button } from "@/components/atoms/Button";

const navItems = [
  { label: "Home", href: "#", active: true },
  { label: "Research", href: "#" },
  { label: "Sequencing", href: "#" },
  { label: "Datasets", href: "#" },
];

/**
 * TopNavBar Organism.
 * "Glass & Gradient" rule: backdrop-blur-xl + semi-transparent bg.
 * "No-Line" rule: separator done via a surface-colored 1px div (not border util).
 */
const Header = () => (
  <nav className="fixed top-0 w-full z-50 glass-nav shadow-nav">
    <div className="flex items-center justify-between px-8 py-4 max-w-screen-2xl mx-auto">
      {/* Logo */}
      <div className="text-2xl font-black tracking-tighter text-primary">
        Biopatternsg
      </div>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center space-x-8 font-headline tracking-tight font-medium text-sm">
        {navItems.map((item) => (
          <NavLink key={item.label} href={item.href} active={item.active}>
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="md">
          Sign In
        </Button>
        <Button variant="primary" size="md">
          Register
        </Button>
      </div>
    </div>

    {/* "No-Line" separator: bg change instead of border */}
    <div className="bg-surface-container-low h-[1px] w-full" />
  </nav>
);

export { Header };
