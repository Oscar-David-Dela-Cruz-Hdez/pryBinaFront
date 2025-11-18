import { Component } from "@angular/core";
import { RouterModule } from '@angular/router';

// CAMBIOS: Importar los módulos necesarios para el menú y los iconos
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  standalone: true,

  imports: [
    RouterModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})

export class HeaderComponent {

}
