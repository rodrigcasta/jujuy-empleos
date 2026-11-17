# language: es
Característica: Cierre de ofertas laborales
  Como empresario
  Quiero cerrar una oferta laboral que publiqué
  Para dejar de mantenerla activa cuando ya no necesito cubrir el puesto

  Escenario: CEO1 - El empresario cierra una oferta propia
    Dado que existe un empresario registrado con email "dueno@empresa.com.ar" y contraseña "Empresa2026!#"
    Y que el empresario "dueno@empresa.com.ar" tiene una oferta activa titulada "Desarrollador Java"
    Y que el empresario "dueno@empresa.com.ar" está autenticado
    Cuando accede al detalle de la oferta "Desarrollador Java"
    Entonces ve el botón "Cerrar oferta"
    Cuando selecciona el botón "Cerrar oferta"
    Entonces la oferta "Desarrollador Java" queda cerrada

  Escenario: CEO2 - Un empresario no puede cerrar una oferta ajena
    Dado que existe un empresario registrado con email "dueno@empresa.com.ar" y contraseña "Empresa2026!#"
    Y que el empresario "dueno@empresa.com.ar" tiene una oferta activa titulada "Analista QA"
    Y que existe un empresario registrado con email "otro@empresa.com.ar" y contraseña "Empresa2026!#"
    Y que el empresario "otro@empresa.com.ar" está autenticado
    Cuando accede al detalle de la oferta "Analista QA"
    Entonces no ve el botón "Cerrar oferta"
    Cuando intenta cerrar directamente la oferta "Analista QA"
    Entonces no puede cerrar la oferta "Analista QA"

  Escenario: CEO3 - El listado público no muestra ofertas cerradas
    Dado que existe un empresario registrado con email "dueno@empresa.com.ar" y contraseña "Empresa2026!#"
    Y que el empresario "dueno@empresa.com.ar" tiene una oferta cerrada titulada "Diseñador UX"
    Cuando una persona visita el listado público de ofertas
    Entonces no ve la oferta "Diseñador UX" en el listado

  Escenario: CEO3b - El empresario dueño ve su oferta cerrada en su listado
    Dado que existe un empresario registrado con email "dueno@empresa.com.ar" y contraseña "Empresa2026!#"
    Y que el empresario "dueno@empresa.com.ar" tiene una oferta cerrada titulada "Desarrollador backend"
    Y que el empresario "dueno@empresa.com.ar" está autenticado
    Cuando visita el listado de ofertas
    Entonces ve la oferta "Desarrollador backend" con la etiqueta "Cerrada"

  Escenario: CEO4 - Cerrar una oferta libera espacio para publicar otra
    Dado que el empresario "limite@empresa.com.ar" esta autenticado
    Y tiene una suscripcion "Gratuita"
    Y ya publico 1 oferta
    Cuando accede al detalle de la oferta "Oferta 1"
    Entonces ve el botón "Cerrar oferta"
    Cuando selecciona el botón "Cerrar oferta"
    Entonces la oferta "Oferta 1" queda cerrada
    Cuando publica una oferta con titulo "Nuevo puesto", descripcion "Nueva descripcion para el puesto" y ubicacion "CABA"
    Entonces la oferta se publica exitosamente
