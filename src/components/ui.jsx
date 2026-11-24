import { AlertCircle, CheckCircle2, Loader2, SearchX } from "lucide-react";
import { cn } from "../lib/cn";

export function buttonClass(variant = "primary", className = "") {
  const estilos = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    mint: "btn-mint",
    ghost: "btn-ghost",
  };
  return cn(estilos[variant] ?? estilos.primary, className);
}

export function Button({ variant = "primary", className = "", loading = false, children, disabled, ...props }) {
  return (
    <button
      className={buttonClass(variant, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function Input({ className = "", ...props }) {
  return <input className={cn("input", className)} {...props} />;
}

export function Select({ className = "", children, ...props }) {
  return (
    <select className={cn("input", className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className = "", ...props }) {
  return <textarea className={cn("input min-h-[96px] resize-y", className)} {...props} />;
}

export function Label({ children, htmlFor, ...props }) {
  return (
    <label htmlFor={htmlFor} className="label" {...props}>
      {children}
    </label>
  );
}

export function Card({ className = "", children, ...props }) {
  return (
    <div className={cn("card", className)} {...props}>
      {children}
    </div>
  );
}

export function Badge({ children, tone = "brand", className = "" }) {
  const tonos = {
    brand: "bg-brand-100 text-brand-700",
    mint: "bg-mint-100 text-mint-700",
    amber: "bg-amber-100 text-amber-800",
    slate: "bg-slate-100 text-slate-600",
    rose: "bg-rose-100 text-rose-700",
  };
  return <span className={cn("chip", tonos[tone] ?? tonos.brand, className)}>{children}</span>;
}

export function Skeleton({ className = "" }) {
  return <div className={cn("animate-pulse rounded-xl bg-slate-200/80", className)} aria-hidden="true" />;
}

export function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden p-0" aria-busy="true">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-9 w-full" />
      </div>
    </Card>
  );
}

export function EmptyState({ titulo, mensaje, accion }) {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <SearchX className="h-6 w-6 text-slate-400" aria-hidden="true" />
      </span>
      <h3 className="text-lg font-semibold">{titulo}</h3>
      <p className="max-w-md text-sm text-slate-500">{mensaje}</p>
      {accion}
    </Card>
  );
}

export function Toast({ tipo = "success", mensaje, onClose }) {
  if (!mensaje) return null;
  const exito = tipo === "success";
  const Icono = exito ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={exito ? "status" : "alert"}
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-soft",
        exito ? "border-mint-100 bg-mint-50 text-mint-700" : "border-rose-100 bg-rose-50 text-rose-700"
      )}
    >
      <Icono className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="flex-1">{mensaje}</span>
      {onClose && (
        <button type="button" onClick={onClose} className="text-xs font-semibold underline" aria-label="Cerrar aviso">
          Cerrar
        </button>
      )}
    </div>
  );
}

export function SectionTitle({ titulo, descripcion, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{titulo}</h2>
        {descripcion && <p className="mt-1 text-sm text-slate-500">{descripcion}</p>}
      </div>
      {action}
    </div>
  );
}
