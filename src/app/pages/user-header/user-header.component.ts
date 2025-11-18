  import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { RouterModule } from '@angular/router';
  import { Observable } from 'rxjs';

  import { MatButtonModule } from '@angular/material/button';
  import { MatIconModule } from '@angular/material/icon';
  import { MatMenuModule } from '@angular/material/menu';

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
    styleUrls: ['./user-header.component.css']
  })
  export class UserHeaderComponent implements OnInit {

    public userName$: Observable<string | null>;

    constructor(private authService: AuthService) {

      this.userName$ = this.authService.currentUserName$;
    }

    ngOnInit(): void {

    }

    logout(): void {
      console.log("Boton de logout presionado");
      this.authService.logout();
    }
  }
