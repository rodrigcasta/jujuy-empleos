import DatosDeSuscripcionInvalidos from "./datos-de-suscripcion-invalidos";

export default class Suscripcion {
  private static readonly PLANES_VALIDOS: readonly string[] = ["Gratuita", "Profesional", "Corporativa"];

  constructor(private readonly plan: string) {
    if (!Suscripcion.PLANES_VALIDOS.includes(plan)) {
      throw new DatosDeSuscripcionInvalidos("La suscripción es inválida");
    }
  }

  public obtenerPlan(): string {
    return this.plan;
  }
}
