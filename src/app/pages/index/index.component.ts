import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { ProductsService } from '../../core/services/admin/products.service';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [RouterModule, MatIconModule, CommonModule],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
})

export class IndexComponent implements OnInit {
  productosDestacados: any[] = [];
  isLoading = true;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private productsService: ProductsService
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
  }
}