import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service'; // Ajusta la ruta si es necesario
import Swal from 'sweetalert2';

// Importaciones de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. Inicializa el formulario (vacío al principio)
    this.profileForm = this.fb.group({
      nombre: ['', Validators.required],
      ap: ['', Validators.required],
      am: ['', Validators.required],
      username: ['', Validators.required],
      email: [{ value: '', disabled: true }], // El email no se puede editar
      telefono: ['', Validators.required]
    });

    // 2. Carga los datos del perfil desde el backend
    this.authService.getProfile().subscribe({
      next: (userData) => {
        // 3. Rellena el formulario con los datos
        this.profileForm.patchValue(userData);
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudo cargar tu información de perfil.', 'error');
        this.router.navigate(['/']);
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    // `getRawValue()` obtiene los valores incluyendo los campos deshabilitados (como el email)
    const formData = this.profileForm.getRawValue();

    this.authService.updateProfile(formData).subscribe({
      next: (response) => {
        Swal.fire('¡Éxito!', 'Tu perfil ha sido actualizado.', 'success');
        // Opcional: actualizar el nombre en el authService si cambió
        this.authService.updateLocalUserName(response.usuario.nombre);
        this.router.navigate(['/']);
      },
      error: (err) => {
        Swal.fire('Error', err.error?.error || 'No se pudo actualizar el perfil.', 'error');
      }
    });
  }
}

