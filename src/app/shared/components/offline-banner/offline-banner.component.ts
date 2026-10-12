import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConnectionService } from '../../../core/services/connection.service';

@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offline-banner.component.html',
  styleUrls: ['./offline-banner.component.css']
})
export class OfflineBannerComponent implements OnInit, OnDestroy {
  offline = false;
  private subscription!: Subscription;

  constructor(public connectionService: ConnectionService) {}

  ngOnInit(): void {
    this.subscription = this.connectionService.online$.subscribe(online => {
      this.offline = !online;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
