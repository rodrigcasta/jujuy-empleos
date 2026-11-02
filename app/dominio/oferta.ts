import DatosDeOfertaInvalidos from "./datos-de-oferta-invalidos";

export default class Oferta {
  private static readonly LARGO_MAXIMO_TITULO = 50;
  private static readonly LARGO_MAXIMO_DESCRIPCION = 250;
  private static readonly LARGO_MAXIMO_UBICACION = 70;
  private titulo: string;
  private descripcion: string;
  private ubicacion: string;
  private idEmpresario: number;
  private fechaPublicacion: Date;

  constructor(titulo: string, descripcion: string, ubicacion: string, idEmpresario: number, fechaPublicacion: Date) {
    if (titulo.trim().length === 0) {
      throw new DatosDeOfertaInvalidos("titulo es obligatorio");
    }
    if (descripcion.trim().length > Oferta.LARGO_MAXIMO_DESCRIPCION) {
      throw new DatosDeOfertaInvalidos(`La descripción tiene mas de ${Oferta.LARGO_MAXIMO_DESCRIPCION} caracteres`);
    }
    if (descripcion.trim().length === 0) {
      throw new DatosDeOfertaInvalidos("descripcion es obligatorio");
    }
    if (ubicacion.trim().length === 0) {
      throw new DatosDeOfertaInvalidos("ubicacion es obligatorio");
    }
    if (ubicacion.trim().length > Oferta.LARGO_MAXIMO_UBICACION) {
      throw new DatosDeOfertaInvalidos(`La ubicación tiene más de ${Oferta.LARGO_MAXIMO_UBICACION} caracteres`);
    }
    if (titulo.trim().length > Oferta.LARGO_MAXIMO_TITULO) {
      throw new DatosDeOfertaInvalidos("El titulo tiene más de 50 caracteres");
    }
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.ubicacion = ubicacion;
    this.idEmpresario = idEmpresario;
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
