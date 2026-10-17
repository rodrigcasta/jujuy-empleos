import assert from "node:assert/strict";
import { Response } from "supertest";

export const debeContener = (respuesta: Response, texto: string) => {
  assert.ok(respuesta.text.includes(texto), `Se esperaba que la página contenga "${texto}"`);
};

// Acepta cualquier redirección (302, 303, etc.): lo que importa es a dónde llega el usuario
export const debeRedirigirA = (respuesta: Response, ruta: string) => {
  assert.ok(
    respuesta.status >= 300 && respuesta.status < 400,
    `Se esperaba una redirección, pero el estado fue ${respuesta.status}`,
  );
  assert.equal(respuesta.headers.location, ruta);
};

// Contenido propio de la página, sin la barra de navegación del layout
export const contenidoPrincipal = (respuesta: Response): string => {
  const contenido = /<main[^>]*>([\s\S]*)<\/main>/.exec(respuesta.text);
  assert.ok(contenido, "La página no tiene un elemento <main>");
  return contenido[1];
};
