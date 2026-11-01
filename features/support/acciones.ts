import { MundoDeLaAplicacion } from "./mundo";

// Acciones en la interfaz que usan los steps de distintas features

export interface DatosDeRegistro {
  nombre: string;
  apellido: string;
  email: string;
  contraseña: string;
  confirmación: string;
  suscripcion?: string;
}

// El usuario que se registra en el step "que inició sesión un usuario registrado"
export const USUARIO_REGISTRADO = {
  nombre: "Marta",
  apellido: "Suarez",
  email: "marta@example.com",
  contraseña: "Secreta123!#",
};

export const registrarse = async (mundo: MundoDeLaAplicacion, datos: DatosDeRegistro) => {
  const pagina = mundo.pagina;

  await pagina.goto("/registro");
  await pagina.getByLabel("Nombre").fill(datos.nombre);
  await pagina.getByLabel("Apellido").fill(datos.apellido);
  await pagina.getByLabel("Email").fill(datos.email);

  await pagina.getByLabel("Contraseña *", { exact: true }).fill(datos.contraseña);

  await pagina.getByLabel("Repetir contraseña *", { exact: true }).fill(datos.confirmación);

  if (datos.suscripcion !== undefined) {
    await pagina.getByText(datos.suscripcion, { exact: true }).click();
  }

  await mundo.presionar("Crear cuenta");
};
