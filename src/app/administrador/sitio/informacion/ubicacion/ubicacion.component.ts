import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { SiteInfoService } from '../../../../core/services/admin/site-info.service';

@Component({
    selector: 'app-admin-ubicacion',
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
    <div class="admin-container fade-in">
      <h2>Gestión de Ubicación</h2>
      
      <mat-card>
        <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
                
                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Dirección</mat-label>
                    <input matInput formControlName="direccion" placeholder="Calle, número, ciudad...">
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
                    <mat-label>URL Google Maps (Iframe/Embed)</mat-label>
                    <input matInput formControlName="googleMapsUrl" placeholder="https://www.google.com/maps/embed...">
                </mat-form-field>

                <div class="row">
                    <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Teléfono</mat-label>
                        <input matInput formControlName="telefono" placeholder="+52...">
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Horario</mat-label>
                        <input matInput formControlName="horario" placeholder="Lunes a Viernes 9am - 6pm">
                    </mat-form-field>
                </div>

                <div class="actions">
                    <button mat-raised-button color="primary" type="submit" [disabled]="isLoading">
                        {{ isLoading ? 'Guardando...' : 'Guardar Cambios' }}
                    </button>
                </div>
            </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
    styles: [`
    .admin-container { padding: 20px; max-width: 800px; margin: 0 auto; }
    .full-width { width: 100%; margin-bottom: 10px; }
    .row { display: flex; gap: 15px; }
    .half-width { flex: 1; }
    .actions { display: flex; justify-content: flex-end; margin-top: 15px; }
    .fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AdminUbicacionComponent implements OnInit {
    form!: FormGroup;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private siteInfoService: SiteInfoService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.form = this.fb.group({
            direccion: [''],
            latitud: [0],
            longitud: [0],
            googleMapsUrl: [''],
            telefono: [''],
            horario: ['']
        });
        this.loadData();
    }

    loadData() {
        this.siteInfoService.getUbicacion().subscribe({
            next: (data) => {
                if (data) {
                    this.form.patchValue(data);
                }
            },
            error: (err) => console.error('Error al cargar ubicación', err)
        });
    }

    onSubmit() {
        if (this.form.invalid) return;
        this.isLoading = true;

        this.siteInfoService.updateUbicacion(this.form.value).subscribe({
            next: () => {
                this.isLoading = false;
                this.snackBar.open('Ubicación actualizada correctamente', 'Cerrar', { duration: 3000 });
            },
            error: () => {
                this.isLoading = false;
                this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 });
            }
        });
    }
}
