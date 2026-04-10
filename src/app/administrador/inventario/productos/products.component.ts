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
import { MatTooltipModule } from '@angular/material/tooltip';

import Swal from 'sweetalert2';

import { ProductsService } from '../../../core/services/admin/products.service';
import { FamiliasService } from '../../../core/services/admin/familias.service';

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
    MatTooltipModule
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  displayedColumns: string[] = ['imagen', 'nombre', 'precioNormal', 'stock', 'activo', 'acciones'];
  dataSource!: MatTableDataSource<any>;

  productForm!: FormGroup;
  showForm = false;
  isEditing = false;
  editingId: string | null = null;
  isLoading = false;

  marcas: any[] = [];
  familias: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private familiasService: FamiliasService
  ) { }

  ngOnInit(): void {
    this.productForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precioNormal: [0, Validators.required],
      skuNormal: [''],
      precioMayoreo: [0],
      skuMayoreo: [''],
      precioCaja: [0],
      skuCaja: [''],
      stock: [0, Validators.required],
      marca: ['', Validators.required],
      familia: [{ value: '', disabled: true }],
      imagenUrl: [''],
      activo: [true]
    });

    this.productForm.get('marca')?.valueChanges.subscribe(marcaId => {
      this.familias = [];
      this.productForm.get('familia')?.setValue('');
      if (marcaId) {
        this.productForm.get('familia')?.enable();
        this.loadFamilias(marcaId);
      } else {
        this.productForm.get('familia')?.disable();
      }
    });

    this.loadData();
  }

  loadData() {
    this.productsService.getProductos().subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data || []);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar los productos.' })
    });

    this.productsService.getMarcas().subscribe({
      next: (data) => this.marcas = data || [],
      error: () => console.log('No se pudieron cargar marcas')
    });
  }

  loadFamilias(marcaId: string) {
    this.familiasService.getFamilias({ marca: marcaId }).subscribe({
      next: (data) => this.familias = data || [],
      error: () => console.log('No se pudieron cargar familias')
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
      this.productForm.reset({ activo: true, precioNormal: 0, precioMayoreo: 0, precioCaja: 0, stock: 0 });
      this.productForm.get('familia')?.disable();
      this.isEditing = false;
      this.editingId = null;
    }
  }

  editProduct(product: any) {
    this.isEditing = true;
    this.editingId = product._id;
    
    // Si ya tiene marca, cargamos sus familias antes de hacer patch para que no se bloquee el valor
    const dataToPatch = { ...product };
    dataToPatch.marca = product.marca?._id || product.marca || '';
    dataToPatch.familia = product.familia?._id || product.familia || '';

    // Manejo de compatibilidad en caso que existan campos viejos
    dataToPatch.precioNormal = product.precioNormal ?? product.precioBase ?? product.precio ?? 0;
    dataToPatch.stock = product.stock ?? product.stockTotal ?? 0;
    dataToPatch.imagenUrl = product.imagenUrl ?? product.imagenUrlPrincipal ?? '';

    // Asegurar explícitamente el mapeo de los SKU
    dataToPatch.skuNormal = product.skuNormal ?? product.skuBase ?? '';
    dataToPatch.skuMayoreo = product.skuMayoreo ?? '';
    dataToPatch.skuCaja = product.skuCaja ?? '';

    if (dataToPatch.marca) {
      this.productForm.get('familia')?.enable();
      this.loadFamilias(dataToPatch.marca);
    } else {
      this.productForm.get('familia')?.disable();
    }

    this.productForm.patchValue(dataToPatch);
    this.showForm = true;
  }

  onSubmit() {
    if (this.productForm.invalid) return;
    this.isLoading = true;

    const payload = { ...this.productForm.value };

    if (this.isEditing && this.editingId) {
      this.productsService.updateProducto(this.editingId, payload).subscribe({
        next: (res) => {
          this.finishSubmit('Producto actualizado correctamente');
          this.loadData();
        },
        error: () => this.handleError()
      });
    } else {
      this.productsService.createProducto(payload).subscribe({
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
    Swal.fire({ icon: 'success', title: '¡Guardado!', text: msg, timer: 2000, showConfirmButton: false });
    this.toggleForm();
  }

  handleError() {
    this.isLoading = false;
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar los cambios.' });
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
