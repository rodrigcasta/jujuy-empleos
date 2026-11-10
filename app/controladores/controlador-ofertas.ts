import express, { Request, Response } from "express";
import SistemaOfertas from "../dominio/sistema-ofertas";
import DatosDeOfertaInvalidos from "../dominio/datos-de-oferta-invalidos";
import LimiteDeOfertasAlcanzadoError from "../dominio/limite-de-ofertas-alcanzado-error";
import OfertaNoEncontradaError from "../dominio/oferta-no-encontrada-error";
import { EstadoHttp } from "../web/estado-http";
import { registrarExcepcion, renderizarError } from "../web/registrar-excepcion";
import { usuarioActual } from "../web/autenticacion";
import Usuario from "../dominio/usuario";
import SistemaPostulaciones from "../dominio/sistema-postulaciones";
import PostulacionDuplicadaError from "../dominio/postulacion-duplicada-error";
import PostulacionNoAutorizadaError from "../dominio/postulacion-no-autorizada-error";

const CANTIDAD_CARACTERES_RESUMEN = 50;

const resumirDescripcion = (descripcion: string): string =>
  descripcion.length > CANTIDAD_CARACTERES_RESUMEN
    ? `${descripcion.slice(0, CANTIDAD_CARACTERES_RESUMEN)}...`
    : descripcion;

interface FormularioOferta {
  titulo?: string;
  descripcion?: string;
  ubicacion?: string;
}

type SesionDeOfertas = NonNullable<Request["session"]> & {
  ofertaPublicada?: FormularioOferta;
  postulacionRegistradaEnOferta?: number;
  errorDePostulacion?: { idOferta: number; mensaje: string };
};

export const crearControladorOfertas = (sistemaOfertas: SistemaOfertas, sistemaPostulaciones: SistemaPostulaciones) => {
  const router = express.Router();

  const obtenerEmpresarioAutenticado = (req: Request, res: Response): Usuario | undefined => {
    const usuario = usuarioActual(req);
    if (!usuario) {
      res.redirect(EstadoHttp.ENCONTRADO, "/login");
      return undefined;
    }
    if (!usuario.esEmpresario()) {
      res.redirect(EstadoHttp.ENCONTRADO, "/");
      return undefined;
    }
    return usuario;
  };

  router.get("/", async (_req: Request, res: Response) => {
    const ofertas = await sistemaOfertas.listar();
    res.render("ofertas/listado", {
      titulo: "Ofertas laborales",
      sinOfertas: ofertas.length === 0,
      ofertas: ofertas.map((oferta) => ({
        id: oferta.obtenerId(),
        titulo: oferta.obtenerTitulo(),
        descripcion: resumirDescripcion(oferta.obtenerDescripcion()),
        ubicacion: oferta.obtenerUbicacion(),
      })),
    });
  });

  router.get("/nueva", async (req: Request, res: Response) => {
    const empresario = obtenerEmpresarioAutenticado(req, res);
    if (!empresario) {
      return;
    }

    const publicada = req.query.publicada === "1";
    if (publicada || (await sistemaOfertas.puedePublicar(empresario))) {
      const sesion = req.session as SesionDeOfertas | null | undefined;
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

  router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
    try {
      const detalle = await sistemaOfertas.obtenerDetallePorId(Number(req.params.id));
      const usuario = usuarioActual(req);
      const sesion = req.session as SesionDeOfertas | null | undefined;
      const postulacionRegistrada = sesion?.postulacionRegistradaEnOferta === detalle.id;
      const errorDePostulacion =
        sesion?.errorDePostulacion?.idOferta === detalle.id ? sesion.errorDePostulacion : undefined;
      if (postulacionRegistrada && sesion) {
        delete sesion.postulacionRegistradaEnOferta;
      }
      if (errorDePostulacion && sesion) {
        delete sesion.errorDePostulacion;
      }
      res.render("ofertas/detalle", {
        titulo: "Detalle de la oferta",
        detalle,
        puedePostularse: usuario === undefined || usuario.esAspirante(),
        postulacionRegistrada,
        errorDePostulacion: errorDePostulacion?.mensaje,
      });
    } catch (error: unknown) {
      registrarExcepcion(req, error);
      if (error instanceof OfertaNoEncontradaError) {
        res.status(EstadoHttp.NO_ENCONTRADO).render("ofertas/detalle", {
          titulo: "Detalle de la oferta",
          noEncontrada: true,
          mensaje: error.message,
        });
      } else {
        renderizarError(res, EstadoHttp.ERROR_INTERNO, "No se pudo obtener el detalle de la oferta");
      }
    }
  });

  router.post("/:id/postulaciones", async (req: Request<{ id: string }>, res: Response) => {
    const aspirante = usuarioActual(req);
    if (!aspirante) {
      res.redirect(EstadoHttp.ENCONTRADO, "/login");
      return;
    }

    try {
      const idOferta = Number(req.params.id);
      await sistemaPostulaciones.postular(aspirante, idOferta);
      const sesion = req.session as SesionDeOfertas | null | undefined;
      if (sesion) {
        sesion.postulacionRegistradaEnOferta = idOferta;
      }
      res.redirect(EstadoHttp.VER_OTRO, `/ofertas/${idOferta}`);
    } catch (error: unknown) {
      registrarExcepcion(req, error);
      if (error instanceof PostulacionDuplicadaError || error instanceof PostulacionNoAutorizadaError) {
        const idOferta = Number(req.params.id);
        const sesion = req.session as SesionDeOfertas | null | undefined;
        if (sesion) {
          sesion.errorDePostulacion = { idOferta, mensaje: error.message };
        }
        res.redirect(EstadoHttp.VER_OTRO, `/ofertas/${idOferta}`);
      } else {
        renderizarError(res, EstadoHttp.ERROR_INTERNO, "No se pudo registrar la postulación");
      }
    }
  });

  router.post("/", async (req: Request<Record<string, string>, unknown, FormularioOferta>, res: Response) => {
    const empresario = obtenerEmpresarioAutenticado(req, res);
    if (!empresario) {
      return;
    }

    const { titulo, descripcion, ubicacion } = req.body;

    try {
      await sistemaOfertas.publicar(empresario, titulo ?? "", descripcion ?? "", ubicacion ?? "");
      const sesion = req.session as SesionDeOfertas | null | undefined;
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
