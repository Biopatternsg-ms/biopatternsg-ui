import { useNavigate, useLocation } from "react-router-dom";
import { NavLink } from "@/components/atoms/NavLink";
import { Button } from "@/components/atoms/Button";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Research", href: "#" },
  { label: "Sequencing", href: "#" },
  { label: "Datasets", href: "#" },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav shadow-nav">
      <div className="flex items-center justify-between px-8 py-4 max-w-screen-2xl mx-auto">
        {/* Logo — behaves as an interactive home trigger */}
        <button
          onClick={() => navigate("/")}
          className="text-2xl font-black tracking-tighter text-primary hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-lg px-1.5"
          aria-label="Ir a la página de inicio"
        >
          Biopatternsg
        </button>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center space-x-8 font-headline tracking-tight font-medium text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              href={item.href}
              active={item.href === "/" && location.pathname === "/"}
              onClick={(e) => {
                if (item.href === "/") {
                  e.preventDefault();
                  navigate("/");
                }
              }}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate("/login")}
          >
            Sign In
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/register")}
          >
            Register
          </Button>
        </div>
      </div>

      {/* "No-Line" separator: bg change instead of border */}
      <div className="bg-surface-container-low h-[1px] w-full" />
    </nav>
  );
};

export { Header };
