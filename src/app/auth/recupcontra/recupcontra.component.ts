import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// Importaciones de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Importar SweetAlert2
import Swal from 'sweetalert2';

// Validador personalizado para comparar contraseñas
function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const nuevaPassword = control.get('nuevaPassword')?.value;
  const confirmarPassword = control.get('confirmarPassword')?.value;
  return nuevaPassword === confirmarPassword ? null : { passwordsDoNotMatch: true };
}

@Component({
  selector: 'app-recupcontra', // CAMBIO: Selector coincide con el nombre del componente
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
    MatProgressBarModule
  ],
  templateUrl: './recupcontra.component.html', // CAMBIO: Ruta del archivo coincide
  styleUrls: ['./recupcontra.component.css']  // CAMBIO: Ruta del archivo coincide
})
// CAMBIO: El nombre de la clase ahora es 'RecupcontraComponent'
export class RecupcontraComponent implements OnInit {
  step = 0;
  preguntaSecreta = "";
  showPassword = false;
  recoveryForm!: FormGroup;
  isLoading = false;

  // Regex de tu código de React
  private passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{12,}$/;

  // CORRECCIÓN: Se añade la propiedad 'apiUrl' que faltaba
  private apiUrl = 'http://localhost:4000/api/usuarios';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      respuestaSecreta: ['', [Validators.required]],
      nuevaPassword: ['', [Validators.required, Validators.pattern(this.passwordRegex)]],
      confirmarPassword: ['', [Validators.required]]
    }, { validators: passwordsMatchValidator });
  }

  // --- Getters para acceso fácil en HTML ---
  get email() { return this.recoveryForm.get('email'); }
  get respuestaSecreta() { return this.recoveryForm.get('respuestaSecreta'); }
  get nuevaPassword() { return this.recoveryForm.get('nuevaPassword'); }
  get confirmarPassword() { return this.recoveryForm.get('confirmarPassword'); }

  // --- Lógica de Pasos ---

  // PASO 0 -> 1: Verificar Correo y Obtener Pregunta
  verificarCorreo(): void {
    if (this.email?.invalid) {
      this.email?.markAsTouched();
      return;
    }
    this.isLoading = true;

    // CORRECCIÓN: Se usa 'this.apiUrl'
    this.http.post<any>(`${this.apiUrl}/verificar-correo`, { email: this.email?.value })
      .subscribe({
        next: (res) => {
          // CORRECCIÓN: Se usa 'this.apiUrl'
          this.http.post<any>(`${this.apiUrl}/obtener-pregunta`, { email: this.email?.value })
            .subscribe({
              next: (preguntaRes) => {
                this.preguntaSecreta = preguntaRes.preguntaSecreta;
                this.isLoading = false;
                this.step = 1;
              },
              error: (err) => this.handleError(err, 'No se pudo obtener la pregunta secreta.')
            });
        },
        error: (err) => this.handleError(err, 'El correo no fue encontrado.')
      });
  }

  // PASO 1 -> 2: Verificar Respuesta Secreta
  verificarRespuesta(): void {
    if (this.respuestaSecreta?.invalid) {
      this.respuestaSecreta?.markAsTouched();
      return;
    }
    this.isLoading = true;

    // CORRECCIÓN: Se usa 'this.apiUrl'
    this.http.post<any>(`${this.apiUrl}/verificar-respuesta`, {
      email: this.email?.value,
      respuesta: this.respuestaSecreta?.value
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.step = 2;
      },
      error: (err) => this.handleError(err, 'La respuesta secreta es incorrecta.')
    });
  }

  // PASO 2 -> 3: Cambiar Contraseña
  cambiarContrasena(): void {
    const passControl = this.recoveryForm.get('nuevaPassword');
    const confirmControl = this.recoveryForm.get('confirmarPassword');

    if (passControl?.invalid || confirmControl?.invalid || this.recoveryForm.hasError('passwordsDoNotMatch')) {
      passControl?.markAsTouched();
      confirmControl?.markAsTouched();
      return;
    }
    this.isLoading = true;

    // CORRECCIÓN: Se usa 'this.apiUrl'
    this.http.post<any>(`${this.apiUrl}/cambiar-contrasena`, {
      email: this.email?.value,
      nuevaPassword: this.nuevaPassword?.value
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.step = 3;
        Swal.fire({
          icon: 'success',
          title: 'Contraseña Cambiada',
          text: res.mensaje || 'Tu contraseña ha sido actualizada con éxito.'
        });
      },
      error: (err) => this.handleError(err, 'No se pudo cambiar la contraseña.')
    });
  }

  // --- Funciones de Utilidad ---

  private handleError(err: any, defaultMessage: string): void {
    this.isLoading = false;
    const errorMessage = err.error?.error || err.message || defaultMessage;
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMessage
    });
  }

  goBack(step: number): void {
    this.step = step;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
