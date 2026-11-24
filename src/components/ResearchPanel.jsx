import { ExternalLink, Info, MapPin, Search, ShieldAlert, Sparkles } from "lucide-react";
import { Badge, Card } from "./ui";

const revisar = [
  ["Seguridad", "Pregunta por la vigilancia, iluminación y referencias de los vecinos."],
  ["Transporte", "Mide la distancia real a estaciones, buses y vías principales en hora punta."],
  ["Servicios", "Verifica colegios, mercados, hospitales y parques cercanos."],
  ["Precio del m²", "Compara con 3 inmuebles similares del mismo distrito y antigüedad."],
];

export function ResearchPanel({ property }) {
  const consulta = `${property.distrito} ${property.tipo} ${property.operacion} Lima precio metro cuadrado`;
  const enlaces = [
    { nombre: "Google", url: `https://www.google.com/search?q=${encodeURIComponent(consulta)}`, icono: Search },
    { nombre: "Google Maps", url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.distrito}, Lima, Perú`)}`, icono: MapPin },
    { nombre: "Urbanopia", url: `https://www.urbanopia.com.pe/inmuebles?buscar=${encodeURIComponent(property.distrito)}`, icono: ExternalLink },
    { nombre: "Foogaro", url: `https://www.foogaro.com/inmuebles?buscar=${encodeURIComponent(property.distrito)}`, icono: ExternalLink },
  ];

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Search className="h-5 w-5 text-brand-600" aria-hidden="true" /> Investigar más
        </h2>
        <Badge tone="amber">Verifica antes de decidir</Badge>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Enlaces prearmados para {property.distrito}, {property.tipo} en {property.operacion}.
      </p>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {enlaces.map(({ nombre, url, icono: Icono }) => (
          <a
            key={nombre}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium hover:border-brand-200 hover:bg-brand-50"
          >
            <span className="inline-flex items-center gap-2"><Icono className="h-4 w-4 text-brand-600" /> {nombre}</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          </a>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-bold">Qué revisar de la zona</h3>
        <ul className="mt-3 space-y-3">
          {revisar.map(([titulo, texto]) => (
            <li key={titulo} className="flex gap-3 text-sm">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-mint-600" aria-hidden="true" />
              <span><strong>{titulo}:</strong> <span className="text-slate-500">{texto}</span></span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Sparkles className="h-4 w-4" aria-hidden="true" /> Resumen con IA y fuentes
          <Badge tone="slate">Desactivado</Badge>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          Preparado para ejecutarse en una función de servidor: la clave de API nunca viajaría al navegador y el resumen incluiría enlaces a las fuentes.
        </p>
        <button type="button" disabled className="mt-3 btn-secondary cursor-not-allowed opacity-50" aria-disabled="true">
          Resumir con IA (próxima etapa)
        </button>
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs text-slate-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Verifica la información antes de decidir. Los enlaces son búsquedas, no recomendaciones de terceros.
      </p>
    </Card>
  );
}
