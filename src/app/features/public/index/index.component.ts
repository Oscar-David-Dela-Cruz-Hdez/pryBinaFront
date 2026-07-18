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
  productosDestacados: any[] = [];
  carruseles: any[] = [];
  familias: any[] = [];
  marcas: any[] = [];
  ofertas: any[] = [];
  metodosEnvio: any[] = [];
  metodosPago: any[] = [];
  contactos: any[] = [];
  historia: any = null;
  mision: any = null;
  vision: any = null;
  currentCarouselIndex = 0;
  carouselInterval: any;
  isLoading = true;

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
    this.loadStorefrontContent();
  }

  loadStorefrontContent() {
    this.productsService.getProductos().subscribe({
      next: (productos) => {
        let conImagen = productos.filter(p => p.imagenUrl || p.imagenUrlPrincipal);
        this.productosDestacados = conImagen.slice(0, 4);
        
        if (this.productosDestacados.length < 4) {
           const faltantes = 4 - this.productosDestacados.length;
           const sinImagen = productos.filter(p => !p.imagenUrl && !p.imagenUrlPrincipal);
           this.productosDestacados = [...this.productosDestacados, ...sinImagen.slice(0, faltantes)];
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetch productos:', err);
        this.isLoading = false;
      }
    });

    this.salesService.getCarruseles(true).subscribe(data => {
      this.carruseles = data || [];
      if (this.carruseles.length > 1) {
        this.carouselInterval = setInterval(() => {
          this.currentCarouselIndex = (this.currentCarouselIndex + 1) % this.carruseles.length;
        }, 5000); // Cambia cada 5 segundos
      }
    });

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

    this.siteInfoService.getHistoria().subscribe(data => {
      this.historia = data;
    });

    this.siteInfoService.getMision().subscribe(data => {
      this.mision = data;
    });

    this.siteInfoService.getVision().subscribe(data => {
      this.vision = data;
    });
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
    return producto?.imagenUrl || producto?.imagenUrlPrincipal || 'assets/img/shampoo.jpg';
  }
}
