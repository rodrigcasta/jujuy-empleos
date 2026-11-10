export default class PostulacionNoAutorizadaError extends Error {
  constructor() {
    super("Solo los aspirantes pueden postularse a ofertas");
    this.name = "PostulacionNoAutorizadaError";
  }
}
