import { Component, OnInit } from "@angular/core";
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

// CAMBIOS: Importar los módulos necesarios para el menú y los iconos
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge'; // Importar Badge

import { CartService } from "../../core/services/shop/cart.service";
import { ThemeService } from "../../core/services/theme/theme";
import { FamiliasService } from "../../core/services/admin/familias.service";
import { ProductsService } from "../../core/services/admin/products.service";

@Component({
  selector: 'app-header',
  standalone: true,

  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})

export class HeaderComponent implements OnInit {
  cartCount = 0;
  searchQuery = '';
  
  // Datos Dinámicos para el Menú
  familias: any[] = [];
  marcas: any[] = [];

  constructor(
    private cartService: CartService,
    private router: Router,
    public themeService: ThemeService,
    private familiasService: FamiliasService,
    private productsService: ProductsService
  ) { }

  ngOnInit() {
    this.loadMenuData();
    this.cartService.cartItems$.subscribe(items => {
      this.cartCount = items.reduce((acc, item) => acc + item.cantidad, 0);
    });
  }

  loadMenuData() {
    // Cargar Familias
    this.familiasService.getFamilias().subscribe(data => {
      this.familias = (data || []).slice(0, 12); // Limitamos para no saturar el menú
    });

    // Cargar Marcas Populares
    this.productsService.getMarcas().subscribe(data => {
      this.marcas = (data || []).slice(0, 8); // Solo las más populares
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/productos'], { queryParams: { q: this.searchQuery } });
    }
  }
}
