import Postulacion from "./postulacion";
import PostulacionDuplicadaError from "./postulacion-duplicada-error";
import PostulacionNoAutorizadaError from "./postulacion-no-autorizada-error";
import { DatosDePostulacion, IRepositorioPostulacion } from "./puerto-repositorio-postulacion";
import Usuario from "./usuario";
import { ProveedorFecha } from "./puerto-proveedor-fecha";

export default class SistemaPostulaciones {
  private repositorioPostulacion: IRepositorioPostulacion;
  private proveedorFecha: ProveedorFecha;

  constructor(repositorioPostulacion: IRepositorioPostulacion, proveedorFecha: ProveedorFecha) {
    this.repositorioPostulacion = repositorioPostulacion;
    this.proveedorFecha = proveedorFecha;
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
    if (!aspirante.esAspirante()) {
      throw new PostulacionNoAutorizadaError();
    }
    if (await this.repositorioPostulacion.existePara(idOferta, aspirante.obtenerId())) {
      throw new PostulacionDuplicadaError();
    }
    const postulacion = new Postulacion(aspirante.obtenerId(), idOferta, this.proveedorFecha.obtenerFechaActual());
    await this.repositorioPostulacion.guardar(postulacion);
    return postulacion;
  }
}
