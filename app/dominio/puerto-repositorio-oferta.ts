import { DetalleOferta } from "./detalle-oferta";
import Oferta from "./oferta";

export interface IRepositorioOferta {
  guardar(oferta: Oferta): Promise<void>;

  actualizar(oferta: Oferta): Promise<void>;

  contarActivasPorEmpresario(idEmpresario: number): Promise<number>;

  listar(): Promise<Oferta[]>;

  listarPublicas(): Promise<Oferta[]>;

  recuperarPorId(id: number): Promise<Oferta | null>;

  recuperarDetallePorId(id: number): Promise<DetalleOferta | null>;
}
