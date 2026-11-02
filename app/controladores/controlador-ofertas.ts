import express, { Request, Response } from "express";
import SistemaOfertas from "../dominio/sistema-ofertas";
import { EstadoHttp } from "../web/estado-http";
import { registrarExcepcion, renderizarError } from "../web/registrar-excepcion";
import { usuarioActual } from "../web/autenticacion";

interface FormularioOferta {
  titulo?: string;
  descripcion?: string;
  ubicacion?: string;
}

export const crearControladorOfertas = (sistemaOfertas: SistemaOfertas) => {
  const router = express.Router();

  router.get("/nueva", (req: Request, res: Response) => {
    res.render("ofertas/nueva", {
      titulo: "Publicar oferta",
      publicada: req.query.publicada === "1",
    });
  });

  router.post("/", async (req: Request<Record<string, string>, unknown, FormularioOferta>, res: Response) => {
    const empresario = usuarioActual(req);
    if (!empresario) {
      res.redirect(EstadoHttp.ENCONTRADO, "/login");
      return;
    }

    try {
      await sistemaOfertas.publicar(
        empresario,
        req.body.titulo ?? "",
        req.body.descripcion ?? "",
        req.body.ubicacion ?? "",
      );
      res.redirect(EstadoHttp.VER_OTRO, "/ofertas/nueva?publicada=1");
    } catch (error: unknown) {
      registrarExcepcion(req, error);
      renderizarError(res, EstadoHttp.ERROR_INTERNO, "No se pudo publicar la oferta");
    }
  });

  return router;
};
