import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/**
 * Detecta el estado de conexión a internet en tiempo real
 * usando navigator.onLine y los eventos nativos online/offline.
 */
@Injectable({ providedIn: 'root' })
export class ConnectionService {
  private onlineStatus = new BehaviorSubject<boolean>(navigator.onLine);

  /** Emite `true` cuando hay conexión y `false` cuando no (solo cambios). */
  public online$ = this.onlineStatus.asObservable().pipe(distinctUntilChanged());

  constructor() {
    window.addEventListener('online', () => this.onlineStatus.next(true));
    window.addEventListener('offline', () => this.onlineStatus.next(false));
  }

  isOnline(): boolean {
    return this.onlineStatus.value;
  }
}
