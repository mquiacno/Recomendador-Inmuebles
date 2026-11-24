import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Info, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Badge, Button, Card, Input, Toast } from "../components/ui";
import { useApp } from "../context/AppContext";
import { signIn, signUp } from "../data/repository";

function AuthShell({ titulo, descripcion, children, pie }) {
  return (
    <div className="container mx-auto flex max-w-md justify-center px-4 py-14">
      <Card className="w-full p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
        <p className="mt-1 text-sm text-slate-500">{descripcion}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-center text-sm text-slate-500">{pie}</p>
      </Card>
    </div>
  );
}

function Campo({ icono: Icono, id, label, ...props }) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="relative">
        <Icono className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <Input id={id} className="pl-10" {...props} />
      </div>
    </div>
  );
}

export function Login() {
  const { user, refresh, esDemo } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.from || "/recomendador";
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (user) return <Navigate to={destino} replace />;

  const enviar = async (evento) => {
    evento.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return setError("Ingresa un correo válido.");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    setEnviando(true);
    try {
      const resultado = await signIn({ email: correo, password });
      if (resultado.message) return setError(resultado.message);
      await refresh();
      navigate(destino, { replace: true });
    } catch (e) {
      setError(e.message || "No pudimos iniciar sesión.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthShell
      titulo="Bienvenido de nuevo"
      descripcion="Ingresa para ver tus recomendaciones y guardar inmuebles."
      pie={<>¿Aún no tienes cuenta? <Link to="/registro" className="font-semibold text-brand-700 hover:underline">Regístrate</Link></>}
    >
      {esDemo && (
        <div className="mb-5 flex gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700">
          <Info className="h-4 w-4 shrink-0" /> Demo: las cuentas se guardan solo en este navegador. Usa cualquier correo y contraseña de 6+ caracteres.
        </div>
      )}
      <form onSubmit={enviar} className="space-y-4">
        <Campo icono={Mail} id="login-correo" label="Correo electrónico" type="email" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required placeholder="ana@ejemplo.com" />
        <Campo icono={LockKeyhole} id="login-password" label="Contraseña" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" />
        {error && <Toast tipo="error" mensaje={error} />}
        <Button type="submit" className="w-full" loading={enviando}>Ingresar</Button>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const { user, refresh, esDemo } = useApp();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (user) return <Navigate to="/recomendador" replace />;

  const enviar = async (evento) => {
    evento.preventDefault();
    setError("");
    if (nombre.trim().length < 2) return setError("Escribe tu nombre (al menos 2 caracteres).");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return setError("Ingresa un correo válido.");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirmacion) return setError("Las contraseñas no coinciden.");
    setEnviando(true);
    try {
      const resultado = await signUp({ nombre, email: correo, password });
      if (resultado.message) {
        setError(resultado.message);
        return;
      }
      await refresh();
      navigate("/recomendador", { replace: true });
    } catch (e) {
      setError(e.message || "No pudimos crear tu cuenta.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthShell
      titulo="Crea tu cuenta"
      descripcion="Guarda preferencias, carrito y visitas en un solo lugar."
      pie={<>¿Ya tienes cuenta? <Link to="/login" className="font-semibold text-brand-700 hover:underline">Ingresa</Link></>}
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {esDemo ? (
          <Badge tone="brand">Modo demo · localStorage</Badge>
        ) : (
          <Badge tone="mint">Modo Supabase</Badge>
        )}
      </div>
      {esDemo && (
        <div className="mb-5 flex gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700">
          <Info className="h-4 w-4 shrink-0" /> Demo: las cuentas se guardan solo en este navegador.
        </div>
      )}
      <form onSubmit={enviar} className="space-y-4">
        <Campo icono={UserRound} id="reg-nombre" label="Nombre" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} required minLength={2} placeholder="Ana García" />
        <Campo icono={Mail} id="reg-correo" label="Correo electrónico" type="email" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required placeholder="ana@ejemplo.com" />
        <Campo icono={LockKeyhole} id="reg-password" label="Contraseña" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" />
        <Campo icono={LockKeyhole} id="reg-confirmacion" label="Confirmar contraseña" type="password" autoComplete="new-password" value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} required minLength={6} placeholder="Repite tu contraseña" />
        {error && <Toast tipo="error" mensaje={error} />}
        <Button type="submit" className="w-full" loading={enviando}>Crear cuenta</Button>
      </form>
    </AuthShell>
  );
}
