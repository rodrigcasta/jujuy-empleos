import Oferta from "../dominio/oferta";
import { DetalleOferta } from "../dominio/detalle-oferta";
import { IRepositorioOferta } from "../dominio/puerto-repositorio-oferta";
import pool from "./pool";

interface OfertaPersistida {
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  fecha_publicacion: Date;
  id_empresario: number;
  activa: boolean;
}

export default class RepositorioOfertaSql implements IRepositorioOferta {
  public async guardar(oferta: Oferta): Promise<void> {
    const resultado = await pool.query<{ id: number }>(
      `INSERT INTO ofertas (titulo, descripcion, ubicacion, fecha_publicacion, id_empresario, activa)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        oferta.obtenerTitulo(),
        oferta.obtenerDescripcion(),
        oferta.obtenerUbicacion(),
        oferta.obtenerFechaPublicacion(),
        oferta.obtenerIdEmpresario(),
        oferta.estaActiva(),
      ],
    );
    oferta.asignarId(resultado.rows[0].id);
  }

  public async actualizar(oferta: Oferta): Promise<void> {
    await pool.query(`UPDATE ofertas SET activa = $1 WHERE id = $2`, [oferta.estaActiva(), oferta.obtenerId()]);
  }

  public async contarActivasPorEmpresario(idEmpresario: number): Promise<number> {
    const resultado = await pool.query<{ cantidad: string }>(
      "SELECT COUNT(*) AS cantidad FROM ofertas WHERE id_empresario = $1 AND activa = true",
      [idEmpresario],
    );
    return Number(resultado.rows[0].cantidad);
  }

  public async listar(): Promise<Oferta[]> {
    const resultado = await pool.query<OfertaPersistida>("SELECT * FROM ofertas ORDER BY fecha_publicacion DESC");
    return resultado.rows.map((oferta) => {
      return this.deserializarOferta(oferta);
    });
  }

  public async recuperarPorId(id: number): Promise<Oferta | null> {
    const resultado = await pool.query<OfertaPersistida>("SELECT * FROM ofertas WHERE id = $1", [id]);
    const oferta = resultado.rows[0];
    if (oferta === undefined) {
      return null;
    }
    return this.deserializarOferta(oferta);
  }

  public async recuperarDetallePorId(id: number): Promise<DetalleOferta | null> {
    const resultado = await pool.query<{
      id: number;
      id_empresario: number;
      titulo: string;
      descripcion: string;
      ubicacion: string;
      email_empresario: string;
    }>(
      `SELECT ofertas.id, ofertas.id_empresario, ofertas.titulo, ofertas.descripcion, ofertas.ubicacion,
              usuarios.email AS email_empresario
       FROM ofertas
       INNER JOIN usuarios ON usuarios.id = ofertas.id_empresario
       WHERE ofertas.id = $1`,
      [id],
    );
    const oferta = resultado.rows[0];
    if (oferta === undefined) {
      return null;
    }
    return {
      id: oferta.id,
      idEmpresario: oferta.id_empresario,
      titulo: oferta.titulo,
      descripcion: oferta.descripcion,
      ubicacion: oferta.ubicacion,
      emailEmpresario: oferta.email_empresario,
    };
  }

  public async eliminarTodos(): Promise<void> {
    await pool.query("DELETE FROM ofertas");
  }

  private deserializarOferta(oferta: OfertaPersistida): Oferta {
    return new Oferta(
      oferta.titulo,
      oferta.descripcion,
      oferta.ubicacion,
      oferta.id_empresario,
      oferta.fecha_publicacion,
      oferta.id,
      oferta.activa,
    );
  }
}
