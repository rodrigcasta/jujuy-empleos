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
      | contraseña   | Secreta123        |
      | confirmación | Secreta123        |
    Entonces puede ver el listado de alumnos
    Y se le muestra que inició sesión como "Juana (juana@example.com)"
    Y la contraseña de "juana@example.com" no se guarda en texto plano

  Escenario: No se puede registrar dos veces el mismo email
    Dado que existe el usuario:
      | nombre     | Marta             |
      | apellido   | Suarez            |
      | email      | marta@example.com |
      | contraseña | Secreta123        |
    Cuando se registra con nombre "Otra", apellido "Persona", email "MARTA@example.com", contraseña "Otra-clave" y confirmación "Otra-clave"
    Entonces ve el mensaje de error "El email es inválido"
    Y no puede ver el listado de alumnos

  Escenario: No se puede registrar un usuario si las contraseñas no coinciden
    Cuando se registra con nombre "Juana", apellido "Lopez", email "juana@example.com", contraseña "Secreta123" y confirmación "Distinta123"
    Entonces ve el mensaje de error "Las contraseñas no coinciden"
    Y no puede ver el listado de alumnos
