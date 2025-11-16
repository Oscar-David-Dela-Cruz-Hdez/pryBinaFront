import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule 
  ],
  templateUrl: './terminos.component.html',
  styleUrls: ['./terminos.component.css']
})
export class TerminosComponent {

}
