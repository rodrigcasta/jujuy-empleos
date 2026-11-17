export default class OfertaYaCerradaError extends Error {
  constructor() {
    super("La oferta ya se encuentra cerrada");
    this.name = "OfertaYaCerradaError";
  }
}
