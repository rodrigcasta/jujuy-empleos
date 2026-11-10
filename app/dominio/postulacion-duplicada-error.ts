export default class PostulacionDuplicadaError extends Error {
  constructor() {
    super("Ya te postulaste a esta oferta");
    this.name = "PostulacionDuplicadaError";
  }
}
