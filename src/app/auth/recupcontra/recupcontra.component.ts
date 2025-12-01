import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import Swal from 'sweetalert2';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const nuevaPassword = control.get('nuevaPassword')?.value;
  const confirmarPassword = control.get('confirmarPassword')?.value;
  return nuevaPassword === confirmarPassword ? null : { passwordsDoNotMatch: true };
}
@Component({
  selector: 'app-recupcontra',
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
  templateUrl: './recupcontra.component.html',
  styleUrls: ['./recupcontra.component.css']
})

export class RecupcontraComponent implements OnInit {
  step = 0;
  preguntaSecreta = "";
  showPassword = false;
  recoveryForm!: FormGroup;
  isLoading = false;

  private passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{12,}$/;

  //private apiUrl = 'https://prybinaback.onrender.com/api/usuarios';
  private apiUrl = 'http://localhost:4000/api/usuarios';
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      respuestaSecreta: ['', [Validators.required]],
      nuevaPassword: ['', [Validators.required, Validators.pattern(this.passwordRegex)]],
      confirmarPassword: ['', [Validators.required]]
    }, { validators: passwordsMatchValidator });
  }

  get email() { return this.recoveryForm.get('email'); }
  get respuestaSecreta() { return this.recoveryForm.get('respuestaSecreta'); }
  get nuevaPassword() { return this.recoveryForm.get('nuevaPassword'); }
  get confirmarPassword() { return this.recoveryForm.get('confirmarPassword'); }

  //opcion 1 la actual
  /*   verificarCorreo(): void {
      if (this.email?.invalid) {
        this.email?.markAsTouched();
        return;
      }
      this.isLoading = true;
      this.http.post<any>(`${this.apiUrl}/verificar-correo`, { email: this.email?.value })
        .subscribe({
          next: (res) => {
            //se simula?
            this.http.post<any>(`${this.apiUrl}/obtener-pregunta`, { email: this.email?.value })
              .subscribe({
                next: (preguntaRes) => {
                  this.preguntaSecreta = preguntaRes.preguntaSecreta;
                  this.isLoading = false;
                  this.step = 1;
                  this.cdr.detectChanges();
                },
                error: (err) => {
                  this.isLoading = false;
                  this.handleError(err, 'No se pudo obtener la pregunta secreta.');
                }
              });
          },
          error: (err) => {
            this.isLoading = false;
            this.handleError(err, 'Se ha enviado un mensaje de recuperacion');
          }
        });
    } */

  //opcion 2 la nueva que tiene el numero de intentos
  verificarCorreo(): void {
    if (this.email?.invalid) {
      this.email?.markAsTouched();
      return;
    }
    this.isLoading = true;
    this.http.post<any>(`${this.apiUrl}/verificar-correo`, { email: this.email?.value })
      .subscribe({
        next: (res) => {
          // Verificar correo fue exitoso, ahora obtener la pregunta secreta
          this.http.post<any>(`${this.apiUrl}/obtener-pregunta`, { email: this.email?.value })
            .subscribe({
              next: (preguntaRes) => {
                this.preguntaSecreta = preguntaRes.preguntaSecreta;
                this.isLoading = false;
                this.step = 1;
                this.cdr.detectChanges();
                // Mostrar mensaje de éxito solo después de obtener la pregunta secreta
                Swal.fire({
                  icon: 'info',
                  title: 'Solicitud recibida',
                  text: 'Se ha enviado un mensaje de recuperación.'
                });
              },
              error: (err) => {
                this.isLoading = false;
                if (err.status === 429) {
                  Swal.fire({
                    icon: 'error',
                    title: 'Demasiados intentos',
                    text: 'Has excedido el número de intentos de recuperación. Por favor, intenta de nuevo más tarde.'
                  });
                } else {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo obtener la pregunta secreta.'
                  });
                }
              }
            });
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 429) {
            Swal.fire({
              icon: 'error',
              title: 'Demasiados intentos',
              text: 'Has excedido el número de intentos de recuperación. Por favor, intenta de nuevo más tarde.'
            });
          } else {
            Swal.fire({
              icon: 'info',
              title: 'Solicitud recibida',
              text: 'Si el correo está registrado, se ha enviado un mensaje de recuperación.'
            });
          }
        }
      });
  }






  verificarRespuesta(): void {
    if (this.respuestaSecreta?.invalid) {
      this.respuestaSecreta?.markAsTouched();
      return;
    }
    this.isLoading = true;

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


  cambiarContrasena(): void {
    const passControl = this.recoveryForm.get('nuevaPassword');
    const confirmControl = this.recoveryForm.get('confirmarPassword');
    if (passControl?.invalid || confirmControl?.invalid || this.recoveryForm.hasError('passwordsDoNotMatch')) {
      passControl?.markAsTouched();
      confirmControl?.markAsTouched();
      return;
    }
    this.isLoading = true;
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

  //codigo 1
  /*   private handleError(err: any, defaultMessage: string): void {
      this.isLoading = false;
      //const errorMessage = err.error?.error || err.message || defaultMessage;
      Swal.fire({
        icon: 'success',
        title: 'Exito',
        text: 'Se envio un correo con instrucciones para cambiar tu contraseña'
      });
    } */

  //nuevo codigo
  private handleError(err: any, defaultMessage: string): void {
    this.isLoading = false;
    if (err.status === 429) {
      Swal.fire({
        icon: 'error',
        title: 'Demasiados intentos',
        text: 'Has excedido el número de intentos de recuperación. Por favor, intenta de nuevo más tarde.'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: defaultMessage
      });
    }
  }


  goBack(step: number): void {
    this.step = step;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
