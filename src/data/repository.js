/* Capa de datos única. La interfaz (páginas y componentes) nunca sabe si está
   usando localStorage (MODO DEMO) o Supabase (MODO SUPABASE).
  Todas las funciones devuelven Promises en ambos modos. */

import { createClient } from "@supabase/supabase-js";
import { PROPIEDADES } from "./seed";

const URL = import.meta.env.VITE_SUPABASE_URL?.trim();
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const MODE = URL && ANON_KEY ? "supabase" : "demo";
export const ES_DEMO = MODE === "demo";

const supabase = ES_DEMO ? null : createClient(URL, ANON_KEY);

const DB_KEY = "ri_demo_db_v2";
const SESSION_KEY = "ri_demo_session_v2";
const EVENTO = "ri:changed";

/* -------------------------------------------------------------------------- */
/* Utilidades demo                                                             */
/* -------------------------------------------------------------------------- */

function notify(tipo = "data") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: { tipo, mode: MODE } }));
}

function uid(prefijo) {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function clon(valor) {
  return JSON.parse(JSON.stringify(valor));
}

function dbInicial() {
  return {
    users: [],
    properties: clon(PROPIEDADES),
    cart_items: [],
    preferences: [],
    visit_requests: [],
    interactions: [],
  };
}

function leerDB() {
  if (typeof window === "undefined") return dbInicial();
  const guardado = window.localStorage.getItem(DB_KEY);
  if (!guardado) {
    const inicial = dbInicial();
    window.localStorage.setItem(DB_KEY, JSON.stringify(inicial));
    return inicial;
  }
  try {
    const db = JSON.parse(guardado);
    if (!Array.isArray(db.properties) || db.properties.length === 0) return dbInicial();
    return db;
  } catch {
    return dbInicial();
  }
}

function escribirDB(db, tipo = "data") {
  if (typeof window !== "undefined") window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  notify(tipo);
}

function usuarioPublico(usuario) {
  if (!usuario) return null;
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    creadoEn: usuario.creadoEn,
  };
}

function sesionDemo() {
  if (typeof window === "undefined") return null;
  const id = window.localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return usuarioPublico(leerDB().users.find((u) => u.id === id));
}

/* -------------------------------------------------------------------------- */
/* Adaptadores Supabase                                                        */
/* -------------------------------------------------------------------------- */

function deSupabase(row) {
  if (!row) return null;
  return {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion ?? "",
    operacion: row.operacion,
    tipo: row.tipo,
    precio: Number(row.precio),
    moneda: row.moneda,
    precioUsd: row.precio_usd == null ? null : Number(row.precio_usd),
    distrito: row.distrito,
    ciudad: row.ciudad ?? "Lima",
    direccion: row.direccion ?? "",
    dormitorios: row.dormitorios ?? 0,
    banos: row.banos ?? 1,
    areaM2: row.area_m2 == null ? null : Number(row.area_m2),
    estacionamientos: row.estacionamientos ?? 0,
    mascotas: Boolean(row.mascotas),
    antiguedad: row.antiguedad ?? null,
    cercaTransporte: row.cerca_transporte ?? 3,
    cercaColegios: row.cerca_colegios ?? 3,
    cercaParques: row.cerca_parques ?? 3,
    destacado: Boolean(row.destacado),
    creadoEn: row.creado_en,
    fotos: row.fotos ?? [],
  };
}

function usuarioDeAuth(user) {
  if (!user) return null;
  return {
    id: user.id,
    nombre: user.user_metadata?.nombre || user.email?.split("@")[0] || "Usuario",
    email: user.email,
    creadoEn: user.created_at,
  };
}

function preferenciaDeSupabase(row) {
  if (!row) return null;
  return {
    budgetMin: Number(row.presupuesto_min ?? 0),
    budgetMax: Number(row.presupuesto_max ?? 0),
    districts: row.distritos ?? [],
    types: row.tipos ?? [],
    bedroomsMin: row.dormitorios_min ?? 0,
    priorities: row.prioridades ?? { transport: 3, schools: 3, parks: 3, pets: 3 },
    pets: row.mascotas ?? "indiferente",
  };
}

const COLUMNAS_PROPIEDAD = `
  id, titulo, descripcion, operacion, tipo, precio, moneda, precio_usd,
  distrito, ciudad, direccion, dormitorios, banos, area_m2, estacionamientos,
  mascotas, antiguedad, cerca_transporte, cerca_colegios, cerca_parques,
  destacado, creado_en, fotos
`;

function lanzar(error, mensaje) {
  throw new Error(error?.message || mensaje);
}

/* -------------------------------------------------------------------------- */
/* API pública del repositorio                                                 */
/* -------------------------------------------------------------------------- */

export async function getSession() {
  if (ES_DEMO) return sesionDemo();
  const { data } = await supabase.auth.getSession();
  return usuarioDeAuth(data?.session?.user);
}

export async function signUp({ nombre, email, password }) {
  if (ES_DEMO) {
    const db = leerDB();
    const correo = email.trim().toLowerCase();
    if (db.users.some((u) => u.email === correo)) {
      throw new Error("Ya existe una cuenta con ese correo en este navegador.");
    }
    const usuario = {
      id: uid("user"),
      nombre: nombre.trim(),
      email: correo,
      password,
      creadoEn: new Date().toISOString(),
    };
    db.users.push(usuario);
    window.localStorage.setItem(SESSION_KEY, usuario.id);
    escribirDB(db, "auth");
    return { user: usuarioPublico(usuario), message: null };
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { nombre: nombre.trim() } },
  });
  if (error) lanzar(error, "No pudimos crear la cuenta.");
  if (!data.session) {
    return { user: null, message: "Revisa tu correo para confirmar la cuenta y luego ingresa." };
  }
  notify("auth");
  return { user: usuarioDeAuth(data.user), message: null };
}

export async function signIn({ email, password }) {
  if (ES_DEMO) {
    const db = leerDB();
    const correo = email.trim().toLowerCase();
    const usuario = db.users.find((u) => u.email === correo && u.password === password);
    if (!usuario) throw new Error("Correo o contraseña incorrectos.");
    window.localStorage.setItem(SESSION_KEY, usuario.id);
    notify("auth");
    return { user: usuarioPublico(usuario), message: null };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw new Error("Correo o contraseña incorrectos.");
  notify("auth");
  return { user: usuarioDeAuth(data.user), message: null };
}

export async function signOut() {
  if (ES_DEMO) {
    if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
  } else {
    const { error } = await supabase.auth.signOut();
    if (error) lanzar(error, "No se pudo cerrar la sesión.");
  }
  notify("auth");
}

export async function getProperties() {
  if (ES_DEMO) return clon(leerDB().properties);
  const { data, error } = await supabase.from("properties").select(COLUMNAS_PROPIEDAD);
  if (error) lanzar(error, "No pudimos cargar las propiedades.");
  return (data ?? []).map(deSupabase);
}

export async function getPropertyById(id) {
  const propiedades = await getProperties();
  return propiedades.find((p) => p.id === id) ?? null;
}

export async function getCart(userId) {
  if (!userId) return [];
  if (ES_DEMO) {
    const db = leerDB();
    return db.cart_items
      .filter((item) => item.userId === userId)
      .map((item) => ({
        id: item.id,
        propertyId: item.propertyId,
        property: db.properties.find((p) => p.id === item.propertyId) ?? null,
        createdAt: item.creadoEn,
      }))
      .filter((item) => item.property);
  }

  const { data, error } = await supabase
    .from("cart_items")
    .select(`id, property_id, creado_en, properties ( ${COLUMNAS_PROPIEDAD} )`)
    .eq("user_id", userId);
  if (error) lanzar(error, "No pudimos cargar tu carrito.");
  return (data ?? [])
    .map((item) => ({
      id: item.id,
      propertyId: item.property_id,
      property: deSupabase(item.properties),
      createdAt: item.creado_en,
    }))
    .filter((item) => item.property);
}

export async function addToCart(userId, propertyId) {
  if (!userId) throw new Error("Ingresa para guardar inmuebles en tu carrito.");
  if (ES_DEMO) {
    const db = leerDB();
    if (!db.cart_items.some((i) => i.userId === userId && i.propertyId === propertyId)) {
      db.cart_items.push({ id: uid("cart"), userId, propertyId, creadoEn: new Date().toISOString() });
    }
    db.interactions.push({
      id: uid("int"),
      userId,
      propertyId,
      tipo: "carrito",
      creadoEn: new Date().toISOString(),
    });
    escribirDB(db);
    return;
  }

  const { error } = await supabase
    .from("cart_items")
    .upsert({ user_id: userId, property_id: propertyId }, { onConflict: "user_id,property_id" });
  if (error) lanzar(error, "No se pudo agregar al carrito.");
  await logInteraction(userId, propertyId, "carrito");
}

export async function removeFromCart(userId, propertyId) {
  if (ES_DEMO) {
    const db = leerDB();
    db.cart_items = db.cart_items.filter(
      (i) => !(i.userId === userId && i.propertyId === propertyId)
    );
    escribirDB(db);
    return;
  }
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("property_id", propertyId);
  if (error) lanzar(error, "No se pudo quitar del carrito.");
}

export async function getPreferences(userId) {
  if (!userId) return null;
  if (ES_DEMO) {
    const fila = leerDB().preferences.find((p) => p.userId === userId);
    return fila ? clon(fila) : null;
  }
  const { data, error } = await supabase
    .from("preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) lanzar(error, "No pudimos cargar tus preferencias.");
  return preferenciaDeSupabase(data);
}

export async function savePreferences(userId, preferencias) {
  if (!userId) throw new Error("Ingresa para guardar tus preferencias.");
  if (ES_DEMO) {
    const db = leerDB();
    const registro = {
      userId,
      ...preferencias,
      actualizadoEn: new Date().toISOString(),
    };
    const indice = db.preferences.findIndex((p) => p.userId === userId);
    if (indice >= 0) db.preferences[indice] = registro;
    else db.preferences.push(registro);
    escribirDB(db);
    return;
  }

  const { error } = await supabase.from("preferences").upsert(
    {
      user_id: userId,
      presupuesto_min: preferencias.budgetMin,
      presupuesto_max: preferencias.budgetMax,
      distritos: preferencias.districts,
      tipos: preferencias.types,
      dormitorios_min: preferencias.bedroomsMin,
      prioridades: preferencias.priorities,
      mascotas: preferencias.pets,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) lanzar(error, "No se pudieron guardar tus preferencias.");
}

export async function createVisitRequest(userId, datos) {
  if (!userId) throw new Error("Ingresa para solicitar una visita.");
  if (ES_DEMO) {
    const db = leerDB();
    db.visit_requests.push({
      id: uid("vis"),
      userId,
      propertyId: datos.propertyId,
      nombre: datos.nombre,
      telefono: datos.telefono,
      mensaje: datos.mensaje ?? "",
      fechaPreferida: datos.fechaPreferida ?? null,
      estado: "pendiente",
      creadoEn: new Date().toISOString(),
    });
    db.interactions.push({
      id: uid("int"),
      userId,
      propertyId: datos.propertyId,
      tipo: "visita",
      creadoEn: new Date().toISOString(),
    });
    escribirDB(db);
    return;
  }

  const { error } = await supabase.from("visit_requests").insert({
    user_id: userId,
    property_id: datos.propertyId,
    nombre: datos.nombre,
    telefono: datos.telefono,
    mensaje: datos.mensaje ?? null,
    fecha_preferida: datos.fechaPreferida || null,
    estado: "pendiente",
  });
  if (error) lanzar(error, "No se pudo registrar la solicitud.");
  await logInteraction(userId, datos.propertyId, "visita");
}

export async function logInteraction(userId, propertyId, tipo) {
  if (!userId) return;
  if (ES_DEMO) {
    const db = leerDB();
    db.interactions.push({
      id: uid("int"),
      userId,
      propertyId,
      tipo,
      creadoEn: new Date().toISOString(),
    });
    escribirDB(db);
    return;
  }
  const { error } = await supabase
    .from("interactions")
    .insert({ user_id: userId, property_id: propertyId, tipo });
  if (error) lanzar(error, "No pudimos registrar la interacción.");
}

export async function getInteractions(userId) {
  if (!userId) return [];
  if (ES_DEMO) {
    return clon(leerDB().interactions.filter((i) => i.userId === userId));
  }
  const { data, error } = await supabase
    .from("interactions")
    .select("id, property_id, tipo, creado_en")
    .eq("user_id", userId);
  if (error) lanzar(error, "No pudimos cargar tu historial.");
  return (data ?? []).map((i) => ({
    id: i.id,
    propertyId: i.property_id,
    tipo: i.tipo,
    creadoEn: i.creado_en,
  }));
}

export async function getVisitRequests(userId) {
  if (!userId) return [];
  if (ES_DEMO) {
    const db = leerDB();
    return db.visit_requests
      .filter((v) => v.userId === userId)
      .map((v) => ({
        ...clon(v),
        property: db.properties.find((p) => p.id === v.propertyId) ?? null,
      }))
      .sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn));
  }
  const { data, error } = await supabase
    .from("visit_requests")
    .select(`id, property_id, nombre, telefono, mensaje, fecha_preferida, estado, creado_en, properties ( ${COLUMNAS_PROPIEDAD} )`)
    .eq("user_id", userId)
    .order("creado_en", { ascending: false });
  if (error) lanzar(error, "No pudimos cargar tus visitas.");
  return (data ?? []).map((v) => ({
    id: v.id,
    propertyId: v.property_id,
    property: deSupabase(v.properties),
    nombre: v.nombre,
    telefono: v.telefono,
    mensaje: v.mensaje,
    fechaPreferida: v.fecha_preferida,
    estado: v.estado,
    creadoEn: v.creado_en,
  }));
}
