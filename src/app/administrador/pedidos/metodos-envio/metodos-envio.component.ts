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

import { LogisticsService } from '../../../core/services/admin/logistics.service';

@Component({
  selector: 'app-admin-metodos-envio',
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
  templateUrl: './metodos-envio.component.html',
  styleUrls: ['./metodos-envio.component.css']
})
export class MetodosEnvioComponent implements OnInit {
  metodos: any[] = [];
  shippingForm!: FormGroup;
  showForm = false;
  isEditing = false;
  editingId: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private logisticsService: LogisticsService,
  ) { }

  ngOnInit(): void {
    this.shippingForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      costo: [0, Validators.required],
      tipo: ['nacional'],
      tiempoEstimado: [''],
      activo: [true]
    });
    this.loadMethods();
  }

  loadMethods() {
    this.logisticsService.getMetodosEnvio().subscribe(data => {
      this.metodos = data || [];
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.shippingForm.reset({ activo: true, costo: 0, tipo: 'nacional' });
      this.isEditing = false;
      this.editingId = null;
    }
  }

  editMethod(method: any) {
    this.isEditing = true;
    this.editingId = method._id;
    this.shippingForm.patchValue(method);
    this.showForm = true;
  }

  onSubmit() {
    if (this.shippingForm.invalid) return;
    this.isLoading = true;

    if (this.isEditing && this.editingId) {
      this.logisticsService.updateMetodoEnvio(this.editingId, this.shippingForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Método actualizado correctamente');
          this.loadMethods(); 
        },
        error: () => this.handleError()
      });
    } else {
      this.logisticsService.createMetodoEnvio(this.shippingForm.value).subscribe({
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
    Swal.fire({ icon: 'success', title: '¡Guardado!', text: msg, timer: 2000, showConfirmButton: false });
    this.toggleForm();
  }

  handleError() {
    this.isLoading = false;
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar los cambios.' });
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
        this.logisticsService.deleteMetodoEnvio(method._id).subscribe({
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
