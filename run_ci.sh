#!/bin/bash

#set -e
set -x

cd /app
# yarn install descarga Chromium (en el postinstall), pero la imagen de Node no trae las bibliotecas del sistema que
# necesita para ejecutarse: se instalan con apt-get
yarn install
yarn playwright install-deps chromium
yarn lint

# Se ejecutan todas las pruebas aunque falle alguna, para que se generen todos los reportes,
# pero el job falla si falló cualquiera de ellas
resultado=0
yarn test || resultado=1
yarn test:aceptacion || resultado=1
exit $resultado
