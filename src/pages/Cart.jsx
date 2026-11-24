import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Trash2 } from "lucide-react";
import { VisitForm } from "../components/VisitForm";
import { Badge, Button, Card, EmptyState, Skeleton, Toast, buttonClass } from "../components/ui";
import { useApp } from "../context/AppContext";
import { getCart, removeFromCart } from "../data/repository";
import { dinero } from "../lib/format";

export function Cart() {
  const { user } = useApp();
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    if (!user) return;
    let activo = true;
    getCart(user.id)
      .then((datos) => activo && setItems(datos))
      .catch(() => activo && setAviso({ tipo: "error", mensaje: "No pudimos cargar tu carrito." }))
      .finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, [user?.id]);

  const grupos = useMemo(() => {
    const acc = { PEN: { items: [], total: 0 }, USD: { items: [], total: 0 } };
    items.forEach((item) => {
      const moneda = item.property.moneda;
      acc[moneda].items.push(item);
      acc[moneda].total += Number(item.property.precio);
    });
    return acc;
  }, [items]);

  const eliminar = async (propertyId) => {
    try {
      await removeFromCart(user.id, propertyId);
      setItems((prev) => prev.filter((i) => i.propertyId !== propertyId));
      setAviso({ tipo: "success", mensaje: "Inmueble quitado del carrito." });
    } catch {
      setAviso({ tipo: "error", mensaje: "No pudimos quitar el inmueble." });
    }
  };

  if (cargando) {
    return (
      <div className="container mx-auto max-w-6xl space-y-4 px-4 py-12" aria-busy="true">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
        <ShoppingCart className="h-7 w-7 text-brand-600" /> Mi carrito
      </h1>
      <p className="mt-1 text-sm text-slate-500">Guarda inmuebles para compararlos. No hay pagos ni reservas automáticas.</p>

      {aviso && <div className="mt-5"><Toast tipo={aviso.tipo} mensaje={aviso.mensaje} onClose={() => setAviso(null)} /></div>}

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            titulo="Tu carrito está vacío"
            mensaje="Agrega inmuebles desde el catálogo o el recomendador para compararlos aquí."
            accion={<Link to="/propiedades" className={buttonClass("primary", "mt-2")}>Explorar propiedades</Link>}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            {Object.entries(grupos).map(([moneda, grupo]) => grupo.items.length > 0 && (
              <Card key={moneda} className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-bold">
                    <Badge tone={moneda === "PEN" ? "brand" : "mint"}>{moneda}</Badge>
                    {moneda === "PEN" ? "Soles" : "Dólares"}
                  </h2>
                  <span className="text-sm text-slate-500">{grupo.items.length} {grupo.items.length === 1 ? "inmueble" : "inmuebles"}</span>
                </div>

                <ul className="space-y-3">
                  {grupo.items.map(({ property }) => (
                    <li key={property.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 p-3">
                      <img src={property.fotos?.[0]} alt="" className="h-20 w-28 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <Link to={`/propiedades/${property.id}`} className="line-clamp-1 font-semibold hover:text-brand-700">{property.titulo}</Link>
                        <p className="text-xs text-slate-500">{property.distrito} · {property.dormitorios} dorm. · {property.areaM2} m²</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand-700">{dinero(property.precio, property.moneda)}</p>
                        <button type="button" onClick={() => eliminar(property.id)} className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:underline">
                          <Trash2 className="h-3.5 w-3.5" /> Quitar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex justify-end border-t pt-4">
                  <p className="text-sm text-slate-500">Subtotal {moneda}: <strong className="ml-1 text-lg text-ink">{dinero(grupo.total, moneda)}</strong></p>
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              <h2 className="text-lg font-bold">Resumen</h2>
              <div className="mt-4 space-y-2 text-sm">
                {Object.entries(grupos).filter(([, g]) => g.items.length).map(([moneda, g]) => (
                  <div key={moneda} className="flex justify-between">
                    <span className="text-slate-500">Total en {moneda}</span>
                    <strong>{dinero(g.total, moneda)}</strong>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-400">
                Los totales son informativos. No se cobra nada en esta Beta.
              </p>
            </Card>

            <VisitForm
              properties={items.map((i) => i.property)}
              showSelector
              onSuccess={() => setAviso({ tipo: "success", mensaje: "Visita registrada desde el carrito." })}
            />
            <Link to="/propiedades" className={buttonClass("secondary", "w-full")}>Seguir explorando</Link>
          </div>
        </div>
      )}
    </div>
  );
}
