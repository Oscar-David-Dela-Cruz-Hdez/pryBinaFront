import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
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
    MatListModule
  ],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
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
  ) { }

  ngOnInit(): void {
    this.catForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['']
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
    Swal.fire({ icon: 'success', title: '¡Guardado!', text: msg, timer: 2000, showConfirmButton: false });
    this.toggleForm();
  }

  handleError() {
    this.isLoading = false;
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar los cambios.' });
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
