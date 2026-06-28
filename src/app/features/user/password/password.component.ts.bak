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
  selector: 'app-password',
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
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css']
})
export class PasswordComponent implements OnInit {
  passwordForm!: FormGroup;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      currentPassword: [''],
      newPassword: ['', [Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{12,}$/)]],
      confirmNewPassword: ['']
    }, { validators: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(fg: FormGroup) {
    return fg.get('newPassword')?.value === fg.get('confirmNewPassword')?.value
      ? null
      : { passwordsDoNotMatch: true };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const formData = this.passwordForm.value;
    this.authService.updatePassword(formData).subscribe({
      next: (response) => {
        Swal.fire('¡Éxito!', 'Tu contraseña ha sido actualizada.', 'success');
      },
      error: (err) => {
        Swal.fire('Error', err.error?.error || 'No se pudo actualizar la contraseña.', 'error');
      }
    });
  }
}
