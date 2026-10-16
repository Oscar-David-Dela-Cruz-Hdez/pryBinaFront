import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dirname, '../dist/prynuevo/browser');
const config = JSON.parse(readFileSync(resolve(root, 'ngsw.json'), 'utf8'));
const base = 'https://prybinaback.onrender.com';
const cached = path => config.dataGroups.some(group =>
  group.patterns.some(pattern => new RegExp(pattern).test(base + path)));
for (const path of ['/api/productos', '/api/productos?marca=x',
  '/api/productos/507f1f77bcf86cd799439011',
  '/api/productos/507f1f77bcf86cd799439011?x=1',
  '/api/marcas', '/api/familias', '/api/ofertas', '/api/carruseles']) {
  assert.ok(cached(path), `Falta caché pública: ${path}`);
}
for (const path of ['/api/usuarios/perfil', '/api/usuarios/direcciones',
  '/api/usuarios/admin/usuarios', '/api/pedidos', '/api/pagos/paypal/config',
  '/api/respaldos', '/api/monitoreo/resumen', '/api/productos/exportar/excel',
  '/api/productos/exportar/excel?x=1', '/api/productos/importar/excel']) {
  assert.equal(cached(path), false, `Ruta privada en caché: ${path}`);
}
const images = config.dataGroups.find(group => group.name === 'imagenes-productos');
for (const path of ['/api/contactos', '/api/contactos?activo=true', '/api/faqs',
  '/api/faqs?activo=true', '/api/historia', '/api/mision', '/api/vision',
  '/api/politicas', '/api/terminos', '/api/ubicacion', '/api/empresa', '/api/informacion']) {
  assert.ok(cached(path), `Falta información pública offline: ${path}`);
}
for (const path of ['/api/contactos/privado', '/api/faqs/admin', '/api/empresa/admin']) {
  assert.equal(cached(path), false, `Ruta adicional no permitida: ${path}`);
}
assert.ok(images?.patterns.some(pattern => new RegExp(pattern)
  .test('https://res.cloudinary.com/da8xounzu/image/upload/v1/producto.jpg')));
assert.equal(config.dataGroups.some(group => group.name === 'api-backend'), false);
for (const file of Object.keys(config.hashTable)) {
  assert.ok(existsSync(resolve(root, file.slice(1))), `Falta recurso: ${file}`);
  assert.equal(createHash('sha1').update(readFileSync(resolve(root, file.slice(1)))).digest('hex'),
    config.hashTable[file], `La huella no coincide: ${file}`);
}
const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.webmanifest'), 'utf8'));
for (const icon of manifest.icons) {
  const png = readFileSync(resolve(root, icon.src));
  assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, icon.sizes);
}
assert.ok(existsSync(resolve(root, 'ngsw-worker.js')));
console.log('PWA: privacidad de caché, imágenes, recursos, worker e iconos verificados.');
