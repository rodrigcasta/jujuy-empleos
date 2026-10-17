# language: es
Característica: Página de inicio
  Para saber cómo empezar a usar el sistema
  Como visitante
  Quiero que la página de inicio me indique cómo acceder a los alumnos

  Escenario: Un usuario anónimo es invitado a iniciar sesión
    Cuando visita la página de inicio
    Entonces la página de inicio ofrece el link "iniciar sesión" hacia la página de inicio de sesión
    Y la página de inicio no ofrece un link hacia el listado de alumnos

  Escenario: Un usuario con la sesión iniciada es invitado a ir al listado de alumnos
    Dado que inició sesión un usuario registrado
    Cuando visita la página de inicio
    Entonces la página de inicio ofrece el link "listado de alumnos" hacia el listado de alumnos
    Y la página de inicio no ofrece un link hacia la página de inicio de sesión
