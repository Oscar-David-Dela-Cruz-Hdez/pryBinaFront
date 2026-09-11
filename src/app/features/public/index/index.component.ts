import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ProductsService } from '../../../core/services/admin/products.service';
import { SalesService } from '../../../core/services/admin/sales.service';
import { FamiliasService } from '../../../core/services/admin/familias.service';
import { LogisticsService } from '../../../core/services/admin/logistics.service';
import { SiteInfoService } from '../../../core/services/admin/site-info.service';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [RouterModule, MatIconModule, CommonModule],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
})

export class IndexComponent implements OnInit, OnDestroy {
  productosDestacados: any[] = [
    { _id: '1', nombre: 'Shampoo Profesional', marca: 'Panamericana', precioNormal: 180, imagenUrl: 'assets/images/Panamericana.png' },
    { _id: '2', nombre: 'Tratamiento Capilar', marca: 'Panamericana', precioNormal: 250, imagenUrl: 'assets/images/Panamericana.png' },
    { _id: '3', nombre: 'Crema de Peinar', marca: 'Panamericana', precioNormal: 140, imagenUrl: 'assets/images/Panamericana.png' },
    { _id: '4', nombre: 'Aceite Reparador', marca: 'Panamericana', precioNormal: 210, imagenUrl: 'assets/images/Panamericana.png' }
  ];
  carruseles: any[] = [];
  familias: any[] = [];
  marcas: any[] = [];
  ofertas: any[] = [];
  metodosEnvio: any[] = [];
  metodosPago: any[] = [];
  contactos: any[] = [];
  currentCarouselIndex = 0;
  carouselInterval: any;
  isLoading = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private productsService: ProductsService,
    private salesService: SalesService,
    private familiasService: FamiliasService,
    private logisticsService: LogisticsService,
    private siteInfoService: SiteInfoService
  ) {
    this.authService.userRole$.subscribe(role => {
      if (role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      }
    });
  }

  ngOnInit() {
    // Restauración inmediata desde caché local para LCP instantáneo (< 0.8s)
    try {
      const cachedProds = localStorage.getItem('cache_destacados');
      if (cachedProds) {
        const parsed = JSON.parse(cachedProds);
        if (parsed.length > 0) this.productosDestacados = parsed;
      }
      
      const cachedCarruseles = localStorage.getItem('cache_carruseles');
      if (cachedCarruseles) {
        const parsed = JSON.parse(cachedCarruseles);
        if (parsed.length > 0) this.carruseles = parsed;
      }
    } catch (e) {}

    this.loadStorefrontContent();
  }

  loadStorefrontContent() {
    // 1. Petición de productos destacados con actualización de caché local
    this.productsService.getProductos().subscribe({
      next: (productos) => {
        let conImagen = productos.filter(p => p.imagenUrl || p.imagenUrlPrincipal);
        let destacados = conImagen.slice(0, 4);
        
        if (destacados.length < 4) {
           const faltantes = 4 - destacados.length;
           const sinImagen = productos.filter(p => !p.imagenUrl && !p.imagenUrlPrincipal);
           destacados = [...destacados, ...sinImagen.slice(0, faltantes)];
        }

        if (destacados.length > 0) {
          this.productosDestacados = destacados;
          try { localStorage.setItem('cache_destacados', JSON.stringify(destacados)); } catch (e) {}
        }
      },
      error: (err) => {
        console.error('Error fetch productos:', err);
      }
    });

    // 2. Petición de carruseles con actualización de caché local
    this.salesService.getCarruseles(true).subscribe(data => {
      if (data && data.length > 0) {
        this.carruseles = data;
        try { localStorage.setItem('cache_carruseles', JSON.stringify(data)); } catch (e) {}
      }
      
      if (this.carruseles.length > 1 && !this.carouselInterval) {
        this.carouselInterval = setInterval(() => {
          this.currentCarouselIndex = (this.currentCarouselIndex + 1) % this.carruseles.length;
        }, 5000);
      }
    });

    // 3. Peticiones secundarias debajo del pliegue diferidas en 3.5s para no competir con el paint inicial
    setTimeout(() => {
      this.familiasService.getFamilias().subscribe(data => {
        this.familias = (data || []).slice(0, 8);
      });

      this.productsService.getMarcas().subscribe(data => {
        this.marcas = (data || []).slice(0, 8);
      });

      this.salesService.getOfertas(true).subscribe(data => {
        this.ofertas = (data || []).slice(0, 3);
      });

      this.salesService.getMetodosPago(true).subscribe(data => {
        this.metodosPago = (data || []).slice(0, 5);
      });

      this.logisticsService.getMetodosEnvio(true).subscribe(data => {
        this.metodosEnvio = (data || []).slice(0, 3);
      });

      this.siteInfoService.getContactos(true).subscribe(data => {
        this.contactos = (data || []).slice(0, 3);
      });
    }, 3500);
  }

  ngOnDestroy() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  hideBrokenHeroImage(event: Event) {
    const image = event.target as HTMLImageElement;
    image.style.display = 'none';
  }

  getPrice(producto: any): number {
    return producto?.precioOferta || producto?.precioNormal || producto?.precioBase || producto?.precio || 0;
  }

  getCover(producto: any): string {
    let url = producto?.imagenUrl || producto?.imagenUrlPrincipal || 'assets/images/Panamericana.png';
    if (url.includes('res.cloudinary.com') && url.includes('/upload/') && !url.includes('f_auto')) {
      return url.replace('/upload/', '/upload/f_auto,q_auto,w_400/');
    }
    return url;
  }
}
