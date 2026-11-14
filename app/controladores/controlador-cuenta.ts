import express, { Request, Response } from "express";
import { requiereAutenticacion, usuarioActual } from "../web/autenticacion";

export const crearControladorCuenta = () => {
  const router = express.Router();

  router.get("/mi-cuenta", requiereAutenticacion, (req: Request, res: Response) => {
    const usuario = usuarioActual(req)!;

    res.render("cuenta/datos", {
      titulo: "Mi cuenta",
      nombre: usuario.obtenerNombre(),
      apellido: usuario.obtenerApellido(),
      email: usuario.obtenerEmail(),
    });
  });

  return router;
};
