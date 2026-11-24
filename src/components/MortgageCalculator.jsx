import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { Card } from "./ui";
import { dinero } from "../lib/format";

export function MortgageCalculator({ precio, moneda }) {
  const [enganche, setEnganche] = useState(20);
  const [anios, setAnios] = useState(20);
  const [tasa, setTasa] = useState(8.5);

  const cuota = useMemo(() => {
    const capital = Number(precio) * (1 - enganche / 100);
    const meses = anios * 12;
    const r = tasa / 100 / 12;
    if (!capital || !meses) return 0;
    if (r === 0) return capital / meses;
    return (capital * r) / (1 - Math.pow(1 + r, -meses));
  }, [precio, enganche, anios, tasa]);

  return (
    <Card className="p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Calculator className="h-5 w-5 text-brand-600" aria-hidden="true" /> Calculadora hipotecaria
      </h2>
      <p className="mt-1 text-sm text-slate-500">Estimación simple solo para orientarte. No incluye seguros ni impuestos.</p>

      <div className="mt-5 space-y-4">
        <div>
          <div className="flex justify-between text-sm">
            <label htmlFor="enganche">Enganche</label>
            <span className="font-semibold">{enganche}%</span>
          </div>
          <input id="enganche" type="range" min="0" max="60" step="5" value={enganche} onChange={(e) => setEnganche(Number(e.target.value))} className="w-full accent-brand-600" />
        </div>
        <div>
          <div className="flex justify-between text-sm">
            <label htmlFor="anios">Plazo</label>
            <span className="font-semibold">{anios} años</span>
          </div>
          <input id="anios" type="range" min="5" max="30" step="5" value={anios} onChange={(e) => setAnios(Number(e.target.value))} className="w-full accent-mint-600" />
        </div>
        <div>
          <label className="label" htmlFor="tasa">Tasa anual estimada (%)</label>
          <input id="tasa" className="input" type="number" min="0" max="25" step="0.5" value={tasa} onChange={(e) => setTasa(Number(e.target.value))} />
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-gradient-to-br from-brand-50 to-mint-50 p-4">
        <p className="text-xs font-medium text-slate-500">Cuota mensual aproximada</p>
        <p className="mt-1 text-2xl font-bold text-brand-700">{dinero(cuota, moneda)}</p>
        <p className="mt-1 text-xs text-slate-500">Sobre {dinero(precio, moneda)} con {enganche}% de enganche.</p>
      </div>
    </Card>
  );
}
