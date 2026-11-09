# language: es
Característica: Inicio de sesión
  Como usuario registrado
  Quiero iniciar sesión en la aplicación
  Para acceder a las funcionalidades disponibles para mi tipo de usuario

  Antecedentes:
    Dado que existe un empresario registrado con email "marta.suarez@empresa-ejemplo.com.ar" y contraseña "Empresa2026!#"
    Y existe un aspirante registrado con email "sofia.martinez@correo-ejemplo.com.ar" y contraseña "Empleo2026!#"

  Esquema del escenario: LOG-01 - Inicio de sesión exitoso
    Cuando inicia sesión con email "<email>" y contraseña "<contraseña>"
    Entonces queda autenticado como "<email_normalizado>"
    Y es dirigido al inicio

    Ejemplos:
      | tipo       | email                                            | contraseña    | email_normalizado                   |
      | empresario | MARTA.SUAREZ@EMPRESA-EJEMPLO.COM.AR               | Empresa2026!# | marta.suarez@empresa-ejemplo.com.ar |
      | aspirante  | sofia.martinez@correo-ejemplo.com.ar              | Empleo2026!#  | sofia.martinez@correo-ejemplo.com.ar |

  Esquema del escenario: LOG-02 - Credenciales incorrectas
    Cuando intenta iniciar sesión con email "<email>" y contraseña "<contraseña>"
    Entonces ve el mensaje de error "Email o contraseña incorrectos"
    Y no queda autenticado

    Ejemplos:
      | caso                   | email                               | contraseña    |
      | contraseña incorrecta | marta.suarez@empresa-ejemplo.com.ar | Incorrecta1!# |
      | usuario inexistente   | nadie@correo-ejemplo.com.ar         | Empleo2026!#  |

  Escenario: LOG-03 - Un usuario autenticado no vuelve al login
    Dado que el aspirante "sofia.martinez@correo-ejemplo.com.ar" está autenticado
    Cuando intenta acceder a la página de inicio de sesión
    Entonces es dirigido al inicio

  Escenario: LOG-04 - Cierre de sesión
    Dado que el empresario "marta.suarez@empresa-ejemplo.com.ar" está autenticado
    Cuando cierra la sesión
    Entonces deja de estar autenticado
    Y se le pide que inicie sesión
