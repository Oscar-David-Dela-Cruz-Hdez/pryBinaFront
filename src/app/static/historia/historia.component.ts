import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SiteInfoService } from '../../core/services/admin/site-info.service';

@Component({
  selector: 'app-historia-public',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './historia.component.html'
})
export class HistoriaPublicComponent implements OnInit {
  historiaData: any = null;
  isLoading = true;

  constructor(private siteInfoService: SiteInfoService) {}

  ngOnInit() {
    this.siteInfoService.getHistoria().subscribe({
      next: (data) => {
        this.historiaData = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}
