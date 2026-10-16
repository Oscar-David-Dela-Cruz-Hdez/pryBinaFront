const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { webcrypto, createHash } = require('node:crypto');
const { BehaviorSubject } = require('rxjs');
const origin = 'https://example.test/';
const body = '<app-root></app-root>';
const digest = value => createHash('sha1').update(value).digest('hex');
const manifest = { index: '/index.html', hashTable: {
  '/index.html': digest(body), '/chunk-test.js': digest('code')
}, assetGroups: [{ name: 'app', installMode: 'prefetch', urls: ['/index.html', '/chunk-test.js'] }] };
const hash = digest(JSON.stringify(manifest));
const name = `ngsw:/:${hash}:assets:app:cache`;
const store = new Map([[origin + 'index.html', body], [origin + 'chunk-test.js', 'code']]);
let diagnostic = `Driver state: NORMAL ((nominal))\nLatest manifest hash: ${hash}`;
const context = {
  exports: {}, crypto: webcrypto, TextEncoder, URL, Response, AbortSignal, setTimeout, clearTimeout,
  navigator: { onLine: true, serviceWorker: { controller: {}, getRegistration: async () => ({ scope: origin }) } },
  window: { caches: {} },
  caches: { keys: async () => [name], open: async () => ({ match: async url =>
    store.has(url) ? new Response(store.get(url)) : undefined }) },
  fetch: async url => new Response(String(url).endsWith('ngsw/state') ? diagnostic : JSON.stringify(manifest)),
  require: name => name === '@angular/core' ? { Injectable: () => value => value }
    : name === 'rxjs' ? { BehaviorSubject } : {}
};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/app/core/services/shell-offline.service.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true }
}).outputText, context);
(async () => {
  await context.exports.verifyShell(manifest, hash, origin);
  store.delete(origin + 'chunk-test.js');
  await assert.rejects(context.exports.verifyShell(manifest, hash, origin), /chunk-test/);
  store.set(origin + 'chunk-test.js', 'corrupted');
  await assert.rejects(context.exports.verifyShell(manifest, hash, origin), /dañada/);
  store.set(origin + 'chunk-test.js', 'code');
  const shell = new context.exports.ShellOfflineService({ isEnabled: true, checkForUpdate: async () => false });
  diagnostic = `Driver state: EXISTING_CLIENTS_ONLY\nLatest manifest hash: ${hash}`;
  assert.equal(await shell.ensureReady(), false, 'Worker degradado no está listo aunque haya caché');
  diagnostic = `Driver state: NORMAL ((nominal))\nLatest manifest hash: wrong`;
  assert.equal(await shell.ensureReady(), false, 'No mezclar versiones');
  diagnostic = `Driver state: NORMAL ((nominal))\nLatest manifest hash: ${hash}`;
  assert.equal(await shell.ensureReady(), true);
  console.log('OK: shell completo, archivo ausente/dañado, worker degradado y mezcla de versiones.');
})().catch(error => { console.error(error); process.exitCode = 1; });
