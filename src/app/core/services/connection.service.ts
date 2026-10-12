import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, fromEvent, timer } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/**
 * Detecta el estado de conexión a internet en tiempo real
 * usando navigator.onLine y los eventos nativos online/offline.
 */
@Injectable({ providedIn: 'root' })
export class ConnectionService {
  private onlineStatus = new BehaviorSubject<boolean>(navigator.onLine);
  private serverStatus = new BehaviorSubject<string>('checking');
  private checking = false;
  public server$ = this.serverStatus.asObservable().pipe(distinctUntilChanged());

  /** Emite `true` cuando hay conexión y `false` cuando no (solo cambios). */
  public online$ = this.onlineStatus.asObservable().pipe(distinctUntilChanged());

  constructor(destroyRef: DestroyRef) {
    fromEvent(window, 'online').pipe(takeUntilDestroyed(destroyRef)).subscribe(() => {
      this.onlineStatus.next(true); void this.checkServer();
    });
    fromEvent(window, 'offline').pipe(takeUntilDestroyed(destroyRef)).subscribe(() => {
      this.onlineStatus.next(false); this.serverStatus.next('offline');
    });
    timer(0, 60000).pipe(takeUntilDestroyed(destroyRef)).subscribe(() => void this.checkServer());
  }

  async checkServer(): Promise<void> {
    if (!navigator.onLine) { this.serverStatus.next('offline'); return; }
    if (this.checking) return;
    this.checking = true;
    try {
      const response = await fetch('https://prybinaback.onrender.com/api/health', {
        headers: { 'ngsw-bypass': 'true' }, cache: 'no-store', credentials: 'omit',
        signal: AbortSignal.timeout(10000)
      });
      const health = response.ok ? await response.json() : null;
      this.serverStatus.next(!navigator.onLine ? 'offline' :
        health?.ok && health?.mongo === 'conectado' ? 'available' : 'unavailable');
    } catch { this.serverStatus.next(navigator.onLine ? 'unavailable' : 'offline'); }
    finally { this.checking = false; }
  }

  isOnline(): boolean {
    return this.onlineStatus.value;
  }
}
