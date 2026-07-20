import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
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
      catchError(() => this.getContentFallback(ids))
    ).subscribe({
      next: productos => { this.recommendations = productos; this.loading = false; },
      error: () => { this.recommendations = []; this.loading = false; }
    });
  }

  addToCart(product: any): void { this.cartService.addToCart(product); }

  private getContentFallback(ids: string[]): Observable<any[]> {
    const semillas$ = forkJoin(ids.map(productId =>
      this.productsService.getProductoById(productId).pipe(catchError(() => of(null)))
    ));
    return forkJoin({ semillas: semillas$, catalogo: this.productsService.getProductos() }).pipe(
      map(({ semillas, catalogo }) => {
        const validas = semillas.filter(Boolean);
        const candidatos = catalogo.filter(producto => !ids.includes(producto._id) && producto.activo !== false);
        const porSemilla = validas.map((semilla: any) => candidatos
          .map(producto => ({ producto, puntos: this.sameId(producto.familia, semilla.familia) ? 6 : this.sameId(producto.marca, semilla.marca) ? 3 : 0 }))
          .filter(item => item.puntos > 0).sort((a, b) => b.puntos - a.puntos));
        const elegidos: any[] = [];
        let vuelta = 0;
        while (elegidos.length < 6 && porSemilla.some(lista => lista.length > vuelta)) {
          for (const lista of porSemilla) {
            const candidato = lista[vuelta]?.producto;
            if (candidato && !elegidos.some(p => p._id === candidato._id)) {
              elegidos.push({ ...candidato, motivo: 'Relacionado por marca o familia' });
              if (elegidos.length === 6) break;
            }
          }
          vuelta++;
        }
        for (const producto of candidatos) {
          if (elegidos.length === 6) break;
          if (!elegidos.some(p => p._id === producto._id)) elegidos.push({ ...producto, motivo: 'Alternativa del catálogo' });
        }
        return elegidos;
      })
    );
  }

  private sameId(a: any, b: any): boolean {
    const normalize = (value: any) => value?._id || value || '';
    return Boolean(normalize(a)) && normalize(a) === normalize(b);
  }
}
