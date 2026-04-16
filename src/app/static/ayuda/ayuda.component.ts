import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SiteInfoService } from '../../core/services/admin/site-info.service';

@Component({
  selector: 'app-ayuda-public',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ayuda.component.html'
})
export class AyudaPublicComponent implements OnInit {
  faqs: any[] = [];
  isLoading = true;

  constructor(private siteInfoService: SiteInfoService) {}

  ngOnInit() {
    this.siteInfoService.getFaqs(true).subscribe({
      next: (data) => {
        this.faqs = data || [];
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}
