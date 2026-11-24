import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HeartCrack, Info, Save, SlidersHorizontal, Sparkles } from "lucide-react";
import { PropertyCard } from "../components/PropertyCard";
import { Badge, Button, Card, EmptyState, Input, PropertyCardSkeleton, Select, Toast } from "../components/ui";
import { buttonClass } from "../components/ui";
import { useApp } from "../context/AppContext";
import { TIPOS } from "../data/seed";
import { getInteractions, getPreferences, getProperties, logInteraction, savePreferences } from "../data/repository";
import { calcularRecomendaciones } from "../lib/recommender";

const VACIO = {
  budgetMin: 0,
  budgetMax: 0,
  districts: [],
  types: [],
  bedroomsMin: 0,
  priorities: { transport: 3, schools: 3, parks: 3, pets: 3 },
  pets: "indiferente",
};

const prioridades = [
  ["transport", "Transporte"],
  ["schools", "Colegios"],
  ["parks", "Parques"],
  ["pets", "Mascotas"],
];

export function Recommender() {
  const { user } = useApp();
  const [propiedades, setPropiedades] = useState([]);
  const [preferencias, setPreferencias] = useState(VACIO);
  const [interacciones, setInteracciones] = useState([]);
  const [distritosTexto, setDistritosTexto] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    let activo = true;
    Promise.all([getProperties(), user ? getPreferences(user.id) : null, user ? getInteractions(user.id) : null])
      .then(([props, pref, ints]) => {
        if (!activo) return;
        setPropiedades(props);
        setPreferencias(pref ?? VACIO);
        setDistritosTexto(pref?.districts?.join(", ") ?? "");
        setInteracciones(ints ?? []);
      })
      .catch(() => activo && setAviso({ tipo: "error", mensaje: "No pudimos cargar tus recomendaciones." }))
      .finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, [user?.id]);

  const recomendados = useMemo(
    () => calcularRecomendaciones({ propiedades, preferencias, interacciones, limite: 12 }),
    [propiedades, preferencias, interacciones]
  );

  const personalizado = Boolean(
    Number(preferencias.budgetMin) > 0 ||
      Number(preferencias.budgetMax) > 0 ||
      preferencias.districts?.length ||
      preferencias.types?.length ||
      Number(preferencias.bedroomsMin) > 0 ||
      preferencias.pets !== "indiferente"
  );

  const alternarTipo = (tipo) => {
    const tipos = preferencias.types ?? [];
    setPreferencias({
      ...preferencias,
      types: tipos.includes(tipo) ? tipos.filter((t) => t !== tipo) : [...tipos, tipo],
    });
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setAviso(null);
    try {
      const pref = {
        ...preferencias,
        budgetMin: Number(preferencias.budgetMin) || 0,
        budgetMax: Number(preferencias.budgetMax) || 0,
        bedroomsMin: Number(preferencias.bedroomsMin) || 0,
        districts: distritosTexto.split(",").map((d) => d.trim()).filter(Boolean),
      };
      if (pref.budgetMax > 0 && pref.budgetMax < pref.budgetMin) {
        throw new Error("El presupuesto máximo debe ser mayor al mínimo.");
      }
      await savePreferences(user.id, pref);
      setPreferencias(pref);
      setAviso({ tipo: "success", mensaje: "Preferencias guardadas. Afinidad recalculada." });
    } catch (e) {
      setAviso({ tipo: "error", mensaje: e.message || "No pudimos guardar tus preferencias." });
    } finally {
      setGuardando(false);
    }
  };

  const rechazar = async (id) => {
    if (!user) return;
    try {
      await logInteraction(user.id, id, "no_me_interesa");
      setInteracciones((prev) => [
        ...prev,
        { id: `local-${Date.now()}`, propertyId: id, tipo: "no_me_interesa", creadoEn: new Date().toISOString() },
      ]);
      setAviso({ tipo: "success", mensaje: "Lo quitamos de tus recomendaciones." });
    } catch {
      setAviso({ tipo: "error", mensaje: "No pudimos registrar el descarte." });
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Sparkles className="h-7 w-7 text-mint-600" /> Recomendador
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Puntaje de afinidad 0-100 con explicaciones en lenguaje natural. Los pesos están en un solo archivo: <code>src/data/weights.js</code>.
          </p>
        </div>
        <Badge tone={personalizado ? "mint" : "amber"}>
          {personalizado ? "Usando tus preferencias e historial" : "Modo popularidad por zona"}
        </Badge>
      </div>

      {aviso && <div className="mb-5"><Toast tipo={aviso.tipo} mensaje={aviso.mensaje} onClose={() => setAviso(null)} /></div>}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit p-5">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <SlidersHorizontal className="h-4 w-4 text-brand-600" /> Mis preferencias
          </h2>
          <p className="mt-1 text-xs text-slate-500">Guardar vuelve a calcular el ranking.</p>

          <form onSubmit={guardar} className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="pref-min">Mín. S/</label>
                <Input id="pref-min" type="number" min="0" step="10000" value={preferencias.budgetMin} onChange={(e) => setPreferencias({ ...preferencias, budgetMin: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="pref-max">Máx. S/</label>
                <Input id="pref-max" type="number" min="0" step="10000" value={preferencias.budgetMax} onChange={(e) => setPreferencias({ ...preferencias, budgetMax: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="pref-distritos">Distritos (separados por coma)</label>
              <Input id="pref-distritos" value={distritosTexto} onChange={(e) => setDistritosTexto(e.target.value)} placeholder="Miraflores, Barranco" />
            </div>

            <div>
              <span className="label">Tipos de inmueble</span>
              <div className="flex flex-wrap gap-2">
                {TIPOS.map((tipo) => (
                  <label key={tipo} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-700">
                    <input type="checkbox" className="accent-brand-600" checked={(preferencias.types ?? []).includes(tipo)} onChange={() => alternarTipo(tipo)} />
                    {tipo}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="pref-dorm">Dormitorios mín.</label>
                <Select id="pref-dorm" value={preferencias.bedroomsMin} onChange={(e) => setPreferencias({ ...preferencias, bedroomsMin: e.target.value })}>
                  {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n === 0 ? "Cualquiera" : n}</option>)}
                </Select>
              </div>
              <div>
                <label className="label" htmlFor="pref-mascotas">Mascotas</label>
                <Select id="pref-mascotas" value={preferencias.pets} onChange={(e) => setPreferencias({ ...preferencias, pets: e.target.value })}>
                  <option value="indiferente">Indiferente</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </Select>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-semibold">Prioridades (1 a 5)</p>
              {prioridades.map(([clave, texto]) => (
                <div key={clave} className="flex items-center justify-between gap-3">
                  <label className="text-sm text-slate-600" htmlFor={`pref-${clave}`}>{texto}</label>
                  <Select id={`pref-${clave}`} className="w-24" value={preferencias.priorities?.[clave] ?? 3}
                    onChange={(e) => setPreferencias({ ...preferencias, priorities: { ...preferencias.priorities, [clave]: Number(e.target.value) } })}>
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                  </Select>
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full" loading={guardando}>
              <Save className="h-4 w-4" /> Guardar y recalcular
            </Button>
          </form>

          <p className="mt-4 flex gap-2 text-[11px] leading-relaxed text-slate-400">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> El historial de vistas, carrito y descartes ajusta el puntaje automáticamente.
          </p>
        </Card>

        <div className="space-y-5">
          {cargando ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((n) => <PropertyCardSkeleton key={n} />)}
            </div>
          ) : recomendados.length === 0 ? (
            <EmptyState
              titulo="Sin recomendaciones por ahora"
              mensaje="Ajusta tus preferencias o descarta menos inmuebles para volver a ver sugerencias."
              accion={<Link to="/propiedades" className={buttonClass("primary", "mt-2")}>Explorar catálogo</Link>}
            />
          ) : (
            <>
              <p className="text-sm text-slate-500" aria-live="polite">
                {recomendados.length} {recomendados.length === 1 ? "sugerencia" : "sugerencias"} ordenadas por afinidad.
              </p>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {recomendados.map((p) => (
                  <div key={p.id} className="space-y-2">
                    <PropertyCard property={p} score={p.score} explicacion={p.explicacion} compacta />
                    <Button variant="ghost" className="w-full text-rose-600 hover:bg-rose-50" onClick={() => rechazar(p.id)}>
                      <HeartCrack className="h-4 w-4" /> No me interesa
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
