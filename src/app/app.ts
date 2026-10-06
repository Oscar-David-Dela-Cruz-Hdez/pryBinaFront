import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { HeaderComponent } from './layout/public/header/header.component';
import { UserHeaderComponent } from './layout/user-header/user-header.component';
import { AdminHeaderComponent } from './layout/admin-header/admin-header.component';
import { FooterComponent } from './layout/public/footer/footer.component';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme/theme';
import { CartService } from './core/services/shop/cart.service';
import { PwaService } from './core/services/pwa.service';
import { OfflineBannerComponent } from './shared/components/offline-banner/offline-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    UserHeaderComponent,
    AdminHeaderComponent,
    FooterComponent,
    OfflineBannerComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  isLoggedIn$: Observable<boolean>;
  userRole$: Observable<string | null>;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private cartService: CartService,
    private pwaService: PwaService
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.userRole$ = this.authService.userRole$;
  }

  ngOnInit(): void {
    this.isLoggedIn$.subscribe(isLoggedIn => {
      console.log("Estado de login en App:", isLoggedIn);
    });

    // Badge de la PWA: contador de ítems del carrito en el ícono instalado
    this.cartService.cartItems$.subscribe(() => {
      this.pwaService.setBadge(this.cartService.getItemCount());
    });
  }
}
