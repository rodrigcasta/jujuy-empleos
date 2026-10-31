CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(40) NOT NULL,
    apellido VARCHAR(40) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    hash_contrasena VARCHAR(100) NOT NULL
);
