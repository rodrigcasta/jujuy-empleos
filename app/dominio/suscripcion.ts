import DatosDeSuscripcionInvalidos from "./datos-de-suscripcion-invalidos";

export default class Suscripcion {
  private static readonly LIMITE_PUBLICACION_GRATUITA = 1;
  private static readonly LIMITE_PUBLICACION_PROFESIONAL = 5;
  private static readonly SIN_LIMITE: null = null;
  private static readonly LIMITES_POR_PLAN: ReadonlyMap<string, number | null> = new Map<string, number | null>([
    ["Gratuita", Suscripcion.LIMITE_PUBLICACION_GRATUITA],
    ["Profesional", Suscripcion.LIMITE_PUBLICACION_PROFESIONAL],
    ["Corporativa", Suscripcion.SIN_LIMITE],
  ]);
  private readonly limitePublicacion: number | null;

  constructor(private readonly plan: string) {
    const limite = Suscripcion.LIMITES_POR_PLAN.get(plan);
    if (limite === undefined) {
      throw new DatosDeSuscripcionInvalidos("La suscripción es inválida");
    }
    this.limitePublicacion = limite;
  }

  public obtenerPlan(): string {
    return this.plan;
  }

  public puedePublicar(cantidadOfertasActivas: number): boolean {
    return this.limitePublicacion === Suscripcion.SIN_LIMITE || cantidadOfertasActivas < this.limitePublicacion;
  }
}
