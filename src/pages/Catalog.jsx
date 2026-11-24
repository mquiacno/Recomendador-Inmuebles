import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FilterPanel } from "../components/FilterPanel";
import { PropertyCard } from "../components/PropertyCard";
import { Button, EmptyState, PropertyCardSkeleton, Select, Toast } from "../components/ui";
import { getProperties } from "../data/repository";
import { filtrarPropiedades, ordenarPropiedades } from "../lib/filters";

const POR_PAGINA = 9;

export function Catalog() {
  const [propiedades, setPropiedades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const filtros = {
    operacion: searchParams.get("operacion") ?? "",
    tipo: searchParams.get("tipo") ?? "",
    distrito: searchParams.get("distrito") ?? "",
    precioMax: searchParams.get("precioMax") ?? "",
    dormitorios: searchParams.get("dormitorios") ?? "",
    mascotas: searchParams.get("mascotas") ?? "",
  };
  const orden = searchParams.get("orden") ?? "relevancia";
  const pagina = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    getProperties()
      .then((datos) => activo && setPropiedades(datos))
      .catch(() => activo && setError("No pudimos cargar el catálogo. Inténtalo de nuevo."))
      .finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, []);

  const filtradas = useMemo(() => filtrarPropiedades(propiedades, filtros), [propiedades, searchParams]);
  const ordenadas = useMemo(() => ordenarPropiedades(filtradas, orden), [filtradas, orden]);
  const totalPaginas = Math.max(1, Math.ceil(ordenadas.length / POR_PAGINA));
  const visibles = ordenadas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  useEffect(() => {
    if (pagina > totalPaginas) {
      const nuevos = new URLSearchParams(searchParams);
      nuevos.set("page", String(totalPaginas));
      setSearchParams(nuevos, { replace: true });
    }
  }, [pagina, totalPaginas, searchParams, setSearchParams]);

  const cambiar = (clave, valor) => {
    const nuevos = new URLSearchParams(searchParams);
    if (valor) nuevos.set(clave, valor);
    else nuevos.delete(clave);
    nuevos.delete("page");
    setSearchParams(nuevos, { replace: true });
  };

  const irAPagina = (numero) => {
    const nuevos = new URLSearchParams(searchParams);
    nuevos.set("page", String(numero));
    setSearchParams(nuevos);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const limpiar = () => setSearchParams(new URLSearchParams(), { replace: true });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Catálogo de inmuebles</h1>
        <p className="mt-1 text-sm text-slate-500">Filtra, compara y guarda lo que te interese. Sin scroll infinito.</p>
      </div>

      {error && <div className="mb-5"><Toast tipo="error" mensaje={error} /></div>}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <FilterPanel
          filtros={filtros}
          onChange={cambiar}
          onReset={limpiar}
          resultados={filtradas.length}
          total={propiedades.length}
        />

        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600" aria-live="polite">
              <strong className="text-ink">{filtradas.length}</strong> {filtradas.length === 1 ? "resultado" : "resultados"}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="orden" className="text-sm text-slate-500">Ordenar:</label>
              <Select id="orden" className="w-auto min-w-40" value={orden} onChange={(e) => cambiar("orden", e.target.value)}>
                <option value="relevancia">Relevancia</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
              </Select>
            </div>
          </div>

          {cargando ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : visibles.length === 0 ? (
            <EmptyState
              titulo="No hay inmuebles con estos filtros"
              mensaje="Prueba quitando alguno o ampliando el presupuesto. El catálogo completo tiene 24 ejemplos."
              accion={<Button variant="secondary" onClick={limpiar} className="mt-1">Limpiar filtros</Button>}
            />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visibles.map((p) => <PropertyCard key={p.id} property={p} compacta />)}
              </div>

              <nav className="flex items-center justify-center gap-2" aria-label="Paginación">
                <Button variant="secondary" className="px-3" disabled={pagina === 1} onClick={() => irAPagina(pagina - 1)} aria-label="Página anterior">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPaginas }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => irAPagina(i + 1)}
                    aria-current={pagina === i + 1 ? "page" : undefined}
                    className={`h-10 w-10 rounded-xl text-sm font-semibold ${pagina === i + 1 ? "bg-brand-600 text-white" : "border border-slate-200 bg-white hover:bg-slate-50"}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <Button variant="secondary" className="px-3" disabled={pagina === totalPaginas} onClick={() => irAPagina(pagina + 1)} aria-label="Página siguiente">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
              <p className="text-center text-xs text-slate-400">Página {pagina} de {totalPaginas}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
