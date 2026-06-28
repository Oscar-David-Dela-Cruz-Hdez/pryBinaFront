import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SiteInfoService } from '../../core/services/admin/site-info.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-mision-vision-public',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mision-vision.component.html'
})
export class MisionVisionPublicComponent implements OnInit {
  misionData: any = null;
  visionData: any = null;
  isLoading = true;

  constructor(private siteInfoService: SiteInfoService) {}

  ngOnInit() {
    forkJoin({
      mision: this.siteInfoService.getMision(),
      vision: this.siteInfoService.getVision()
    }).subscribe({
      next: (res) => {
        this.misionData = res.mision;
        this.visionData = res.vision;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}
