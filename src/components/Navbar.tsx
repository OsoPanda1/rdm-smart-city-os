import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Sparkles, X } from "lucide-react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActiveRoute = (route: string) => location.pathname === route;

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-slate-300/70 bg-gradient-to-r from-slate-100 via-slate-50 to-blue-50/95 shadow-[0_10px_35px_-24px_rgba(37,99,235,0.55)] backdrop-blur-xl">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(115deg,rgba(148,163,184,0.22),rgba(191,219,254,0.2)_38%,rgba(226,232,240,0.36)_72%,rgba(59,130,246,0.12))]" />

      <div className="container relative mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm tracking-[0.2em] uppercase text-slate-800"
          onClick={() => setMobileOpen(false)}
        >
          <Sparkles className="h-4 w-4 text-blue-700" />
          TAMV Nexus
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm transition-colors",
                isActiveRoute(item.to)
                  ? "bg-gradient-to-r from-slate-800 via-slate-700 to-blue-700 text-slate-50 shadow-sm shadow-blue-900/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-slate-300/55 hover:to-blue-200/45",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-400/60 bg-slate-100/80 text-slate-700 hover:text-slate-900 hover:border-blue-400/60 transition-colors"
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-300/80 bg-gradient-to-b from-slate-100/95 to-blue-50/95 px-4 pb-5 pt-3 backdrop-blur-xl">
          <nav className="flex flex-col gap-1">
            {links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm transition-colors",
                  isActiveRoute(item.to)
                    ? "bg-gradient-to-r from-slate-800 via-slate-700 to-blue-700 text-slate-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60",
                )}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
