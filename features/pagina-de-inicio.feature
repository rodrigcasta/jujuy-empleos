# language: es
Característica: Página de inicio
  Para saber cómo empezar a usar el sistema
  Como visitante
  Quiero que la página de inicio me indique cómo acceder a los alumnos

  Escenario: Un usuario anónimo es invitado a iniciar sesión
    Cuando visita la página de inicio
    Entonces se le ofrece iniciar sesión
    Y no se le ofrece consultar el listado de alumnos

  Escenario: Un usuario con la sesión iniciada es invitado a consultar el listado de alumnos
    Dado que inició sesión un usuario registrado
    Cuando visita la página de inicio
    Entonces se le ofrece consultar el listado de alumnos
    Y no se le ofrece iniciar sesión
