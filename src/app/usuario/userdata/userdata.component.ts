import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import Swal from 'sweetalert2';

// Importaciones de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-userdata',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './userdata.component.html',
  styleUrls: ['./userdata.component.css']
})
export class UserdataComponent implements OnInit {
  userdataForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userdataForm = this.fb.group({
      nombre: ['', Validators.required],
      ap: [''],
      am: [''],
      username: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      telefono: ['', Validators.required]
    });

    this.authService.getProfile().subscribe({
      next: (userData) => {
        this.userdataForm.patchValue(userData);
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudo cargar tu información de perfil.', 'error');
      }
    });
  }

  onSubmit(): void {
    if (this.userdataForm.invalid) {
      this.userdataForm.markAllAsTouched();
      return;
    }

    const formData = this.userdataForm.getRawValue();
    this.authService.updateProfile(formData).subscribe({
      next: (response) => {
        Swal.fire('¡Éxito!', 'Tu perfil ha sido actualizado.', 'success');
        this.authService.updateLocalUserName(response.usuario.nombre);
      },
      error: (err) => {
        Swal.fire('Error', err.error?.error || 'No se pudo actualizar el perfil.', 'error');
      }
    });
  }
}