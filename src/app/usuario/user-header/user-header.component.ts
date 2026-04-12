  import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { RouterModule } from '@angular/router';
  import { Observable } from 'rxjs';

  import { MatButtonModule } from '@angular/material/button';
  import { MatIconModule } from '@angular/material/icon';
  import { MatMenuModule } from '@angular/material/menu';

  import { AuthService } from '../../auth/auth.service';
  import { ThemeService } from '../../core/services/theme/theme';
  import { FamiliasService } from '../../core/services/admin/familias.service';
  import { ProductsService } from '../../core/services/admin/products.service';

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
    
    // Datos Dinámicos para el Menú
    familias: any[] = [];
    marcas: any[] = [];

    constructor(
      private authService: AuthService, 
      public themeService: ThemeService,
      private familiasService: FamiliasService,
      private productsService: ProductsService
    ) {
      this.userName$ = this.authService.currentUserName$;
    }

    ngOnInit() {
      this.loadMenuData();
    }

    loadMenuData() {
      this.familiasService.getFamilias().subscribe(data => {
        this.familias = (data || []).slice(0, 12);
      });
      this.productsService.getMarcas().subscribe(data => {
        this.marcas = (data || []).slice(0, 8);
      });
    }


    logout(): void {
      console.log("Boton de logout presionado");
      this.authService.logout();
    }
  }
