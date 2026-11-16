export default class OfertaYaCerrada extends Error {
  constructor() {
    super("La oferta ya se encuentra cerrada");
    this.name = "OfertaYaCerrada";
  }
}
