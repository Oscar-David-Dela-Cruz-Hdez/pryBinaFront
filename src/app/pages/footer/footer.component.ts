import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Importante para standalone o módulos

@Component({
  selector: 'app-footer',
  standalone: true, // Asumimos standalone por la estructura, si es módulo, habría que importarlo allá.
  imports: [CommonModule, RouterModule], // Necesitamos RouterModule para los links existentes
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})

export class FooterComponent {
  constructor(private http: HttpClient) {}

  testError400() {
    // Intenta hacer una petición que fallará con 400
    this.http.get('https://httpstat.us/400').subscribe({
      next: () => console.log('Éxito inesperado'),
      error: (e) => console.log('Error 400 capturado:', e) 
      // El interceptor debería redirigir antes de llegar aquí o justo después
    });
  }

  testError500() {
    // Intenta hacer una petición que fallará con 500
    this.http.get('https://httpstat.us/500').subscribe({
      next: () => console.log('Éxito inesperado'),
      error: (e) => console.log('Error 500 capturado:', e)
    });
  }
}

import { RouterModule } from '@angular/router';
