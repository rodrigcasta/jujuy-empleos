import OfertaYaCerradaError from "./oferta-ya-cerrada-error";
import DatosDePostulacionInvalidos from "./datos-de-postulacion-invalidos";
import Usuario from "./usuario";
import Oferta from "./oferta";
import PostulacionNoAutorizadaError from "./postulacion-no-autorizada-error";

export default class Postulacion {
  private static readonly ID_SIN_ASIGNAR = 0;
  private aspirante: Usuario;
  private oferta: Oferta;
  private fechaPostulacion: Date;
  private id: number;

  private constructor(
    aspirante: Usuario,
    oferta: Oferta,
    fechaPostulacion: Date,
    id: number = Postulacion.ID_SIN_ASIGNAR,
  ) {
    if (!aspirante.esAspirante()) {
      throw new PostulacionNoAutorizadaError();
    }
    if (Number.isNaN(fechaPostulacion.getTime())) {
      throw new DatosDePostulacionInvalidos("La fecha de postulación es inválida");
    }
    this.aspirante = aspirante;
    this.oferta = oferta;
    this.fechaPostulacion = new Date(fechaPostulacion.getTime());
    this.id = Postulacion.validarId(id);
  }

  public static estaPermitidaPara(aspirante: Usuario, oferta: Oferta): boolean {
    return oferta.estaActiva() && aspirante.esAspirante();
  }

  public static crear(aspirante: Usuario, oferta: Oferta, fechaPostulacion: Date): Postulacion {
    if (!Postulacion.estaPermitidaPara(aspirante, oferta)) {
      if (!oferta.estaActiva()) {
        throw new OfertaYaCerradaError();
      }
      throw new PostulacionNoAutorizadaError();
    }
    return new Postulacion(aspirante, oferta, fechaPostulacion);
  }

  public static reconstruir(aspirante: Usuario, oferta: Oferta, fechaPostulacion: Date, id: number): Postulacion {
    return new Postulacion(aspirante, oferta, fechaPostulacion, id);
  }

  public obtenerAspirante(): Usuario {
    return this.aspirante;
  }

  public obtenerOferta(): Oferta {
    return this.oferta;
  }

  public obtenerFechaPostulacion(): Date {
    return new Date(this.fechaPostulacion.getTime());
  }

  public obtenerId(): number {
    return this.id;
  }

  public asignarId(id: number): void {
    this.id = Postulacion.validarId(id);
  }

  private static validarId(id: number): number {
    if (!Number.isSafeInteger(id) || id < Postulacion.ID_SIN_ASIGNAR) {
      throw new DatosDePostulacionInvalidos("El identificador de la postulación es inválido");
    }
    return id;
  }
}
