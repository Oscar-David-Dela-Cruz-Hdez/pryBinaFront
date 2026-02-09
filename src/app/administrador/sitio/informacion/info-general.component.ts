import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { SiteInfoService } from '../../../core/services/admin/site-info.service';

@Component({
  selector: 'app-admin-info-general',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  template: `
    <div class="admin-container">
      <h2>Información General del Sitio</h2>
      
      <form [formGroup]="infoForm" (ngSubmit)="onSubmit()">
        
        <!-- Misión -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Misión y Visión</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Misión</mat-label>
              <textarea matInput formControlName="mision" rows="4"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Visión</mat-label>
              <textarea matInput formControlName="vision" rows="4"></textarea>
            </mat-form-field>
          </mat-card-content>
        </mat-card>

        <!-- Legal -->
        <mat-card class="mt-3">
          <mat-card-header>
            <mat-card-title>Legal</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Políticas de Privacidad</mat-label>
              <textarea matInput formControlName="politicasPrivacidad" rows="6"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Términos de Servicio</mat-label>
              <textarea matInput formControlName="terminosServicio" rows="6"></textarea>
            </mat-form-field>
          </mat-card-content>
        </mat-card>

        <!-- Ubicacion -->
        <mat-card class="mt-3" formGroupName="ubicacion">
          <mat-card-header>
            <mat-card-title>Ubicación</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Dirección</mat-label>
              <input matInput formControlName="direccion">
            </mat-form-field>

            <div class="row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Latitud</mat-label>
                <input matInput type="number" formControlName="latitud">
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Longitud</mat-label>
                <input matInput type="number" formControlName="longitud">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>URL Google Maps</mat-label>
              <input matInput formControlName="googleMapsUrl">
            </mat-form-field>
          </mat-card-content>
        </mat-card>

        <div class="actions mt-3">
          <button mat-raised-button color="primary" type="submit" [disabled]="isLoading">
            {{ isLoading ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>

      </form>
    </div>
  `,
  styles: [`
    .admin-container { padding: 20px; max-width: 900px; margin: 0 auto; }
    .full-width { width: 100%; margin-bottom: 10px; }
    .mt-3 { margin-top: 20px; }
    .row { display: flex; gap: 15px; }
    .half-width { flex: 1; }
    .actions { display: flex; justify-content: flex-end; }
    mat-card { padding: 15px; }
  `]
})
export class InfoGeneralComponent implements OnInit {
  infoForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private siteInfoService: SiteInfoService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.infoForm = this.fb.group({
      mision: [''],
      vision: [''],
      politicasPrivacidad: [''],
      terminosServicio: [''],
      ubicacion: this.fb.group({
        direccion: [''],
        latitud: [0],
        longitud: [0],
        googleMapsUrl: ['']
      })
    });

    this.loadInfo();
  }

  loadInfo() {
    this.siteInfoService.getInformacion().subscribe(data => {
      if (data) {
        // Patch simple fields
        this.infoForm.patchValue({
          mision: data.mision,
          vision: data.vision,
          politicasPrivacidad: data.politicasPrivacidad,
          terminosServicio: data.terminosServicio
        });
        
        // Patch nested ubicacion if exists
        if (data.ubicacion) {
          this.infoForm.get('ubicacion')?.patchValue(data.ubicacion);
        }
      }
    });
  }

  onSubmit() {
    if (this.infoForm.invalid) return;
    this.isLoading = true;

    this.siteInfoService.updateInformacion(this.infoForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.snackBar.open('Información actualizada correctamente', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
