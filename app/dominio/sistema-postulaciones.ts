import Postulacion from "./postulacion";
import PostulacionDuplicadaError from "./postulacion-duplicada-error";
import { DatosDePostulacion, IRepositorioPostulacion } from "./puerto-repositorio-postulacion";
import Usuario from "./usuario";
import { ProveedorFecha } from "./puerto-proveedor-fecha";
import { IRepositorioOferta } from "./puerto-repositorio-oferta";
import OfertaNoEncontradaError from "./oferta-no-encontrada-error";

export default class SistemaPostulaciones {
  private repositorioPostulacion: IRepositorioPostulacion;
  private proveedorFecha: ProveedorFecha;
  private repositorioOferta: IRepositorioOferta;

  constructor(
    repositorioPostulacion: IRepositorioPostulacion,
    proveedorFecha: ProveedorFecha,
    repositorioOferta: IRepositorioOferta,
  ) {
    this.repositorioPostulacion = repositorioPostulacion;
    this.proveedorFecha = proveedorFecha;
    this.repositorioOferta = repositorioOferta;
  }

  public async listarParaEmpresario(
    empresario: Usuario,
    idOferta: number,
    idEmpresarioOferta: number,
  ): Promise<DatosDePostulacion[] | null> {
    if (!empresario.esEmpresario() || empresario.obtenerId() !== idEmpresarioOferta) {
      return null;
    }
    return this.repositorioPostulacion.listarPorOferta(idOferta);
  }

  public async postular(aspirante: Usuario, idOferta: number): Promise<Postulacion> {
    const oferta = await this.repositorioOferta.recuperarPorId(idOferta);
    if (oferta === null) {
      throw new OfertaNoEncontradaError();
    }
    const postulacion = new Postulacion(aspirante, oferta, this.proveedorFecha.obtenerFechaActual());
    if (await this.repositorioPostulacion.existePara(idOferta, aspirante.obtenerId())) {
      throw new PostulacionDuplicadaError();
    }
    await this.repositorioPostulacion.guardar(postulacion);
    return postulacion;
  }
}
