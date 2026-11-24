/* ÚNICO archivo de pesos del recomendador.
   Todos los valores son relativos: se normalizan para dar un puntaje 0-100.
   Ajusta aquí el comportamiento sin tocar los componentes. */

export const PESOS = Object.freeze({
  presupuesto: 25, // Cumplir el presupuesto es la señal más fuerte.
  distrito: 20, // Zonas elegidas por el usuario.
  tipo: 15, // Departamento, casa, terreno u oficina.
  dormitorios: 10, // Espacio mínimo solicitado.
  mascotas: 8, // Acepta mascotas cuando el usuario lo pide.
  prioridades: 12, // Transporte, colegios, parques y mascotas (1-5).
  popularidad: 7, // Vistas, carrito y visitas de otros usuarios.
  interacciones: 8, // Historial del propio usuario.
  destacado: 3, // Pequeño empuje a inmuebles destacados.
});

export const VALOR_INTERACCION = Object.freeze({
  vista: 1,
  carrito: 6,
  guardado: 4,
  me_interesa: 7,
  visita: 8,
  no_me_interesa: -100, // Se filtra directamente, se deja aquí como documentación.
});

export const TIPO_CAMBIO = 3.7; // Referencia demo para comparar PEN y USD.

export const LIMITE_RECOMENDACIONES = 12;
