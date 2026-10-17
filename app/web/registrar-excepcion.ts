import { Request, Response } from "express";
import { EstadoHttp } from "./estado-http";

const describir = (error: unknown): string =>
  error instanceof Error ? `${error.constructor.name}: ${error.message}` : String(error);

export const registrarExcepcion = (req: Request, error: unknown) => {
  console.error(`!!! ${req.method} ${req.originalUrl} ${describir(error)}`);
  if (!(error instanceof Error)) {
    return;
  }
  // Un AggregateError (por ej. cuando no se puede conectar a la BD) tiene el detalle en los errores que agrupa
  if (error instanceof AggregateError) {
    for (const causa of error.errors as unknown[]) {
      console.error(`    causa: ${describir(causa)}`);
    }
  }
  const stack = (error.stack ?? "").split("\n").filter((linea) => linea.trimStart().startsWith("at "));
  if (stack.length > 0) {
    console.error(stack.join("\n"));
  }
};

export const renderizarError = (res: Response, estado: EstadoHttp, mensaje: string) => {
  res.status(estado).render("error", { titulo: "Error", mensaje });
};
