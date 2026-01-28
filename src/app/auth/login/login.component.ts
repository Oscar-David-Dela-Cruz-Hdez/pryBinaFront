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
import Swal from 'sweetalert2';
import {
  SocialAuthService,
  GoogleLoginProvider,
  GoogleSigninButtonModule
} from '@abacritt/angularx-social-login';

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
    GoogleSigninButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  step = 1;
  loginForm!: FormGroup;
  codeForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  private authSubscription!: Subscription;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private socialAuthService: SocialAuthService
  ) { }

  ngOnInit(): void {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    this.authSubscription = this.socialAuthService.authState.subscribe(user => {

      if (user && user.idToken) {
        // ------------------------------------
        this.isLoading = true;
        this.authService.loginWithGoogle(user.idToken).subscribe({
          next: (data) => {
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

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
  get code() { return this.codeForm.get('code'); }

  //codigo 2, experimental
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
          if (err.status === 429) {
            Swal.fire({
              icon: 'error',
              title: 'Demasiados intentos fallidos',
              text: err.error?.error || 'Demasiados intentos fallidos. Por favor, intenta de nuevo más tarde.'
            });
          } else {
            const errorMessage = err.error?.error || 'Credenciales incorrectas';
            Swal.fire({ icon: 'error', title: 'Error', text: errorMessage });
          }
        }
      });
  }
  //codigo 2, experimental
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
          if (errorMessage === 'Token inválido.') {
            this.authService.logout();
          }
        }
      });
  }


  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
