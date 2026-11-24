import { Info } from "lucide-react";
import { useApp } from "../context/AppContext";

export function DemoBanner() {
  const { esDemo } = useApp();
  if (!esDemo) return null;

  return (
    <div className="bg-brand-600 px-4 py-1.5 text-center text-xs font-medium text-white">
      <Info className="mr-1.5 inline h-3.5 w-3.5 align-[-2px]" aria-hidden="true" />
      Demo: las cuentas se guardan solo en este navegador
    </div>
  );
}
