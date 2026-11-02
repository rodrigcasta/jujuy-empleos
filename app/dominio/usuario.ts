import bcrypt from "bcryptjs";
import DatosDeUsuarioInvalidos from "./datos-de-usuario-invalidos";

export default class Usuario {
  private static readonly LARGO_MAXIMO_NOMBRE = 20;
  private static readonly LARGO_MAXIMO_EMAIL = 254;
  private static readonly LARGO_MINIMO_CONTRASENA = 8;
  private static readonly LARGO_MAXIMO_CONTRASENA = 20;
  private static readonly COSTO_HASH = 10;
  private static readonly FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly SUSCRIPCION_PREDETERMINADA = "Profesional";
  private static readonly SUSCRIPCION_GRATUITA = "Gratuita";
  private static readonly SUSCRIPCION_CORPORATIVA = "Corporativa";
  private static readonly LIMITE_PUBLICACION_GRATUITA = 1;
  private static readonly LIMITE_PUBLICACION_PROFESIONAL = 5;
  private static readonly PATRON_MINUSCULA = /[a-z]/;
  private static readonly PATRON_MAYUSCULA = /[A-Z]/;
  private static readonly PATRON_NUMERO = /[0-9]/;
  private static readonly PATRON_SIMBOLO = /[^\p{L}\p{N}\s]/u;
  private static readonly CANTIDAD_MINIMA_DE_SIMBOLOS = 2;
  private nombre: string;
  private apellido: string;
  private email: string;
  private hashContrasena: string;
  private id: number;
  private suscripcion: string;

  constructor(
    nombre: string,
    apellido: string,
    email: string,
    hashContrasena: string,
    id: number = 0,
    suscripcion: string = Usuario.SUSCRIPCION_PREDETERMINADA,
  ) {
    this.nombre = Usuario.validarNombre(nombre, "nombre");
    this.apellido = Usuario.validarNombre(apellido, "apellido");
    this.email = Usuario.validarEmail(email);
    if (!hashContrasena) {
      throw new DatosDeUsuarioInvalidos("El usuario debe tener una contraseña");
    }
    this.hashContrasena = hashContrasena;
    this.id = id;
    this.suscripcion = suscripcion;
  }

  public obtenerSuscripcion(): string {
    return this.suscripcion;
  }

  // Crea un usuario nuevo a partir de la contraseña en texto plano, que solo se usa para calcular el hash.
  // La confirmación de la contraseña es opcional: solo se valida si está presente.
  public static async registrar(
    nombre: string,
    apellido: string,
    email: string,
    contrasena: string,
    confirmacion?: string,
    suscripcion: string = Usuario.SUSCRIPCION_PREDETERMINADA,
  ): Promise<Usuario> {
    // Se validan todos los datos antes de calcular el hash, que es costoso
    Usuario.validarContrasena(contrasena, confirmacion);
    Usuario.validarNombre(nombre, "nombre");
    Usuario.validarNombre(apellido, "apellido");
    Usuario.validarEmail(email);
    const hashContrasena = await bcrypt.hash(contrasena, Usuario.COSTO_HASH);
    return new Usuario(nombre, apellido, email, hashContrasena, 0, suscripcion);
  }

  public async verificarContrasena(contrasena: string): Promise<boolean> {
    return bcrypt.compare(contrasena, this.hashContrasena);
  }

  public static normalizarEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  public obtenerNombre(): string {
    return this.nombre;
  }

  public obtenerApellido(): string {
    return this.apellido;
  }

  public obtenerEmail(): string {
    return this.email;
  }

  public obtenerHashContrasena(): string {
    return this.hashContrasena;
  }

  public obtenerId(): number {
    return this.id;
  }

  public cambiarId(id: number): void {
    this.id = id;
  }

  private static validarEmail(email: string): string {
    const normalizado = Usuario.normalizarEmail(email);
    if (normalizado.length > Usuario.LARGO_MAXIMO_EMAIL) {
      throw new DatosDeUsuarioInvalidos(`El email no puede tener mas de ${Usuario.LARGO_MAXIMO_EMAIL} caracteres`);
    }
    if (normalizado.length === 0) {
      throw new DatosDeUsuarioInvalidos("El email es obligatorio");
    }
    if (!Usuario.FORMATO_EMAIL.test(normalizado)) {
      throw new DatosDeUsuarioInvalidos("El email no es válido");
    }
    return normalizado;
  }

  private static validarContrasena(contrasena: string, confirmacion?: string) {
    if (contrasena.length === 0) {
      throw new DatosDeUsuarioInvalidos("La contraseña es obligatoria");
    }

    if (contrasena.length < Usuario.LARGO_MINIMO_CONTRASENA) {
      throw new DatosDeUsuarioInvalidos(
        `La contraseña debe tener al menos ${Usuario.LARGO_MINIMO_CONTRASENA} caracteres`,
      );
    }

    if (contrasena.length > Usuario.LARGO_MAXIMO_CONTRASENA) {
      throw new DatosDeUsuarioInvalidos(
        `La contraseña no puede tener mas de ${Usuario.LARGO_MAXIMO_CONTRASENA} caracteres`,
      );
    }

    if (!Usuario.PATRON_MINUSCULA.test(contrasena)) {
      throw new DatosDeUsuarioInvalidos("La contraseña debe tener al menos una letra minúscula");
    }

    if (!Usuario.PATRON_MAYUSCULA.test(contrasena)) {
      throw new DatosDeUsuarioInvalidos("La contraseña debe tener al menos una letra mayúscula");
    }

    if (!Usuario.PATRON_NUMERO.test(contrasena)) {
      throw new DatosDeUsuarioInvalidos("La contraseña debe tener al menos un número");
    }

    if (Usuario.contarSimbolos(contrasena) < Usuario.CANTIDAD_MINIMA_DE_SIMBOLOS) {
      throw new DatosDeUsuarioInvalidos(
        `La contraseña debe tener al menos ${Usuario.CANTIDAD_MINIMA_DE_SIMBOLOS} símbolos`,
      );
    }

    if (confirmacion !== undefined && confirmacion !== contrasena) {
      throw new DatosDeUsuarioInvalidos("Las contraseñas no coinciden");
    }
  }

  public puedePublicar(cantidadOfertasPublicadas: number): boolean {
    if (this.suscripcion === Usuario.SUSCRIPCION_GRATUITA) {
      return cantidadOfertasPublicadas < Usuario.LIMITE_PUBLICACION_GRATUITA;
    }
    if (this.suscripcion === Usuario.SUSCRIPCION_PREDETERMINADA) {
      return cantidadOfertasPublicadas < Usuario.LIMITE_PUBLICACION_PROFESIONAL;
    }
    return this.suscripcion === Usuario.SUSCRIPCION_CORPORATIVA;
  }

  private static validarNombre(valor: string, campo: string): string {
    const normalizado = valor.trim();
    if (normalizado === "") {
      throw new DatosDeUsuarioInvalidos(`El campo ${campo} es obligatorio`);
    }
    if (normalizado.length > Usuario.LARGO_MAXIMO_NOMBRE) {
      throw new DatosDeUsuarioInvalidos(
        `El campo ${campo} no puede tener más de ${Usuario.LARGO_MAXIMO_NOMBRE} caracteres`,
      );
    }
    return normalizado;
  }

  private static contarSimbolos(contrasena: string): number {
    return [...contrasena].filter((caracter) => Usuario.PATRON_SIMBOLO.test(caracter)).length;
  }
}
