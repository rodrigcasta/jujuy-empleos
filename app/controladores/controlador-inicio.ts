import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { registrarExcepcion } from "../web/registrar-excepcion";
import { EstadoHttp } from "../web/estado-http";

export const crearControladorInicio = () => {
  const router = express.Router();

  router.get("/", (req: Request, res: Response) => {
    res.render("inicio/inicio", { titulo: "Inicio", limiteOfertas: req.query.limite === "ofertas" });
  });

  // Devuelve la versión del package.json
  router.get("/version", (req: Request, res: Response) => {
    try {
      const pkgPath = path.resolve(process.cwd(), "package.json");
      const pkgContent = fs.readFileSync(pkgPath, { encoding: "utf8" });
      const pkg = JSON.parse(pkgContent) as { version?: string };
      res.json({ equipo: "caseros", version: pkg.version ?? "unknown" });
    } catch (error: unknown) {
      registrarExcepcion(req, error);
      res.status(EstadoHttp.ERROR_INTERNO).json({ error: "No se pudo leer la versión" });
    }
  });

  return router;
};
