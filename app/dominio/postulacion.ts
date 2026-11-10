export default class Postulacion {
  private idAspirante: number;
  private idOferta: number;
  private id: number;

  constructor(idAspirante: number, idOferta: number, id: number = 0) {
    this.idAspirante = idAspirante;
    this.idOferta = idOferta;
    this.id = id;
  }

  public obtenerIdAspirante(): number {
    return this.idAspirante;
  }

  public obtenerIdOferta(): number {
    return this.idOferta;
  }

  public obtenerId(): number {
    return this.id;
  }

  public asignarId(id: number): void {
    this.id = id;
  }
}
