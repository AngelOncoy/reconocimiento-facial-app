// generarImageMap.js

const fs = require('fs');
const path = require('path');

// Ruta a tu carpeta ISIA → AJUSTA ESTA LÍNEA 👇
const ISIA_PATH = path.join(__dirname, 'app', '(tabs)', 'ISIA');

// Tipos de archivos que queremos incluir
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Archivos basura que queremos ignorar
const IGNORED_FILES = ['.DS_Store', 'Thumbs.db'];

// Archivo que vamos a generar
const OUTPUT_FILE = path.join(__dirname, 'app', '(tabs)', 'imageMap.ts');

// Recorrer la carpeta recursivamente
function recorrerCarpeta(dir, callback) {
    fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);
        const relativePath = path.relative(path.join(__dirname, 'app', '(tabs)'), fullPath);
        const stat = fs.statSync(fullPath);

        if (stat && stat.isDirectory()) {
            recorrerCarpeta(fullPath, callback);
        } else if (IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase()) &&
            !IGNORED_FILES.includes(file)) {
            callback(relativePath.replace(/\\/g, '/')); // Normalizamos a UNIX path
        }
    });
}

// Construir imageMap
const imageEntries = [];

recorrerCarpeta(ISIA_PATH, (relativeImagePath) => {
    const dbKey = `ISIA/${relativeImagePath.split('/').slice(1).join('/')}`; // Como en DB
    const requirePath = `./${relativeImagePath}`;
    imageEntries.push({
        dbKey,
        requirePath
    });
});

// Ordenamos las claves alfabéticamente
imageEntries.sort((a, b) => a.dbKey.localeCompare(b.dbKey));

// Preparamos las líneas del archivo
const lines = [];
lines.push('// Este archivo fue generado automáticamente');
lines.push('// No editar a mano. Ejecuta `node generarImageMap.js` para regenerar.\n');
lines.push('export const imageMap: Record<string, any> = {');

imageEntries.forEach(({ dbKey, requirePath }) => {
    lines.push(`  "${dbKey}": require('${requirePath}'),`);
});

lines.push('};\n');

// Escribimos el archivo
fs.writeFileSync(OUTPUT_FILE, lines.join('\n'), 'utf8');

console.log(`✅ imageMap.ts generado correctamente en: ${OUTPUT_FILE}`);
console.log(`✅ Total imágenes encontradas: ${imageEntries.length}`);
