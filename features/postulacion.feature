# language: es
Característica: Postulación a ofertas
  Como aspirante
  Quiero postularme a una oferta laboral
  Para poder conseguir empleo

  Antecedentes:
    Dado que existe la oferta "Desarrollador Backend" publicada por "empresa@ejemplo.com.ar"

  Escenario: POS-01 - Postulación exitosa
    Dado que el aspirante "sofia.martinez@correo-ejemplo.com.ar" está autenticado
    Cuando se postula a la oferta "Desarrollador Backend" desde su detalle
    Entonces ve el mensaje "Tu postulación fue registrada"
    Y queda registrada una postulación de "sofia.martinez@correo-ejemplo.com.ar" a la oferta "Desarrollador Backend"

  Escenario: POS-02 - Postulación duplicada
    Dado que el aspirante "sofia.martinez@correo-ejemplo.com.ar" está autenticado
    Y ya se postuló a la oferta "Desarrollador Backend"
    Cuando intenta postularse nuevamente a la oferta "Desarrollador Backend"
    Entonces ve el mensaje "Ya te postulaste a esta oferta"
    Y conserva una única postulación a la oferta "Desarrollador Backend"

  Escenario: POS-03 - Visitante no autenticado
    Dado que no hay un usuario autenticado
    Cuando intenta postularse a la oferta "Desarrollador Backend"
    Entonces es dirigido al inicio de sesión
    Y no se registra una postulación

  Escenario: POS-04 - Empresario no autorizado para postularse
    Dado que el empresario "empresa@ejemplo.com.ar" está autenticado
    Cuando intenta postularse a la oferta "Desarrollador Backend"
    Entonces ve el mensaje "Solo los aspirantes pueden postularse a ofertas"
    Y no se registra una postulación

  Escenario: POS-05 - Rechazar una postulación directa a una oferta cerrada
    Dado que el aspirante "sofia.martinez@correo-ejemplo.com.ar" está autenticado
    Y que la oferta "Desarrollador Backend" fue cerrada
    Cuando envía directamente una postulación a la oferta "Desarrollador Backend"
    Entonces ve el mensaje "La oferta ya se encuentra cerrada"
    Y no se registra una postulación
    Y no ve el botón "Postularse"
