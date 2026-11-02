import Oferta from "../dominio/oferta";
import { IRepositorioOferta } from "../dominio/puerto-repositorio-oferta";
import pool from "./pool";

export default class RepositorioOfertaSql implements IRepositorioOferta {
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

  public async contarPorEmpresario(idEmpresario: number): Promise<number> {
    const resultado = await pool.query<{ cantidad: string }>(
      "SELECT COUNT(*) AS cantidad FROM ofertas WHERE id_empresario = $1",
      [idEmpresario],
    );
    return Number(resultado.rows[0].cantidad);
  }

  public async eliminarTodos(): Promise<void> {
    await pool.query("DELETE FROM ofertas");
  }
}
