import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { ProductsService } from '../../../../core/services/admin/products.service';
import { CartService } from '../../../../core/services/shop/cart.service';

@Component({
  selector: 'app-product-recommendations',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './product-recommendations.component.html',
  styleUrls: ['./product-recommendations.component.css']
})
export class ProductRecommendationsComponent implements OnChanges {
  @Input() productIds: string[] = [];
  @Input() title = 'También te puede interesar';
  recommendations: any[] = [];
  loading = false;

  constructor(private productsService: ProductsService, private cartService: CartService) {}

  ngOnChanges(): void {
    const ids = [...new Set((this.productIds || []).filter(Boolean))];
    if (!ids.length) { this.recommendations = []; return; }
    this.loading = true;
    this.productsService.getRecomendaciones(ids).pipe(
      // Permite tomar capturas aunque el backend nuevo todavía no haya sido desplegado.
      catchError(() => this.productsService.getProductos().pipe(
        switchMap(productos => of(productos.filter(p => !ids.includes(p._id)).slice(0, 6)))
      ))
    ).subscribe({
      next: productos => { this.recommendations = productos; this.loading = false; },
      error: () => { this.recommendations = []; this.loading = false; }
    });
  }

  addToCart(product: any): void { this.cartService.addToCart(product); }
}
