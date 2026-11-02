import Oferta from "./oferta";

export interface IRepositorioOferta {
  guardar(oferta: Oferta): Promise<void>;
}
