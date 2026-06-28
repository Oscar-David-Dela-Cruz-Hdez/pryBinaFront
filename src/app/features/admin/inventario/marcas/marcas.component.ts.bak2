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
  selector: 'app-admin-marcas',
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
  templateUrl: './marcas.component.html',
  styleUrls: ['./marcas.component.css']
})
export class MarcasComponent implements OnInit {
  marcas: any[] = [];
  marcaForm!: FormGroup;
  showForm = false;
  isEditing = false;
  editingId: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
  ) { }

  ngOnInit(): void {
    this.marcaForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['']
    });
    this.loadData();
  }

  loadData() {
    this.productsService.getMarcas().subscribe(data => {
      this.marcas = data || [];
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.marcaForm.reset();
      this.isEditing = false;
      this.editingId = null;
    }
  }

  editMarca(marca: any) {
    this.isEditing = true;
    this.editingId = marca._id;
    this.marcaForm.patchValue(marca);
    this.showForm = true;
  }

  onSubmit() {
    if (this.marcaForm.invalid) return;
    this.isLoading = true;

    if (this.isEditing && this.editingId) {
      this.productsService.updateMarca(this.editingId, this.marcaForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Marca actualizada');
          this.loadData();
        },
        error: () => this.handleError()
      });
    } else {
      this.productsService.createMarca(this.marcaForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Marca creada');
          if (res.marca) { this.marcas.push(res.marca); }
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

  deleteMarca(marca: any) {
    Swal.fire({
      title: '¿Eliminar marca?',
      text: "No podrás revertir esto",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productsService.deleteMarca(marca._id).subscribe({
          next: () => {
             this.marcas = this.marcas.filter(m => m._id !== marca._id);
             Swal.fire('Eliminado', 'La marca ha sido eliminada.', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }
}
