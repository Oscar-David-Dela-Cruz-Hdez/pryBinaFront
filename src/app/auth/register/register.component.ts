import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError, of, take, filter, timeout } from 'rxjs';
import { delay } from 'rxjs/operators';

// Importaciones de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

import Swal from 'sweetalert2';

///aqui entra la validacion de los campos del formulario telefono, correo y nombre de usuario
function usernameAvailabilityValidator(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) {
      return of(null);
    }
    return control.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      take(1),
      switchMap(username => {
        return authService.checkUsernameAvailability(username).pipe(
          catchError(() => of({ available: true })) // Si hay error, asumimos que está disponible
        );
      }),
      map(response => response.available ? null : { usernameTaken: true }),
      catchError(() => of(null))
    );
  };
}

function emailAvailabilityValidator(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) {
      return of(null);
    }
    return control.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      take(1),
      switchMap(email => {
        return authService.checkEmailAvailability(email).pipe(
          catchError(() => of({ available: true }))
        );
      }),
      map(response => response.available ? null : { emailTaken: true }),
      catchError(() => of(null))
    );
  };
}

function phoneAvailabilityValidator(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) {
      return of(null);
    }
    return control.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      take(1),
      switchMap(telefono => {
        return authService.checkPhoneAvailability(telefono).pipe(
          catchError(() => of({ available: true }))
        );
      }),
      map(response => response.available ? null : { phoneTaken: true }),
      catchError(() => of(null))
    );
  };
}


//esto es para validar las contraseñas esas

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordsDoNotMatch: true };
}

function noSequentialNumbers(control: AbstractControl): ValidationErrors | null {
  const password = control.value;
  if (!password) return null;

  const sequentialRegex = /(0123456789|12345678910|9876543210|0987654321|1234567890|1111111111|2222222222|3333333333|4444444444|5555555555|6666666666|7777777777|8888888888|9999999999)/;
  return sequentialRegex.test(password) ? { sequentialNumbers: true } : null;
}

function noPersonalData(control: AbstractControl): ValidationErrors | null {
  const formGroup = control.parent?.parent;
  if (!formGroup) return null;

  const password = control.value;
  if (!password) return null;

  const nombre = formGroup.get('step1.nombre')?.value?.toLowerCase();
  const ap = formGroup.get('step1.ap')?.value?.toLowerCase();
  const am = formGroup.get('step1.am')?.value?.toLowerCase();

  const passwordLower = password.toLowerCase();

  if (nombre && passwordLower.includes(nombre)) {
    return { containsPersonalData: true };
  }
  if (ap && passwordLower.includes(ap)) {
    return { containsPersonalData: true };
  }
  if (am && passwordLower.includes(am)) {
    return { containsPersonalData: true };
  }

  return null;
}



@Component({
  selector: 'app-register',
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
    MatStepperModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  showPassword = false;

  //private apiUrl = 'http://localhost:4000/api/usuarios/register';
  private apiUrl = 'https://prybinaback.onrender.com/api/usuarios/register';

  // Regex de tu código de React
  private soloLetras = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/;
  private letrasYNumeros = /^[a-zA-Z0-9]+$/;
  private passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{12,}$/;
  private telefonoRegex = /^[0-9]{10}$/;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) { }



  getFormGroupErrors(groupName: string): string[] {
    const errors: string[] = [];
    const group = this.registerForm.get(groupName) as FormGroup;

    // Mapa para traducir nombres de controles a texto legible
    const fieldNames: { [key: string]: string } = {
      nombre: 'Nombre',
      ap: 'Apellido Paterno',
      am: 'Apellido Materno',
      username: 'Usuario',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      telefono: 'Teléfono',
      preguntaSecreta: 'Pregunta Secreta',
      respuestaSecreta: 'Respuesta Secreta',
      terminos: 'Términos y Condiciones'
    };

    if (!group) return errors;

    Object.keys(group.controls).forEach(controlName => {
      const control = group.get(controlName);
      const friendlyName = fieldNames[controlName] || controlName;
      if (control?.invalid) {
        const controlErrors = control.errors;
        if (controlErrors) {
          let errorMessage = '';

          // --- Validaciones Estándar ---
          if (controlErrors['required']) {
            errorMessage = `El campo "<strong>${friendlyName}</strong>" es obligatorio.`;
          } else if (controlErrors['pattern']) {
            errorMessage = `El campo "<strong>${friendlyName}</strong>" tiene un formato inválido.`;
          } else if (controlErrors['email']) {
            errorMessage = `El campo "<strong>${friendlyName}</strong>" debe ser un correo válido.`;

            // --- Validaciones de Contraseña ---
          } else if (controlErrors['passwordsDoNotMatch']) {
            errorMessage = `Las contraseñas no coinciden.`;
          } else if (controlErrors['sequentialNumbers']) {
            errorMessage = `La contraseña no puede contener secuencias numéricas obvias.`;
          } else if (controlErrors['containsPersonalData']) {
            errorMessage = `La contraseña no puede contener tus datos personales.`;

            // --- Validaciones Asíncronas (Backend) ---
          } else if (controlErrors['usernameTaken']) {
            errorMessage = `El <strong>${friendlyName}</strong> ya está en uso.`;
          } else if (controlErrors['emailTaken']) {
            errorMessage = `El <strong>${friendlyName}</strong> ya está registrado.`;
          } else if (controlErrors['phoneTaken']) {
            errorMessage = `El <strong>${friendlyName}</strong> ya está registrado.`;
          }
          if (errorMessage) {
            errors.push(errorMessage);
          }
        }
      }
    });

    return errors;
  }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      step1: this.fb.group({
        nombre: ['', [Validators.required, Validators.pattern(this.soloLetras)]],
        ap: ['', [Validators.required, Validators.pattern(this.soloLetras)]],
        am: ['', [Validators.required, Validators.pattern(this.soloLetras)]]
      }),
      step2: this.fb.group({
        username: ['', {
          validators: [Validators.required, Validators.pattern(this.letrasYNumeros)],
          asyncValidators: [usernameAvailabilityValidator(this.authService)]
        }],
        email: ['', {
          validators: [Validators.required, Validators.email],
          asyncValidators: [emailAvailabilityValidator(this.authService)]
        }],
        password: ['', [Validators.required, Validators.pattern(this.passwordRegex), noSequentialNumbers, noPersonalData]],
        confirmPassword: ['', Validators.required]
      }, { validators: passwordsMatchValidator }),
      step3: this.fb.group({
        telefono: ['', {
          validators: [Validators.required, Validators.pattern(this.telefonoRegex)],
          asyncValidators: [phoneAvailabilityValidator(this.authService)]
        }],
        preguntaSecreta: ['', Validators.required],
        respuestaSecreta: ['', [Validators.required, Validators.pattern(this.soloLetras)]],
        terminos: [false, Validators.requiredTrue]
      })
    });
  }

  getControl(groupName: string, controlName: string) {
    return this.registerForm.get(groupName)?.get(controlName);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  /**/
  validateStep(stepName: string, stepper: MatStepper): void {
    const stepGroup = this.registerForm.get(stepName);
    if (!stepGroup) return;

    // 1. SI ESTÁ VERIFICANDO (PENDING)
    if (stepGroup.status === 'PENDING') {
      Swal.fire({
        title: 'Verificando disponibilidad...',
        text: 'Por favor espera un momento.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Suscripción con seguridad (Timeout)
      const subscription = stepGroup.statusChanges.pipe(
        filter(status => status !== 'PENDING'),
        take(1),
        timeout(10000) // Aumenta el tiempo de espera a 10 segundos
      ).subscribe({
        next: () => {
          subscription.unsubscribe();
          Swal.close();
          this.validateStep(stepName, stepper); // Validar de nuevo
        },
        error: (err) => {
          subscription.unsubscribe();
          Swal.close();
          if (stepGroup.status !== 'PENDING') {
            this.validateStep(stepName, stepper); // Validar de nuevo
          } else {
            Swal.fire('Tiempo de espera agotado', 'La verificación está tardando demasiado. Intenta de nuevo.', 'warning');
          }
        }
      });
      return;
    }

    // 2. SI HAY ERRORES (INVALID)
    if (stepGroup.invalid) {
      stepGroup.markAllAsTouched();
      const errors = this.getFormGroupErrors(stepName);
      if (errors.length > 0) {
        Swal.fire({
          icon: 'error',
          title: 'Campos incompletos o inválidos',
          html: errors.join('<br>'),
        });
        return;
      }
    }

    // 3. VALIDACIONES MANUALES (Contraseñas)
    if (stepName === 'step2') {
      const passwordControl = stepGroup.get('password');
      if (passwordControl?.hasError('sequentialNumbers')) {
        Swal.fire({
          icon: 'error',
          title: 'Contraseña inválida',
          text: 'La contraseña no puede contener secuencias numéricas obvias.',
        });
        return;
      }
      if (passwordControl?.hasError('containsPersonalData')) {
        Swal.fire({
          icon: 'error',
          title: 'Contraseña inválida',
          text: 'La contraseña no puede contener tu nombre o apellidos.',
        });
        return;
      }
    }

    // 4. SI TODO ESTÁ CORRECTO -> AVANZAR
    stepper.next();
  }

  /* */


  onSubmit(): void {
    if (!this.registerForm.get('step3.terminos')?.value) {
      Swal.fire({
        icon: 'error',
        title: 'Términos no aceptados',
        text: 'Debes aceptar los términos y condiciones para registrarte.',
      });
      return;
    }

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Formulario incompleto',
        text: 'Por favor, revisa todos los pasos y corrige los errores.',
      });
      return;
    }

    const formData = {
      ...this.registerForm.value.step1,
      ...this.registerForm.value.step2,
      ...this.registerForm.value.step3
    };
    delete formData.confirmPassword;
    delete formData.terminos;

    this.http.post<any>(this.apiUrl, formData).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: '¡Bienvenido! Por favor, inicia sesión.',
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        const errorMessage = err.error?.error || 'Error al registrar usuario';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
        });
      }
    });
  }
}
