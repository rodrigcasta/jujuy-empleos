import Postulacion from "./postulacion";

export interface IRepositorioPostulacion {
  guardar(postulacion: Postulacion): Promise<void>;

  existePara(idOferta: number, idAspirante: number): Promise<boolean>;
}
