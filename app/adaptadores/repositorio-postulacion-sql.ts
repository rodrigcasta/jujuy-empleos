import Postulacion from "../dominio/postulacion";
import { DatosDePostulacion, IRepositorioPostulacion } from "../dominio/puerto-repositorio-postulacion";
import { IRepositorioUsuario } from "../dominio/puerto-repositorio-usuario";
import { IRepositorioOferta } from "../dominio/puerto-repositorio-oferta";
import DatosDePostulacionInvalidos from "../dominio/datos-de-postulacion-invalidos";
import pool from "./pool";

interface PostulacionPersistida {
  id: number;
  id_aspirante: number;
  id_oferta: number;
  fecha_postulacion: Date;
}

export default class RepositorioPostulacionSql implements IRepositorioPostulacion {
  constructor(
    private repositorioUsuario: IRepositorioUsuario,
    private repositorioOferta: IRepositorioOferta,
  ) {}

  public async guardar(postulacion: Postulacion): Promise<void> {
    const resultado = await pool.query<{ id: number }>(
      `INSERT INTO postulaciones (id_aspirante, id_oferta, fecha_postulacion)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [
        postulacion.obtenerAspirante().obtenerId(),
        postulacion.obtenerOferta().obtenerId(),
        postulacion.obtenerFechaPostulacion(),
      ],
    );
    postulacion.asignarId(resultado.rows[0].id);
  }

  public async existePara(idOferta: number, idAspirante: number): Promise<boolean> {
    const resultado = await pool.query<{ existe: boolean }>(
      `SELECT EXISTS(
         SELECT 1
         FROM postulaciones
         WHERE id_oferta = $1 AND id_aspirante = $2
       ) AS existe`,
      [idOferta, idAspirante],
    );
    return resultado.rows[0].existe;
  }

  public async listarPorOferta(idOferta: number): Promise<DatosDePostulacion[]> {
    const postulaciones = await this.recuperarPorOferta(idOferta);
    return postulaciones.map((postulacion) => ({
      nombre: postulacion.obtenerAspirante().obtenerNombre(),
      apellido: postulacion.obtenerAspirante().obtenerApellido(),
      email: postulacion.obtenerAspirante().obtenerEmail(),
      fechaPostulacion: postulacion.obtenerFechaPostulacion(),
    }));
  }

  public async recuperarPorOferta(idOferta: number): Promise<Postulacion[]> {
    const resultado = await pool.query<PostulacionPersistida>(
      `SELECT id, id_aspirante, id_oferta, fecha_postulacion
       FROM postulaciones WHERE id_oferta = $1
       ORDER BY fecha_postulacion ASC, id ASC`,
      [idOferta],
    );
    if (resultado.rows.length === 0) {
      return [];
    }
    const postulaciones: Postulacion[] = [];
    for (const fila of resultado.rows) {
      const oferta = await this.repositorioOferta.recuperarPorId(idOferta);
      if (oferta === null) {
        throw new DatosDePostulacionInvalidos("No se encontró la oferta de las postulaciones recuperadas");
      }
      const aspirante = await this.repositorioUsuario.recuperarPorId(fila.id_aspirante);
      if (aspirante === null) {
        throw new DatosDePostulacionInvalidos("No se encontró el aspirante de la postulación recuperada");
      }
      postulaciones.push(new Postulacion(aspirante, oferta, fila.fecha_postulacion, fila.id));
    }
    return postulaciones;
  }

  public async eliminarTodos(): Promise<void> {
    await pool.query("DELETE FROM postulaciones");
  }
}
