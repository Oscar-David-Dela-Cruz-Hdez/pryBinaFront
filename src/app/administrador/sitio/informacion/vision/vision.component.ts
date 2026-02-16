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
    selector: 'app-admin-vision',
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
      <h2>Gestión de Visión</h2>
      
      <mat-card>
        <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Visión de la Empresa</mat-label>
                    <textarea matInput formControlName="vision" rows="8" placeholder="Escribe la visión aquí..."></textarea>
                </mat-form-field>

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
    .full-width { width: 100%; }
    .actions { display: flex; justify-content: flex-end; margin-top: 15px; }
    .fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class VisionComponent implements OnInit {
    form!: FormGroup;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private siteInfoService: SiteInfoService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.form = this.fb.group({
            vision: ['']
        });
        this.loadData();
    }

    loadData() {
        this.siteInfoService.getVision().subscribe({
            next: (data) => {
                if (data && data.texto) {
                    this.form.patchValue({ vision: data.texto });
                }
            },
            error: (err) => console.error('Error al cargar visión', err)
        });
    }

    onSubmit() {
        if (this.form.invalid) return;
        this.isLoading = true;

        const payload = { texto: this.form.value.vision };

        this.siteInfoService.updateVision(payload).subscribe({
            next: () => {
                this.isLoading = false;
                this.snackBar.open('Visión actualizada correctamente', 'Cerrar', { duration: 3000 });
            },
            error: () => {
                this.isLoading = false;
                this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 });
            }
        });
    }
}
