// Se ejecuta en el postinstall: descarga el Chromium que usan las pruebas de aceptación, salvo que ya esté instalado
// (por ejemplo, en la imagen de Docker de Playwright que usa el CI, o porque ya se descargó en una instalación anterior)
const { execFileSync } = require("node:child_process");
const { existsSync } = require("node:fs");
const { chromium } = require("@playwright/test");

const ejecutable = chromium.executablePath();

if (existsSync(ejecutable)) {
  console.log(`Chromium ya está instalado: ${ejecutable}`);
} else {
  execFileSync(process.execPath, [require.resolve("@playwright/test/cli"), "install", "chromium"], {
    stdio: "inherit",
  });
}
