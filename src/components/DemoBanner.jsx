import { Info } from "lucide-react";
import { useApp } from "../context/AppContext";

export function DemoBanner() {
  const { esDemo } = useApp();
  if (!esDemo) return null;

  return (
    <div className="bg-ink px-4 py-1.5 text-center text-[11px] font-medium tracking-wide text-white/90">
      <Info className="mr-1.5 inline h-3.5 w-3.5 align-[-2px]" aria-hidden="true" />
      Demo: las cuentas se guardan solo en este navegador
    </div>
  );
}
