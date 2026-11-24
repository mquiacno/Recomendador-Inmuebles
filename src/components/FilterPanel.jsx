import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { Badge, Button, Card, Input, Select } from "./ui";
import { DISTRITOS, TIPOS } from "../data/seed";

export function FilterPanel({ filtros, onChange, onReset, resultados, total }) {
  const actualizar = (clave, valor) => onChange(clave, valor);

  return (
    <Card className="h-fit p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <SlidersHorizontal className="h-4 w-4 text-brand-600" aria-hidden="true" /> Filtros
        </h2>
        <Badge tone="mint">{resultados} de {total}</Badge>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="f-operacion">Operación</label>
          <Select id="f-operacion" value={filtros.operacion} onChange={(e) => actualizar("operacion", e.target.value)}>
            <option value="">Todas</option>
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
          </Select>
        </div>

        <div>
          <label className="label" htmlFor="f-tipo">Tipo de inmueble</label>
          <Select id="f-tipo" value={filtros.tipo} onChange={(e) => actualizar("tipo", e.target.value)}>
            <option value="">Todos</option>
            {TIPOS.map((tipo) => <option key={tipo} value={tipo}>{tipo[0].toUpperCase() + tipo.slice(1)}</option>)}
          </Select>
        </div>

        <div>
          <label className="label" htmlFor="f-distrito">Distrito</label>
          <Select id="f-distrito" value={filtros.distrito} onChange={(e) => actualizar("distrito", e.target.value)}>
            <option value="">Todos los distritos</option>
            {DISTRITOS.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>
        </div>

        <div>
          <label className="label" htmlFor="f-precio">Precio máximo (S/)</label>
          <Input
            id="f-precio"
            type="number"
            min="0"
            step="10000"
            placeholder="Ej. 800000"
            value={filtros.precioMax}
            onChange={(e) => actualizar("precioMax", e.target.value)}
          />
          <p className="mt-1 text-[11px] text-slate-400">Los precios en USD se convierten para comparar.</p>
        </div>

        <div>
          <label className="label" htmlFor="f-dormitorios">Dormitorios mínimos</label>
          <Select id="f-dormitorios" value={filtros.dormitorios} onChange={(e) => actualizar("dormitorios", e.target.value)}>
            <option value="">Cualquiera</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} o más</option>)}
          </Select>
        </div>

        <div>
          <label className="label" htmlFor="f-mascotas">Mascotas</label>
          <Select id="f-mascotas" value={filtros.mascotas} onChange={(e) => actualizar("mascotas", e.target.value)}>
            <option value="">Indiferente</option>
            <option value="si">Acepta mascotas</option>
            <option value="no">Sin mascotas</option>
          </Select>
        </div>

        <Button variant="secondary" className="w-full" onClick={onReset}>
          <RotateCcw className="h-4 w-4" /> Limpiar filtros
        </Button>
      </div>
    </Card>
  );
}
