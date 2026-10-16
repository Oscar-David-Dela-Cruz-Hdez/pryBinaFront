import { DestroyRef, Inject, Injectable, OnDestroy, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';
import { fromEvent, timer } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { CompanyOfflineService } from './company-offline.service';

interface InstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/**
 * Servicio de funcionalidades nativas de la PWA:
 * - Vibración háptica (Vibration API: navigator.vibrate)
 * - Compartido nativo de productos (Web Share API: navigator.share)
 * - Indicador numérico en el ícono (App Badge API: navigator.setAppBadge)
 */
@Injectable({ providedIn: 'root' })
export class PwaService implements OnDestroy {
  private installEvent: InstallPromptEvent | null = null;
  private installTimer?: ReturnType<typeof setTimeout>;
  private installNoticeOpen = false;
  private installed = false;
  private promptedThisVisit = false;
  private readonly remindAfterKey = 'pwa-install-remind-after';

  private readonly onInstallAvailable = (event: Event): void => {
    event.preventDefault();
    this.installEvent = event as InstallPromptEvent;
    this.scheduleInstallNotice();
  };

  private readonly onInstalled = (): void => {
    this.installed = true;
    this.installEvent = null;
    clearTimeout(this.installTimer);
    if (this.installNoticeOpen) Swal.close();
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private snackBar: MatSnackBar,
    private updates: SwUpdate,
    private destroyRef: DestroyRef,
    private companyOffline: CompanyOfflineService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      // El bypass se usa solo para recuperar la primera carga tras reparar.
      const url = new URL(window.location.href);
      if (url.searchParams.has('ngsw-bypass')) {
        url.searchParams.delete('ngsw-bypass');
        window.history.replaceState(window.history.state, '', url.href);
      }
      window.addEventListener('beforeinstallprompt', this.onInstallAvailable);
      window.addEventListener('appinstalled', this.onInstalled);
      this.configureUpdates();
      this.configureCompanyOffline();
    }
  }

  private configureCompanyOffline(): void {
    // La copia fechada utiliza su propia caché: no necesita esperar al worker.
    fromEvent(window, 'online').pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => void this.prefetchCompany());
    timer(0, 60000).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => void this.prefetchCompany());
  }

  private async prefetchCompany(): Promise<void> {
    if (navigator.onLine) await this.companyOffline.prepare(false);
  }

  private configureUpdates(): void {
    if (!this.updates.isEnabled) return;
    this.updates.versionUpdates.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
      if (event.type === 'VERSION_READY') {
        this.snackBar.open('Hay una nueva versión. Guarda tus cambios antes de actualizar.', 'Actualizar', { duration: 0 })
          .onAction().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => window.location.reload());
      } else if (event.type === 'VERSION_INSTALLATION_FAILED') {
        console.warn('No se pudo descargar la actualización PWA', event.error);
      }
    });
    this.updates.unrecoverable.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.snackBar.open('Conéctate a internet y recarga para recuperar la aplicación.', 'Recargar', { duration: 0 })
        .onAction().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => window.location.reload());
    });
    timer(60000, 6 * 60 * 60 * 1000).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => void this.checkForUpdate());
    fromEvent(window, 'online').pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => void this.checkForUpdate());
  }

  private async checkForUpdate(): Promise<void> {
    if (!navigator.onLine) return;
    try { await this.updates.checkForUpdate(); }
    catch (error) { console.warn('No se pudo comprobar la actualización PWA', error); }
  }

  ngOnDestroy(): void {
    clearTimeout(this.installTimer);
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('beforeinstallprompt', this.onInstallAvailable);
      window.removeEventListener('appinstalled', this.onInstalled);
    }
  }

  private runningInstalled(): boolean {
    return this.installed || window.matchMedia('(display-mode: standalone)').matches
      || window.matchMedia('(display-mode: window-controls-overlay)').matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  }

  private postponeInstallNotice(): void {
    try {
      localStorage.setItem(this.remindAfterKey, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    } catch { /* El aviso sigue limitado a una vez por visita sin almacenamiento. */ }
  }

  private scheduleInstallNotice(): void {
    clearTimeout(this.installTimer);
    if (this.runningInstalled() || this.promptedThisVisit) return;
    try {
      if (Number(localStorage.getItem(this.remindAfterKey)) > Date.now()) return;
    } catch { /* El almacenamiento puede estar deshabilitado. */ }
    this.installTimer = setTimeout(() => { void this.showInstallNotice(); }, 8000);
  }

  private async showInstallNotice(): Promise<void> {
    if (!this.installEvent || this.runningInstalled() || this.promptedThisVisit) return;
    // No interrumpir otros avisos ni mostrar el diálogo en una pestaña oculta.
    if (Swal.isVisible() || document.visibilityState !== 'visible') {
      this.scheduleInstallNotice();
      return;
    }
    this.promptedThisVisit = true;
    this.installNoticeOpen = true;
    try {
      const result = await Swal.fire({
        title: '¿Instalar Panamericana?',
        text: 'Agrega Panamericana a tu dispositivo para abrirla directamente desde su ícono y consultar contenido guardado sin conexión.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Instalar',
        cancelButtonText: 'Ahora no',
        confirmButtonColor: '#111111',
        focusCancel: true,
        preConfirm: () => {
          const event = this.installEvent;
          if (!event || this.runningInstalled()) return false;
          this.installEvent = null;
          // Se llama dentro del clic para conservar la activación del usuario.
          return event.prompt().catch(() => {
            Swal.showValidationMessage('No se pudo abrir la instalación. Puedes intentarlo desde el menú del navegador.');
            return false;
          });
        }
      });
      if (!this.installed && (!result.isConfirmed || result.value?.outcome !== 'accepted')) {
        this.postponeInstallNotice();
      }
    } finally {
      this.installNoticeOpen = false;
    }
  }

  /** Vibración táctil (50 ms por defecto) al agregar al carrito o confirmar pedido. */
  vibrate(pattern: number | number[] = 50): void {
    if (isPlatformBrowser(this.platformId) && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  /** Comparte el producto con la hoja nativa del SO; fallback: copiar enlace al portapapeles. */
  async shareProduct(product: any): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) return false;

    // Alias `any` para evitar el narrowing de TS (Navigator no declara `share`).
    const nav: any = navigator;
    const url = `${window.location.origin}/productos/${product._id}`;
    const price = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
      .format(product.precioNormalFinal ?? product.precioNormal ?? product.precio ?? 0);
    const text = `${product.nombre} — ${price} MXN en Distribuidora Panamericana`;

    if (nav.share) {
      try {
        await nav.share({ title: 'Distribuidora Panamericana', text, url });
        return true; // Compartido completado
      } catch {
        return false; // El usuario canceló la hoja de compartido
      }
    }

    // Fallback en escritorio: copiar el enlace al portapapeles
    try {
      await nav.clipboard.writeText(`${text} ${url}`);
      this.snackBar.open('Enlace copiado al portapapeles', 'Ok', { duration: 2500 });
      return true;
    } catch {
      return false;
    }
  }

  /** Contador dinámico en el ícono de la PWA instalada (App Badge API). */
  setBadge(count: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const nav: any = navigator;
      if (count > 0 && 'setAppBadge' in nav) {
        void Promise.resolve(nav.setAppBadge(count)).catch(() => {});
      } else if ('clearAppBadge' in nav) {
        void Promise.resolve(nav.clearAppBadge()).catch(() => {});
      }
    } catch {
      /* PWA no instalada o API no soportada: se ignora silenciosamente */
    }
  }
}
