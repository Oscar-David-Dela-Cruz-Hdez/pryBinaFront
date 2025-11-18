import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core'; 
// Importar AMBOS headers
import { HeaderComponent } from './pages/header/header.component';
import { UserHeaderComponent } from './pages/user-header/user-header.component';
import { FooterComponent } from './pages/footer/footer.component';
// Importar el servicio
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
export class App implements OnInit { // <-- Implementa OnInit
  isLoggedIn$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef // <-- Inyecta ChangeDetectorRef
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  ngOnInit(): void {
    // Depuración: Suscríbete al observable para ver los cambios
    this.isLoggedIn$.subscribe(isLoggedIn => {
      console.log("Estado de login en App:", isLoggedIn);
      this.cdr.detectChanges(); // <-- Fuerza la detección de cambios
    });
  }
}
