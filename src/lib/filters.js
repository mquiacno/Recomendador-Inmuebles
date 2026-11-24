import { TIPO_CAMBIO } from "../data/weights";
import { normalizar } from "./format";

/** Compara precios de distinta moneda en soles para filtros y presupuestos. */
export function precioEnPEN(property) {
  return property.moneda === "USD" ? Number(property.precio) * TIPO_CAMBIO : Number(property.precio);
}

export function filtrarPropiedades(propiedades, filtros = {}) {
  const {
    operacion = "",
    tipo = "",
    distrito = "",
    precioMax = 0,
    dormitorios = 0,
    mascotas = "",
    busqueda = "",
  } = filtros;

  const distritoBuscado = normalizar(distrito);
  const texto = normalizar(busqueda);

  return propiedades.filter((p) => {
    if (operacion && p.operacion !== operacion) return false;
    if (tipo && p.tipo !== tipo) return false;
    if (distritoBuscado && normalizar(p.distrito) !== distritoBuscado) return false;
    if (Number(dormitorios) > 0 && p.dormitorios < Number(dormitorios)) return false;
    if (Number(precioMax) > 0 && precioEnPEN(p) > Number(precioMax)) return false;
    if (mascotas === "si" && !p.mascotas) return false;
    if (mascotas === "no" && p.mascotas) return false;
    if (texto) {
      const hesto = normalizar(`${p.titulo} ${p.descripcion} ${p.distrito} ${p.tipo}`);
      if (!hesto.includes(texto)) return false;
    }
    return true;
  });
}

export function ordenarPropiedades(propiedades, orden = "relevancia") {
  const copia = [...propiedades];
  if (orden === "precio-asc") return copia.sort((a, b) => precioEnPEN(a) - precioEnPEN(b));
  if (orden === "precio-desc") return copia.sort((a, b) => precioEnPEN(b) - precioEnPEN(a));
  return copia.sort((a, b) => {
    if (a.destacado !== b.destacado) return a.destacado ? -1 : 1;
    return new Date(b.creadoEn) - new Date(a.creadoEn);
  });
}
