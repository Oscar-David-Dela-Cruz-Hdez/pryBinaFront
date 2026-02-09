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
  selector: 'app-admin-metodos-pago',
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
        <h2>Métodos de Pago</h2>
        <button mat-raised-button color="primary" (click)="toggleForm()">
          <mat-icon>{{ showForm ? 'remove' : 'add' }}</mat-icon>
          {{ showForm ? 'Cancelar' : 'Nuevo Método' }}
        </button>
      </div>

      <!-- Formulario -->
      <mat-card *ngIf="showForm" class="mb-4 fade-in">
        <mat-card-header>
          <mat-card-title>{{ isEditing ? 'Editar Método' : 'Agregar Método' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()">
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="nombre" placeholder="Ej: Tarjeta de Crédito">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción</mat-label>
              <input matInput formControlName="descripcion" placeholder="Ej: Pago seguro con tarjeta">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Instrucciones (Opcional)</mat-label>
              <textarea matInput formControlName="instrucciones" rows="3" placeholder="Ej: Clabe interbancaria..."></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Icono (Nombre o URL)</mat-label>
              <input matInput formControlName="icono" placeholder="credit_card">
              <mat-icon matSuffix *ngIf="paymentForm.get('icono')?.value && !paymentForm.get('icono')?.value.includes('http')">{{ paymentForm.get('icono')?.value }}</mat-icon>
            </mat-form-field>

            <div class="mb-2">
              <mat-slide-toggle formControlName="activo" color="primary">Activo</mat-slide-toggle>
            </div>

            <div class="actions">
              <button mat-stroked-button type="button" (click)="toggleForm()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="paymentForm.invalid || isLoading">
                {{ isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Lista -->
      <mat-card *ngIf="metodos.length > 0; else noData">
        <mat-list>
          <div *ngFor="let metodo of metodos">
            <mat-list-item>
              <mat-icon matListItemIcon *ngIf="!metodo.icono?.includes('http')">{{ metodo.icono || 'payments' }}</mat-icon>
              
              <div matListItemTitle>
                <strong>{{ metodo.nombre }}</strong>
                <span *ngIf="!metodo.activo" class="badge-inactive">(Inactivo)</span>
              </div>
              <div matListItemLine>{{ metodo.descripcion }}</div>
              
              <div matListItemMeta>
                <button mat-icon-button color="primary" (click)="editMethod(metodo)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteMethod(metodo)">
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
          <mat-icon>payments</mat-icon>
          <p>No hay métodos de pago registrados.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .admin-container { padding: 20px; max-width: 900px; margin: 0 auto; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .full-width { width: 100%; margin-bottom: 10px; }
    .mb-4 { margin-bottom: 20px; }
    .mb-2 { margin-bottom: 10px; }
    .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
    .empty-state { text-align: center; padding: 40px; color: #777; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 10px; }
    .badge-inactive { font-size: 0.8rem; color: red; margin-left: 5px; }
    .fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class MetodosPagoComponent implements OnInit {
  metodos: any[] = [];
  paymentForm!: FormGroup;
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
    this.paymentForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      instrucciones: [''],
      icono: [''],
      activo: [true]
    });
    this.loadMethods();
  }

  loadMethods() {
    this.salesService.getMetodosPago().subscribe(data => {
      this.metodos = data || [];
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.paymentForm.reset({ activo: true });
      this.isEditing = false;
      this.editingId = null;
    }
  }

  editMethod(method: any) {
    this.isEditing = true;
    this.editingId = method._id;
    this.paymentForm.patchValue(method);
    this.showForm = true;
  }

  onSubmit() {
    if (this.paymentForm.invalid) return;
    this.isLoading = true;

    if (this.isEditing && this.editingId) {
      this.salesService.updateMetodoPago(this.editingId, this.paymentForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Método actualizado correctamente');
          this.loadMethods(); // Reload to see updates
        },
        error: () => this.handleError()
      });
    } else {
      this.salesService.createMetodoPago(this.paymentForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Método creado correctamente');
          this.metodos.push(res.metodo);
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

  deleteMethod(method: any) {
    Swal.fire({
      title: '¿Eliminar método?',
      text: "No podrás revertir esto",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.salesService.deleteMetodoPago(method._id).subscribe({
          next: () => {
             this.metodos = this.metodos.filter(m => m._id !== method._id);
             Swal.fire('Eliminado', 'El método ha sido eliminado.', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }
}
