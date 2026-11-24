import { Link } from "react-router-dom";
import { buttonClass } from "../components/ui";

export function NotFound() {
  return (
    <div className="container mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-bold text-brand-600">404</p>
      <h1 className="mt-2 text-3xl font-bold">No encontramos esa página</h1>
      <p className="mt-3 text-sm text-slate-500">Es posible que el enlace haya cambiado durante esta Beta.</p>
      <Link to="/" className={buttonClass("primary", "mt-6")}>Volver al inicio</Link>
    </div>
  );
}
