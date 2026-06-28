import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SiteInfoService } from '../../../core/services/admin/site-info.service';
import { SalesService } from '../../../core/services/admin/sales.service';
import { FamiliasService } from '../../../core/services/admin/familias.service';
import { ProductsService } from '../../../core/services/admin/products.service';

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
  familias: any[] = [];
  marcas: any[] = [];
  currentYear = new Date().getFullYear();

  constructor(
    private siteInfoService: SiteInfoService,
    private salesService: SalesService,
    private familiasService: FamiliasService,
    private productsService: ProductsService
  ) {}

  ngOnInit() {
    this.siteInfoService.getContactos(true).subscribe(data => {
      this.contactos = data || [];
    });

    this.salesService.getMetodosPago(true).subscribe(data => {
      this.metodosPago = data || [];
    });

    this.familiasService.getFamilias().subscribe(data => {
      this.familias = (data || []).slice(0, 6);
    });

    this.productsService.getMarcas().subscribe(data => {
      this.marcas = (data || []).slice(0, 6);
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
