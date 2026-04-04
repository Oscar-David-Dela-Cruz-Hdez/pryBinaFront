import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';

import { FamiliasService } from '../../../core/services/admin/familias.service';
import { ProductsService } from '../../../core/services/admin/products.service';

@Component({
  selector: 'app-admin-familias',
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
    MatSelectModule
  ],
  templateUrl: './familias.component.html',
  styleUrls: ['./familias.component.css']
})
export class FamiliasComponent implements OnInit {
  familias: any[] = [];
  marcas: any[] = [];
  familiaForm!: FormGroup;
  showForm = false;
  isEditing = false;
  editingId: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private familiasService: FamiliasService,
    private productsService: ProductsService
  ) { }

  ngOnInit(): void {
    this.familiaForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      marca: ['', Validators.required]
    });
    this.loadData();
  }

  loadData() {
    this.familiasService.getFamilias().subscribe(data => {
      this.familias = data || [];
    });
    this.productsService.getMarcas().subscribe(data => {
      this.marcas = data || [];
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.familiaForm.reset();
      this.isEditing = false;
      this.editingId = null;
    }
  }

  editFamilia(familia: any) {
    this.isEditing = true;
    this.editingId = familia._id;

    // Handle nested marca object if populated
    const patchData = { ...familia };
    patchData.marca = familia.marca?._id || familia.marca || '';

    this.familiaForm.patchValue(patchData);
    this.showForm = true;
  }

  onSubmit() {
    if (this.familiaForm.invalid) return;
    this.isLoading = true;

    if (this.isEditing && this.editingId) {
      this.familiasService.updateFamilia(this.editingId, this.familiaForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Familia actualizada');
          this.loadData();
        },
        error: () => this.handleError()
      });
    } else {
      this.familiasService.createFamilia(this.familiaForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Familia creada');
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

  deleteFamilia(familia: any) {
    Swal.fire({
      title: '¿Eliminar familia?',
      text: "No podrás revertir esto",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.familiasService.deleteFamilia(familia._id).subscribe({
          next: () => {
             this.familias = this.familias.filter(f => f._id !== familia._id);
             Swal.fire('Eliminado', 'La familia ha sido eliminada.', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }

  getMarcaName(marcaId: string | any): string {
    const id = typeof marcaId === 'object' ? marcaId?._id : marcaId;
    const marca = this.marcas.find(m => m._id === id);
    return marca ? marca.nombre : 'Sin marca';
  }
}
