import { Component, OnInit, OnDestroy } from '@angular/core'; // Añadir OnDestroy
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs'; // Importar Subscription
import { HttpClient } from '@angular/common/http'; // Importar HttpClient

// Importaciones de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Importar SweetAlert2
import Swal from 'sweetalert2';

// 1. Importar el servicio de Google
import {
  SocialAuthService,
  GoogleLoginProvider,
  GoogleSigninButtonModule // El módulo del botón
} from '@abacritt/angularx-social-login';

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
    MatProgressSpinnerModule,
    GoogleSigninButtonModule // <-- Módulo del botón de Google
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy { // Implementar OnDestroy

  step = 1;
  loginForm!: FormGroup;
  codeForm!: FormGroup;
  isLoading = false;
  showPassword = false;

  // Suscripción para el login de Google
  private authSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    // Inyectar el servicio social
    private socialAuthService: SocialAuthService
  ) {}

  ngOnInit(): void {
    // Formulario de Email/Pass
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    // Formulario de Código 2FA
    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    // Suscribirse a los cambios de estado de Google
    this.authSubscription = this.socialAuthService.authState.subscribe(user => {

      // --- ¡¡¡AQUÍ ESTÁ LA CORRECIÓN!!! ---
      // Comprobamos que 'user' Y 'user.idToken' existan
      if (user && user.idToken) {
      // ------------------------------------

        // ¡El usuario inició sesión en Google!
        // Enviamos el 'idToken' de Google a nuestro backend
        this.isLoading = true; // Activar spinner
        this.authService.loginWithGoogle(user.idToken).subscribe({
          next: (data) => {
            // ¡Nuestro backend respondió con NUESTRO token!
            this.isLoading = false;
            this.authService.login(data.token, data.rol, data.nombre);

            // Redirigimos
            if (data.rol === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/']);
            }
          },
          error: (err) => {
            this.isLoading = false;
            Swal.fire({ icon: 'error', title: 'Error de Google', text: err.error?.error || 'No se pudo iniciar sesión con Google' });
          }
        });
      }
    });
  }

  // Limpiar la suscripción
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
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

    this.authService.loginStep1_requestEmailCode(this.loginForm.value)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Verifica tu correo',
            text: response.mensaje || 'Te hemos enviado un código de 6 dígitos.'
          });
          this.step = 2;
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
    const email = this.email.value;
    const code = this.code!.value;

    this.authService.loginStep2_verifyCode(email, code)
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          Swal.fire({ icon: 'success', title: 'Inicio de sesión exitoso' });

          this.authService.login(data.token, data.rol, data.nombre);

          if (data.rol === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
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
