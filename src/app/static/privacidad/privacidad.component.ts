import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, // <-- Importar MatCardModule
    MatIconModule
  ],
  templateUrl: './privacidad.component.html',
  styleUrls: ['./privacidad.component.css']
})
export class PrivacidadComponent {

}
