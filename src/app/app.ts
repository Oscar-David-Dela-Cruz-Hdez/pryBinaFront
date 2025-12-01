import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { HeaderComponent } from './pages/header/header.component';
import { UserHeaderComponent } from './pages/user-header/user-header.component';
import { FooterComponent } from './pages/footer/footer.component';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    UserHeaderComponent,
    FooterComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  isLoggedIn$: Observable<boolean>;

  //codigo 1 - funcional
  /*   constructor(
      private authService: AuthService,
      private cdr: ChangeDetectorRef
    ) {
      this.isLoggedIn$ = this.authService.isLoggedIn$;
    } */

  //codigo 2 experimental
  constructor(private authService: AuthService) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }
  //codigo 1
  /*   ngOnInit(): void {
      this.isLoggedIn$.subscribe(isLoggedIn => {
        console.log("Estado de login en App:", isLoggedIn);
        this.cdr.detectChanges();
      });
    } */

  //codigo 2 experimental
  ngOnInit(): void {
    this.isLoggedIn$.subscribe(isLoggedIn => {
      console.log("Estado de login en App:", isLoggedIn);
    });
  }

  @HostListener('document:mousemove')
  @HostListener('document:keydown')
  resetInactivityTimer() {
    if (localStorage.getItem('user_token')) {
      // El temporizador se reinicia automáticamente en cada solicitud HTTP exitosa
    }
  }
}
