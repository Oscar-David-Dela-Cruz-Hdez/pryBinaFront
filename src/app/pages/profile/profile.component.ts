import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserdataComponent } from '../../usuario/userdata/userdata.component';
import { PasswordComponent } from '../../usuario/password/password.component';
import { PreguntaComponent } from '../../usuario/pregunta/pregunta.component';
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
export class ProfileComponent implements OnInit {
  selectedSection: string = 'userdata';

  constructor() { }

  ngOnInit(): void {
  }

  selectSection(section: string): void {
    this.selectedSection = section;
  }
}
