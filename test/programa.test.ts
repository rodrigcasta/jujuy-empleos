import { app, server } from "../app/programa";
import supertest from "supertest";
import RepositorioAlumnoSql from "../app/adaptadores/repositorio-alumno-sql";
import RepositorioUsuarioSql from "../app/adaptadores/repositorio-usuario-sql";
import pool from "../app/adaptadores/pool";

const USUARIO = {
  nombre: "Marta",
  apellido: "Suarez",
  email: "marta@example.com",
  contrasena: "secreta123",
  confirmacion: "secreta123",
};

const anonimo = supertest(app);
// Agente con una sesión iniciada: guarda la cookie de sesión entre requests
let agente: ReturnType<typeof supertest.agent>;

const registrar = (cliente: ReturnType<typeof supertest.agent>, datos: Record<string, string> = USUARIO) =>
  cliente.post("/registro").type("form").send(datos);

const iniciarSesion = (cliente: ReturnType<typeof supertest.agent>, email: string, contrasena: string) =>
  cliente.post("/login").type("form").send({ email, contrasena });

const crearAlumno = (datos: Record<string, string>) => agente.post("/alumnos").type("form").send(datos);

beforeEach(async () => {
  const resultadoAlumnos = await new RepositorioAlumnoSql().eliminarTodos();
  const resultadoUsuarios = await new RepositorioUsuarioSql().eliminarTodos();
  if (!resultadoAlumnos || !resultadoUsuarios) {
    throw new Error("setup failed");
  }

  agente = supertest.agent(app);
  const respuesta = await registrar(agente);
  if (respuesta.status !== 303) {
    throw new Error("setup failed: no se pudo registrar el usuario de prueba");
  }
});

afterAll(async () => {
  await pool.end();
  server.close();
});

describe("GET /", () => {
  test("deberia devolver la home page en HTML", async () => {
    const respuesta = await agente.get("/");

    expect(respuesta.status).toEqual(200);
    expect(respuesta.type).toEqual("text/html");
    expect(respuesta.text).toContain("Hola mundo");
  });
});

describe("Bootstrap", () => {
  test("el layout deberia incluir el CSS y el JS de Bootstrap", async () => {
    const respuesta = await anonimo.get("/");

    expect(respuesta.text).toContain('href="/vendor/bootstrap/css/bootstrap.min.css"');
    expect(respuesta.text).toContain('src="/vendor/bootstrap/js/bootstrap.bundle.min.js"');
  });

  test.each([
    ["/vendor/bootstrap/css/bootstrap.min.css", "text/css"],
    ["/vendor/bootstrap/js/bootstrap.bundle.min.js", "application/javascript"],
  ])("deberia servir %s sin requerir sesion", async (ruta, tipo) => {
    const respuesta = await anonimo.get(ruta);

    expect(respuesta.status).toEqual(200);
    expect(respuesta.type).toEqual(tipo);
  });
});

describe("POST /alumnos", () => {
  test("deberia redirigir al detalle del alumno creado", async () => {
    const respuesta = await crearAlumno({
      nombre: "Juana",
      apellido: "Lopez",
      padron: "11111",
    });

    expect(respuesta.status).toEqual(303);
    expect(respuesta.headers.location).toEqual("/alumnos/11111");

    const detalle = await agente.get(respuesta.headers.location);
    expect(detalle.status).toEqual(200);
    expect(detalle.text).toContain("11111");
    expect(detalle.text).toContain("Juana");
    expect(detalle.text).toContain("Lopez");
  });

  test("deberia devolver estado 400 y mensaje de error si no se incluye el campo padron", async () => {
    const respuesta = await crearAlumno({ nombre: "Juana", apellido: "Lopez" });

    expect(respuesta.status).toEqual(400);
    expect(respuesta.type).toEqual("text/html");
    expect(respuesta.text).toContain("El campo padron es obligatorio");
  });

  test("deberia devolver estado 400 si el campo padron esta vacio", async () => {
    const respuesta = await crearAlumno({
      nombre: "Juana",
      apellido: "Lopez",
      padron: "",
    });

    expect(respuesta.status).toEqual(400);
    expect(respuesta.text).toContain("El campo padron es obligatorio");
  });

  test("deberia conservar los datos ingresados en el formulario si hay un error", async () => {
    const respuesta = await crearAlumno({ nombre: "Juana", apellido: "Lopez" });

    expect(respuesta.text).toContain('value="Juana"');
    expect(respuesta.text).toContain('value="Lopez"');
  });
});

describe("GET /alumnos", () => {
  test("deberia devolver estado OK e indicar que no hay alumnos si no hay alumnos guardados", async () => {
    const respuesta = await agente.get("/alumnos");

    expect(respuesta.status).toEqual(200);
    expect(respuesta.type).toEqual("text/html");
    expect(respuesta.text).toContain("No hay alumnos cargados.");
  });

  test("deberia incluir el formulario para crear alumnos", async () => {
    const respuesta = await agente.get("/alumnos");

    expect(respuesta.text).toContain('<form method="post" action="/alumnos">');
    expect(respuesta.text).toContain('name="padron"');
    expect(respuesta.text).toContain('name="nombre"');
    expect(respuesta.text).toContain('name="apellido"');
  });

  test("deberia devolver estado OK y una lista con un alumno si hay uno guardado", async () => {
    await crearAlumno({ padron: "12345", nombre: "Ana", apellido: "Garcia" });

    const respuesta = await agente.get("/alumnos");

    expect(respuesta.status).toEqual(200);
    expect(respuesta.text).toContain("12345");
    expect(respuesta.text).toContain("Ana");
    expect(respuesta.text).toContain("Garcia");
    expect(respuesta.text).not.toContain("No hay alumnos cargados.");
  });

  test("deberia devolver estado OK y una lista con todos los alumnos si hay varios guardados", async () => {
    await crearAlumno({ padron: "11111", nombre: "Juana", apellido: "Lopez" });
    await crearAlumno({
      padron: "22222",
      nombre: "Carlos",
      apellido: "Martinez",
    });
    await crearAlumno({
      padron: "33333",
      nombre: "Sofia",
      apellido: "Rodriguez",
    });

    const respuesta = await agente.get("/alumnos");

    expect(respuesta.status).toEqual(200);
    expect(respuesta.text).toContain("11111");
    expect(respuesta.text).toContain("22222");
    expect(respuesta.text).toContain("33333");
    expect(respuesta.text).toContain("Juana");
    expect(respuesta.text).toContain("Carlos");
    expect(respuesta.text).toContain("Sofia");
  });

  test("deberia escapar el HTML de los datos del alumno", async () => {
    await crearAlumno({
      padron: "12345",
      nombre: "<script>alert(1)</script>",
      apellido: "Garcia",
    });

    const respuesta = await agente.get("/alumnos");

    expect(respuesta.text).not.toContain("<script>alert(1)</script>");
    expect(respuesta.text).toContain("&lt;script&gt;");
  });
});

describe("GET /alumnos/:padron", () => {
  test("deberia devolver estado OK y los datos del alumno si existe", async () => {
    await crearAlumno({ padron: "12345", nombre: "Ana", apellido: "Garcia" });

    const respuesta = await agente.get("/alumnos/12345");

    expect(respuesta.status).toEqual(200);
    expect(respuesta.type).toEqual("text/html");
    expect(respuesta.text).toContain("12345");
    expect(respuesta.text).toContain("Ana");
    expect(respuesta.text).toContain("Garcia");
  });

  test("deberia devolver el alumno correcto cuando hay varios alumnos guardados", async () => {
    await crearAlumno({ padron: "11111", nombre: "Juana", apellido: "Lopez" });
    await crearAlumno({
      padron: "22222",
      nombre: "Carlos",
      apellido: "Martinez",
    });
    await crearAlumno({
      padron: "33333",
      nombre: "Sofia",
      apellido: "Rodriguez",
    });

    const respuesta = await agente.get("/alumnos/22222");

    expect(respuesta.status).toEqual(200);
    expect(respuesta.text).toContain("Carlos");
    expect(respuesta.text).toContain("Martinez");
    expect(respuesta.text).not.toContain("Juana");
    expect(respuesta.text).not.toContain("Sofia");
  });

  test("deberia devolver estado 404 y mensaje de error si el alumno no existe", async () => {
    const padronInexistente = "99999";
    const respuesta = await agente.get(`/alumnos/${padronInexistente}`);

    expect(respuesta.status).toEqual(404);
    expect(respuesta.type).toEqual("text/html");
    expect(respuesta.text).toContain(`No se encontró el alumno con padrón ${padronInexistente}`);
  });
});

describe("POST /alumnos/:padron/eliminar", () => {
  test("deberia redirigir al listado y eliminar el alumno si existe", async () => {
    await crearAlumno({ padron: "12345", nombre: "Ana", apellido: "Garcia" });

    let respuesta = await agente.get("/alumnos/12345");
    expect(respuesta.status).toEqual(200);

    respuesta = await agente.post("/alumnos/12345/eliminar");
    expect(respuesta.status).toEqual(303);
    expect(respuesta.headers.location).toEqual("/alumnos");

    respuesta = await agente.get("/alumnos/12345");
    expect(respuesta.status).toEqual(404);
  });

  test("deberia eliminar solo el alumno especificado cuando hay varios guardados", async () => {
    await crearAlumno({ padron: "11111", nombre: "Juana", apellido: "Lopez" });
    await crearAlumno({
      padron: "22222",
      nombre: "Carlos",
      apellido: "Martinez",
    });
    await crearAlumno({
      padron: "33333",
      nombre: "Sofia",
      apellido: "Rodriguez",
    });

    const respuesta = await agente.post("/alumnos/22222/eliminar");
    expect(respuesta.status).toEqual(303);

    const respuestaBusqueda = await agente.get("/alumnos/22222");
    expect(respuestaBusqueda.status).toEqual(404);

    const respuestaAlumno1 = await agente.get("/alumnos/11111");
    expect(respuestaAlumno1.status).toEqual(200);
    expect(respuestaAlumno1.text).toContain("Juana");

    const respuestaAlumno3 = await agente.get("/alumnos/33333");
    expect(respuestaAlumno3.status).toEqual(200);
    expect(respuestaAlumno3.text).toContain("Sofia");
  });

  test("deberia devolver estado 404 y mensaje de error si el alumno no existe", async () => {
    const padronInexistente = "99999";
    const respuesta = await agente.post(`/alumnos/${padronInexistente}/eliminar`);

    expect(respuesta.status).toEqual(404);
    expect(respuesta.type).toEqual("text/html");
    expect(respuesta.text).toContain(`No se encontró el alumno con padrón ${padronInexistente}`);
  });
});

describe("Acceso anónimo a las páginas de alumnos", () => {
  test.each([
    ["GET", "/alumnos"],
    ["GET", "/alumnos/12345"],
    ["POST", "/alumnos"],
    ["POST", "/alumnos/12345/eliminar"],
  ])("%s %s deberia redirigir al login", async (metodo, ruta) => {
    const respuesta = metodo === "GET" ? await anonimo.get(ruta) : await anonimo.post(ruta).type("form").send({});

    expect(respuesta.status).toEqual(302);
    expect(respuesta.headers.location).toEqual("/login");
  });

  test("no deberia permitir crear alumnos", async () => {
    await anonimo.post("/alumnos").type("form").send({ padron: "12345", nombre: "Ana", apellido: "Garcia" });

    const alumnos = await new RepositorioAlumnoSql().listarAlumnos();
    expect(alumnos).toHaveLength(0);
  });

  test("no deberia permitir eliminar alumnos", async () => {
    await crearAlumno({ padron: "12345", nombre: "Ana", apellido: "Garcia" });

    await anonimo.post("/alumnos/12345/eliminar");

    const respuesta = await agente.get("/alumnos/12345");
    expect(respuesta.status).toEqual(200);
  });

  test("deberia mostrar los links para iniciar sesion y registrarse en el layout", async () => {
    const respuesta = await anonimo.get("/");

    expect(respuesta.text).toContain('href="/login"');
    expect(respuesta.text).toContain('href="/registro"');
    expect(respuesta.text).not.toContain("Cerrar sesión");
  });
});

describe("GET /login y GET /registro", () => {
  test("deberian devolver los formularios en HTML", async () => {
    const login = await anonimo.get("/login");
    expect(login.status).toEqual(200);
    expect(login.text).toContain('<form method="post" action="/login">');
    expect(login.text).toContain('name="email"');
    expect(login.text).toContain('name="contrasena"');

    const registro = await anonimo.get("/registro");
    expect(registro.status).toEqual(200);
    expect(registro.text).toContain('<form method="post" action="/registro">');
    for (const campo of ["nombre", "apellido", "email", "contrasena", "confirmacion"]) {
      expect(registro.text).toContain(`name="${campo}"`);
    }
  });

  test("deberian redirigir al listado de alumnos si ya hay una sesion iniciada", async () => {
    expect((await agente.get("/login")).headers.location).toEqual("/alumnos");
    expect((await agente.get("/registro")).headers.location).toEqual("/alumnos");
  });
});

describe("POST /registro", () => {
  test("deberia registrar al usuario, iniciar su sesion y redirigir al listado de alumnos", async () => {
    const cliente = supertest.agent(app);

    const respuesta = await registrar(cliente, {
      nombre: "Juana",
      apellido: "Lopez",
      email: "juana@example.com",
      contrasena: "otra-clave",
      confirmacion: "otra-clave",
    });

    expect(respuesta.status).toEqual(303);
    expect(respuesta.headers.location).toEqual("/alumnos");

    const alumnos = await cliente.get("/alumnos");
    expect(alumnos.status).toEqual(200);
    expect(alumnos.text).toContain("Juana (juana@example.com)");
    expect(alumnos.text).toContain("Cerrar sesión");
  });

  test("no deberia guardar la contraseña en texto plano", async () => {
    const resultado = await pool.query("SELECT hash_contrasena FROM usuarios WHERE email = $1", [USUARIO.email]);

    expect(resultado.rows).toHaveLength(1);
    expect(resultado.rows[0].hash_contrasena).not.toContain(USUARIO.contrasena);
    expect(resultado.rows[0].hash_contrasena).toMatch(/^\$2[aby]\$/);
  });

  test("deberia devolver estado 409 si ya existe un usuario con el mismo email", async () => {
    const respuesta = await registrar(anonimo, { ...USUARIO, email: "MARTA@example.com" });

    expect(respuesta.status).toEqual(409);
    expect(respuesta.text).toContain("Ya existe un usuario registrado con el email marta@example.com");
  });

  test("deberia devolver estado 400 si las contraseñas no coinciden", async () => {
    const respuesta = await registrar(anonimo, { ...USUARIO, email: "otra@example.com", confirmacion: "distinta123" });

    expect(respuesta.status).toEqual(400);
    expect(respuesta.text).toContain("Las contraseñas no coinciden");
  });

  test("no deberia validar la confirmacion si el formulario no la incluye", async () => {
    const respuesta = await registrar(anonimo, {
      nombre: USUARIO.nombre,
      apellido: USUARIO.apellido,
      email: "otra@example.com",
      contrasena: USUARIO.contrasena,
    });

    expect(respuesta.status).toEqual(303);
    expect(respuesta.headers.location).toEqual("/alumnos");
  });

  test.each([
    ["el nombre esta vacio", { nombre: "" }, "El campo nombre es obligatorio"],
    ["el apellido esta vacio", { apellido: "" }, "El campo apellido es obligatorio"],
    ["el email no es valido", { email: "no-es-un-email" }, "El email no es válido"],
    ["la contraseña es corta", { contrasena: "corta", confirmacion: "corta" }, "al menos 8 caracteres"],
  ])("deberia devolver estado 400 si %s", async (_caso, cambios, mensaje) => {
    const respuesta = await registrar(anonimo, { ...USUARIO, email: "otra@example.com", ...cambios });

    expect(respuesta.status).toEqual(400);
    expect(respuesta.text).toContain(mensaje);
  });

  test("deberia conservar los datos ingresados, salvo las contraseñas, si hay un error", async () => {
    const respuesta = await registrar(anonimo, { ...USUARIO, email: "otra@example.com", confirmacion: "distinta123" });

    expect(respuesta.text).toContain('value="Marta"');
    expect(respuesta.text).toContain('value="Suarez"');
    expect(respuesta.text).toContain('value="otra@example.com"');
    expect(respuesta.text).not.toContain(USUARIO.contrasena);
  });
});

describe("POST /login", () => {
  test("deberia iniciar la sesion con credenciales correctas y redirigir al listado de alumnos", async () => {
    const cliente = supertest.agent(app);

    const respuesta = await iniciarSesion(cliente, "Marta@Example.com", USUARIO.contrasena);

    expect(respuesta.status).toEqual(303);
    expect(respuesta.headers.location).toEqual("/alumnos");
    const alumnos = await cliente.get("/alumnos");
    expect(alumnos.status).toEqual(200);
    expect(alumnos.text).toContain("Marta (marta@example.com)");
  });

  test.each([
    ["la contraseña es incorrecta", USUARIO.email, "incorrecta"],
    ["el usuario no existe", "nadie@example.com", USUARIO.contrasena],
    ["faltan los datos", "", ""],
  ])("deberia devolver estado 401 si %s", async (_caso, email, contrasena) => {
    const cliente = supertest.agent(app);

    const respuesta = await iniciarSesion(cliente, email, contrasena);

    expect(respuesta.status).toEqual(401);
    expect(respuesta.text).toContain("Email o contraseña incorrectos");
    expect((await cliente.get("/alumnos")).status).toEqual(302);
  });

  test("no deberia imprimir la contraseña en el log", async () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => undefined);
    try {
      await iniciarSesion(supertest.agent(app), USUARIO.email, USUARIO.contrasena);

      const salida = log.mock.calls.map((argumentos) => argumentos.join(" ")).join("\n");
      expect(salida).toContain('"contrasena":"***"');
      expect(salida).not.toContain(USUARIO.contrasena);
    } finally {
      log.mockRestore();
    }
  });
});

describe("POST /logout", () => {
  test("deberia cerrar la sesion y redirigir al login", async () => {
    const respuesta = await agente.post("/logout");

    expect(respuesta.status).toEqual(303);
    expect(respuesta.headers.location).toEqual("/login");

    const alumnos = await agente.get("/alumnos");
    expect(alumnos.status).toEqual(302);
    expect(alumnos.headers.location).toEqual("/login");
  });
});

describe("Sesión del lado del cliente", () => {
  // Inicia sesión y devuelve las cookies "sesion" (contenido en base64) y "sesion.sig" (firma)
  const obtenerCookiesDeSesion = async () => {
    const respuesta = await iniciarSesion(anonimo, USUARIO.email, USUARIO.contrasena);
    const cookies = respuesta.get("Set-Cookie") ?? [];
    const valor = (nombre: string) =>
      cookies
        .find((cookie) => cookie.startsWith(`${nombre}=`))!
        .split(";")[0]
        .substring(nombre.length + 1);
    return { sesion: valor("sesion"), firma: valor("sesion.sig") };
  };

  const decodificar = (valor: string) => JSON.parse(Buffer.from(valor, "base64").toString("utf8"));

  test("la cookie deberia contener solo el id del usuario y el vencimiento de la sesion", async () => {
    const { sesion } = await obtenerCookiesDeSesion();

    const contenido = decodificar(sesion);
    expect(Object.keys(contenido).sort()).toEqual(["passport", "venceEn"]);
    expect(Object.keys(contenido.passport)).toEqual(["user"]);
    expect(typeof contenido.passport.user).toEqual("number");
    expect(contenido.venceEn).toBeGreaterThan(Date.now());
  });

  test("no deberia aceptar una cookie modificada por el cliente", async () => {
    const { sesion, firma } = await obtenerCookiesDeSesion();
    const contenido = decodificar(sesion);
    contenido.passport.user = contenido.passport.user + 1;
    const sesionModificada = Buffer.from(JSON.stringify(contenido)).toString("base64");

    const respuesta = await anonimo.get("/alumnos").set("Cookie", `sesion=${sesionModificada}; sesion.sig=${firma}`);

    expect(respuesta.status).toEqual(302);
    expect(respuesta.headers.location).toEqual("/login");
  });

  test("no deberia aceptar una sesion vencida aunque la cookie siga siendo valida", async () => {
    const { sesion, firma } = await obtenerCookiesDeSesion();
    const ahora = Date.now();
    const reloj = jest.spyOn(Date, "now").mockReturnValue(ahora + 9 * 60 * 60 * 1000);
    try {
      const respuesta = await anonimo.get("/alumnos").set("Cookie", `sesion=${sesion}; sesion.sig=${firma}`);

      expect(respuesta.status).toEqual(302);
      expect(respuesta.headers.location).toEqual("/login");
    } finally {
      reloj.mockRestore();
    }
  });

  test("no deberia enviar una cookie de sesion a los usuarios anonimos", async () => {
    const respuesta = await anonimo.get("/");

    expect(respuesta.headers["set-cookie"]).toBeUndefined();
  });
});
