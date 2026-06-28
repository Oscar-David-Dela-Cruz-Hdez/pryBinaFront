import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserdataComponent } from '../../user/userdata/userdata.component';
import { PasswordComponent } from '../../user/password/password.component';
import { PreguntaComponent } from '../../user/pregunta/pregunta.component';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UserdataComponent,
    PasswordComponent,
    PreguntaComponent,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  selectedSection: string = 'userdata';

  constructor() { }


  selectSection(section: string): void {
    this.selectedSection = section;
  }
}
