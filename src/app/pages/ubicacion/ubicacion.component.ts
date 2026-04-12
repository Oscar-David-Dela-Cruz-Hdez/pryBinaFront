import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SiteInfoService } from '../../core/services/admin/site-info.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-ubicacion',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './ubicacion.component.html',
  styleUrls: ['./ubicacion.component.css']
})
export class UbicacionComponent implements OnInit {
  ubicacion: any;
  safeMapUrl: SafeResourceUrl | null = null;

  constructor(
    private siteInfoService: SiteInfoService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.siteInfoService.getUbicacion().subscribe({
      next: (data) => {
        this.ubicacion = data;
        if (data?.googleMapsUrl) {
          this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.googleMapsUrl);
        } else if (data?.latitud && data?.longitud) {
          const fallbackUrl = `https://www.google.com/maps?q=${data.latitud},${data.longitud}&output=embed`;
          this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fallbackUrl);
        }
      },
      error: (err) => console.error('Error al cargar ubicación pública', err)
    });
  }
}
