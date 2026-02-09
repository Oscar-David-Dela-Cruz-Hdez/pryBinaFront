import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

import { ProductsService } from '../../../core/services/admin/products.service';

@Component({
  selector: 'app-admin-categorias',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSnackBarModule
  ],
  template: `
    <div class="admin-container">
      <div class="header-section">
        <h2>Gestión de Categorías</h2>
        <button mat-raised-button color="primary" (click)="toggleForm()">
          <mat-icon>{{ showForm ? 'remove' : 'add' }}</mat-icon>
          {{ showForm ? 'Cancelar' : 'Nueva Categoría' }}
        </button>
      </div>

      <!-- Formulario -->
      <mat-card *ngIf="showForm" class="mb-4 fade-in">
        <mat-card-header>
          <mat-card-title>{{ isEditing ? 'Editar Categoría' : 'Agregar Categoría' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="catForm" (ngSubmit)="onSubmit()">
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="nombre" placeholder="Ej: Electrónica">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción</mat-label>
              <textarea matInput formControlName="descripcion" rows="2"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>URL Imagen (Opcional)</mat-label>
              <input matInput formControlName="imagenUrl">
            </mat-form-field>

            <div class="actions">
              <button mat-stroked-button type="button" (click)="toggleForm()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="catForm.invalid || isLoading">
                {{ isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Lista -->
      <mat-card *ngIf="categorias.length > 0; else noData">
        <mat-list>
          <div *ngFor="let cat of categorias">
            <mat-list-item>
              <mat-icon matListItemIcon>category</mat-icon>
              
              <div matListItemTitle>
                <strong>{{ cat.nombre }}</strong>
              </div>
              <div matListItemLine>{{ cat.descripcion }}</div>
              
              <div matListItemMeta>
                <button mat-icon-button color="primary" (click)="editCat(cat)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteCat(cat)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </mat-list-item>
            <mat-divider></mat-divider>
          </div>
        </mat-list>
      </mat-card>

      <ng-template #noData>
        <div class="empty-state">
          <mat-icon>category</mat-icon>
          <p>No hay categorías registradas.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .admin-container { padding: 20px; max-width: 800px; margin: 0 auto; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .full-width { width: 100%; margin-bottom: 10px; }
    .mb-4 { margin-bottom: 20px; }
    .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
    .empty-state { text-align: center; padding: 40px; color: #777; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 10px; }
    .fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class CategoriasComponent implements OnInit {
  categorias: any[] = [];
  catForm!: FormGroup;
  showForm = false;
  isEditing = false;
  editingId: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.catForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      imagenUrl: ['']
    });
    this.loadData();
  }

  loadData() {
    this.productsService.getCategorias().subscribe(data => {
      this.categorias = data || [];
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.catForm.reset();
      this.isEditing = false;
      this.editingId = null;
    }
  }

  editCat(cat: any) {
    this.isEditing = true;
    this.editingId = cat._id;
    this.catForm.patchValue(cat);
    this.showForm = true;
  }

  onSubmit() {
    if (this.catForm.invalid) return;
    this.isLoading = true;

    if (this.isEditing && this.editingId) {
      this.productsService.updateCategoria(this.editingId, this.catForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Categoría actualizada');
          this.loadData();
        },
        error: () => this.handleError()
      });
    } else {
      this.productsService.createCategoria(this.catForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Categoría creada');
          this.categorias.push(res.categoria); // Optimistic update
          this.loadData();
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

  deleteCat(cat: any) {
    Swal.fire({
      title: '¿Eliminar categoría?',
      text: "No podrás revertir esto",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productsService.deleteCategoria(cat._id).subscribe({
          next: () => {
             this.categorias = this.categorias.filter(c => c._id !== cat._id);
             Swal.fire('Eliminado', 'La categoría ha sido eliminada.', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }
}
