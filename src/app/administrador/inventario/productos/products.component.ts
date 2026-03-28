import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
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
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.productForm = this.fb.group({
      nombre: ['', Validators.required],
      skuBase: [''],
      precioBase: [0, Validators.required],
      stockTotal: [0, Validators.required],
      categoria: [''],
      imagenUrlPrincipal: [''],
      descripcion: [''],
      tieneVariantes: [false],
      variantes: this.fb.array([]),
      activo: [true]
    });

    this.loadData();
  }

  get variantes() {
    return this.productForm.get('variantes') as FormArray;
  }

  getAtributos(variantIndex: number): FormArray {
    return this.variantes.at(variantIndex).get('atributos') as FormArray;
  }

  addVariante() {
    const varianteForm = this.fb.group({
      sku: [''],
      precio: [0, Validators.required],
      stock: [0],
      imagenUrl: [''],
      atributos: this.fb.array([])
    });
    this.variantes.push(varianteForm);
  }

  removeVariante(index: number) {
    this.variantes.removeAt(index);
  }

  addAtributo(variantIndex: number) {
    const atributoForm = this.fb.group({
      nombre: ['', Validators.required],
      valor: ['', Validators.required]
    });
    this.getAtributos(variantIndex).push(atributoForm);
  }

  removeAtributo(variantIndex: number, attrIndex: number) {
    this.getAtributos(variantIndex).removeAt(attrIndex);
  }

  loadData() {
    this.productsService.getProductos().subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data || []);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: () => this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 3000 })
    });

    this.productsService.getCategorias().subscribe({
      next: (data) => this.categorias = data || [],
      error: () => console.log('No se pudieron cargar categorías')
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
      this.productForm.reset({ activo: true, precioBase: 0, stockTotal: 0, tieneVariantes: false });
      this.variantes.clear();
      this.isEditing = false;
      this.editingId = null;
    }
  }

  editProduct(product: any) {
    this.isEditing = true;
    this.editingId = product._id;
    
    this.variantes.clear();
    
    const formData = { ...product };
    // Compatibility fallbacks
    formData.precioBase = product.precioBase ?? product.precio ?? 0;
    formData.stockTotal = product.stockTotal ?? product.stock ?? 0;
    formData.skuBase = product.skuBase ?? product.sku ?? '';
    formData.imagenUrlPrincipal = product.imagenUrlPrincipal ?? product.imagenUrl ?? '';
    
    if (product.categoria && typeof product.categoria === 'object') {
      formData.categoria = product.categoria._id;
    }
    
    if (product.variantes && product.variantes.length > 0) {
      product.variantes.forEach((v: any) => {
        const atributosArray = this.fb.array([] as any[]) as FormArray;
        if (v.atributos) {
          Object.keys(v.atributos).forEach(key => {
            atributosArray.push(this.fb.group({
              nombre: [key, Validators.required],
              valor: [v.atributos[key], Validators.required]
            }));
          });
        }

        this.variantes.push(this.fb.group({
          sku: [v.sku || ''],
          precio: [v.precio || 0, Validators.required],
          stock: [v.stock || 0],
          imagenUrl: [v.imagenUrl || ''],
          atributos: atributosArray
        }));
      });
      formData.tieneVariantes = true;
    } else {
      formData.tieneVariantes = false;
    }

    this.productForm.patchValue(formData);
    this.showForm = true;
  }

  onSubmit() {
    if (this.productForm.invalid) return;
    this.isLoading = true;

    // Map `variantes` array to `variantesGenerar` for the backend
    const payload = { ...this.productForm.value };
    if (payload.tieneVariantes) {
      payload.variantesGenerar = payload.variantes.map((v: any) => {
        const _v = { ...v };
        const attrObj: any = {};
        if (_v.atributos && Array.isArray(_v.atributos)) {
          _v.atributos.forEach((attr: any) => {
            if (attr.nombre && attr.valor) {
              attrObj[attr.nombre] = attr.valor;
            }
          });
        }
        _v.atributos = attrObj;
        return _v;
      });
    } else {
      payload.variantesGenerar = [];
    }

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
