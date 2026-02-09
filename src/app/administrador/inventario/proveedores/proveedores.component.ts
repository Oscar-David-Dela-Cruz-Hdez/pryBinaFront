import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

import { LogisticsService } from '../../../core/services/admin/logistics.service';

@Component({
  selector: 'app-admin-proveedores',
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
    MatTableModule,
    MatSnackBarModule
  ],
  template: `
    <div class="admin-container">
      <div class="header-section">
        <h2>Gestión de Proveedores</h2>
        <button mat-raised-button color="primary" (click)="toggleForm()">
          <mat-icon>{{ showForm ? 'remove' : 'add' }}</mat-icon>
          {{ showForm ? 'Cancelar' : 'Nuevo Proveedor' }}
        </button>
      </div>

      <!-- Formulario -->
      <mat-card *ngIf="showForm" class="mb-4 fade-in">
        <mat-card-header>
          <mat-card-title>{{ isEditing ? 'Editar Proveedor' : 'Agregar Proveedor' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="supplierForm" (ngSubmit)="onSubmit()">
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Nombre Empresa</mat-label>
                <input matInput formControlName="nombre">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Nombre Contacto</mat-label>
                <input matInput formControlName="contacto">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Teléfono</mat-label>
                <input matInput formControlName="telefono">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Dirección</mat-label>
              <input matInput formControlName="direccion">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Sitio Web</mat-label>
              <input matInput formControlName="sitioWeb">
            </mat-form-field>

            <div class="mb-2">
              <mat-slide-toggle formControlName="activo" color="primary">Activo</mat-slide-toggle>
            </div>

            <div class="actions">
              <button mat-stroked-button type="button" (click)="toggleForm()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="supplierForm.invalid || isLoading">
                {{ isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Tabla -->
      <div class="mat-elevation-z8" *ngIf="proveedores.length > 0; else noData">
        <table mat-table [dataSource]="dataSource">
          
          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef> Empresa </th>
            <td mat-cell *matCellDef="let row"> {{row.nombre}} </td>
          </ng-container>

          <ng-container matColumnDef="contacto">
            <th mat-header-cell *matHeaderCellDef> Contacto </th>
            <td mat-cell *matCellDef="let row"> {{row.contacto}} </td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef> Email </th>
            <td mat-cell *matCellDef="let row"> {{row.email}} </td>
          </ng-container>

          <ng-container matColumnDef="telefono">
            <th mat-header-cell *matHeaderCellDef> Teléfono </th>
            <td mat-cell *matCellDef="let row"> {{row.telefono}} </td>
          </ng-container>

          <ng-container matColumnDef="activo">
            <th mat-header-cell *matHeaderCellDef> Estado </th>
            <td mat-cell *matCellDef="let row">
              <span [class]="row.activo ? 'status-active' : 'status-inactive'">
                {{ row.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef> Acciones </th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button color="primary" (click)="editSupplier(row)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteSupplier(row)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>

      <ng-template #noData>
        <div class="empty-state">
          <mat-icon>local_shipping</mat-icon>
          <p>No hay proveedores registrados.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .admin-container { padding: 20px; max-width: 1000px; margin: 0 auto; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .full-width { width: 100%; margin-bottom: 10px; }
    .form-row { display: flex; gap: 15px; }
    .half-width { flex: 1; margin-bottom: 10px; }
    .mb-4 { margin-bottom: 20px; }
    .mb-2 { margin-bottom: 10px; }
    .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
    .empty-state { text-align: center; padding: 40px; color: #777; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 10px; }
    .status-active { color: green; font-weight: bold; }
    .status-inactive { color: red; font-weight: bold; }
    .fade-in { animation: fadeIn 0.3s ease-in; }
    table { width: 100%; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ProveedoresComponent implements OnInit {
  proveedores: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['nombre', 'contacto', 'email', 'telefono', 'activo', 'acciones'];
  
  supplierForm!: FormGroup;
  showForm = false;
  isEditing = false;
  editingId: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private logisticsService: LogisticsService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.supplierForm = this.fb.group({
      nombre: ['', Validators.required],
      contacto: [''],
      email: ['', Validators.email],
      telefono: [''],
      direccion: [''],
      sitioWeb: [''],
      activo: [true]
    });
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.logisticsService.getProveedores().subscribe(data => {
      this.proveedores = data || [];
      this.dataSource.data = this.proveedores;
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.supplierForm.reset({ activo: true });
      this.isEditing = false;
      this.editingId = null;
    }
  }

  editSupplier(supplier: any) {
    this.isEditing = true;
    this.editingId = supplier._id;
    this.supplierForm.patchValue(supplier);
    this.showForm = true;
  }

  onSubmit() {
    if (this.supplierForm.invalid) return;
    this.isLoading = true;

    if (this.isEditing && this.editingId) {
      this.logisticsService.updateProveedor(this.editingId, this.supplierForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Proveedor actualizado correctamente');
          this.loadSuppliers(); 
        },
        error: () => this.handleError()
      });
    } else {
      this.logisticsService.createProveedor(this.supplierForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Proveedor creado correctamente');
          this.proveedores.push(res.proveedor);
          this.loadSuppliers();
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

  deleteSupplier(supplier: any) {
    Swal.fire({
      title: '¿Eliminar proveedor?',
      text: "Se eliminará permanentemente",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.logisticsService.deleteProveedor(supplier._id).subscribe({
          next: () => {
             this.loadSuppliers();
             Swal.fire('Eliminado', 'El proveedor ha sido eliminado.', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }
}
