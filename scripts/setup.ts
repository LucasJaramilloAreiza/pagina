import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const rootEnvPath = join(process.cwd(), '.env');
const webEnvPath = join(process.cwd(), 'apps', 'web', '.env');
const exampleEnvPath = join(process.cwd(), 'apps', 'web', '.env.example');

function logInfo(message: string) {
  console.log(`✅ ${message}`);
}

function logWarn(message: string) {
  console.log(`⚠️ ${message}`);
}

function createEnvFile(targetPath: string, sourcePath: string) {
  if (!existsSync(sourcePath)) {
    logWarn(`No se encontró ${sourcePath}. Asegúrate de que exista el archivo de ejemplo.`);
    return;
  }

  const content = readFileSync(sourcePath, 'utf-8');
  writeFileSync(targetPath, content, { encoding: 'utf-8' });
  logInfo(`Archivo ${targetPath} creado a partir de ${sourcePath}`);
}

function ensureDirExists(filePath: string) {
  const dir = filePath.substring(0, filePath.lastIndexOf('/'));
  if (dir && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    logInfo(`Directorio creado: ${dir}`);
  }
}

function main() {
  logInfo('Iniciando setup de entorno...');

  if (!existsSync(rootEnvPath)) {
    ensureDirExists(rootEnvPath);
    createEnvFile(rootEnvPath, exampleEnvPath);
  } else {
    logInfo('.env ya existe en la raíz');
  }

  if (!existsSync(webEnvPath)) {
    ensureDirExists(webEnvPath);
    createEnvFile(webEnvPath, exampleEnvPath);
  } else {
    logInfo('.env ya existe en apps/web');
  }

  console.log('');
  logInfo('Setup completado.');
  console.log('Por favor levanta la base de datos con: docker compose up -d db');
}

main();
