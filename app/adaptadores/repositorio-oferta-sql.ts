import Oferta from "../dominio/oferta";
import { DetalleOferta } from "../dominio/detalle-oferta";
import { IRepositorioOferta } from "../dominio/puerto-repositorio-oferta";
import { IRepositorioUsuario } from "../dominio/puerto-repositorio-usuario";
import Usuario from "../dominio/usuario";
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
  constructor(private repositorioUsuario: IRepositorioUsuario) {}

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
        oferta.obtenerTitular().obtenerId(),
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

  public async listarVisiblesParaEmpresario(idEmpresario: number): Promise<Oferta[]> {
    const resultado = await pool.query<OfertaPersistida>(
      "SELECT * FROM ofertas WHERE activa = true OR id_empresario = $1 ORDER BY fecha_publicacion DESC",
      [idEmpresario],
    );
    return this.deserializarOfertas(resultado.rows);
  }

  public async listarPublicas(): Promise<Oferta[]> {
    const resultado = await pool.query<OfertaPersistida>(
      "SELECT * FROM ofertas WHERE activa = true ORDER BY fecha_publicacion DESC",
    );
    return this.deserializarOfertas(resultado.rows);
  }

  public async recuperarPorId(id: number): Promise<Oferta | null> {
    const resultado = await pool.query<OfertaPersistida>("SELECT * FROM ofertas WHERE id = $1", [id]);
    const oferta = resultado.rows[0];
    if (oferta === undefined) {
      return null;
    }
    const titular = await this.repositorioUsuario.recuperarPorId(oferta.id_empresario);
    return titular === null ? null : this.deserializarOferta(oferta, titular);
  }

  public async recuperarDetallePorId(id: number): Promise<DetalleOferta | null> {
    const resultado = await pool.query<OfertaPersistida>("SELECT * FROM ofertas WHERE id = $1", [id]);
    const oferta = resultado.rows[0];
    if (oferta === undefined) {
      return null;
    }
    const titular = await this.repositorioUsuario.recuperarPorId(oferta.id_empresario);
    if (titular === null) {
      return null;
    }
    return {
      id: oferta.id,
      idEmpresario: oferta.id_empresario,
      titulo: oferta.titulo,
      descripcion: oferta.descripcion,
      ubicacion: oferta.ubicacion,
      emailEmpresario: titular.obtenerEmail(),
      activa: oferta.activa,
    };
  }

  public async eliminarTodos(): Promise<void> {
    await pool.query("DELETE FROM ofertas");
  }

  private async deserializarOfertas(filas: OfertaPersistida[]): Promise<Oferta[]> {
    const titulares = new Map<number, Usuario>();
    const ofertas: Oferta[] = [];
    for (const fila of filas) {
      let titular = titulares.get(fila.id_empresario);
      if (titular === undefined) {
        const recuperado = await this.repositorioUsuario.recuperarPorId(fila.id_empresario);
        if (recuperado === null) {
          throw new Error("No se encontró el titular de una oferta recuperada");
        }
        titular = recuperado;
        titulares.set(fila.id_empresario, titular);
      }
      ofertas.push(this.deserializarOferta(fila, titular));
    }
    return ofertas;
  }

  private deserializarOferta(oferta: OfertaPersistida, titular: Usuario): Oferta {
    return new Oferta(
      oferta.titulo,
      oferta.descripcion,
      oferta.ubicacion,
      titular,
      oferta.fecha_publicacion,
      oferta.id,
      oferta.activa,
    );
  }
}
