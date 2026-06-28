import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subscription, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

import { MonitoreoService, ResumenMonitoreo } from '../../../core/services/admin/monitoreo.service';

@Component({
  selector: 'app-monitoreo',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './monitoreo.component.html',
  styleUrls: ['./monitoreo.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonitoreoComponent implements OnInit, OnDestroy {
  datos: ResumenMonitoreo | null = null;
  cargando = true;
  error: string | null = null;
  ultimaActualizacion: Date | null = null;

  private sub!: Subscription;
  readonly INTERVALO_MS = 15_000;

  constructor(
    private monitoreoService: MonitoreoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sub = interval(this.INTERVALO_MS).pipe(
      startWith(0),
      switchMap(() => this.monitoreoService.getResumen())
    ).subscribe({
      next: (res) => {
        this.datos = res;
        this.cargando = false;
        this.error = null;
        this.ultimaActualizacion = new Date();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Error al conectar con el servidor.';
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  formatUptime(segundos: number): string {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return `${h}h ${m}m ${s}s`;
  }

  getColorCPU(pct: number): string {
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  }

  getColorRAM(pct: number): string {
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 70) return 'bg-amber-500';
    return 'bg-cyan-500';
  }

  get totalOps(): number {
    if (!this.datos?.mongo?.operaciones) return 0;
    const ops = this.datos.mongo.operaciones;
    return ops.inserts + ops.queries + ops.updates + ops.deletes + ops.commands + ops.getmores;
  }
}
