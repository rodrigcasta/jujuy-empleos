CREATE TABLE Usuarios (
    id serial PRIMARY KEY,
    nombre           varchar(40) NOT NULL,
    apellido         varchar(40) NOT NULL,
    email            varchar(254) NOT NULL UNIQUE,
    hash_contrasena  varchar(100) NOT NULL
);
