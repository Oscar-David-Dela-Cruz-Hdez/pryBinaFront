import { Component, OnInit, OnDestroy } from "@angular/core";
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subscription } from "rxjs";

import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';

import { CartService } from "../../../core/services/shop/cart.service";
import { ThemeService } from "../../../core/services/theme/theme";
import { FamiliasService } from "../../../core/services/admin/familias.service";
import { ProductsService } from "../../../core/services/admin/products.service";
import { SiteInfoService } from "../../../core/services/admin/site-info.service";

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
export class HeaderComponent implements OnInit, OnDestroy {
  cartCount = 0;
  searchQuery = '';
  
  // Datos Dinámicos para el Menú
  familias: any[] = [];
  marcas: any[] = [];
  topContacts: any[] = [];

  // Control del Menú Móvil
  isMobileMenuOpen = false;
  isMobileCatalogOpen = false;
  isMobileCompanyOpen = false;

  private routerSub?: Subscription;

  constructor(
    private cartService: CartService,
    private router: Router,
    public themeService: ThemeService,
    private familiasService: FamiliasService,
    private productsService: ProductsService,
    private siteInfoService: SiteInfoService
  ) { }

  ngOnInit() {
    this.loadMenuData();
    this.cartService.cartItems$.subscribe(items => {
      this.cartCount = items.reduce((acc, item) => acc + item.cantidad, 0);
    });

    // Cerrar menú móvil automáticamente al navegar
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.closeMobileMenu();
      }
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
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

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/productos'], { queryParams: { q: this.searchQuery } });
      this.closeMobileMenu();
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    this.isMobileCatalogOpen = false;
    this.isMobileCompanyOpen = false;
  }

  toggleMobileCatalog() {
    this.isMobileCatalogOpen = !this.isMobileCatalogOpen;
  }

  toggleMobileCompany() {
    this.isMobileCompanyOpen = !this.isMobileCompanyOpen;
  }
}
