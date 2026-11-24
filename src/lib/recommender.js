import { LIMITE_RECOMENDACIONES, PESOS, VALOR_INTERACCION } from "../data/weights";
import { normalizar } from "./format";
import { precioEnPEN } from "./filters";

const clamp = (numero, min, max) => Math.min(max, Math.max(min, numero));

function listaTextos(textos) {
  const limpios = textos.filter(Boolean);
  if (limpios.length <= 1) return limpios[0] ?? "";
  if (limpios.length === 2) return `${limpios[0]} y ${limpios[1]}`;
  return `${limpios.slice(0, -1).join(", ")} y ${limpios[limpios.length - 1]}`;
}

function tienePreferencias(pref) {
  if (!pref) return false;
  const prioridades = pref.priorities ?? {};
  return Boolean(
    Number(pref.budgetMin) > 0 ||
      Number(pref.budgetMax) > 0 ||
      pref.districts?.length ||
      pref.types?.length ||
      Number(pref.bedroomsMin) > 0 ||
      (pref.pets && pref.pets !== "indiferente") ||
      Object.values(prioridades).some((v) => Number(v) !== 3)
  );
}

function prioridadScore(property, prioridades = {}) {
  const pesos = {
    transporte: Number(prioridades.transport ?? 3),
    colegios: Number(prioridades.schools ?? 3),
    parques: Number(prioridades.parks ?? 3),
    mascotas: Number(prioridades.pets ?? 3),
  };
  const total = Object.values(pesos).reduce((a, b) => a + b, 0) || 1;
  const valorMascotas = property.mascotas ? 5 : 2;
  const obtenido =
    Number(property.cercaTransporte || 3) * pesos.transporte +
    Number(property.cercaColegios || 3) * pesos.colegios +
    Number(property.cercaParques || 3) * pesos.parques +
    valorMascotas * pesos.mascotas;
  return clamp(obtenido / (total * 5), 0, 1);
}

function explicacionPreferencias(property, pref, razones) {
  const texto = listaTextos(razones);
  return texto
    ? `${texto[0].toUpperCase()}${texto.slice(1)}.`
    : "Se acerca a lo que pediste, aunque ajustar tus preferencias puede afinar el resultado.";
}

/**
 * Recomendador híbrido simple:
 * 1) Sin preferencias → reglas de popularidad por zona y destacados.
 * 2) Con preferencias → afinidad 0-100 con pesos de weights.js.
 * 3) Con historial → ajuste por vistas, carrito, guardados, visitas y descartes.
 */
export function calcularRecomendaciones({
  propiedades = [],
  preferencias = null,
  interacciones = [],
  limite = LIMITE_RECOMENDACIONES,
}) {
  const porId = Object.fromEntries(propiedades.map((p) => [p.id, p]));
  const descartados = new Set(
    interacciones.filter((i) => i.tipo === "no_me_interesa").map((i) => i.propertyId)
  );

  const popularidad = {};
  const historial = {};
  const porDistrito = {};
  propiedades.forEach((p) => {
    popularidad[p.id] = 0;
    porDistrito[p.distrito] = 0;
  });

  interacciones.forEach((i) => {
    const valor = VALOR_INTERACCION[i.tipo] ?? 0;
    if (i.tipo === "no_me_interesa") return;
    if (popularidad[i.propertyId] !== undefined) popularidad[i.propertyId] += valor;
    historial[i.propertyId] = (historial[i.propertyId] ?? 0) + valor;
    const propiedad = porId[i.propertyId];
    if (propiedad && valor > 0) porDistrito[propiedad.distrito] += valor;
  });

  const maxDistrito = Math.max(1, ...Object.values(porDistrito));
  const conPreferencias = tienePreferencias(preferencias);
  const distritosElegidos = (preferencias?.districts ?? []).map(normalizar);
  const tiposElegidos = (preferencias?.types ?? []).map(normalizar);
  const presupuestoMin = Number(preferencias?.budgetMin ?? 0);
  const presupuestoMax = Number(preferencias?.budgetMax ?? 0);
  const dormitoriosMin = Number(preferencias?.bedroomsMin ?? 0);
  const mascotas = preferencias?.pets ?? "indiferente";

  const resultados = propiedades
    .filter((p) => !descartados.has(p.id))
    .map((p) => {
      const pop = Math.max(0, popularidad[p.id] ?? 0);
      const bonusPopular = Math.min(PESOS.popularidad, pop * 0.8);

      if (!conPreferencias) {
        const bonusZona = Math.round((8 * (porDistrito[p.distrito] ?? 0)) / maxDistrito);
        const score = clamp(
          Math.round(48 + bonusZona + bonusPopular + (p.destacado ? PESOS.destacado + 2 : 0)),
          0,
          100
        );
        const explicacion = pop > 0 || bonusZona > 0
          ? `Popular entre quienes exploraron ${p.distrito}; tiene ${p.cercaTransporte >= 4 ? "buena cercanía al transporte" : "datos de ubicación claros"}.`
          : "Destacado de la zona con datos completos; buen punto de partida mientras defines tus preferencias.";
        return { ...p, score, explicacion, modo: "popularidad" };
      }

      const precio = precioEnPEN(p);
      const dentroPresupuesto =
        (!presupuestoMin || precio >= presupuestoMin) &&
        (!presupuestoMax || precio <= presupuestoMax);
      const scorePresupuesto = dentroPresupuesto
        ? 1
        : presupuestoMax && precio > presupuestoMax
          ? precio <= presupuestoMax * 1.15 ? 0.5 : 0
          : presupuestoMin && precio < presupuestoMin
            ? precio >= presupuestoMin * 0.85 ? 0.5 : 0
            : 0.7;
      const scoreDistrito = distritosElegidos.length
        ? distritosElegidos.includes(normalizar(p.distrito)) ? 1 : 0
        : 0.7;
      const scoreTipo = tiposElegidos.length
        ? tiposElegidos.includes(normalizar(p.tipo)) ? 1 : 0
        : 0.7;
      const scoreDormitorios = dormitoriosMin > 0
        ? clamp(p.dormitorios / dormitoriosMin, 0, 1)
        : 0.7;
      const scoreMascotas = mascotas === "si"
        ? p.mascotas ? 1 : 0
        : mascotas === "no"
          ? p.mascotas ? 0 : 1
          : 0.7;
      const scorePrioridades = prioridadScore(p, preferencias?.priorities);

      const pesosBase = [
        ["presupuesto", scorePresupuesto],
        ["distrito", scoreDistrito],
        ["tipo", scoreTipo],
        ["dormitorios", scoreDormitorios],
        ["mascotas", scoreMascotas],
        ["prioridades", scorePrioridades],
      ];
      const sumaPesos = pesosBase.reduce((acc, [clave]) => acc + PESOS[clave], 0);
      const base = pesosBase.reduce((acc, [clave, valor]) => acc + PESOS[clave] * valor, 0) / sumaPesos * 100;

      const bonusHistorial = clamp((historial[p.id] ?? 0) * 2, -20, PESOS.interacciones + 4);
      const score = clamp(
        Math.round(base + bonusHistorial + bonusPopular + (p.destacado ? PESOS.destacado : 0)),
        0,
        100
      );

      const razones = [];
      if ((presupuestoMin || presupuestoMax) && dentroPresupuesto) razones.push("dentro de tu presupuesto");
      if (distritosElegidos.includes(normalizar(p.distrito))) razones.push(`en ${p.distrito}, un distrito que elegiste`);
      if (tiposElegidos.includes(normalizar(p.tipo))) razones.push("del tipo que buscas");
      if (dormitoriosMin > 0 && p.dormitorios >= dormitoriosMin) razones.push(`${p.dormitorios} dormitorios`);
      if (mascotas === "si" && p.mascotas) razones.push("acepta mascotas");
      if (p.cercaTransporte >= 4) razones.push("cerca del transporte");
      if ((historial[p.id] ?? 0) > 0) razones.push("coincide con lo que ya te interesó");
      if (pop > 3) razones.push("popular entre otros usuarios");

      return {
        ...p,
        score,
        explicacion: explicacionPreferencias(p, preferencias, razones),
        modo: "preferencias",
      };
    })
    .sort((a, b) => b.score - a.score || Number(b.destacado) - Number(a.destacado));

  return resultados.slice(0, limite);
}
