import DatosDeOfertaInvalidos from "./datos-de-oferta-invalidos";
import EstadoOferta from "./estado-oferta";

export default class Oferta {
  private static readonly LARGO_MAXIMO_TITULO = 50;
  private static readonly LARGO_MAXIMO_DESCRIPCION = 250;
  private static readonly LARGO_MAXIMO_UBICACION = 70;
  private titulo: string;
  private descripcion: string;
  private ubicacion: string;
  private idEmpresario: number;
  private fechaPublicacion: Date;
  private id: number;
  private estado: EstadoOferta = "activa";

  constructor(
    titulo: string,
    descripcion: string,
    ubicacion: string,
    idEmpresario: number,
    fechaPublicacion: Date,
    id: number = 0,
  ) {
    const tituloNormalizado = titulo.trim();
    const descripcionNormaliza = descripcion.trim();
    const ubicacionNormalizada = ubicacion.trim();

    if (tituloNormalizado.length === 0) {
      throw new DatosDeOfertaInvalidos("titulo es obligatorio");
    }
    if (descripcionNormaliza.length > Oferta.LARGO_MAXIMO_DESCRIPCION) {
      throw new DatosDeOfertaInvalidos(`La descripción tiene mas de ${Oferta.LARGO_MAXIMO_DESCRIPCION} caracteres`);
    }
    if (descripcionNormaliza.length === 0) {
      throw new DatosDeOfertaInvalidos("descripcion es obligatorio");
    }
    if (ubicacionNormalizada.length === 0) {
      throw new DatosDeOfertaInvalidos("ubicacion es obligatorio");
    }
    if (ubicacionNormalizada.length > Oferta.LARGO_MAXIMO_UBICACION) {
      throw new DatosDeOfertaInvalidos(`La ubicación tiene más de ${Oferta.LARGO_MAXIMO_UBICACION} caracteres`);
    }
    if (tituloNormalizado.length > Oferta.LARGO_MAXIMO_TITULO) {
      throw new DatosDeOfertaInvalidos("El titulo tiene más de 50 caracteres");
    }
    this.titulo = tituloNormalizado;
    this.descripcion = descripcionNormaliza;
    this.ubicacion = ubicacionNormalizada;
    this.idEmpresario = idEmpresario;
    this.fechaPublicacion = fechaPublicacion;
    this.id = id;
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

  public obtenerId(): number {
    return this.id;
  }

  public obtenerEstado(): EstadoOferta {
    return this.estado;
  }

  public cerrarOferta(): void {
    this.estado = "cerrada";
  }

  public asignarId(id: number): void {
    this.id = id;
  }
}
