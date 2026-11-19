import DatosDePostulacionInvalidos from "./datos-de-postulacion-invalidos";

export default class Postulacion {
  private idAspirante: number;
  private idOferta: number;
  private fechaPostulacion: Date;
  private id: number;

  constructor(idAspirante: number, idOferta: number, fechaPostulacion: Date, id: number = 0) {
    if (Number.isNaN(fechaPostulacion.getTime())) {
      throw new DatosDePostulacionInvalidos("La fecha de postulación es inválida");
    }
    this.idAspirante = idAspirante;
    this.idOferta = idOferta;
    this.fechaPostulacion = fechaPostulacion;
    this.id = id;
  }

  public obtenerIdAspirante(): number {
    return this.idAspirante;
  }

  public obtenerIdOferta(): number {
    return this.idOferta;
  }

  public obtenerFechaPostulacion(): Date {
    return this.fechaPostulacion;
  }

  public obtenerId(): number {
    return this.id;
  }

  public asignarId(id: number): void {
    this.id = id;
  }
}
