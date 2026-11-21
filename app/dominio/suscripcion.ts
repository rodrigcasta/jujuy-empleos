import DatosDeSuscripcionInvalidos from "./datos-de-suscripcion-invalidos";

export default class Suscripcion {
  private static readonly PLAN_GRATUITA = "Gratuita";
  private static readonly PLAN_PROFESIONAL = "Profesional";
  private static readonly PLAN_CORPORATIVA = "Corporativa";
  private static readonly LIMITE_PUBLICACION_GRATUITA = 1;
  private static readonly LIMITE_PUBLICACION_PROFESIONAL = 5;
  private static readonly PLANES_VALIDOS: readonly string[] = [
    Suscripcion.PLAN_GRATUITA,
    Suscripcion.PLAN_PROFESIONAL,
    Suscripcion.PLAN_CORPORATIVA,
  ];

  constructor(private readonly plan: string) {
    if (!Suscripcion.PLANES_VALIDOS.includes(plan)) {
      throw new DatosDeSuscripcionInvalidos("La suscripción es inválida");
    }
  }

  public obtenerPlan(): string {
    return this.plan;
  }

  public puedePublicar(cantidadOfertasActivas: number): boolean {
    if (this.plan === Suscripcion.PLAN_GRATUITA) {
      return cantidadOfertasActivas < Suscripcion.LIMITE_PUBLICACION_GRATUITA;
    }
    if (this.plan === Suscripcion.PLAN_PROFESIONAL) {
      return cantidadOfertasActivas < Suscripcion.LIMITE_PUBLICACION_PROFESIONAL;
    }
    return this.plan === Suscripcion.PLAN_CORPORATIVA;
  }
}
