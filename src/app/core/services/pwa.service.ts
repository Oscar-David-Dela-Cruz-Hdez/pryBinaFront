import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Servicio de funcionalidades nativas de la PWA:
 * - Vibración háptica (Vibration API: navigator.vibrate)
 * - Compartido nativo de productos (Web Share API: navigator.share)
 * - Indicador numérico en el ícono (App Badge API: navigator.setAppBadge)
 */
@Injectable({ providedIn: 'root' })
export class PwaService {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private snackBar: MatSnackBar
  ) {}

  /** Vibración táctil (50 ms por defecto) al agregar al carrito o confirmar pedido. */
  vibrate(pattern: number | number[] = 50): void {
    if (isPlatformBrowser(this.platformId) && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  /** Comparte el producto con la hoja nativa del SO; fallback: copiar enlace al portapapeles. */
  async shareProduct(product: any): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) return false;

    const url = `${window.location.origin}/productos/${product._id}`;
    const text = `${product.nombre} — ${product.precioNormalFinal || product.precioNormal || product.precio || 0} Bs. en Distribuidora Panamericana`;

    if ('share' in navigator) {
      try {
        await (navigator as any).share({ title: 'Distribuidora Panamericana', text, url });
        return true; // Compartido completado
      } catch {
        return false; // El usuario canceló la hoja de compartido
      }
    }

    // Fallback en escritorio: copiar el enlace al portapapeles
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
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
        nav.setAppBadge(count);
      } else if ('clearAppBadge' in nav) {
        nav.clearAppBadge();
      }
    } catch {
      /* PWA no instalada o API no soportada: se ignora silenciosamente */
    }
  }
}
