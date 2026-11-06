export default class OfertaNoEncontradaError extends Error {
  constructor() {
    super("No se encontró la oferta solicitada");
    this.name = "OfertaNoEncontradaError";
  }
}
