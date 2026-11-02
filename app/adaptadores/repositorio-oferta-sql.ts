import Oferta from "../dominio/oferta";
import pool from "./pool";

export default class RepositorioOfertaSql {
  public async guardar(oferta: Oferta): Promise<void> {
    const resultado = await pool.query<{ id: number }>(
      `INSERT INTO ofertas (titulo, descripcion, ubicacion, fecha_publicacion, id_empresario)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        oferta.obtenerTitulo(),
        oferta.obtenerDescripcion(),
        oferta.obtenerUbicacion(),
        oferta.obtenerFechaPublicacion(),
        oferta.obtenerIdEmpresario(),
      ],
    );
    oferta.asignarId(resultado.rows[0].id);
  }

  public async eliminarTodos(): Promise<void> {
    await pool.query("DELETE FROM ofertas");
  }
}
