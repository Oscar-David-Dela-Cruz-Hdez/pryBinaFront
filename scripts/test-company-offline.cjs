// Servicio real con red y almacenamiento simulados; no contacta la API.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const rxjs = require('rxjs');
const output = ts.transpileModule(fs.readFileSync('src/app/core/services/company-offline.service.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true }
}).outputText;
const stores = new Map();
let rejectStorage = false, networkFails = false, online = true;
const caches = {
  keys: async () => [...stores.keys()],
  open: async name => {
    if (!stores.has(name)) stores.set(name, new Map());
    const store = stores.get(name);
    return { match: async key => store.get(key)?.clone(), put: async (key, response) => {
      if (rejectStorage) throw new Error('QuotaExceeded');
      store.set(key, response.clone());
    } };
  }
};
const context = {
  exports: {}, Response, AbortSignal, caches, window: { caches },
  navigator: { serviceWorker: { controller: {} } },
  fetch: async (url, options) => {
    assert.equal(options.credentials, 'omit');
    assert.equal(options.headers['ngsw-bypass'], 'true');
    if (networkFails) throw new Error('Network error');
    return new Response(JSON.stringify({ texto: 'Información pública' }));
  },
  require: name => name === '@angular/core' ? { Injectable: () => value => value }
    : name === 'rxjs' ? rxjs : {}
};
vm.runInNewContext(output, context);
(async () => {
  let shellReady = true;
  const service = new context.exports.CompanyOfflineService({ isOnline: () => online, checkServer: async () => {} }, {
    ensureReady: async () => shellReady
  });
  await service.inspect();
  await service.load('historia');
  const savedAt = service.state.value.historia.date;
  assert.ok(savedAt);
  online = false;
  assert.equal((await service.load('historia')).texto, 'Información pública');
  assert.equal(service.state.value.historia.date, savedAt);
  await assert.rejects(service.load('vision'), /no está disponible/);
  assert.equal(service.state.value.vision.missing, true);
  await assert.rejects(service.load('usuarios/perfil'), /no permitida/);
  online = true; networkFails = true;
  assert.equal((await service.load('historia')).texto, 'Información pública');
  assert.equal(service.state.value.historia.date, savedAt, 'Fallo de red no renueva la fecha');
  await service.prepare();
  assert.ok(service.result.value.includes('0 de 8'), 'No confirma descargas fallidas');
  networkFails = false; rejectStorage = true;
  await service.prepare();
  assert.ok(service.result.value.includes('0 de 8'), 'No confirma almacenamiento fallido');
  rejectStorage = false;
  await service.prepare();
  assert.ok(service.result.value.includes('Información lista'));
  shellReady = false;
  await service.prepare();
  assert.ok(service.result.value.includes('aún no está verificada'), 'Nunca confirma si el shell está incompleto');
  stores.clear();
  service.state.next({});
  await service.prepare(false);
  for (const section of service.sections) {
    assert.ok(service.state.value[section.path]?.date, 'Descarga datos aunque el shell no esté listo');
  }
  online = false;
  for (const section of service.sections) await service.load(section.path);
  online = true;
  const healthContext = {
    exports: {}, AbortSignal, navigator: { onLine: true }, window: {},
    fetch: async () => new Response(JSON.stringify({ ok: true, mongo: 'conectado' })),
    require: name => name === '@angular/core' ? { Injectable: () => value => value }
      : name === '@angular/core/rxjs-interop' ? { takeUntilDestroyed: () => value => value }
      : name === 'rxjs' ? { ...rxjs, timer: () => rxjs.EMPTY, fromEvent: () => rxjs.EMPTY }
      : require(name)
  };
  const healthCode = ts.transpileModule(fs.readFileSync('src/app/core/services/connection.service.ts', 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true }
  }).outputText;
  vm.runInNewContext(healthCode, healthContext);
  const connection = new healthContext.exports.ConnectionService({});
  await connection.checkServer();
  assert.equal(connection.serverStatus.value, 'available');
  healthContext.fetch = async () => { throw new Error('No responde'); };
  await connection.checkServer();
  assert.equal(connection.serverStatus.value, 'unavailable');
  healthContext.navigator.onLine = false;
  await connection.checkServer();
  assert.equal(connection.serverStatus.value, 'offline');
  console.log('OK: fechas, lectura offline, servidor fallido, contenido ausente, privacidad y descargas parciales.');
})().catch(error => { console.error(error); process.exitCode = 1; });
