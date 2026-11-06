import { DetalleOferta } from "./detalle-oferta";
import Oferta from "./oferta";

export interface IRepositorioOferta {
  guardar(oferta: Oferta): Promise<void>;

  contarPorEmpresario(idEmpresario: number): Promise<number>;

  listar(): Promise<Oferta[]>;

  recuperarDetallePorId(id: number): Promise<DetalleOferta | null>;
}
