import { NextFunction, Request, Response } from "express";

// Campos del formulario que nunca deben imprimirse
const CAMPOS_OCULTOS = ["contrasena", "confirmacion"];

const ocultarCamposSensibles = (cuerpo: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(cuerpo).map(([campo, valor]) => [campo, CAMPOS_OCULTOS.includes(campo) ? "***" : valor]),
  );

// Imprime los datos de cada request y de su response
export const logDeRequests = (req: Request, res: Response, next: NextFunction) => {
  const inicio = Date.now();
  const cuerpo = req.body && Object.keys(req.body).length > 0 ? JSON.stringify(ocultarCamposSensibles(req.body)) : "";
  console.log(`--> ${req.method} ${req.originalUrl} ${cuerpo}`.trimEnd());

  res.on("finish", () => {
    const datos = [
      `${res.statusCode}`,
      `${Date.now() - inicio}ms`,
      res.get("Content-Type"),
      res.get("Content-Length") && `${res.get("Content-Length")} bytes`,
      res.get("Location") && `-> ${res.get("Location")}`,
    ].filter(Boolean);
    console.log(`<-- ${req.method} ${req.originalUrl} ${datos.join(" ")}`);
  });

  next();
};
