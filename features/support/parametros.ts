import { defineParameterType } from "@cucumber/cucumber";

// {destino}: una página de la aplicación, por el nombre con el que se la menciona en los escenarios.
// El step recibe la ruta correspondiente.
const RUTAS: Record<string, string> = {
  "la página de inicio de sesión": "/login",
  "el listado de alumnos": "/alumnos",
};

defineParameterType({
  name: "destino",
  regexp: new RegExp(Object.keys(RUTAS).join("|")),
  transformer: (destino: string) => RUTAS[destino],
});
