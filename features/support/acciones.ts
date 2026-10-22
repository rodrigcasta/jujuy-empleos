import { MundoDeLaAplicacion } from "./mundo";

// Acciones en la interfaz que usan los steps de distintas features

export interface DatosDeRegistro {
  nombre: string;
  apellido: string;
  email: string;
  contraseña: string;
  confirmación: string;
}

export const registrarse = async (mundo: MundoDeLaAplicacion, datos: DatosDeRegistro) => {
  const pagina = mundo.pagina;
  await pagina.goto("/registro");
  await pagina.getByLabel("Nombre").fill(datos.nombre);
  await pagina.getByLabel("Apellido").fill(datos.apellido);
  await pagina.getByLabel("Email").fill(datos.email);
  // Sin exact también encontraría "Repetir contraseña"
  await pagina.getByLabel("Contraseña", { exact: true }).fill(datos.contraseña);
  await pagina.getByLabel("Repetir contraseña").fill(datos.confirmación);
  await mundo.presionar("Registrarse");
};
