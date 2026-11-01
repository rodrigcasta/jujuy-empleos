export default class Oferta {
  private titulo: string;
  private descripcion: string;
  private ubicacion: string;
  private idEmpresario: number;
  private fechaPublicacion: Date;

  constructor(titulo: string, descripcion: string, ubicacion: string, idempresario: number, fechaPublicacion: Date) {
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.ubicacion = ubicacion;
    this.idEmpresario = idempresario;
    this.fechaPublicacion = fechaPublicacion;
  }

  public obtenerTitulo(): string {
    return this.titulo;
  }

  public obtenerDescripcion(): string {
    return this.descripcion;
  }

  public obtenerUbicacion(): string {
    return this.ubicacion;
  }

  public obtenerIdEmpresario(): number {
    return this.idEmpresario;
  }

  public obtenerFechaPublicacion(): Date {
    return this.fechaPublicacion;
  }
}
