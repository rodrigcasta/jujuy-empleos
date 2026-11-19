import { ProveedorFecha } from "../dominio/puerto-proveedor-fecha";

export default class ProveedorFechaDelSistema implements ProveedorFecha {
  public obtenerFechaActual(): Date {
    return new Date();
  }
}
