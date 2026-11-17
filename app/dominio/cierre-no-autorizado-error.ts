export default class CierreNoAutorizadoError extends Error {
  constructor() {
    super("Solo el empresario propietario puede cerrar la oferta");
    this.name = "CierreNoAutorizadoError";
  }
}
