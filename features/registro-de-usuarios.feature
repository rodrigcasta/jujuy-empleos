# language: es
Característica: Registro de usuarios
  Para poder acceder al sistema
  Como persona que todavía no tiene cuenta
  Quiero registrarme con mis datos

  Escenario: REG-01 - Registración exitosa
    Cuando se registra con los datos:
      | nombre       | Juana             |
      | apellido     | Lopez             |
      | email        | juana@example.com |
      | contraseña   | Secreta123!#      |
      | confirmación | Secreta123!#      |
      | tipo_usuario | Empresario        |
    Entonces se le muestra que inició sesión como "Juana (juana@example.com)"
    Y la contraseña de "juana@example.com" no se guarda en texto plano

  Escenario: REG-02 - Registracion con suscripcion Gratuita
    Cuando se registra con los datos:
      | nombre       | Laura                                  |
      | apellido     | Fernandez                              |
      | email        | laura.fernandez@empresa-ejemplo.com.ar |
      | contraseña   | Empresa2026!#                         |
      | confirmación | Empresa2026!#                         |
      | suscripcion  | Gratuita                               |
      | tipo_usuario | Empresario                             |
    Entonces el usuario "laura.fernandez@empresa-ejemplo.com.ar" queda registrado con suscripcion "Gratuita"

  Escenario: REG-03 - Registracion con suscripcion Corporativa
    Cuando se registra con los datos:
      | nombre       | Laura                                    |
      | apellido     | Fernandez                                |
      | email        | laura.corporativa@empresa-ejemplo.com.ar |
      | contraseña   | Empresa2026!#                           |
      | confirmación | Empresa2026!#                           |
      | suscripcion  | Corporativa                              |
      | tipo_usuario | Empresario                               |
    Entonces el usuario "laura.corporativa@empresa-ejemplo.com.ar" queda registrado con suscripcion "Corporativa"

  @wip
  Escenario: REG-04 - Registración fallida por nombre vacío
    Dado que no existe un empresario registrado con email "laura.fernandez@empresa-ejemplo.com.ar"
    Cuando intento registrar un empresario con nombre vacío, apellido "Fernandez", email "laura.fernandez@empresa-ejemplo.com.ar", contraseña "Empresa2026!#", confirmación "Empresa2026!#" y suscripción "Profesional"
    Entonces la registración falla porque el nombre es obligatorio

  @wip
  Escenario: REG-05 - Registración fallida por apellido vacío
    Dado que no existe un empresario registrado con email "laura.fernandez@empresa-ejemplo.com.ar"
    Cuando intento registrar un empresario con nombre "Laura", apellido vacío, email "laura.fernandez@empresa-ejemplo.com.ar", contraseña "Empresa2026!#", confirmación "Empresa2026!#" y suscripción "Profesional"
    Entonces la registración falla porque el apellido es obligatorio

  @wip
  Escenario: REG-06 - Registración fallida por email vacío
    Cuando intento registrar un empresario con nombre "Laura", apellido "Fernandez", email vacío, contraseña "Empresa2026!#", confirmación "Empresa2026!#" y suscripción "Profesional"
    Entonces la registración falla porque el email es obligatorio

  @wip
  Esquema del escenario: REG-07 - Registración fallida por email inválido
    Cuando intento registrar un empresario con nombre "Laura", apellido "Fernandez", email "<email>", contraseña "Empresa2026!#", confirmación "Empresa2026!#" y suscripción "Profesional"
    Entonces la registración falla porque el email no tiene un formato válido

    Ejemplos:
      | email                        |
      | laura.empresa-ejemplo.com.ar |
      | @gmail.com                   |
      | diego@.com                   |

  Escenario: REG-08 - Registracion fallida por email duplicado
    Dado que existe el usuario:
      | nombre     | Marta             |
      | apellido   | Suarez            |
      | email      | marta@example.com |
      | contraseña | Secreta123!#      |
    Cuando se registra con nombre "Otra", apellido "Persona", email "MARTA@example.com", contraseña "Otra-clave1!#" y confirmación "Otra-clave1!#"
    Entonces ve el mensaje de error "El email es inválido"

  @wip
  Escenario: REG-09 - Registración fallida por contraseña vacía
    Dado que no existe un empresario registrado con email "laura.fernandez@empresa-ejemplo.com.ar"
    Cuando intento registrar un empresario con nombre "Laura", apellido "Fernandez", email "laura.fernandez@empresa-ejemplo.com.ar", contraseña vacía, confirmación vacía y suscripción "Profesional"
    Entonces la registración falla porque la contraseña es obligatoria

  @wip
  Escenario: REG-10 - Registración fallida por contraseña corta
    Dado que no existe un empresario registrado con email "laura.fernandez@empresa-ejemplo.com.ar"
    Cuando intento registrar un empresario con nombre "Laura", apellido "Fernandez", email "laura.fernandez@empresa-ejemplo.com.ar", contraseña "Emp1!#", confirmación "Emp1!#" y suscripción "Profesional"
    Entonces la registración falla porque la contraseña tiene menos de 8 caracteres

  @wip
  Escenario: REG-11 - Registración fallida por falta de letra minúscula
    Dado que no existe un empresario registrado con email "laura.fernandez@empresa-ejemplo.com.ar"
    Cuando intento registrar un empresario con nombre "Laura", apellido "Fernandez", email "laura.fernandez@empresa-ejemplo.com.ar", contraseña "EMPRESA2026!#", confirmación "EMPRESA2026!#" y suscripción "Profesional"
    Entonces la registración falla porque la contraseña no contiene una letra minúscula

  @wip
  Escenario: REG-12 - Registración fallida por falta de letra mayúscula
    Dado que no existe un empresario registrado con email "laura.fernandez@empresa-ejemplo.com.ar"
    Cuando intento registrar un empresario con nombre "Laura", apellido "Fernandez", email "laura.fernandez@empresa-ejemplo.com.ar", contraseña "empresa2026!#", confirmación "empresa2026!#" y suscripción "Profesional"
    Entonces la registración falla porque la contraseña no contiene una letra mayúscula

  @wip
  Escenario: REG-13 - Registración fallida por falta de número
    Dado que no existe un empresario registrado con email "laura.fernandez@empresa-ejemplo.com.ar"
    Cuando intento registrar un empresario con nombre "Laura", apellido "Fernandez", email "laura.fernandez@empresa-ejemplo.com.ar", contraseña "EmpresaSegura!#", confirmación "EmpresaSegura!#" y suscripción "Profesional"
    Entonces la registración falla porque la contraseña no contiene un número

  Escenario: REG-14 - Registracion fallida por confirmacion diferente
    Cuando se registra con nombre "Juana", apellido "Lopez", email "juana@example.com", contraseña "Secreta123!#" y confirmación "Distinta123!#"
    Entonces ve el mensaje de error "Las contraseñas no coinciden"

  Escenario: REG-15 - Registracion con la suscripcion predeterminada
    Cuando se registra con los datos:
      | nombre       | Laura                                    |
      | apellido     | Fernandez                                |
      | email        | laura.profesional@empresa-ejemplo.com.ar |
      | contraseña   | Empresa2026!#                           |
      | confirmación | Empresa2026!#                           |
    Entonces el usuario "laura.profesional@empresa-ejemplo.com.ar" queda registrado con suscripcion "Profesional"

  @wip
  Escenario: REG-16 - Registración fallida por no incluir dos símbolos
    Dado que no existe un empresario registrado con email "laura.fernandez@empresa-ejemplo.com.ar"
    Cuando intento registrar un empresario con nombre "Laura", apellido "Fernandez", email "laura.fernandez@empresa-ejemplo.com.ar", contraseña "Empresa2026!", confirmación "Empresa2026!" y suscripción "Profesional"
    Entonces la registración falla porque la contraseña contiene menos de dos símbolos

  @wip
  Escenario: REG-17 - Registración exitosa con contraseña de longitud máxima
    Dado que no existe un empresario registrado con email "laura.fernandez@empresa-ejemplo.com.ar"
    Cuando registro un empresario con nombre "Laura", apellido "Fernandez", email "laura.fernandez@empresa-ejemplo.com.ar", contraseña "EmpresaSegura2026!#$", confirmación "EmpresaSegura2026!#$" y suscripción "Profesional"
    Entonces la registración resulta exitosa

  @wip
  Escenario: REG-18 - Registración fallida por superar la longitud máxima de contraseña
    Dado que no existe un empresario registrado con email "laura.fernandez@empresa-ejemplo.com.ar"
    Cuando intento registrar un empresario con nombre "Laura", apellido "Fernandez", email "laura.fernandez@empresa-ejemplo.com.ar", contraseña "EmpresaSegura2026!#$A", confirmación "EmpresaSegura2026!#$A" y suscripción "Profesional"
    Entonces la registración falla porque la contraseña supera los 20 caracteres

  @wip
  Esquema del escenario: REG-19 - Registración fallida por nombre o apellido demasiado largo
    Dado que no existe un empresario registrado con email "limites@empresa-ejemplo.com.ar"
    Cuando intento registrar un empresario con nombre "<nombre>", apellido "<apellido>", email "limites@empresa-ejemplo.com.ar", contraseña "Empresa2026!#", confirmación "Empresa2026!#" y suscripción "Profesional"
    Entonces la registración falla porque el <campo> supera los 20 caracteres

    Ejemplos:
      | nombre                | apellido              | campo    |
      | NombreDeEmpresaLargoX | Fernandez             | nombre   |
      | Laura                 | ApellidoEmpresaLargoX | apellido |

  @wip
  Escenario: REG-20 - Registración fallida por email demasiado largo
    Cuando intento registrar un empresario con nombre "Laura", apellido "Fernandez", email "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc.dddddddddddddddddddddddddddddddddddddddddddddddddddddddddd.com", contraseña "Empresa2026!#", confirmación "Empresa2026!#" y suscripción "Profesional"
    Entonces la registración falla porque el email supera los 254 caracteres

  @wip
  Escenario: REG-21 - Registracion de empresario rechazada por email perteneciente a un aspirante
    Dado que existe un aspirante registrado con email "pedro.sanchez@correo-ejemplo.com.ar"
    Cuando Pedro Sanchez intenta registrarse como empresario con email "pedro.sanchez@correo-ejemplo.com.ar", contrasena "Empresa2026!#", confirmacion "Empresa2026!#" y suscripcion "Profesional"
    Entonces ve el mensaje de error "El email es invalido"
    Y no se registra un nuevo usuario

  Escenario: Suscripcion Profesional seleccionada inicialmente
    Cuando inicia una registracion
    Entonces puede elegir las suscripciones:
      | Gratuita    |
      | Profesional |
      | Corporativa |
    Y la suscripcion inicial es "Profesional"

  Escenario: Informa los requisitos de contraseña
    Cuando inicia una registracion
    Entonces se informan los requisitos de contraseña "Entre 8 y 20 caracteres, con al menos una letra minúscula, una letra mayúscula, un número y dos símbolos."
