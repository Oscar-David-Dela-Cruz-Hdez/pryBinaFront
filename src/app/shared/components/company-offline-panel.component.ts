import { Component, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CompanyOfflineService } from '../../core/services/company-offline.service';
import { ConnectionService } from '../../core/services/connection.service';

@Component({
  selector: 'app-company-offline-panel', standalone: true, imports: [CommonModule],
  template: `
    <aside *ngIf="!admin && currentPaths.length" class="offline-tools" aria-label="Estado de la información guardada">
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
      </ng-container>
    </aside>`,
  styles: [`.offline-tools{max-width:1100px;margin:12px auto;padding:12px 20px;font-size:13px;line-height:1.6}`]
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
