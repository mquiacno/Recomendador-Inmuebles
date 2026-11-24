import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Bath, BedDouble, Building2, CalendarDays, Heart, MapPin,
  PawPrint, Ruler, Search, ShoppingCart, Sparkles,
} from "lucide-react";
import { MortgageCalculator } from "../components/MortgageCalculator";
import { ResearchPanel } from "../components/ResearchPanel";
import { VisitForm } from "../components/VisitForm";
import { Badge, Button, Card, EmptyState, Skeleton, Toast, buttonClass } from "../components/ui";
import { useApp } from "../context/AppContext";
import { addToCart, getProperties, logInteraction } from "../data/repository";
import { dinero, fecha } from "../lib/format";

export function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useApp();
  const [propiedades, setPropiedades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [fotoActiva, setFotoActiva] = useState(0);
  const [investigar, setInvestigar] = useState(false);
  const [aviso, setAviso] = useState(null);
  const vistaRegistrada = useRef("");

  useEffect(() => {
    let activo = true;
    setCargando(true);
    getProperties()
      .then((datos) => activo && setPropiedades(datos))
      .catch(() => activo && setAviso({ tipo: "error", mensaje: "No pudimos cargar el inmueble." }))
      .finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, []);

  const property = useMemo(() => propiedades.find((p) => p.id === id) ?? null, [propiedades, id]);

  useEffect(() => {
    if (!user || !property) return;
    const clave = `${user.id}:${property.id}`;
    if (vistaRegistrada.current === clave) return;
    vistaRegistrada.current = clave;
    logInteraction(user.id, property.id, "vista").catch(() => {});
  }, [user?.id, property?.id]);

  const similares = useMemo(() => {
    if (!property) return [];
    return propiedades
      .filter((p) => p.id !== property.id && (p.tipo === property.tipo || p.distrito === property.distrito))
      .slice(0, 3);
  }, [propiedades, property]);

  const agregar = async () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    try {
      await addToCart(user.id, property.id);
      setAviso({ tipo: "success", mensaje: "Inmueble agregado a tu carrito." });
    } catch (e) {
      setAviso({ tipo: "error", mensaje: e.message || "No se pudo agregar al carrito." });
    }
  };

  if (cargando) {
    return (
      <div className="container mx-auto max-w-6xl space-y-5 px-4 py-10" aria-busy="true">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-80 w-full" />
        <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-14">
        <EmptyState
          titulo="No encontramos este inmueble"
          mensaje="Puede que el enlace haya cambiado o que el ejemplo ya no esté disponible en el catálogo demo."
          accion={<Link to="/propiedades" className={buttonClass("primary", "mt-2")}>Volver al catálogo</Link>}
        />
      </div>
    );
  }

  const datos = [
    { icono: BedDouble, texto: `${property.dormitorios} dormitorios` },
    { icono: Bath, texto: `${property.banos} baños` },
    { icono: Ruler, texto: `${property.areaM2} m²` },
    { icono: Building2, texto: property.tipo[0].toUpperCase() + property.tipo.slice(1) },
    { icono: PawPrint, texto: property.mascotas ? "Acepta mascotas" : "Sin mascotas" },
    { icono: CalendarDays, texto: `${property.antiguedad} años` },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <Link to="/propiedades" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Volver al catálogo
      </Link>

      {aviso && <div className="mb-5"><Toast tipo={aviso.tipo} mensaje={aviso.mensaje} onClose={() => setAviso(null)} /></div>}

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge tone={property.operacion === "venta" ? "mint" : "brand"}>
              {property.operacion === "venta" ? "En venta" : "En alquiler"}
            </Badge>
            {property.destacado && <Badge tone="amber">Destacado</Badge>}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{property.titulo}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-4 w-4 text-mint-600" /> {property.distrito}, {property.ciudad} · Publicado el {fecha(property.creadoEn)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-brand-700">{dinero(property.precio, property.moneda)}</p>
          {property.operacion === "alquiler" && <p className="text-xs text-slate-400">por mes</p>}
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <img src={property.fotos?.[fotoActiva]} alt={property.titulo} className="h-[320px] w-full object-cover sm:h-[440px]" />
        <div className="flex gap-2 overflow-x-auto p-3" aria-label="Galería de fotos">
          {property.fotos?.map((foto, index) => (
            <button
              key={foto}
              type="button"
              onClick={() => setFotoActiva(index)}
              aria-label={`Ver foto ${index + 1}`}
              aria-pressed={fotoActiva === index}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${fotoActiva === index ? "border-brand-600" : "border-transparent"}`}
            >
              <img src={foto} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold">Sobre este inmueble</h2>
            <p className="mt-3 leading-relaxed text-slate-600">{property.descripcion}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {datos.map(({ icono: Icono, texto }) => (
                <div key={texto} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                  <Icono className="h-4 w-4 text-brand-600" aria-hidden="true" /> {texto}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={agregar}><ShoppingCart className="h-4 w-4" /> Agregar al carrito</Button>
              <Button
                variant="secondary"
                onClick={() => document.getElementById("visita")?.scrollIntoView({ behavior: "smooth" })}
              >
                <CalendarDays className="h-4 w-4" /> Solicitar visita
              </Button>
              <Button variant="ghost" onClick={() => setInvestigar((v) => !v)} aria-expanded={investigar}>
                <Search className="h-4 w-4" /> Investigar más
              </Button>
            </div>
          </Card>

          {investigar && <ResearchPanel property={property} />}

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-mint-600" aria-hidden="true" />
              <h2 className="text-lg font-bold">Inmuebles similares</h2>
            </div>
            {similares.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No hay ejemplos similares en este momento.</p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {similares.map((p) => (
                  <Link key={p.id} to={`/propiedades/${p.id}`} className="group overflow-hidden rounded-xl border border-slate-200 hover:border-brand-200">
                    <img src={p.fotos?.[0]} alt={p.titulo} className="h-24 w-full object-cover" loading="lazy" />
                    <div className="p-3">
                      <p className="line-clamp-2 text-xs font-semibold group-hover:text-brand-700">{p.titulo}</p>
                      <p className="mt-1 text-sm font-bold text-brand-700">{dinero(p.precio, p.moneda)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <MortgageCalculator precio={property.precio} moneda={property.moneda} />
          <div id="visita" className="scroll-mt-24">
            <VisitForm propertyId={property.id} onSuccess={() => setAviso({ tipo: "success", mensaje: "Solicitud enviada desde el detalle." })} />
          </div>
          <Card className="p-5 text-sm text-slate-500">
            <Heart className="mb-2 h-5 w-5 text-rose-400" aria-hidden="true" />
            Guardar un inmueble en el carrito no es una reserva. Puedes quitarlo cuando quieras.
          </Card>
        </div>
      </div>
    </div>
  );
}
