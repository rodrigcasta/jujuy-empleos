import { defineParameterType } from "@cucumber/cucumber";

// {consulta}: una consulta sobre los alumnos, por el nombre con el que se la menciona en los escenarios.
// El step recibe la ruta correspondiente.
const CONSULTAS: Record<string, string> = {
  "consultar el listado de alumnos": "/alumnos",
  "comenzar el alta de un alumno": "/alumnos/nuevo",
  "consultar el alumno con padrón 11111": "/alumnos/11111",
};

defineParameterType({
  name: "consulta",
  regexp: new RegExp(Object.keys(CONSULTAS).join("|")),
  transformer: (consulta: string) => CONSULTAS[consulta],
});

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
