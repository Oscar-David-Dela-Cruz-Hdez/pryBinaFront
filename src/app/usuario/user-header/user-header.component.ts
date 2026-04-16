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
  import { SiteInfoService } from '../../core/services/admin/site-info.service';

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
    topContacts: any[] = [];

    constructor(
      private authService: AuthService, 
      public themeService: ThemeService,
      private familiasService: FamiliasService,
      private productsService: ProductsService,
      private siteInfoService: SiteInfoService
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
      // Cargar info de Contacto rapido para la barra superior
      this.siteInfoService.getContactos(true).subscribe(data => {
        this.topContacts = (data || []).slice(0, 3);
      });
    }

    getContactIcon(tipo: string): string {
      const t = tipo?.toLowerCase() || '';
      if (t.includes('whatsapp') || t.includes('tel')) return 'phone';
      if (t.includes('mail') || t.includes('correo')) return 'email';
      if (t.includes('facebook')) return 'thumb_up';
      if (t.includes('instagram')) return 'photo_camera';
      return 'info';
    }


    logout(): void {
      console.log("Boton de logout presionado");
      this.authService.logout();
    }
  }
