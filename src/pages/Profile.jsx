import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarCheck, History, LogOut, Settings2, UserRound } from "lucide-react";
import { Badge, Button, Card, Skeleton, Toast, buttonClass } from "../components/ui";
import { useApp } from "../context/AppContext";
import { getInteractions, getPreferences, getVisitRequests, signOut } from "../data/repository";
import { fecha, iniciales } from "../lib/format";

const ETIQUETAS_INTERACCION = {
  vista: "Vistas",
  carrito: "Carrito",
  guardado: "Guardados",
  me_interesa: "Me interesa",
  no_me_interesa: "No me interesa",
  visita: "Visitas",
};

export function Profile() {
  const { user, mode, refresh } = useApp();
  const navigate = useNavigate();
  const [preferencias, setPreferencias] = useState(null);
  const [visitas, setVisitas] = useState([]);
  const [interacciones, setInteracciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    if (!user) return;
    let activo = true;
    Promise.all([
      getPreferences(user.id),
      getVisitRequests(user.id),
      getInteractions(user.id),
    ])
      .then(([pref, vis, ints]) => {
        if (!activo) return;
        setPreferencias(pref);
        setVisitas(vis);
        setInteracciones(ints);
      })
      .catch(() => activo && setAviso("No pudimos cargar toda tu información."))
      .finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, [user?.id]);

  const cerrar = async () => {
    await signOut();
    await refresh();
    navigate("/");
  };

  if (cargando) {
    return (
      <div className="container mx-auto max-w-5xl space-y-4 px-4 py-12" aria-busy="true">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const conteo = interacciones.reduce((acc, i) => {
    acc[i.tipo] = (acc[i.tipo] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
        <UserRound className="h-7 w-7 text-brand-600" /> Mi perfil
      </h1>
      <p className="mt-1 text-sm text-slate-500">Tu actividad y preferencias en esta Beta.</p>

      {aviso && <div className="mt-5"><Toast tipo="error" mensaje={aviso} /></div>}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
              {iniciales(user?.nombre)}
            </span>
            <div>
              <h2 className="text-xl font-bold">{user?.nombre}</h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone={mode === "demo" ? "brand" : "mint"}>
              {mode === "demo" ? "Demo · solo este navegador" : "Supabase"}
            </Badge>
            <Badge tone="slate">Miembro desde {fecha(user?.creadoEn)}</Badge>
          </div>
          <Button variant="secondary" className="mt-6" onClick={cerrar}>
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Settings2 className="h-5 w-5 text-mint-600" /> Preferencias
          </h2>
          {preferencias ? (
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Presupuesto</dt><dd className="text-right font-medium">{preferencias.budgetMin || 0} – {preferencias.budgetMax || "libre"} S/</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Distritos</dt><dd className="text-right font-medium">{preferencias.districts?.join(", ") || "Todos"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Tipos</dt><dd className="text-right font-medium">{preferencias.types?.join(", ") || "Todos"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Dormitorios mín.</dt><dd className="font-medium">{preferencias.bedroomsMin || 0}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Mascotas</dt><dd className="font-medium">{preferencias.pets}</dd></div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Aún no guardas preferencias. El recomendador usa popularidad por zona.</p>
          )}
          <Link to="/recomendador" className={buttonClass("primary", "mt-6")}>Editar preferencias</Link>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <CalendarCheck className="h-5 w-5 text-brand-600" /> Solicitudes de visita
          </h2>
          {visitas.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Todavía no has solicitado visitas.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {visitas.slice(0, 6).map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-sm">
                  <div className="min-w-0">
                    <p className="line-clamp-1 font-medium">{v.property?.titulo ?? "Inmueble"}</p>
                    <p className="text-xs text-slate-500">{fecha(v.creadoEn)}</p>
                  </div>
                  <Badge tone={v.estado === "pendiente" ? "amber" : "mint"}>{v.estado}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <History className="h-5 w-5 text-mint-600" /> Historial
          </h2>
          {interacciones.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Aún no hay interacciones registradas.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {Object.entries(conteo).map(([tipo, cantidad]) => (
                <li key={tipo} className="flex justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-slate-600">{ETIQUETAS_INTERACCION[tipo] ?? tipo.replace(/_/g, " ")}</span>
                  <strong>{cantidad}</strong>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
