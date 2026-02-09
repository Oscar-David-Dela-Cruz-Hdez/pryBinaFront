import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

import { ProductsService } from '../../../core/services/admin/products.service';
import { LogisticsService } from '../../../core/services/admin/logistics.service';

@Component({
  selector: 'app-admin-productos',
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
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  template: `
    <div class="admin-container">
      <div class="header-section">
        <h2>Gestión de Productos</h2>
        <button mat-raised-button color="primary" (click)="toggleForm()">
          <mat-icon>{{ showForm ? 'remove' : 'add' }}</mat-icon>
          {{ showForm ? 'Cancelar' : 'Nuevo Producto' }}
        </button>
      </div>

      <!-- Formulario -->
      <mat-card *ngIf="showForm" class="mb-4 fade-in">
        <mat-card-header>
          <mat-card-title>{{ isEditing ? 'Editar Producto' : 'Agregar Producto' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="nombre">
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>SKU / Código</mat-label>
                <input matInput formControlName="sku">
              </mat-form-field>
            </div>

            <div class="form-row">
               <mat-form-field appearance="outline" class="half-width">
                <mat-label>Precio</mat-label>
                <span matPrefix>$ &nbsp;</span>
                <input matInput type="number" formControlName="precio">
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Stock</mat-label>
                <input matInput type="number" formControlName="stock">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Categoría</mat-label>
                <mat-select formControlName="categoria">
                  <mat-option *ngFor="let cat of categorias" [value]="cat._id || cat.nombre">
                    {{ cat.nombre }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Proveedor</mat-label>
                 <mat-select formControlName="proveedor">
                  <mat-option *ngFor="let prov of proveedores" [value]="prov._id">
                    {{ prov.nombre }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>URL Imagen Principal</mat-label>
              <input matInput formControlName="imagenUrl" placeholder="https://example.com/producto.jpg">
            </mat-form-field>
             <img *ngIf="productForm.get('imagenUrl')?.value" [src]="productForm.get('imagenUrl')?.value" class="preview-img mb-2" alt="Vista previa">

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción</mat-label>
              <textarea matInput formControlName="descripcion" rows="3"></textarea>
            </mat-form-field>

            <div class="mb-2">
              <mat-slide-toggle formControlName="activo" color="primary">Producto Activo</mat-slide-toggle>
            </div>

            <div class="actions">
              <button mat-stroked-button type="button" (click)="toggleForm()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="productForm.invalid || isLoading">
                {{ isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Filtro y Tabla -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Filtrar productos</mat-label>
        <input matInput (keyup)="applyFilter($event)" placeholder="Buscar por nombre, SKU..." #input>
      </mat-form-field>

      <div class="mat-elevation-z8">
        <table mat-table [dataSource]="dataSource" matSort>
          
          <!-- Imagen -->
          <ng-container matColumnDef="imagen">
            <th mat-header-cell *matHeaderCellDef> Imagen </th>
            <td mat-cell *matCellDef="let row">
              <img [src]="row.imagenUrl || 'assets/no-image.png'" class="thumb-img">
            </td>
          </ng-container>

          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Nombre </th>
            <td mat-cell *matCellDef="let row"> 
              <div class="col-flex">
                <span>{{row.nombre}}</span>
                <span class="sub-text">{{row.sku}}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="precio">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Precio </th>
            <td mat-cell *matCellDef="let row"> {{row.precio | currency}} </td>
          </ng-container>

          <ng-container matColumnDef="stock">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Stock </th>
            <td mat-cell *matCellDef="let row">
              <span [class.low-stock]="row.stock < 5">{{row.stock}}</span>
            </td>
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
              <button mat-icon-button color="primary" (click)="editProduct(row)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteProduct(row)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
           <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" colspan="6">No se encontraron datos para "{{input.value}}"</td>
          </tr>
        </table>
        
        <mat-paginator [pageSizeOptions]="[10, 25, 50]" aria-label="Select page of products"></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .full-width { width: 100%; margin-bottom: 10px; }
    .form-row { display: flex; gap: 15px; }
    .half-width { flex: 1; margin-bottom: 10px; }
    .mb-4 { margin-bottom: 20px; }
    .mb-2 { margin-bottom: 10px; }
    .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
    .status-active { color: green; font-weight: bold; }
    .status-inactive { color: red; font-weight: bold; }
    .thumb-img { width: 50px; height: 50px; object-fit: cover; border-radius: 4px; }
    .col-flex { display: flex; flex-direction: column; }
    .sub-text { font-size: 0.8rem; color: #777; }
    .low-stock { color: red; font-weight: bold; }
    .preview-img { max-width: 200px; border-radius: 4px; display: block; }
    table { width: 100%; }
    .fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ProductsComponent implements OnInit {
  displayedColumns: string[] = ['imagen', 'nombre', 'precio', 'stock', 'activo', 'acciones'];
  dataSource!: MatTableDataSource<any>;
  
  productForm!: FormGroup;
  showForm = false;
  isEditing = false;
  editingId: string | null = null;
  isLoading = false;

  categorias: any[] = [];
  proveedores: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private logisticsService: LogisticsService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.productForm = this.fb.group({
      nombre: ['', Validators.required],
      sku: [''],
      precio: [0, Validators.required],
      stock: [0, Validators.required],
      categoria: [''],
      proveedor: [''],
      imagenUrl: [''],
      descripcion: [''],
      activo: [true]
    });

    this.loadData();
  }

  loadData() {
    // Cargar productos
    this.productsService.getProductos().subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data || []);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: () => this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 3000 })
    });

    // Cargar categorías (si existe endpoint, si no, array vacío por ahora)
    this.productsService.getCategorias().subscribe({
      next: (data) => this.categorias = data || [],
      error: () => console.log('No se pudieron cargar categorías')
    });

    // Cargar proveedores
    this.logisticsService.getProveedores(true).subscribe({
      next: (data) => this.proveedores = data || [],
      error: () => console.log('No se pudieron cargar proveedores')
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.productForm.reset({ activo: true, precio: 0, stock: 0 });
      this.isEditing = false;
      this.editingId = null;
    }
  }

  editProduct(product: any) {
    this.isEditing = true;
    this.editingId = product._id;
    // Mapear campos si es necesario (ej: categoria._id o categoria nombre)
    const formData = { ...product };
    if (product.categoria && typeof product.categoria === 'object') {
        formData.categoria = product.categoria._id;
    }
    if (product.proveedor && typeof product.proveedor === 'object') {
        formData.proveedor = product.proveedor._id;
    }
    this.productForm.patchValue(formData);
    this.showForm = true;
  }

  onSubmit() {
    if (this.productForm.invalid) return;
    this.isLoading = true;

    if (this.isEditing && this.editingId) {
      this.productsService.updateProducto(this.editingId, this.productForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Producto actualizado correctamente');
          this.loadData();
        },
        error: () => this.handleError()
      });
    } else {
      this.productsService.createProducto(this.productForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Producto creado correctamente');
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

  deleteProduct(product: any) {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: "Se eliminará permanentemente",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productsService.deleteProducto(product._id).subscribe({
          next: () => {
             this.loadData();
             Swal.fire('Eliminado', 'El producto ha sido eliminado.', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }
}
