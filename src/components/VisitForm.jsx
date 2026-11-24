import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, Phone, Send } from "lucide-react";
import { useApp } from "../context/AppContext";
import { createVisitRequest } from "../data/repository";
import { Button, Card, Input, Select, Textarea, Toast } from "./ui";

const hoy = new Date().toISOString().slice(0, 10);

export function VisitForm({ propertyId, properties = [], showSelector = false, onSuccess }) {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [seleccionado, setSeleccionado] = useState(propertyId ?? properties[0]?.id ?? "");
  const [nombre, setNombre] = useState(user?.nombre ?? "");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [confirmado, setConfirmado] = useState("");

  useEffect(() => {
    if (propertyId) setSeleccionado(propertyId);
  }, [propertyId]);

  useEffect(() => {
    if (user?.nombre) setNombre(user.nombre);
  }, [user?.nombre]);

  const enviar = async (evento) => {
    evento.preventDefault();
    setError("");
    setConfirmado("");
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (!seleccionado) return setError("Selecciona un inmueble.");
    if (nombre.trim().length < 2) return setError("Escribe tu nombre.");
    if (telefono.replace(/\D/g, "").length < 7) return setError("Ingresa un teléfono válido.");
    setEnviando(true);
    try {
      await createVisitRequest(user.id, {
        propertyId: seleccionado,
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        fechaPreferida: fecha || null,
        mensaje: mensaje.trim(),
      });
      setConfirmado("Solicitud registrada. Te contactaremos para confirmar la visita.");
      setMensaje("");
      setFecha("");
      onSuccess?.();
    } catch (e) {
      setError(e.message || "No pudimos registrar la solicitud. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <CalendarDays className="h-5 w-5 text-mint-600" aria-hidden="true" /> Solicitar visita
      </h2>
      <p className="mt-1 text-sm text-slate-500">Sin pagos y sin compromiso. Solo registramos tu interés.</p>

      <form onSubmit={enviar} className="mt-5 space-y-4">
        {showSelector && (
          <div>
            <label className="label" htmlFor="visita-propiedad">Inmueble</label>
            <Select id="visita-propiedad" value={seleccionado} onChange={(e) => setSeleccionado(e.target.value)} required>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
            </Select>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="visita-nombre">Nombre</label>
            <Input id="visita-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required minLength={2} placeholder="Ana García" />
          </div>
          <div>
            <label className="label" htmlFor="visita-telefono">Teléfono</label>
            <Input id="visita-telefono" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} required placeholder="987 654 321" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="visita-fecha">Fecha preferida (opcional)</label>
          <Input id="visita-fecha" type="date" min={hoy} value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="visita-mensaje">Mensaje (opcional)</label>
          <Textarea id="visita-mensaje" value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Me gustaría verlo el fin de semana…" />
        </div>

        {error && <Toast tipo="error" mensaje={error} />}
        {confirmado && <Toast tipo="success" mensaje={confirmado} />}

        <Button type="submit" className="w-full" loading={enviando}>
          <Send className="h-4 w-4" aria-hidden="true" /> Enviar solicitud
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <Phone className="h-3 w-3" /> No compartimos tu teléfono con terceros.
        </p>
      </form>
    </Card>
  );
}
