import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

import { SalesService } from '../../../core/services/admin/sales.service';
import { ProductsService } from '../../../core/services/admin/products.service';

@Component({
  selector: 'app-admin-ofertas',
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
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  template: `
    <div class="admin-container">
      <div class="header-section">
        <h2>Gestión de Ofertas</h2>
        <button mat-raised-button color="primary" (click)="toggleForm()">
          <mat-icon>{{ showForm ? 'remove' : 'add' }}</mat-icon>
          {{ showForm ? 'Cancelar' : 'Nueva Oferta' }}
        </button>
      </div>

      <!-- Formulario -->
      <mat-card *ngIf="showForm" class="mb-4 fade-in">
        <mat-card-header>
          <mat-card-title>{{ isEditing ? 'Editar Oferta' : 'Agregar Oferta' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="offerForm" (ngSubmit)="onSubmit()">
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre de la Oferta</mat-label>
              <input matInput formControlName="nombre">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción</mat-label>
              <textarea matInput formControlName="descripcion" rows="2"></textarea>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Tipo de Descuento</mat-label>
                <mat-select formControlName="tipoDescuento">
                  <mat-option value="porcentaje">Porcentaje (%)</mat-option>
                  <mat-option value="monto_fijo">Monto Fijo ($)</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Valor del Descuento</mat-label>
                <input matInput type="number" formControlName="valorDescuento">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Fecha de Inicio</mat-label>
                <input matInput [matDatepicker]="pickerInicio" formControlName="fechaInicio">
                <mat-datepicker-toggle matSuffix [for]="pickerInicio"></mat-datepicker-toggle>
                <mat-datepicker #pickerInicio></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Fecha de Fin</mat-label>
                <input matInput [matDatepicker]="pickerFin" formControlName="fechaFin">
                <mat-datepicker-toggle matSuffix [for]="pickerFin"></mat-datepicker-toggle>
                <mat-datepicker #pickerFin></mat-datepicker>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Aplicar a Categorías (Opcional)</mat-label>
                <mat-select formControlName="categorias" multiple>
                  <mat-option *ngFor="let cat of categoriasDisponibles" [value]="cat._id">
                    {{ cat.nombre }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Aplicar a Productos (Opcional)</mat-label>
                <mat-select formControlName="productos" multiple>
                  <mat-option *ngFor="let prod of productosDisponibles" [value]="prod._id">
                    {{ prod.nombre }} ({{ prod.skuBase || prod.sku }})
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="mb-2">
              <mat-slide-toggle formControlName="activo" color="primary">Oferta Activa</mat-slide-toggle>
            </div>

            <div class="actions">
              <button mat-stroked-button type="button" (click)="toggleForm()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="offerForm.invalid || isLoading">
                {{ isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Lista -->
      <div class="offers-grid" *ngIf="ofertas.length > 0; else noData">
        <mat-card *ngFor="let oferta of ofertas" class="offer-card">
          <mat-card-header>
             <mat-card-title>{{ oferta.nombre }} <span *ngIf="!oferta.activo" class="badge-inactive">(Inactiva)</span></mat-card-title>
             <mat-card-subtitle>{{ oferta.tipoDescuento === 'porcentaje' ? '%' : '$' }} {{ oferta.valorDescuento }} de descuento</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ oferta.descripcion }}</p>
            <p><strong>Vigencia:</strong> {{ oferta.fechaInicio | date }} al {{ oferta.fechaFin | date }}</p>
            <div class="associations">
              <p *ngIf="oferta.categorias?.length"><strong>Categorías:</strong> {{ oferta.categorias.length }}</p>
              <p *ngIf="oferta.productos?.length"><strong>Productos:</strong> {{ oferta.productos.length }}</p>
            </div>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-icon-button color="primary" (click)="editOffer(oferta)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteOffer(oferta)">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <ng-template #noData>
        <div class="empty-state">
          <mat-icon>local_offer</mat-icon>
          <p>No hay ofertas registradas.</p>
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
    .offers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .offer-card { display: flex; flex-direction: column; justify-content: space-between; }
    .associations { margin-top: 10px; font-size: 0.9em; color: #555; }
    .associations p { margin: 2px 0; }
    .badge-inactive { color: red; font-size: 0.8em; font-weight: normal; }
    .fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class OfertasComponent implements OnInit {
  ofertas: any[] = [];
  categoriasDisponibles: any[] = [];
  productosDisponibles: any[] = [];
  
  offerForm!: FormGroup;
  showForm = false;
  isEditing = false;
  editingId: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService,
    private productsService: ProductsService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.offerForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      tipoDescuento: ['porcentaje', Validators.required],
      valorDescuento: [0, [Validators.required, Validators.min(0)]],
      productos: [[]],
      categorias: [[]],
      fechaInicio: [new Date(), Validators.required],
      fechaFin: [new Date(), Validators.required],
      activo: [true]
    });
    this.loadData();
  }

  loadData() {
    this.salesService.getOfertas().subscribe(data => {
      this.ofertas = data || [];
    });
    
    this.productsService.getCategorias().subscribe(data => {
       this.categoriasDisponibles = data || [];
    });
    
    this.productsService.getProductos().subscribe(data => {
       this.productosDisponibles = data || [];
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.offerForm.reset({ 
        tipoDescuento: 'porcentaje', 
        valorDescuento: 0, 
        activo: true, 
        productos: [], 
        categorias: [],
        fechaInicio: new Date(),
        fechaFin: new Date()
      });
      this.isEditing = false;
      this.editingId = null;
    }
  }

  editOffer(offer: any) {
    this.isEditing = true;
    this.editingId = offer._id;
    
    const formData = { ...offer };
    if (offer.productos && offer.productos.length > 0) {
      formData.productos = offer.productos.map((p: any) => p._id || p);
    }
    if (offer.categorias && offer.categorias.length > 0) {
      formData.categorias = offer.categorias.map((c: any) => c._id || c);
    }

    this.offerForm.patchValue(formData);
    this.showForm = true;
  }

  onSubmit() {
    if (this.offerForm.invalid) return;
    this.isLoading = true;

    if (this.isEditing && this.editingId) {
      this.salesService.updateOferta(this.editingId, this.offerForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Oferta actualizada correctamente');
          this.loadData(); 
        },
        error: () => this.handleError()
      });
    } else {
      this.salesService.createOferta(this.offerForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Oferta creada correctamente');
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

  deleteOffer(offer: any) {
    Swal.fire({
      title: '¿Eliminar oferta?',
      text: "No podrás revertir esto",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.salesService.deleteOferta(offer._id).subscribe({
          next: () => {
             this.loadData();
             Swal.fire('Eliminado', 'La oferta ha sido eliminada.', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }
}
