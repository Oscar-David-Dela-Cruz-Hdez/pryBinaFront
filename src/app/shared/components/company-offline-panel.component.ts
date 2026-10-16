import { Component, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CompanyOfflineService } from '../../core/services/company-offline.service';
import { ConnectionService } from '../../core/services/connection.service';

@Component({
  selector: 'app-company-offline-panel', standalone: true, imports: [CommonModule],
  template: `
    <aside *ngIf="!admin" class="offline-tools" aria-label="Información sin conexión">
      <ng-container *ngIf="offline.state | async as state">
        <p *ngFor="let path of currentPaths" role="status">
          <ng-container *ngIf="state[path]?.date; else missing">
            Información guardada el {{ state[path]?.date | date:'dd/MM/yyyy HH:mm' }}.
            <span *ngIf="!(connection.online$ | async)">Estás consultando una copia guardada.</span>
          </ng-container>
          <ng-template #missing>
            <span *ngIf="state[path] && !state[path]?.missing && !state[path]?.date && !state[path]?.storageError">Copia guardada de una versión anterior; fecha no disponible.</span>
            <span *ngIf="state[path]?.missing && (!(connection.online$ | async) || (connection.server$ | async) === 'unavailable')">Este contenido aún no está disponible sin conexión. Vuelve a intentar cuando el servidor esté disponible.</span>
            <span *ngIf="state[path]?.storageError">No se pudo guardar este apartado en tu dispositivo.</span>
          </ng-template>
        </p>
        <details>
          <summary>Consultar información sin conexión</summary>
          <p role="status" aria-live="polite">{{ offline.shell.status | async }}</p>
          <p>Guarda contacto, preguntas frecuentes, historia, misión, visión, políticas, términos y ubicación.</p>
          <button type="button" (click)="offline.prepare()" [disabled]="(offline.busy | async) || !(connection.online$ | async)">
            {{ (offline.busy | async) ? 'Descargando…' : 'Preparar o actualizar para usar sin conexión' }}
          </button>
          <button type="button" (click)="offline.shell.repair()" [disabled]="(offline.busy | async) || !(connection.online$ | async)">Reparar descarga de la aplicación</button>
          <p role="status" aria-live="polite">{{ offline.result | async }}</p>
          <ul>
            <li *ngFor="let section of offline.sections">
              {{ section.label }}:
              <span *ngIf="state[section.path]?.date; else pending">guardado el {{ state[section.path]?.date | date:'dd/MM/yyyy HH:mm' }}</span>
              <ng-template #pending>{{ state[section.path]?.storageError ? 'no se pudo guardar' : (state[section.path] && !state[section.path]?.missing ? 'guardado; fecha no disponible' : 'pendiente de descargar') }}</ng-template>
            </li>
          </ul>
          <p>Los mapas, enlaces externos y pagos necesitan internet. La copia permanece hasta que la actualices o el navegador elimine el almacenamiento.</p>
        </details>
      </ng-container>
    </aside>`,
  styles: [`.offline-tools{max-width:1100px;margin:12px auto;padding:12px 20px;font-size:13px;line-height:1.6}
    summary{cursor:pointer;text-decoration:underline}button{border:1px solid currentColor;padding:8px 12px;margin:8px 0}
    button:disabled{opacity:.5}ul{padding-left:20px;list-style:disc}`]
})
export class CompanyOfflinePanelComponent {
  currentPaths: string[] = [];
  admin = false;
  constructor(public offline: CompanyOfflineService, public connection: ConnectionService,
    router: Router, destroyRef: DestroyRef) {
    const update = () => {
      const path = router.url.split(/[?#]/)[0];
      this.admin = path.startsWith('/admin');
      const routes: Record<string, string[]> = {
        '/contacto': ['contactos?activo=true', 'ubicacion'], '/ayuda': ['faqs?activo=true'],
        '/historia': ['historia'], '/mision-vision': ['mision', 'vision'],
        '/privacidad': ['politicas'], '/terminos': ['terminos'], '/ubicacion': ['ubicacion']
      };
      this.currentPaths = routes[path] || [];
    };
    update();
    router.events.pipe(takeUntilDestroyed(destroyRef)).subscribe(event => {
      if (event instanceof NavigationEnd) update();
    });
  }
}
