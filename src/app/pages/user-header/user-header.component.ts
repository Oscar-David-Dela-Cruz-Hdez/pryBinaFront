import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

// Importaciones de Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

// Importamos el servicio de autenticación
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-user-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.css'] // Usaremos los mismos estilos
})
export class UserHeaderComponent implements OnInit {
  // Un "observable" para el nombre del usuario, se actualizará automáticamente
  public userName$: Observable<string | null>;

  constructor(private authService: AuthService) {
    // Obtenemos el nombre del usuario desde el servicio
    this.userName$ = this.authService.currentUserName$;
  }

  ngOnInit(): void {}

  // Función para cerrar sesión
  logout(): void {
    this.authService.logout();
  }
}
