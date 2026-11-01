export default class DatosDeOfertaInvalidos extends Error {
  constructor(mensaje: string) {
    super(mensaje);
  }
}
