const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const rx = require('rxjs');
let permissionRequests = 0;
const notifications = [], messages = [];
class NotificationMock {
  static permission = 'default';
  static async requestPermission() { permissionRequests++; return this.permission = 'granted'; }
}
const state = new rx.BehaviorSubject(true);
const context = {
  exports: {}, Notification: NotificationMock, window: { isSecureContext: true },
  localStorage: { getItem: () => null, setItem: () => {} },
  navigator: { onLine: true, serviceWorker: { getRegistration: async () => ({
    active: {}, showNotification: async (title, options) => notifications.push({ title, options })
  }) } },
  require: name => name === '@angular/core' ? { Injectable: () => value => value }
    : name === '@angular/core/rxjs-interop' ? { takeUntilDestroyed: () => value => value }
    : name === 'rxjs' ? { ...rx, debounceTime: () => value => value } : {}
};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/app/core/services/connection-notifications.service.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true }
}).outputText, context);
(async () => {
  const service = new context.exports.ConnectionNotificationsService({ online$: state.asObservable() }, {}, {
    open: message => messages.push(message)
  });
  assert.equal(permissionRequests, 0, 'No solicitar permiso al cargar');
  assert.equal(notifications.length, 0, 'No notificar el estado inicial');
  await service.toggle();
  assert.equal(permissionRequests, 1);
  context.navigator.onLine = false; state.next(false);
  await new Promise(setImmediate);
  assert.equal(notifications.at(-1).title, 'Sin conexión a internet');
  context.navigator.onLine = true; state.next(true);
  await new Promise(setImmediate);
  assert.equal(notifications.at(-1).title, 'Conexión recuperada');
  assert.ok(messages.at(-1).includes('Conexión recuperada'));
  await service.toggle();
  context.navigator.onLine = false; state.next(false);
  await new Promise(setImmediate);
  assert.equal(notifications.length, 2, 'Respetar desactivación');
  NotificationMock.permission = 'denied';
  await service.toggle();
  assert.equal(permissionRequests, 1, 'No insistir si el permiso está bloqueado');
  console.log('OK: permiso por acción, ausencia de aviso inicial, pérdida/reconexión y desactivación.');
})().catch(error => { console.error(error); process.exitCode = 1; });
