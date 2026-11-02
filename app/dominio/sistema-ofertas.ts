import LimiteDeOfertasAlcanzadoError from "./limite-de-ofertas-alcanzado-error";
import Oferta from "./oferta";
import { IRepositorioOferta } from "./puerto-repositorio-oferta";
import Usuario from "./usuario";

export default class SistemaOfertas {
  private repositorioOferta: IRepositorioOferta;
  private obtenerFechaActual: () => Date;

  constructor(repositorioOferta: IRepositorioOferta, obtenerFechaActual: () => Date = () => new Date()) {
    this.repositorioOferta = repositorioOferta;
    this.obtenerFechaActual = obtenerFechaActual;
  }

  public async publicar(empresario: Usuario, titulo: string, descripcion: string, ubicacion: string): Promise<Oferta> {
    const cantidadOfertasPublicadas = await this.repositorioOferta.contarPorEmpresario(empresario.obtenerId());
    if (!empresario.puedePublicar(cantidadOfertasPublicadas)) {
      throw new LimiteDeOfertasAlcanzadoError();
    }

    const oferta = new Oferta(titulo, descripcion, ubicacion, empresario.obtenerId(), this.obtenerFechaActual());
    await this.repositorioOferta.guardar(oferta);
    return oferta;
  }
}
