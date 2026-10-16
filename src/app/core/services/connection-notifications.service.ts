import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, debounceTime, pairwise } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConnectionService } from './connection.service';

@Injectable({ providedIn: 'root' })
export class ConnectionNotificationsService {
  private readonly key = 'panamericana-connection-alerts';
  readonly supported = typeof Notification !== 'undefined' && window.isSecureContext;
  readonly enabled = new BehaviorSubject(false);
  readonly message = new BehaviorSubject('');

  constructor(connection: ConnectionService, destroyRef: DestroyRef, private snackBar: MatSnackBar) {
    try { this.enabled.next(this.supported && Notification.permission === 'granted' && localStorage.getItem(this.key) === 'true'); }
    catch { /* El almacenamiento puede estar deshabilitado. */ }
    // No notificar al abrir; solo cuando cambia la conexión durante la sesión.
    connection.online$.pipe(pairwise(), debounceTime(600), takeUntilDestroyed(destroyRef))
      .subscribe(([, online]) => {
        if (online) this.snackBar.open('Conexión recuperada. Puedes continuar navegando.', 'Cerrar', { duration: 5000 });
        void this.notify(online);
      });
  }

  async toggle(): Promise<void> {
    if (this.enabled.value) {
      this.enabled.next(false);
      this.save(false);
      this.message.next('Avisos de conexión desactivados.');
      return;
    }
    if (!this.supported) { this.message.next('Este navegador no admite notificaciones del sistema. Los avisos de la página siguen disponibles.'); return; }
    if (Notification.permission === 'denied') {
      this.message.next('Las notificaciones están bloqueadas. Puedes permitirlas en la configuración del sitio en tu navegador.'); return;
    }
    try {
      // Se solicita únicamente desde el botón pulsado por el usuario.
      const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
      this.enabled.next(permission === 'granted');
      this.save(this.enabled.value);
      this.message.next(this.enabled.value
        ? 'Avisos activados mientras Panamericana esté abierta. El teléfono puede pausar la aplicación en segundo plano.'
        : 'No se activaron las notificaciones. Los avisos de la página siguen disponibles.');
    } catch { this.message.next('No se pudieron activar las notificaciones en este navegador.'); }
  }

  private save(enabled: boolean): void {
    try { localStorage.setItem(this.key, String(enabled)); } catch { /* Preferencia solo para esta sesión. */ }
  }

  private async notify(online: boolean): Promise<void> {
    if (!this.enabled.value || !this.supported || Notification.permission !== 'granted') return;
    const title = online ? 'Conexión recuperada' : 'Sin conexión a internet';
    const options: NotificationOptions = {
      body: online ? 'La red volvió a estar disponible. Panamericana actualizará el contenido guardado.'
        : 'Tu carrito está guardado. Puedes consultar la información descargada previamente.',
      icon: '/assets/icons/icon-192x192.png', tag: 'panamericana-connectivity'
    };
    try {
      const registration = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
      // Evitar un aviso obsoleto si la red cambió durante la búsqueda del registro.
      if (navigator.onLine !== online || !this.enabled.value) return;
      if (registration?.active) await registration.showNotification(title, options);
      else new Notification(title, options);
    } catch { /* El banner y aviso de reconexión siguen funcionando sin soporte nativo. */ }
  }
}
