import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-direcciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './direcciones.component.html',
  styleUrls: ['./direcciones.component.css']
})
export class DireccionesComponent implements OnInit {
  direcciones: any[] = [];
  form!: FormGroup;
  mostrarFormulario = false;
  editandoId = '';
  guardando = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      alias: ['', Validators.required],
      calle: ['', Validators.required],
      colonia: [''],
      ciudad: ['', Validators.required],
      estado: ['', Validators.required],
      cp: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      telefono: ['', Validators.required],
      referencias: [''],
      predeterminada: [false]
    });
    this.cargar();
  }

  cargar(): void {
    this.authService.getDirecciones().subscribe({
      next: data => this.direcciones = data || [],
      error: () => Swal.fire('Error', 'No se pudieron cargar tus direcciones.', 'error')
    });
  }

  nueva(): void {
    this.editandoId = '';
    this.form.reset({ predeterminada: this.direcciones.length === 0 });
    this.mostrarFormulario = true;
  }

  editar(direccion: any): void {
    this.editandoId = direccion._id;
    this.form.patchValue(direccion);
    this.mostrarFormulario = true;
  }

  cerrar(): void {
    this.mostrarFormulario = false;
    this.editandoId = '';
    this.form.reset({ predeterminada: false });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando = true;
    const request = this.editandoId
      ? this.authService.updateDireccion(this.editandoId, this.form.value)
      : this.authService.createDireccion(this.form.value);
    request.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrar();
        this.cargar();
        Swal.fire('Dirección guardada', 'Ya podrás seleccionarla al realizar una compra.', 'success');
      },
      error: error => {
        this.guardando = false;
        Swal.fire('Error', error.error?.error || 'No se pudo guardar la dirección.', 'error');
      }
    });
  }

  async eliminar(direccion: any): Promise<void> {
    const result = await Swal.fire({ title: '¿Eliminar dirección?', text: direccion.alias, icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar', cancelButtonText: 'Conservar' });
    if (!result.isConfirmed) return;
    this.authService.deleteDireccion(direccion._id).subscribe({ next: () => this.cargar(), error: () => Swal.fire('Error', 'No se pudo eliminar.', 'error') });
  }

  predeterminada(direccion: any): void {
    this.authService.setDireccionPredeterminada(direccion._id).subscribe({ next: data => this.direcciones = data });
  }
}
