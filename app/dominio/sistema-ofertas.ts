import CierreNoAutorizadoError from "./cierre-no-autorizado-error";
import LimiteDeOfertasAlcanzadoError from "./limite-de-ofertas-alcanzado-error";
import Oferta from "./oferta";
import OfertaNoEncontradaError from "./oferta-no-encontrada-error";
import { IRepositorioOferta } from "./puerto-repositorio-oferta";
import PublicacionNoAutorizadaError from "./publicacion-no-autorizada-error";
import Usuario from "./usuario";

export default class SistemaOfertas {
  private repositorioOferta: IRepositorioOferta;
  private obtenerFechaActual: () => Date;

  constructor(repositorioOferta: IRepositorioOferta, obtenerFechaActual: () => Date = () => new Date()) {
    this.repositorioOferta = repositorioOferta;
    this.obtenerFechaActual = obtenerFechaActual;
  }

  public puedeGestionarOfertas(usuario: Usuario): boolean {
    return usuario.esEmpresario();
  }

  public async publicar(empresario: Usuario, titulo: string, descripcion: string, ubicacion: string): Promise<Oferta> {
    this.validarEmpresario(empresario);
    if (!(await this.puedePublicar(empresario))) {
      throw new LimiteDeOfertasAlcanzadoError();
    }

    const oferta = new Oferta(titulo, descripcion, ubicacion, empresario, this.obtenerFechaActual());
    await this.repositorioOferta.guardar(oferta);
    return oferta;
  }

  public async cerrar(empresario: Usuario, idOferta: number): Promise<void> {
    if (!this.puedeGestionarOfertas(empresario)) {
      throw new CierreNoAutorizadoError();
    }
    const oferta = await this.repositorioOferta.recuperarPorId(idOferta);
    if (oferta === null) {
      throw new OfertaNoEncontradaError();
    }
    oferta.cerrarPor(empresario);
    await this.repositorioOferta.actualizar(oferta);
  }

  public async puedeAccederAPublicacion(empresario: Usuario, esConfirmacion: boolean): Promise<boolean> {
    this.validarEmpresario(empresario);
    if (esConfirmacion) {
      return true;
    }
    return this.puedePublicar(empresario);
  }

  public async puedePublicar(empresario: Usuario): Promise<boolean> {
    this.validarEmpresario(empresario);
    const cantidadOfertasPublicadas = await this.repositorioOferta.contarActivasPorEmpresario(empresario.obtenerId());
    return empresario.puedePublicar(cantidadOfertasPublicadas);
  }

  public async listar(usuario?: Usuario): Promise<Oferta[]> {
    if (usuario?.esEmpresario()) {
      return this.repositorioOferta.listarVisiblesParaEmpresario(usuario.obtenerId());
    }
    return this.repositorioOferta.listarPublicas();
  }

  public async obtenerDetallePorId(id: number): Promise<Oferta> {
    const oferta = await this.repositorioOferta.recuperarPorId(id);
    if (oferta === null) {
      throw new OfertaNoEncontradaError();
    }
    return oferta;
  }

  private validarEmpresario(usuario: Usuario): void {
    if (!this.puedeGestionarOfertas(usuario)) {
      throw new PublicacionNoAutorizadaError();
    }
  }
}
