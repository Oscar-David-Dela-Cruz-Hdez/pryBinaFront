import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importar CommonModule para *ngIf
import { Observable } from 'rxjs';

// Importar AMBOS headers
import { HeaderComponent } from './pages/header/header.component';
import { UserHeaderComponent } from './pages/user-header/user-header.component';
import { FooterComponent } from './pages/footer/footer.component';

// Importar el servicio
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root', // Este es el selector que está en tu index.html
  standalone: true,
  imports: [
    CommonModule, // Añadir CommonModule (para *ngIf y async)
    RouterOutlet,
    HeaderComponent,
    UserHeaderComponent, // Añadir el nuevo header
    FooterComponent
  ],
  templateUrl: './app.html', // Apuntar al archivo app.html
  styleUrls: ['./app.css']  // Apuntar al archivo app.css
})
export class App { // Mantenemos tu nombre de clase 'App'
  // Crear un observable para el estado de login
  isLoggedIn$: Observable<boolean>;

  constructor(private authService: AuthService) {
    // Asignar el observable desde el servicio
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }
}

