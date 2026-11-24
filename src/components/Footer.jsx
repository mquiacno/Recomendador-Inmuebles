import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200/70 bg-white/60">
      <div className="container mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>Versión Beta · datos ficticios · sin pagos ni compromisos</p>
        <nav className="flex flex-wrap gap-4" aria-label="Enlaces del pie">
          <Link to="/propiedades" className="hover:text-brand-700">Catálogo</Link>
          <Link to="/recomendador" className="hover:text-brand-700">Recomendador</Link>
          <Link to="/perfil" className="hover:text-brand-700">Mi perfil</Link>
        </nav>
      </div>
    </footer>
  );
}
