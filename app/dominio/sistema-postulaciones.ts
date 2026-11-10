import Postulacion from "./postulacion";
import PostulacionNoAutorizadaError from "./postulacion-no-autorizada-error";
import { IRepositorioPostulacion } from "./puerto-repositorio-postulacion";
import Usuario from "./usuario";

export default class SistemaPostulaciones {
  private repositorioPostulacion: IRepositorioPostulacion;

  constructor(repositorioPostulacion: IRepositorioPostulacion) {
    this.repositorioPostulacion = repositorioPostulacion;
  }

  public async postular(aspirante: Usuario, idOferta: number): Promise<Postulacion> {
    if (!aspirante.esAspirante()) {
      throw new PostulacionNoAutorizadaError();
    }
    const postulacion = new Postulacion(aspirante.obtenerId(), idOferta);
    await this.repositorioPostulacion.guardar(postulacion);
    return postulacion;
  }
}
