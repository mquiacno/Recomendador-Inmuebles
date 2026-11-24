/* 24 inmuebles ficticios de Lima para el MODO DEMO.
   Las fotos son placeholders estables de picsum.photos (3 por inmueble). */

const fotos = (id) => [
  `https://picsum.photos/seed/${id}-a/1200/800`,
  `https://picsum.photos/seed/${id}-b/1200/800`,
  `https://picsum.photos/seed/${id}-c/1200/800`,
];

const base = {
  ciudad: "Lima",
  estacionamientos: 1,
  antiguedad: 8,
  destacado: false,
};

const datos = [
  ["p-01", "Departamento luminoso en Miraflores", "Sala amplia, cocina equipada y balcón con luz todo el día. A cinco minutos del Parque Kennedy.", "venta", "departamento", 240000, "USD", "Miraflores", 3, 2, 105, true, 8, 5, 4, 4, true, "2026-01-12"],
  ["p-02", "Departamento ejecutivo en San Isidro", "Acabados premium, sala de juntas y vista a la laguna. Ideal para trabajar desde casa.", "venta", "departamento", 390000, "USD", "San Isidro", 3, 3, 148, true, 5, 5, 5, 3, false, "2026-01-18"],
  ["p-03", "Casa con patio en Barranco", "Casa independiente con patio, parrilla y dos plantas. Zona tranquila cerca de la Puente de los Suspiros.", "venta", "casa", 620000, "USD", "Barranco", 4, 3, 210, true, 15, 4, 3, 5, false, "2026-02-02"],
  ["p-04", "Departamento familiar en Surco", "Cuatro dormitorios, terraza y vigilancia 24 horas. Cerca de colegios y de Monterrico.", "venta", "departamento", 890000, "PEN", "Santiago de Surco", 4, 3, 165, true, 10, 4, 5, 4, false, "2026-02-09"],
  ["p-05", "Departamento renovado en Jesús María", "Cocina nueva, pisos de madera y buena ventilación. A pasos de la Av. Argentina.", "venta", "departamento", 520000, "PEN", "Jesús María", 2, 1, 78, true, 20, 5, 4, 3, false, "2026-02-14"],
  ["p-06", "Departamento compacto en Lince", "Bien distribuido, con balcón y lavandería. Excelente para una persona o pareja.", "venta", "departamento", 380000, "PEN", "Lince", 1, 1, 52, false, 12, 5, 3, 3, false, "2026-02-21"],
  ["p-07", "Casa quinta en Magdalena del Mar", "Jardín, tres dormitorios y amplia sala. A diez minutos de la Costa Verde.", "venta", "casa", 1150000, "PEN", "Magdalena del Mar", 3, 2, 180, true, 25, 4, 4, 5, false, "2026-03-01"],
  ["p-08", "Departamento con vista al mar en San Miguel", "Terraza hacia la Costa Verde, cocina abierta y dormitorio principal con baño propio.", "venta", "departamento", 760000, "PEN", "San Miguel", 3, 2, 120, true, 6, 4, 4, 5, true, "2026-03-08"],
  ["p-09", "Casa moderna en La Molina", "Diseño contemporáneo, pequeña piscina y estudio independiente. Cerca de universidades.", "venta", "casa", 1250000, "PEN", "La Molina", 4, 4, 280, true, 4, 3, 5, 5, true, "2026-03-15"],
  ["p-10", "Terreno residencial en Ate", "Terreno plano de 500 m², ideal para casa propia. Zona en crecimiento con buenos accesos.", "venta", "terreno", 320000, "PEN", "Ate", 0, 0, 500, false, 0, 3, 3, 4, false, "2026-03-22"],
  ["p-11", "Casa económica en Villa El Salvador", "Tres dormitorios, patio amplio y cerca de la estación de metro.", "venta", "casa", 410000, "PEN", "Villa El Salvador", 3, 2, 130, true, 18, 5, 4, 3, false, "2026-04-03"],
  ["p-12", "Departamento frente al mar en Chorrillos", "Vista panorámica, dos ascensores y acceso directo a la ciclovía.", "venta", "departamento", 690000, "PEN", "Chorrillos", 2, 2, 95, true, 9, 4, 3, 5, false, "2026-04-11"],
  ["p-13", "Alquiler: departamento amueblado en Miraflores", "Amueblado, con internet incluido y limpieza quincenal opcional.", "alquiler", "departamento", 3800, "PEN", "Miraflores", 2, 1, 72, false, 5, 5, 4, 4, true, "2026-04-18"],
  ["p-14", "Alquiler: departamento ejecutivo en San Isidro", "Listo para mudarse, con gimnasio y sala de juntas en el edificio.", "alquiler", "departamento", 6500, "PEN", "San Isidro", 2, 2, 110, true, 4, 5, 5, 3, false, "2026-04-25"],
  ["p-15", "Alquiler: loft artístico en Barranco", "Loft con techo alto, cocina abierta y terraza. Cerca de galerías y cafeterías.", "alquiler", "departamento", 3200, "PEN", "Barranco", 1, 1, 58, false, 10, 4, 3, 5, true, "2026-05-02"],
  ["p-16", "Alquiler: casa con patio en Surco", "Casa independiente, patio y parrilla. Perfecta para familia con mascota.", "alquiler", "casa", 5200, "PEN", "Santiago de Surco", 3, 2, 155, true, 16, 4, 5, 4, true, "2026-05-09"],
  ["p-17", "Alquiler: casa con estudio en La Molina", "Casa con oficina independiente, jardín y estacionamiento doble.", "alquiler", "casa", 7200, "PEN", "La Molina", 4, 3, 220, true, 6, 3, 5, 5, true, "2026-05-16"],
  ["p-18", "Departamento premium en San Borja", "Tres dormitorios, sala doble y walking closet. Frente a un parque.", "venta", "departamento", 920000, "PEN", "San Borja", 3, 3, 135, true, 7, 4, 5, 5, false, "2026-05-23"],
  ["p-19", "Departamento familiar en Pueblo Libre", "Ambientes amplios y luminosos, cerca de la Plaza Bolívar y de colegios.", "venta", "departamento", 470000, "PEN", "Pueblo Libre", 3, 2, 110, true, 22, 4, 5, 4, true, "2026-06-01"],
  ["p-20", "Oficina céntrica en Breña", "Oficina diáfana con recepción y dos baños. Cerca de la Av. Brasil.", "venta", "oficina", 350000, "PEN", "Breña", 0, 2, 90, true, 11, 5, 2, 2, false, "2026-06-08"],
  ["p-21", "Alquiler: departamento céntrico en Callao", "Cerca del metro y del aeropuerto. Amueblado, con cocina y lavandería.", "alquiler", "departamento", 2400, "PEN", "Callao", 2, 1, 64, false, 9, 5, 3, 2, true, "2026-06-15"],
  ["p-22", "Departamento nuevo en Los Olivos", "Entrega nueva, cocina modular y acabados claros. Cerca de centros comerciales.", "venta", "departamento", 470000, "PEN", "Los Olivos", 3, 2, 98, true, 1, 4, 4, 3, true, "2026-06-22"],
  ["p-23", "Casa familiar en Independencia", "Amplia sala, cinco dormitorios y garage para dos autos. Cerca del Parque Zonal.", "venta", "casa", 640000, "PEN", "Independencia", 5, 3, 190, true, 14, 4, 5, 4, true, "2026-07-01"],
  ["p-24", "Alquiler: departamento frente al mar en Chorrillos", "Con balcón y vista al mar. Edificio con vigilancia, ascensor y parqueadero.", "alquiler", "departamento", 2900, "PEN", "Chorrillos", 2, 1, 68, true, 13, 4, 3, 5, false, "2026-07-09"],
];

const TIPO_CAMBIO = 3.7;

export const PROPIEDADES = datos.map((fila) => {
  const [
    id, titulo, descripcion, operacion, tipo, precio, moneda, distrito,
    dormitorios, banos, areaM2, mascotas, antiguedad,
    cercaTransporte, cercaColegios, cercaParques, destacado, creadoEn,
  ] = fila;

  return {
    ...base,
    id,
    titulo,
    descripcion,
    operacion,
    tipo,
    precio,
    moneda,
    precioUsd: moneda === "USD" ? precio : Math.round(precio / TIPO_CAMBIO),
    distrito,
    direccion: "Dirección referencial · " + distrito,
    dormitorios,
    banos,
    areaM2,
    mascotas,
    antiguedad,
    cercaTransporte,
    cercaColegios,
    cercaParques,
    destacado,
    creadoEn: new Date(creadoEn).toISOString(),
    fotos: fotos(id),
  };
});

export const DISTRITOS = [...new Set(PROPIEDADES.map((p) => p.distrito))].sort((a, b) => a.localeCompare(b, "es"));
export const TIPOS = ["departamento", "casa", "terreno", "oficina"];
