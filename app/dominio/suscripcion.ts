import DatosDeSuscripcionInvalidos from "./datos-de-suscripcion-invalidos";

export default class Suscripcion {
  private static readonly PLAN_GRATUITA = "Gratuita";
  private static readonly LIMITE_PUBLICACION_GRATUITA = 1;
  private static readonly PLANES_VALIDOS: readonly string[] = [Suscripcion.PLAN_GRATUITA, "Profesional", "Corporativa"];

  constructor(private readonly plan: string) {
    if (!Suscripcion.PLANES_VALIDOS.includes(plan)) {
      throw new DatosDeSuscripcionInvalidos("La suscripción es inválida");
    }
  }

  public obtenerPlan(): string {
    return this.plan;
  }

  public puedePublicar(cantidadOfertasActivas: number): boolean {
    return this.plan === Suscripcion.PLAN_GRATUITA && cantidadOfertasActivas < Suscripcion.LIMITE_PUBLICACION_GRATUITA;
  }
}
