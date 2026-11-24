import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { HeartHandshake, LogOut, Menu, ShoppingCart, UserRound, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { signOut } from "../data/repository";
import { cn } from "../lib/cn";
import { iniciales } from "../lib/format";
import { Button, buttonClass } from "./ui";

const enlaces = [
  { to: "/", texto: "Inicio", end: true },
  { to: "/propiedades", texto: "Catálogo" },
  { to: "/recomendador", texto: "Recomendador" },
];

function enlaceClass({ isActive }) {
  return cn(
    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-ink"
  );
}

export function Navbar() {
  const { user, cartCount, loading, refresh } = useApp();
  const [abierto, setAbierto] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const cerrar = async () => {
    try {
      await signOut();
      await refresh();
      navigate("/");
    } catch {
      navigate("/");
    }
  };

  const cerrarMenu = () => setAbierto(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-brand-700" onClick={cerrarMenu}>
          <HeartHandshake className="h-6 w-6" aria-hidden="true" />
          <span className="text-base sm:text-lg">Inmuebles<span className="text-mint-600"> IA</span></span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
          {enlaces.map((enlace) => (
            <NavLink key={enlace.to} to={enlace.to} end={enlace.end} className={enlaceClass}>
              {enlace.texto}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/carrito"
            aria-label={`Carrito, ${cartCount} ${cartCount === 1 ? "inmueble" : "inmuebles"}`}
            className={cn(
              "relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium",
              location.pathname === "/carrito" ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Carrito</span>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-mint-600 px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {!loading && (user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/perfil"
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-medium hover:bg-slate-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {iniciales(user.nombre)}
                </span>
                <span className="max-w-24 truncate">{user.nombre}</span>
              </Link>
              <Button variant="ghost" onClick={cerrar} aria-label="Cerrar sesión" title="Cerrar sesión" className="px-2">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link to="/login" className={buttonClass("primary", "hidden sm:inline-flex")}>
              Ingresar
            </Link>
          ))}

          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          >
            {abierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {abierto && (
        <nav className="border-t bg-white px-4 py-3 md:hidden" aria-label="Navegación móvil">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {enlaces.map((enlace) => (
              <NavLink key={enlace.to} to={enlace.to} end={enlace.end} className={enlaceClass} onClick={cerrarMenu}>
                {enlace.texto}
              </NavLink>
            ))}
            <NavLink to="/carrito" className={enlaceClass} onClick={cerrarMenu}>
              Carrito ({cartCount})
            </NavLink>
            {user ? (
              <>
                <NavLink to="/perfil" className={enlaceClass} onClick={cerrarMenu}>
                  <span className="inline-flex items-center gap-2"><UserRound className="h-4 w-4" /> Mi perfil</span>
                </NavLink>
                <button type="button" onClick={cerrar} className="btn-ghost justify-start">
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
              </>
            ) : (
              <NavLink to="/login" className={enlaceClass} onClick={cerrarMenu}>Ingresar</NavLink>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
