import PadronDeAlumnoInvalido from "./padron-de-alumno-invalido";

// Número entero mayor a 0: solo dígitos, sin ceros a la izquierda, puntos, comas, signos ni espacios
const FORMATO_PADRON = /^[1-9][0-9]*$/;

export default class Alumno {
  private nombre: string;
  private apellido: string;
  private padron: string;
  private id: number;

  constructor(nombre: string, apellido: string, padron: string, id: number = 0) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.padron = Alumno.validarPadron(padron);
    this.id = id;
  }

  private static validarPadron(padron: string): string {
    if (!padron) {
      throw new PadronDeAlumnoInvalido("El campo padron es obligatorio");
    }
    if (!FORMATO_PADRON.test(padron)) {
      throw new PadronDeAlumnoInvalido("El padrón debe ser un número mayor a 0, sin puntos ni comas");
    }
    return padron;
  }

  public getNombre(): string {
    return this.nombre;
  }

  public getApellido(): string {
    return this.apellido;
  }

  public getPadron(): string {
    return this.padron;
  }

  public Id(): number {
    return this.id;
  }

  public setId(id: number): void {
    this.id = id;
  }
}
