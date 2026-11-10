import Postulacion from "./postulacion";
import { IRepositorioPostulacion } from "./puerto-repositorio-postulacion";
import Usuario from "./usuario";

export default class SistemaPostulaciones {
  private repositorioPostulacion: IRepositorioPostulacion;

  constructor(repositorioPostulacion: IRepositorioPostulacion) {
    this.repositorioPostulacion = repositorioPostulacion;
  }

  public async postular(aspirante: Usuario, idOferta: number): Promise<Postulacion> {
    const postulacion = new Postulacion(aspirante.obtenerId(), idOferta);
    await this.repositorioPostulacion.guardar(postulacion);
    return postulacion;
  }
}
