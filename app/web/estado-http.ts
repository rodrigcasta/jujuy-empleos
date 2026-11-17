// Códigos de estado HTTP usados por la aplicación
export enum EstadoHttp {
  // 302: redirección temporal (la que usa Express por defecto en res.redirect)
  ENCONTRADO = 302,
  // 303: redirección luego de procesar un formulario (POST/Redirect/GET)
  VER_OTRO = 303,
  SOLICITUD_INCORRECTA = 400,
  NO_AUTORIZADO = 401,
  PROHIBIDO = 403,
  NO_ENCONTRADO = 404,
  CONFLICTO = 409,
  ERROR_INTERNO = 500,
}
