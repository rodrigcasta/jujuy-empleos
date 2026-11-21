import DatosDeOfertaInvalidos from "./datos-de-oferta-invalidos";
import OfertaYaCerradaError from "./oferta-ya-cerrada-error";
import Usuario from "./usuario";

export default class Oferta {
  private static readonly LARGO_MAXIMO_TITULO = 50;
  private static readonly LARGO_MAXIMO_DESCRIPCION = 250;
  private static readonly LARGO_MAXIMO_UBICACION = 70;
  private titulo: string;
  private descripcion: string;
  private ubicacion: string;
  private titular: Usuario;
  private fechaPublicacion: Date;
  private id: number;
  private activa: boolean;

  constructor(
    titulo: string,
    descripcion: string,
    ubicacion: string,
    titular: Usuario,
    fechaPublicacion: Date,
    id: number = 0,
    activa: boolean = true,
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
    if (!titular.esEmpresario()) {
      throw new DatosDeOfertaInvalidos("El titular de la oferta debe ser empresario");
    }
    if (Number.isNaN(fechaPublicacion.getTime())) {
      throw new DatosDeOfertaInvalidos("La fecha de publicación es inválida");
    }
    this.titulo = tituloNormalizado;
    this.descripcion = descripcionNormaliza;
    this.ubicacion = ubicacionNormalizada;
    this.titular = titular;
    this.fechaPublicacion = new Date(fechaPublicacion.getTime());
    this.id = id;
    this.activa = activa;
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

  public obtenerTitular(): Usuario {
    return this.titular;
  }

  public obtenerFechaPublicacion(): Date {
    return new Date(this.fechaPublicacion.getTime());
  }

  public obtenerId(): number {
    return this.id;
  }

  public estaActiva(): boolean {
    return this.activa;
  }

  public cerrar(): void {
    if (!this.activa) {
      throw new OfertaYaCerradaError();
    }

    this.activa = false;
  }

  public asignarId(id: number): void {
    this.id = id;
  }
}
