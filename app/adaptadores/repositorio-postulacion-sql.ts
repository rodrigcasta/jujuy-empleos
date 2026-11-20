import Postulacion from "../dominio/postulacion";
import { DatosDePostulacion, IRepositorioPostulacion } from "../dominio/puerto-repositorio-postulacion";
import pool from "./pool";

export default class RepositorioPostulacionSql implements IRepositorioPostulacion {
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
    const resultado = await pool.query<DatosDePostulacion>(
      `SELECT usuarios.nombre, usuarios.apellido, usuarios.email,
              postulaciones.fecha_postulacion AS "fechaPostulacion"
       FROM postulaciones
       INNER JOIN usuarios ON usuarios.id = postulaciones.id_aspirante
       WHERE postulaciones.id_oferta = $1
       ORDER BY postulaciones.fecha_postulacion ASC, postulaciones.id ASC`,
      [idOferta],
    );
    return resultado.rows;
  }

  public async eliminarTodos(): Promise<void> {
    await pool.query("DELETE FROM postulaciones");
  }
}
