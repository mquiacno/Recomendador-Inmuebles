import { Link } from "react-router-dom";
import { ArrowUpRight, Bath, BedDouble, MapPin, PawPrint, Ruler, Sparkles } from "lucide-react";
import { Badge, Card } from "./ui";
import { buttonClass } from "./ui";
import { dinero } from "../lib/format";

export function PropertyCard({ property, score, explicacion, compacta = false }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <Link to={`/propiedades/${property.id}`} className="relative block overflow-hidden" aria-label={`Ver detalle de ${property.titulo}`}>
        <img
          src={property.fotos?.[0]}
          alt={property.titulo}
          loading="lazy"
          className={`${compacta ? "h-40" : "h-52"} w-full object-cover transition-transform duration-300 hover:scale-[1.03]`}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge tone={property.operacion === "venta" ? "mint" : "brand"}>
            {property.operacion === "venta" ? "Venta" : "Alquiler"}
          </Badge>
          {property.destacado && <Badge tone="amber">Destacado</Badge>}
        </div>
        {typeof score === "number" && (
          <span className="absolute bottom-3 right-3 rounded-xl bg-white/95 px-2.5 py-1.5 text-xs font-bold text-brand-700 shadow">
            {score}% afinidad
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {property.distrito}, {property.ciudad}
          </p>
          <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug">{property.titulo}</h3>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
          {property.tipo !== "terreno" && (
            <span className="inline-flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {property.dormitorios} dorm.</span>
          )}
          <span className="inline-flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {property.banos} baños</span>
          <span className="inline-flex items-center gap-1"><Ruler className="h-3.5 w-3.5" /> {property.areaM2} m²</span>
          {property.mascotas && <span className="inline-flex items-center gap-1 text-mint-700"><PawPrint className="h-3.5 w-3.5" /> Mascotas</span>}
        </div>

        {explicacion && (
          <p className="flex gap-2 rounded-xl bg-brand-50 p-3 text-xs leading-relaxed text-brand-700">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {explicacion}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div>
            <p className="text-lg font-bold text-ink">{dinero(property.precio, property.moneda)}</p>
            {property.operacion === "alquiler" && <p className="text-[11px] text-slate-400">por mes</p>}
          </div>
          <Link to={`/propiedades/${property.id}`} className={buttonClass("secondary", "px-3 py-2")}>
            Ver <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
