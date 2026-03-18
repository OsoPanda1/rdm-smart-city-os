import { Link, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/mapa", label: "Mapa" },
  { to: "/eventos", label: "Eventos" },
  { to: "/directorio", label: "Directorio" },
  { to: "/apoya", label: "Apoya" },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm tracking-[0.2em] uppercase text-foreground">
          <Sparkles className="h-4 w-4" />
          TAMV Nexus
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm transition-colors",
                location.pathname === item.to
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/70",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
