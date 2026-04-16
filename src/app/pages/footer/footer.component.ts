import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SiteInfoService } from '../../core/services/admin/site-info.service';
import { SalesService } from '../../core/services/admin/sales.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  contactos: any[] = [];
  metodosPago: any[] = [];

  constructor(
    private siteInfoService: SiteInfoService,
    private salesService: SalesService
  ) {}

  ngOnInit() {
    this.siteInfoService.getContactos(true).subscribe(data => {
      this.contactos = data || [];
    });

    this.salesService.getMetodosPago(true).subscribe(data => {
      this.metodosPago = data || [];
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
