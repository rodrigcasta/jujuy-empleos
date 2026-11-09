export default class PublicacionNoAutorizadaError extends Error {
  constructor() {
    super("Solo los empresarios pueden publicar ofertas");
    this.name = "PublicacionNoAutorizadaError";
  }
}
