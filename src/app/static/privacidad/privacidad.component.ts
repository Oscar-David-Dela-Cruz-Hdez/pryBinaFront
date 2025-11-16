import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule // <-- Importar MatCardModule
  ],
  templateUrl: './privacidad.component.html',
  styleUrls: ['./privacidad.component.css']
})
export class PrivacidadComponent {

}
