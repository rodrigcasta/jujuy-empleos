export default class LimiteDeOfertasAlcanzadoError extends Error {
  constructor() {
    super("La suscripcion no permite publicar mas ofertas");
    this.name = "LimiteDeOfertasAlcanzadoError";
  }
}
