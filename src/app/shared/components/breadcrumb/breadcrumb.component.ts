import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    // Escuchar cambios de navegación
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.buildBreadcrumb(this.activatedRoute.root);
      });
      
    // Inicializar al cargar
    this.breadcrumbs = this.buildBreadcrumb(this.activatedRoute.root);
  }

  private buildBreadcrumb(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    // Si no hay configuración de ruta, detener (excepto root)
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data['breadcrumb'];
      
      // Lógica para evitar duplicados y "Inicio" redundante
      if (label) {
        // Si es "Inicio" y ya estamos en la raíz o ya existe, no lo agregamos de nuevo si ya está explícito
        // En este caso, como "Inicio" es el primer hardcoded en HTML, podemos decidir no agregarlo al array dinámico
        // O si preferimos manejarlo todo dinámico, quitamos el hardcoded del HTML.
        // Vamos a mantener el hardcoded del HTML como "base" y aquí solo agregamos hijos.
        
        if (label !== 'Inicio' && !breadcrumbs.some(b => b.label === label)) {
           breadcrumbs.push({ label, url });
        }
      }

      return this.buildBreadcrumb(child, url, breadcrumbs);
    }
    
    return breadcrumbs;
  }
}
