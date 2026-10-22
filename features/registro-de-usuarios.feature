# language: es
Característica: Registro de usuarios
  Para poder acceder al sistema
  Como persona que todavía no tiene cuenta
  Quiero registrarme con mis datos

  Escenario: Registro exitoso
    Cuando se registra con los datos:
      | nombre       | Juana             |
      | apellido     | Lopez             |
      | email        | juana@example.com |
      | contraseña   | secreta123        |
      | confirmación | secreta123        |
    Entonces puede ver el listado de alumnos
    Y la página muestra "Juana (juana@example.com)"
    Y la contraseña de "juana@example.com" no se guarda en texto plano

  Escenario: No se puede registrar dos veces el mismo email
    Dado que existe el usuario:
      | nombre     | Marta             |
      | apellido   | Suarez            |
      | email      | marta@example.com |
      | contraseña | secreta123        |
    Cuando se registra con nombre "Otra", apellido "Persona", email "MARTA@example.com", contraseña "otra-clave" y confirmación "otra-clave"
    Entonces ve el mensaje de error "Ya existe un usuario registrado con el email marta@example.com"
    Y no puede ver el listado de alumnos

  Escenario: No se puede registrar un usuario si las contraseñas no coinciden
    Cuando se registra con nombre "Juana", apellido "Lopez", email "juana@example.com", contraseña "secreta123" y confirmación "distinta123"
    Entonces ve el mensaje de error "Las contraseñas no coinciden"
    Y no puede ver el listado de alumnos
