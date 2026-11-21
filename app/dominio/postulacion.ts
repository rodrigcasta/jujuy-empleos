import DatosDePostulacionInvalidos from "./datos-de-postulacion-invalidos";
import Usuario from "./usuario";
import Oferta from "./oferta";
import PostulacionNoAutorizadaError from "./postulacion-no-autorizada-error";

export default class Postulacion {
  private aspirante: Usuario;
  private oferta: Oferta;
  private fechaPostulacion: Date;
  private id: number;

  constructor(aspirante: Usuario, oferta: Oferta, fechaPostulacion: Date, id: number = 0) {
    if (!aspirante.esAspirante()) {
      throw new PostulacionNoAutorizadaError();
    }
    if (Number.isNaN(fechaPostulacion.getTime())) {
      throw new DatosDePostulacionInvalidos("La fecha de postulación es inválida");
    }
    this.aspirante = aspirante;
    this.oferta = oferta;
    this.fechaPostulacion = new Date(fechaPostulacion.getTime());
    this.id = id;
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
    this.id = id;
  }
}
