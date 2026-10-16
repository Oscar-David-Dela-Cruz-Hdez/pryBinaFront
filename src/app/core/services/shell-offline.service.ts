import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject } from 'rxjs';

interface ShellManifest {
  index: string;
  hashTable: Record<string, string>;
  assetGroups: { name: string; installMode: string; urls: string[] }[];
}

async function sha1(body: ArrayBuffer): Promise<string> {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-1', body)))
    .map(byte => byte.toString(16).padStart(2, '0')).join('');
}

/** Solo lectura: nunca modifica las cachés internas de Angular. */
export async function verifyShell(manifest: ShellManifest, hash: string, scope: string): Promise<void> {
  const prefix = `ngsw:${new URL(scope).pathname}:${hash}:assets:`;
  const names = await caches.keys();
  const groups = manifest.assetGroups.filter(group => group.installMode === 'prefetch');
  if (!groups.some(group => group.urls.includes(manifest.index))) throw new Error('La página inicial no está precargada.');
  for (const group of groups) {
    const name = `${prefix}${group.name}:cache`;
    if (!names.includes(name)) throw new Error(`La descarga de ${group.name} todavía está incompleta.`);
    const cache = await caches.open(name);
    for (const path of group.urls) {
      const expected = manifest.hashTable[path];
      if (!expected) throw new Error(`No se puede verificar ${path}.`);
      const response = await cache.match(new URL(path, scope).href);
      if (!response?.ok) throw new Error(`Falta descargar ${path}.`);
      if (await sha1(await response.arrayBuffer()) !== expected) throw new Error(`La copia de ${path} está dañada.`);
    }
  }
}

@Injectable({ providedIn: 'root' })
export class ShellOfflineService {
  readonly status = new BehaviorSubject('La aplicación aún no ha sido verificada para abrir sin conexión.');
  readonly ready = new BehaviorSubject(false);
  constructor(private updates: SwUpdate) {}

  async ensureReady(): Promise<boolean> {
    this.ready.next(false);
    this.status.next('Verificando la descarga completa de la aplicación. Mantén internet activo…');
    try {
      if (!this.updates.isEnabled || !navigator.serviceWorker.controller || !('caches' in window)) {
        throw new Error('Espera a que termine la instalación de la versión de producción y vuelve a intentar.');
      }
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) throw new Error('No se encontró la instalación de la aplicación.');
      if (navigator.onLine) {
        // Angular instala la versión nueva y puede recuperar un worker degradado.
        let timeout: ReturnType<typeof setTimeout> | undefined;
        try {
          await Promise.race([this.updates.checkForUpdate(), new Promise((_, reject) => {
            timeout = setTimeout(() => reject(new Error('La descarga está tardando. Vuelve a intentar con conexión.')), 30000);
          })]);
        } finally { clearTimeout(timeout); }
      }
      const manifestResponse = await fetch(new URL('ngsw.json', registration.scope), {
        headers: { 'ngsw-bypass': 'true' }, cache: 'no-store', signal: AbortSignal.timeout(15000)
      });
      if (!manifestResponse.ok) throw new Error('No se pudo verificar la versión publicada.');
      const manifest: ShellManifest = await manifestResponse.json();
      const hash = await sha1(new TextEncoder().encode(JSON.stringify(manifest)).buffer);
      const diagnostic = await fetch(new URL('ngsw/state', registration.scope), { signal: AbortSignal.timeout(15000) });
      const text = await diagnostic.text();
      if (!/^Driver state: NORMAL\b/m.test(text)) {
        throw new Error('La instalación está incompleta o dañada. Con internet activo, usa Reparar descarga.');
      }
      if (!text.includes(`Latest manifest hash: ${hash}`)) throw new Error('La versión nueva todavía no está instalada. Vuelve a intentar.');
      await verifyShell(manifest, hash, registration.scope);
      this.ready.next(true);
      this.status.next('Archivos de la aplicación verificados: ya puede abrirse sin conexión.');
      return true;
    } catch (error) {
      this.status.next(error instanceof Error ? error.message : 'No se pudo verificar la descarga.');
      return false;
    }
  }

  async repair(): Promise<void> {
    if (!navigator.onLine) { this.status.next('Necesitas internet para reparar la descarga.'); return; }
    if (!window.confirm('Se volverá a descargar la aplicación y se recargará la página. Guarda tus formularios antes de continuar. El carrito y la información de empresa se conservan.')) return;
    this.ready.next(false);
    this.status.next('Comprobando conexión antes de reparar…');
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) throw new Error('Recarga la página con conexión para instalar la aplicación.');
      const response = await fetch(new URL('index.html', registration.scope), {
        headers: { 'ngsw-bypass': 'true' }, cache: 'no-store', signal: AbortSignal.timeout(15000)
      });
      if (!response.ok || !(await response.text()).includes('<app-root')) throw new Error('El sitio no responde correctamente. No se borró la descarga.');
      await registration.unregister();
      const prefix = `ngsw:${new URL(registration.scope).pathname}:`;
      await Promise.all((await caches.keys()).filter(name => name.startsWith(prefix)).map(name => caches.delete(name)));
      // Navegar omitiendo el worker antiguo que todavía puede controlar esta pestaña.
      const url = new URL(window.location.href);
      url.searchParams.set('ngsw-bypass', 'true');
      window.location.replace(url.href);
    } catch (error) { this.status.next(error instanceof Error ? error.message : 'No se pudo reparar.'); }
  }
}
