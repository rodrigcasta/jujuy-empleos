export default class DatosDePostulacionInvalidos extends Error {
  constructor(mensaje: string) {
    super(mensaje);
  }
}
