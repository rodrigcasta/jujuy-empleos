import { IWorldOptions, setWorldConstructor, World } from "@cucumber/cucumber";
import supertest, { Response } from "supertest";
import { app } from "../../app/programa";

type Navegador = ReturnType<typeof supertest.agent>;

// Estado compartido por los steps de un escenario. Cucumber crea un mundo nuevo para cada escenario.
export class MundoDeLaAplicacion extends World {
  // Simula el navegador del usuario: guarda la cookie de sesión entre requests
  public navegador: Navegador = supertest.agent(app);
  private ultimaRespuesta?: Response;

  constructor(opciones: IWorldOptions) {
    super(opciones);
  }

  public registrarRespuesta(respuesta: Response) {
    this.ultimaRespuesta = respuesta;
  }

  public respuesta(): Response {
    if (!this.ultimaRespuesta) {
      throw new Error("Todavía no se hizo ningún request en este escenario");
    }
    return this.ultimaRespuesta;
  }
}

setWorldConstructor(MundoDeLaAplicacion);
