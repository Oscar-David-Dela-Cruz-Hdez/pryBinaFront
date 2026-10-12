import { Injectable } from '@angular/core';
import { BehaviorSubject, defer, Observable } from 'rxjs';
import { ConnectionService } from './connection.service';

const BASE = 'https://prybinaback.onrender.com/api/';
const CACHE = 'panamericana-empresa-fechada-v1';
export const COMPANY_SECTIONS = [
  { path: 'contactos?activo=true', label: 'Contacto' },
  { path: 'faqs?activo=true', label: 'Preguntas frecuentes' },
  { path: 'historia', label: 'Historia' }, { path: 'mision', label: 'Misión' },
  { path: 'vision', label: 'Visión' }, { path: 'politicas', label: 'Políticas' },
  { path: 'terminos', label: 'Términos' }, { path: 'ubicacion', label: 'Ubicación' }
];
export interface SavedSection { date?: number; missing?: boolean; storageError?: boolean; }

@Injectable({ providedIn: 'root' })
export class CompanyOfflineService {
  readonly sections = COMPANY_SECTIONS;
  readonly state = new BehaviorSubject<Partial<Record<string, SavedSection>>>({});
  readonly busy = new BehaviorSubject(false);
  readonly result = new BehaviorSubject('');
  private pending = new Map<string, Promise<any>>();

  constructor(private connection: ConnectionService) { void this.inspect(); }

  private allowed(path: string): boolean {
    return COMPANY_SECTIONS.some(section => section.path === path) || path === 'contactos' || path === 'faqs';
  }
  private update(path: string, value: SavedSection): void {
    this.state.next({ ...this.state.value, [path]: value });
  }
  private async saved(path: string): Promise<Response | undefined> {
    if (!('caches' in window)) return undefined;
    const current = await (await caches.open(CACHE)).match(BASE + path);
    if (current) return current;
    // Las copias de versiones anteriores no tienen fecha: no inventarla.
    for (const name of await caches.keys()) {
      if (!name.startsWith('ngsw:') || !name.includes(':empresa-publica:cache')) continue;
      const legacy = await (await caches.open(name)).match(BASE + path);
      if (legacy) return legacy;
    }
    return undefined;
  }
  async inspect(): Promise<void> {
    for (const section of COMPANY_SECTIONS) {
      try {
        const response = await this.saved(section.path);
        // No sobrescribir un estado recién descargado mientras se inspeccionaba.
        if (!this.state.value[section.path]) this.update(section.path, response
          ? { date: Number(response.headers.get('x-saved-at')) || undefined } : { missing: true });
      } catch { this.update(section.path, { storageError: true }); }
    }
  }
  get(path: string): Observable<any> { return defer(() => this.load(path)); }
  async load(path: string, force = false): Promise<any> {
    if (!this.allowed(path)) throw new Error('Ruta no permitida para almacenamiento offline');
    if (this.pending.has(path)) {
      if (!force) return this.pending.get(path)!;
      await this.pending.get(path)!.catch(() => {});
    }
    const request = this.fetchAndSave(path, force).finally(() => this.pending.delete(path));
    this.pending.set(path, request);
    return request;
  }
  private async fetchAndSave(path: string, force: boolean): Promise<any> {
    if (this.connection.isOnline()) {
      try {
        const response = await fetch(BASE + path, {
          headers: { 'ngsw-bypass': 'true' }, credentials: 'omit', cache: 'no-store',
          signal: AbortSignal.timeout(10000)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const date = Date.now();
        try {
          if (!('caches' in window)) throw new Error('Almacenamiento no disponible');
          await (await caches.open(CACHE)).put(BASE + path, new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json', 'x-saved-at': String(date) }
          }));
          this.update(path, { date });
        } catch {
          this.update(path, { storageError: true });
          if (force) throw new Error('No se pudo guardar en el dispositivo');
        }
        return data;
      } catch (error) {
        void this.connection.checkServer();
        if (force) throw error;
      }
    } else if (force) { throw new Error('Sin conexión'); }
    try {
      const response = await this.saved(path);
      if (response) {
        this.update(path, { date: Number(response.headers.get('x-saved-at')) || undefined });
        return await response.json();
      }
    } catch { /* El panel informa si no hay copia utilizable. */ }
    this.update(path, { missing: true });
    throw new Error('Este contenido aún no está disponible sin conexión');
  }
  async prepare(): Promise<void> {
    if (this.busy.value) return;
    if (!this.connection.isOnline()) {
      this.result.next('Necesitas internet para descargar o actualizar la información.'); return;
    }
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      this.result.next('Espera a que la aplicación esté lista y vuelve a intentarlo. Esta función requiere la versión de producción.'); return;
    }
    this.busy.next(true);
    this.result.next('Descargando información de la empresa…');
    try {
      const results = await Promise.allSettled(COMPANY_SECTIONS.map(section => this.load(section.path, true)));
      const count = results.filter(result => result.status === 'fulfilled').length;
      this.result.next(count === COMPANY_SECTIONS.length
        ? 'Información lista para consultar sin conexión en este dispositivo.'
        : `Se actualizaron ${count} de ${COMPANY_SECTIONS.length} apartados. Revisa los pendientes y vuelve a intentar.`);
    } finally { this.busy.next(false); }
  }
}
