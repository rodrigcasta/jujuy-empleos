import PadronDeAlumnoInvalido from "./padron-de-alumno-invalido";

export default class Alumno {
  private nombre: string;
  private apellido: string;
  private padron: string;
  private id: number;


  constructor(nombre: string, apellido: string, padron: string, id: number = 0) {
    if (padron == undefined) {
      throw new PadronDeAlumnoInvalido();
    }
    this.nombre = nombre;
    this.apellido = apellido;
    this.padron = padron;
    this.id = id;
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
