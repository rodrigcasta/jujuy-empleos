import { defineParameterType } from "@cucumber/cucumber";

export interface Opcion {
  texto: string;
  ruta: string;
}

// {opcion}: algo que la página de inicio le ofrece hacer al usuario. El step recibe el texto y la ruta del link.
const OPCIONES: Record<string, Opcion> = {
  "iniciar sesión": { texto: "iniciar sesión", ruta: "/login" },
  "consultar el listado de alumnos": { texto: "listado de alumnos", ruta: "/alumnos" },
};

defineParameterType({
  name: "opcion",
  regexp: new RegExp(Object.keys(OPCIONES).join("|")),
  transformer: (opcion: string) => OPCIONES[opcion],
});
