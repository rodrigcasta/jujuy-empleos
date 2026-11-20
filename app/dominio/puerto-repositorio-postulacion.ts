import Postulacion from "./postulacion";

export interface DatosDePostulacion {
  nombre: string;
  apellido: string;
  email: string;
  fechaPostulacion: Date;
}

export interface IRepositorioPostulacion {
  guardar(postulacion: Postulacion): Promise<void>;

  existePara(idOferta: number, idAspirante: number): Promise<boolean>;

  listarPorOferta(idOferta: number): Promise<DatosDePostulacion[]>;

  recuperarPorOferta(idOferta: number): Promise<Postulacion[]>;
}
