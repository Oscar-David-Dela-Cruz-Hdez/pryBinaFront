import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProductsService } from '../../../../core/services/admin/products.service';
import { CartService } from '../../../../core/services/shop/cart.service';
import { ProductRecommendationsComponent } from '../product-recommendations/product-recommendations.component';

@Component({
  selector: 'app-product-detail', standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, ProductRecommendationsComponent],
  templateUrl: './product-detail.component.html', styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: any; loading = true; error = false;
  constructor(private route: ActivatedRoute, private productsService: ProductsService, private cartService: CartService) {}
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const productId = params.get('id'); if (!productId) return;
      this.loading = true; window.scrollTo({ top: 0 });
      this.productsService.getProductoById(productId).subscribe({
        next: product => { this.product = product; this.loading = false; },
        error: () => { this.error = true; this.loading = false; }
      });
    });
  }
  addToCart(): void { if (this.product) this.cartService.addToCart(this.product); }
}
