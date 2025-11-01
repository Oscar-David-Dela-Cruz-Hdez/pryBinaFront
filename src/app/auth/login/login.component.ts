import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// Importaciones de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Para 'cargando'

// Importar SweetAlert2
import Swal from 'sweetalert2';

// Importar el Servicio de Auth
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
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
    MatProgressSpinnerModule // Añadir spinner
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  // --- NUEVA LÓGICA ---
  step = 1; // 1 = email/pass, 2 = código 2FA
  loginForm!: FormGroup; // Formulario para Paso 1
  codeForm!: FormGroup;  // Formulario para Paso 2
  isLoading = false;
  showPassword = false;
  // --------------------

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService // Usamos el servicio
  ) {}

  ngOnInit(): void {
    // Formulario para Paso 1: Email y Contraseña
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    // Formulario para Paso 2: Código 2FA
    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  // --- Getters para los formularios ---
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
  get code() { return this.codeForm.get('code'); }

  // --- PASO 1: Enviar Email y Contraseña ---
  onSubmitEmailPassword(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    // Llamamos al Paso 1 del servicio
    this.authService.loginStep1_requestEmailCode(this.loginForm.value)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          // Mostramos alerta de éxito y pasamos al siguiente paso
          Swal.fire({
            icon: 'success',
            title: 'Verifica tu correo',
            text: response.mensaje || 'Te hemos enviado un código de 6 dígitos.'
          });
          this.step = 2; // Cambiamos al formulario de código
        },
        error: (err) => {
          this.isLoading = false;
          const errorMessage = err.error?.error || 'Credenciales incorrectas';
          Swal.fire({ icon: 'error', title: 'Error', text: errorMessage });
        }
      });
  }

  // --- PASO 2: Enviar el Código 2FA ---
  onSubmitCode(): void {
    if (this.codeForm.invalid || !this.email?.value) {
      this.codeForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const email = this.email.value; // Obtenemos el email del primer formulario
    const code = this.code!.value;   // Obtenemos el código del segundo formulario

    // Llamamos al Paso 2 del servicio
    this.authService.loginStep2_verifyCode(email, code)
      .subscribe({
        next: (data) => {
          // ¡ÉXITO! El backend devolvió el token y los datos
          this.isLoading = false;
          Swal.fire({ icon: 'success', title: 'Inicio de sesión exitoso' });

          // Usamos la función de login local del servicio para guardar todo
          this.authService.login(data.token, data.rol, data.nombre);

          // Redirigimos
          if (data.rol === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']); // Redirigir a la página principal
          }
        },
        error: (err) => {
          this.isLoading = false;
          const errorMessage = err.error?.error || 'Código incorrecto o expirado';
          Swal.fire({ icon: 'error', title: 'Error', text: errorMessage });
        }
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
