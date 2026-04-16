import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { ProductsService } from '../../core/services/admin/products.service';
import { SalesService } from '../../core/services/admin/sales.service';

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
  currentCarouselIndex = 0;
  carouselInterval: any;
  isLoading = true;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private productsService: ProductsService,
    private salesService: SalesService
  ) {
    this.authService.userRole$.subscribe(role => {
      if (role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      }
    });
  }

  ngOnInit() {
    this.productsService.getProductos().subscribe({
      next: (productos) => {
        // Find 3 products that have images
        let conImagen = productos.filter(p => p.imagenUrl || p.imagenUrlPrincipal);
        this.productosDestacados = conImagen.slice(0, 3);
        
        // Fill the rest if we have less than 3
        if (this.productosDestacados.length < 3) {
           const faltantes = 3 - this.productosDestacados.length;
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
      // Tomamos solo los carruseles activos
      this.carruseles = data || [];
      if (this.carruseles.length > 1) {
        this.carouselInterval = setInterval(() => {
          this.currentCarouselIndex = (this.currentCarouselIndex + 1) % this.carruseles.length;
        }, 5000); // Cambia cada 5 segundos
      }
    });
  }

  ngOnDestroy() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }
}