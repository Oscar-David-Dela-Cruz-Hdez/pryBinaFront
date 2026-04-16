import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SiteInfoService } from '../../core/services/admin/site-info.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-contacto-public',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './contacto.component.html'
})
export class ContactoPublicComponent implements OnInit {
  contactos: any[] = [];
  ubicacion: any = null;
  isLoading = true;

  constructor(private siteInfoService: SiteInfoService) {}

  ngOnInit() {
    forkJoin({
      contactos: this.siteInfoService.getContactos(true),
      ubicacion: this.siteInfoService.getUbicacion()
    }).subscribe({
      next: (res) => {
        this.contactos = res.contactos || [];
        this.ubicacion = res.ubicacion;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  getContactIcon(tipo: string): string {
    const t = tipo?.toLowerCase() || '';
    if (t.includes('whatsapp') || t.includes('tel')) return 'phone';
    if (t.includes('mail') || t.includes('correo')) return 'email';
    if (t.includes('facebook')) return 'thumb_up';
    if (t.includes('instagram')) return 'photo_camera';
    return 'business';
  }
}
