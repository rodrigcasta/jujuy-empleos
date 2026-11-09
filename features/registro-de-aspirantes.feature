# language: es
Característica: Registracion para aspirante
  Como aspirante
  Quiero registrarme en la aplicacion
  Para poder postularme a una oferta de trabajo

  Escenario: ASP-01 - Registracion exitosa de aspirante
    Dado que no existe un usuario registrado con email "sofia.martinez@correo-ejemplo.com.ar"
    Cuando Sofia Martinez se registra como aspirante con email "sofia.martinez@correo-ejemplo.com.ar", contrasena "Empleo2026!#" y confirmacion "Empleo2026!#"
    Entonces la registracion resulta exitosa
    Y Sofia queda registrada como aspirante
    Y no tiene una suscripcion asociada
    Y queda autenticada en la aplicacion

  Escenario: ASP-02 - Registracion fallida por datos invalidos
    Dado que no existe un usuario registrado con email "correo-invalido"
    Cuando Ana Torres intenta registrarse como aspirante con email "correo-invalido", contrasena "Empleo2026!#" y confirmacion "Empleo2026!#"
    Entonces ve el mensaje de error "El email es inválido"
    Y no se registra un nuevo usuario

  @wip
  Escenario: ASP-03 - Un empresario existente no puede registrarse como aspirante
    Dado que existe un empresario registrado con email "maria.gonzalez@empresa-ejemplo.com.ar"
    Cuando Maria Gonzalez intenta registrarse como aspirante con email "maria.gonzalez@empresa-ejemplo.com.ar", contrasena "Empleo2026!#" y confirmacion "Empleo2026!#"
    Entonces ve el mensaje de error "El email es invalido"
    Y no se registra un nuevo usuario

  @wip
  Escenario: ASP-04 - Se conserva el tipo de usuario ante un error
    Dado que Sofia eligio registrarse como aspirante
    Cuando intenta registrarse con nombre vacio, apellido "Martinez", email "sofia.martinez@correo-ejemplo.com.ar", contrasena "Empleo2026!#" y confirmacion "Empleo2026!#"
    Entonces ve el mensaje de error "El nombre es obligatorio"
    Y continua seleccionada la opcion "Aspirante"
