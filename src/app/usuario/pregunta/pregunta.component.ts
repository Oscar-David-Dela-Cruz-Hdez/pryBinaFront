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
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-pregunta',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './pregunta.component.html',
  styleUrls: ['./pregunta.component.css']
})
export class PreguntaComponent implements OnInit {
  secretForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.secretForm = this.fb.group({
      preguntaSecreta: ['', Validators.required],
      respuestaSecreta: ['', Validators.required]
    });

    this.authService.getProfile().subscribe({
      next: (userData) => {
        if (userData.preguntaSecreta) {
          this.secretForm.patchValue({
            preguntaSecreta: userData.preguntaSecreta
          });
        }
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudo cargar tu información de perfil.', 'error');
      }
    });
  }

  onSubmit(): void {
    if (this.secretForm.invalid) {
      this.secretForm.markAllAsTouched();
      return;
    }

    const formData = this.secretForm.value;
    this.authService.updateSecret(formData).subscribe({
      next: (response) => {
        Swal.fire('¡Éxito!', 'Tu pregunta y respuesta secreta han sido actualizadas.', 'success');
      },
      error: (err) => {
        Swal.fire('Error', err.error?.error || 'No se pudo actualizar la pregunta y respuesta secreta.', 'error');
      }
    });
  }
}
