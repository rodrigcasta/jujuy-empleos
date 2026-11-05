import express, { Request, Response } from "express";
import SistemaOfertas from "../dominio/sistema-ofertas";
import DatosDeOfertaInvalidos from "../dominio/datos-de-oferta-invalidos";
import LimiteDeOfertasAlcanzadoError from "../dominio/limite-de-ofertas-alcanzado-error";
import { EstadoHttp } from "../web/estado-http";
import { registrarExcepcion, renderizarError } from "../web/registrar-excepcion";
import { usuarioActual } from "../web/autenticacion";

interface FormularioOferta {
  titulo?: string;
  descripcion?: string;
  ubicacion?: string;
}

type SesionConOferta = NonNullable<Request["session"]> & {
  ofertaPublicada?: FormularioOferta;
};

export const crearControladorOfertas = (sistemaOfertas: SistemaOfertas) => {
  const router = express.Router();

  router.get("/", async (_req: Request, res: Response) => {
    const ofertas = await sistemaOfertas.listar();
    res.render("ofertas/listado", {
      titulo: "Ofertas laborales",
      sinOfertas: ofertas.length === 0,
      ofertas: ofertas.map((oferta) => ({
        titulo: oferta.obtenerTitulo(),
        descripcion: oferta.obtenerDescripcion(),
        ubicacion: oferta.obtenerUbicacion(),
      })),
    });
  });

  router.get("/nueva", async (req: Request, res: Response) => {
    const empresario = usuarioActual(req);
    if (!empresario) {
      res.redirect(EstadoHttp.ENCONTRADO, "/login");
      return;
    }

    const publicada = req.query.publicada === "1";
    if (publicada || (await sistemaOfertas.puedePublicar(empresario))) {
      const sesion = req.session as SesionConOferta | null | undefined;
      const ofertaPublicada = publicada ? sesion?.ofertaPublicada : undefined;
      if (sesion) {
        delete sesion.ofertaPublicada;
      }
      res.render("ofertas/nueva", {
        titulo: "Publicar oferta",
        publicada,
        nueva: ofertaPublicada,
      });
    } else {
      res.redirect(EstadoHttp.ENCONTRADO, "/?limite=ofertas");
    }
  });

  router.post("/", async (req: Request<Record<string, string>, unknown, FormularioOferta>, res: Response) => {
    const empresario = usuarioActual(req);
    if (!empresario) {
      res.redirect(EstadoHttp.ENCONTRADO, "/login");
      return;
    }

    const { titulo, descripcion, ubicacion } = req.body;

    try {
      await sistemaOfertas.publicar(empresario, titulo ?? "", descripcion ?? "", ubicacion ?? "");
      const sesion = req.session as SesionConOferta | null | undefined;
      if (sesion) {
        sesion.ofertaPublicada = { titulo, descripcion, ubicacion };
      }
      res.redirect(EstadoHttp.VER_OTRO, "/ofertas/nueva?publicada=1");
    } catch (error: unknown) {
      registrarExcepcion(req, error);
      if (error instanceof DatosDeOfertaInvalidos) {
        res.status(EstadoHttp.SOLICITUD_INCORRECTA).render("ofertas/nueva", {
          titulo: "Publicar oferta",
          error: error.message,
          nueva: { titulo, descripcion, ubicacion },
        });
      } else if (error instanceof LimiteDeOfertasAlcanzadoError) {
        res.redirect(EstadoHttp.VER_OTRO, "/?limite=ofertas");
      } else {
        renderizarError(res, EstadoHttp.ERROR_INTERNO, "No se pudo publicar la oferta");
      }
    }
  });

  return router;
};
