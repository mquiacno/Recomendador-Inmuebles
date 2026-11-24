import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, ClipboardCheck, MapPin, Search, Sparkles } from "lucide-react";
import { PropertyCard } from "../components/PropertyCard";
import { useApp } from "../context/AppContext";
import { getInteractions, getPreferences, getProperties } from "../data/repository";
import { calcularRecomendaciones } from "../lib/recommender";
import { Badge, Button, Card, PropertyCardSkeleton, Select, SectionTitle } from "../components/ui";
import { buttonClass } from "../components/ui";

const pasos = [
  { numero: "1", titulo: "Define tus prioridades", texto: "Presupuesto, distritos, tipo de inmueble y qué es importante para ti." },
  { numero: "2", titulo: "Descubre afinidades claras", texto: "Cada recomendación explica por qué aparece, con un puntaje de 0 a 100." },
  { numero: "3", titulo: "Decide con criterio", texto: "Compara la zona, calcula tu cuota y pide una visita sin pagar nada." },
];

const faqs = [
  ["¿Necesito crear una cuenta?", "No para explorar el catálogo. Sí para guardar favoritos, ver recomendaciones personalizadas y solicitar visitas."],
  ["¿Los inmuebles son reales?", "No. Son 24 ejemplos ficticios de Lima creados para probar la experiencia Beta."],
  ["¿Qué significa el % de afinidad?", "Es una estimación de qué tan cerca está un inmueble de tus preferencias e historial. No es una garantía."],
  ["¿Los datos se guardan en algún servidor?", "En modo demo todo vive en tu navegador (localStorage). Si se activa Supabase, los datos pasan a tu proyecto."],
];

export function Home() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [propiedades, setPropiedades] = useState([]);
  const [preferencias, setPreferencias] = useState(null);
  const [interacciones, setInteracciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtros, setFiltros] = useState({ distrito: "", operacion: "", tipo: "", dormitorios: "" });

  useEffect(() => {
    let activo = true;
    getProperties()
      .then((datos) => activo && setPropiedades(datos))
      .catch(() => activo && setPropiedades([]))
      .finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    let activo = true;
    if (!user) {
      setPreferencias(null);
      setInteracciones([]);
      return () => { activo = false; };
    }
    Promise.all([getPreferences(user.id), getInteractions(user.id)])
      .then(([pref, ints]) => {
        if (!activo) return;
        setPreferencias(pref);
        setInteracciones(ints);
      })
      .catch(() => {});
    return () => { activo = false; };
  }, [user]);

  const recomendados = useMemo(
    () => calcularRecomendaciones({ propiedades, preferencias, interacciones, limite: 3 }),
    [propiedades, preferencias, interacciones]
  );

  const distritos = useMemo(
    () => [...new Set(propiedades.map((p) => p.distrito))].sort((a, b) => a.localeCompare(b, "es")),
    [propiedades]
  );

  const buscar = (evento) => {
    evento.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([clave, valor]) => valor && params.set(clave, valor));
    navigate(`/propiedades?${params.toString()}`);
  };

  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-br from-brand-50 via-white to-mint-50">
        <div className="container mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-20">
          <div className="space-y-6">
            <Badge tone="mint">Beta · recomendaciones explicadas</Badge>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Encuentra tu próximo inmueble con <span className="text-brand-600">criterio, no con ruido</span>
            </h1>
            <p className="max-w-2xl text-lg text-slate-600">
              Explora 24 inmuebles de Lima, filtra lo que importa y recibe sugerencias que te dicen por qué encajan contigo.
            </p>

            <form onSubmit={buscar} className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Buscador rápido">
              <div>
                <label className="label" htmlFor="home-distrito">Distrito</label>
                <Select id="home-distrito" value={filtros.distrito} onChange={(e) => setFiltros({ ...filtros, distrito: e.target.value })}>
                  <option value="">Todos</option>
                  {distritos.map((d) => <option key={d} value={d}>{d}</option>)}
                </Select>
              </div>
              <div>
                <label className="label" htmlFor="home-operacion">Operación</label>
                <Select id="home-operacion" value={filtros.operacion} onChange={(e) => setFiltros({ ...filtros, operacion: e.target.value })}>
                  <option value="">Todas</option>
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                </Select>
              </div>
              <div>
                <label className="label" htmlFor="home-tipo">Tipo</label>
                <Select id="home-tipo" value={filtros.tipo} onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}>
                  <option value="">Todos</option>
                  <option value="departamento">Departamento</option>
                  <option value="casa">Casa</option>
                  <option value="terreno">Terreno</option>
                  <option value="oficina">Oficina</option>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  <Search className="h-4 w-4" /> Buscar
                </Button>
              </div>
            </form>

            <div className="flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-mint-600" /> Lima</span>
              <span className="inline-flex items-center gap-1.5"><BarChart3 className="h-4 w-4 text-brand-600" /> Afinidad 0-100%</span>
              <span className="inline-flex items-center gap-1.5"><ClipboardCheck className="h-4 w-4 text-brand-600" /> Sin pagos</span>
            </div>
          </div>

          <Card className="relative overflow-hidden p-6">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-100 blur-2xl" aria-hidden="true" />
            <div className="relative space-y-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-mint-600" aria-hidden="true" />
                <h2 className="text-xl font-bold">Así funciona</h2>
              </div>
              {pasos.map((paso) => (
                <div key={paso.numero} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{paso.numero}</span>
                  <div>
                    <p className="font-semibold">{paso.titulo}</p>
                    <p className="text-sm text-slate-500">{paso.texto}</p>
                  </div>
                </div>
              ))}
              <Link to="/recomendador" className={buttonClass("primary", "w-full")}>
                Ver recomendaciones <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-14">
        <SectionTitle
          titulo="Recomendados para ti"
          descripcion={user ? "Usamos tus preferencias e historial para ordenar esta selección." : "Selección inicial por popularidad mientras defines tus preferencias."}
          action={<Link to="/recomendador" className="text-sm font-semibold text-brand-700 hover:underline">Personalizar →</Link>}
        />
        {cargando ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((n) => <PropertyCardSkeleton key={n} />)}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recomendados.map((p) => (
              <PropertyCard key={p.id} property={p} score={p.score} explicacion={p.explicacion} compacta />
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-slate-200 bg-white py-14">
        <div className="container mx-auto max-w-6xl px-4">
          <SectionTitle titulo="Cómo funciona" descripcion="Tres pasos, sin formularios interminables." />
          <div className="grid gap-4 md:grid-cols-3">
            {pasos.map((paso) => (
              <Card key={paso.numero} className="p-6">
                <span className="text-3xl font-bold text-brand-100">{paso.numero}</span>
                <h3 className="mt-2 text-lg font-semibold">{paso.titulo}</h3>
                <p className="mt-1 text-sm text-slate-500">{paso.texto}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-14">
        <SectionTitle titulo="Preguntas frecuentes" />
        <div className="grid gap-3 md:grid-cols-2">
          {faqs.map(([pregunta, respuesta]) => (
            <details key={pregunta} className="card group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold marker:hidden">
                {pregunta}
                <span className="text-brand-600 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">{respuesta}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
