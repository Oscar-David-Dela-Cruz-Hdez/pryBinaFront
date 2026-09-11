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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    UserHeaderComponent,
    AdminHeaderComponent,
    FooterComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  isLoggedIn$: Observable<boolean>;
  userRole$: Observable<string | null>;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.userRole$ = this.authService.userRole$;
  }

  ngOnInit(): void {
    this.isLoggedIn$.subscribe(isLoggedIn => {
      console.log("Estado de login en App:", isLoggedIn);
    });
  }
}
