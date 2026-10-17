import bcrypt from "bcryptjs";
import DatosDeUsuarioInvalidos from "./datos-de-usuario-invalidos";

const LARGO_MAXIMO_NOMBRE = 40;
const LARGO_MAXIMO_EMAIL = 254;
const LARGO_MINIMO_CONTRASENA = 8;
const COSTO_HASH = 10;
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default class Usuario {
  private nombre: string;
  private apellido: string;
  private email: string;
  private hashContrasena: string;
  private id: number;

  constructor(nombre: string, apellido: string, email: string, hashContrasena: string, id: number = 0) {
    this.nombre = Usuario.validarNombre(nombre, "nombre");
    this.apellido = Usuario.validarNombre(apellido, "apellido");
    this.email = Usuario.validarEmail(email);
    if (!hashContrasena) {
      throw new DatosDeUsuarioInvalidos("El usuario debe tener una contraseña");
    }
    this.hashContrasena = hashContrasena;
    this.id = id;
  }

  // Crea un usuario nuevo a partir de la contraseña en texto plano, que solo se usa para calcular el hash.
  // La confirmación de la contraseña es opcional: solo se valida si está presente.
  public static async registrar(
    nombre: string,
    apellido: string,
    email: string,
    contrasena: string,
    confirmacion?: string,
  ): Promise<Usuario> {
    // Se validan todos los datos antes de calcular el hash, que es costoso
    Usuario.validarContrasena(contrasena, confirmacion);
    Usuario.validarNombre(nombre, "nombre");
    Usuario.validarNombre(apellido, "apellido");
    Usuario.validarEmail(email);
    const hashContrasena = await bcrypt.hash(contrasena, COSTO_HASH);
    return new Usuario(nombre, apellido, email, hashContrasena);
  }

  public static normalizarEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private static validarContrasena(contrasena: string, confirmacion?: string) {
    if (contrasena.length < LARGO_MINIMO_CONTRASENA) {
      throw new DatosDeUsuarioInvalidos(`La contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres`);
    }
    if (confirmacion !== undefined && confirmacion !== contrasena) {
      throw new DatosDeUsuarioInvalidos("Las contraseñas no coinciden");
    }
  }

  private static validarNombre(valor: string, campo: string): string {
    const normalizado = valor.trim();
    if (normalizado === "") {
      throw new DatosDeUsuarioInvalidos(`El campo ${campo} es obligatorio`);
    }
    if (normalizado.length > LARGO_MAXIMO_NOMBRE) {
      throw new DatosDeUsuarioInvalidos(`El campo ${campo} no puede tener más de ${LARGO_MAXIMO_NOMBRE} caracteres`);
    }
    return normalizado;
  }

  private static validarEmail(email: string): string {
    const normalizado = Usuario.normalizarEmail(email);
    if (normalizado.length > LARGO_MAXIMO_EMAIL || !FORMATO_EMAIL.test(normalizado)) {
      throw new DatosDeUsuarioInvalidos("El email no es válido");
    }
    return normalizado;
  }

  public async verificarContrasena(contrasena: string): Promise<boolean> {
    return bcrypt.compare(contrasena, this.hashContrasena);
  }

  public getNombre(): string {
    return this.nombre;
  }

  public getApellido(): string {
    return this.apellido;
  }

  public getEmail(): string {
    return this.email;
  }

  public getHashContrasena(): string {
    return this.hashContrasena;
  }

  public Id(): number {
    return this.id;
  }

  public setId(id: number): void {
    this.id = id;
  }
}
