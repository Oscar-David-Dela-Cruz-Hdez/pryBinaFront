import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/shop/cart.service';
import { ThemeService } from '../../core/services/theme/theme';
import { FamiliasService } from '../../core/services/admin/familias.service';
import { ProductsService } from '../../core/services/admin/products.service';
import { SiteInfoService } from '../../core/services/admin/site-info.service';

@Component({
  selector: 'app-user-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.css']
})
export class UserHeaderComponent implements OnInit {
  public userName$: Observable<string | null>;

  familias: any[] = [];
  marcas: any[] = [];
  topContacts: any[] = [];
  cartCount = 0;
  searchQuery = '';

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    public themeService: ThemeService,
    private familiasService: FamiliasService,
    private productsService: ProductsService,
    private siteInfoService: SiteInfoService
  ) {
    this.userName$ = this.authService.currentUserName$;
  }

  ngOnInit() {
    this.loadMenuData();

    this.cartService.cartItems$.subscribe(items => {
      this.cartCount = items.reduce((acc, item) => acc + item.cantidad, 0);
    });
  }

  loadMenuData() {
    this.familiasService.getFamilias().subscribe(data => {
      this.familias = (data || []).slice(0, 12);
    });

    this.productsService.getMarcas().subscribe(data => {
      this.marcas = (data || []).slice(0, 8);
    });

    this.siteInfoService.getContactos(true).subscribe(data => {
      this.topContacts = (data || []).slice(0, 3);
    });
  }

  getContactIcon(tipo: string): string {
    const t = tipo?.toLowerCase() || '';
    if (t.includes('whatsapp') || t.includes('tel')) return 'phone';
    if (t.includes('mail') || t.includes('correo')) return 'email';
    if (t.includes('facebook')) return 'thumb_up';
    if (t.includes('instagram')) return 'photo_camera';
    return 'info';
  }

  onSearch(): void {
    const query = this.searchQuery.trim();
    if (query) {
      this.router.navigate(['/productos'], { queryParams: { q: query } });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
