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

import Swal from 'sweetalert2';

import { SalesService } from '../../../core/services/admin/sales.service';

@Component({
  selector: 'app-admin-carrusel',
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
    MatListModule
  ],
  templateUrl: './carrusel.component.html',
  styleUrls: ['./carrusel.component.css']
})
export class CarruselComponent implements OnInit {
  carruseles: any[] = [];
  carruselForm!: FormGroup;
  showForm = false;
  isEditing = false;
  editingId: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService,
  ) { }

  ngOnInit(): void {
    this.carruselForm = this.fb.group({
      titulo: [''],
      imagenUrl: ['', Validators.required],
      enlaceDestino: [''],
      orden: [0],
      activo: [true]
    });
    this.loadCarruseles();
  }

  loadCarruseles() {
    this.salesService.getCarruseles().subscribe(data => {
      this.carruseles = data || [];
      this.carruseles.sort((a, b) => a.orden - b.orden);
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.carruselForm.reset({ activo: true, orden: 0 });
      this.isEditing = false;
      this.editingId = null;
    }
  }

  editBanner(item: any) {
    this.isEditing = true;
    this.editingId = item._id;
    this.carruselForm.patchValue(item);
    this.showForm = true;
  }

  onSubmit() {
    if (this.carruselForm.invalid) return;
    this.isLoading = true;

    if (this.isEditing && this.editingId) {
      this.salesService.updateCarrusel(this.editingId, this.carruselForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Banner actualizado correctamente');
          this.loadCarruseles(); 
        },
        error: () => this.handleError()
      });
    } else {
      this.salesService.createCarrusel(this.carruselForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Banner creado correctamente');
          this.loadCarruseles(); 
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

  deleteBanner(item: any) {
    Swal.fire({
      title: '¿Eliminar banner?',
      text: "No podrás revertir esto",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.salesService.deleteCarrusel(item._id).subscribe({
          next: () => {
             this.loadCarruseles();
             Swal.fire('Eliminado', 'El banner ha sido eliminado.', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }
}
