import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

import { SalesService } from '../../../core/services/admin/sales.service';

@Component({
  selector: 'app-admin-carrusel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatListModule,
    MatSnackBarModule
  ],
  template: `
    <div class="admin-container">
      <div class="header-section">
        <h2>Gestión de Carrusel</h2>
        <button mat-raised-button color="primary" (click)="toggleForm()">
          <mat-icon>{{ showForm ? 'remove' : 'add' }}</mat-icon>
          {{ showForm ? 'Cancelar' : 'Nuevo Banner' }}
        </button>
      </div>

      <!-- Formulario -->
      <mat-card *ngIf="showForm" class="mb-4 fade-in">
        <mat-card-header>
          <mat-card-title>{{ isEditing ? 'Editar Banner' : 'Agregar Banner' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="carruselForm" (ngSubmit)="onSubmit()">
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Título (Opcional)</mat-label>
              <input matInput formControlName="titulo">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>URL de Imagen</mat-label>
              <input matInput formControlName="imagenUrl" placeholder="https://example.com/banner.jpg">
            </mat-form-field>

            <img *ngIf="carruselForm.get('imagenUrl')?.value" [src]="carruselForm.get('imagenUrl')?.value" class="preview-img mb-2" alt="Vista previa">

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Enlace de Destino (Opcional)</mat-label>
              <input matInput formControlName="enlaceDestino">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Orden (Prioridad)</mat-label>
              <input matInput type="number" formControlName="orden">
            </mat-form-field>

            <div class="mb-2">
              <mat-slide-toggle formControlName="activo" color="primary">Activo</mat-slide-toggle>
            </div>

            <div class="actions">
              <button mat-stroked-button type="button" (click)="toggleForm()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="carruselForm.invalid || isLoading">
                {{ isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Lista -->
      <div class="offers-grid" *ngIf="carruseles.length > 0; else noData">
        <mat-card *ngFor="let item of carruseles" class="offer-card">
          <img mat-card-image [src]="item.imagenUrl" alt="Banner Carrusel">
          <mat-card-content>
            <h3>{{ item.titulo || 'Sin Título' }}</h3>
            <p>Orden: {{ item.orden }}</p>
            <span *ngIf="!item.activo" class="badge-inactive">Inactivo</span>
            <a *ngIf="item.enlaceDestino" [href]="item.enlaceDestino" target="_blank" class="link-dest">Ver destino</a>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-icon-button color="primary" (click)="editBanner(item)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteBanner(item)">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <ng-template #noData>
        <div class="empty-state">
          <mat-icon>view_carousel</mat-icon>
          <p>No hay banners registrados.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .admin-container { padding: 20px; max-width: 1000px; margin: 0 auto; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .full-width { width: 100%; margin-bottom: 10px; }
    .mb-4 { margin-bottom: 20px; }
    .mb-2 { margin-bottom: 10px; }
    .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
    .empty-state { text-align: center; padding: 40px; color: #777; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 10px; }
    .preview-img { max-width: 100%; height: auto; max-height: 200px; object-fit: cover; border-radius: 4px; }
    .offers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .offer-card { display: flex; flex-direction: column; justify-content: space-between; }
    .badge-inactive { color: red; font-weight: bold; }
    .link-dest { display: block; font-size: 0.8rem; margin-top: 5px; color: #555; text-decoration: underline; }
    .fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class CarruselComponent implements OnInit {
  carruseles: any[] = [];
  carruselForm!: FormGroup;
  showForm = false;
  isEditing = false;
  editingId: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.carruselForm = this.fb.group({
      titulo: [''],
      imagenUrl: ['', Validators.required],
      enlaceDestino: [''],
      orden: [0],
      activo: [true]
    });
    this.loadCarruseles();
  }

  loadCarruseles() {
    this.salesService.getCarruseles().subscribe(data => {
      this.carruseles = data || [];
      this.carruseles.sort((a, b) => a.orden - b.orden);
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.carruselForm.reset({ activo: true, orden: 0 });
      this.isEditing = false;
      this.editingId = null;
    }
  }

  editBanner(item: any) {
    this.isEditing = true;
    this.editingId = item._id;
    this.carruselForm.patchValue(item);
    this.showForm = true;
  }

  onSubmit() {
    if (this.carruselForm.invalid) return;
    this.isLoading = true;

    if (this.isEditing && this.editingId) {
      this.salesService.updateCarrusel(this.editingId, this.carruselForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Banner actualizado correctamente');
          this.loadCarruseles(); 
        },
        error: () => this.handleError()
      });
    } else {
      this.salesService.createCarrusel(this.carruselForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Banner creado correctamente');
          this.loadCarruseles(); 
        },
        error: () => this.handleError()
      });
    }
  }

  finishSubmit(msg: string) {
    this.isLoading = false;
    this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
    this.toggleForm();
  }

  handleError() {
    this.isLoading = false;
    this.snackBar.open('Error al guardar', 'Cerrar', { duration: 3000 });
  }

  deleteBanner(item: any) {
    Swal.fire({
      title: '¿Eliminar banner?',
      text: "No podrás revertir esto",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.salesService.deleteCarrusel(item._id).subscribe({
          next: () => {
             this.loadCarruseles();
             Swal.fire('Eliminado', 'El banner ha sido eliminado.', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }
}
