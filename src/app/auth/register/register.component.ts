import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // 1. Importar Router
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // 2. Importar HttpClient

// Importaciones de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

// 3. Importar SweetAlert2
import Swal from 'sweetalert2';

// Validador personalizado para comparar contraseñas
function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordsDoNotMatch: true };
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
    // HttpClientModule se provee globalmente, no se importa aquí
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  showPassword = false;

  // 4. URL de tu API de backend
  private apiUrl = 'http://localhost:4000/api/usuarios/register';

  // Regex de tu código de React
  private soloLetras = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/;
  private letrasYNumeros = /^[a-zA-Z0-9]+$/;
  private passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{12,}$/;
  private telefonoRegex = /^[0-9]{10}$/;

  // 5. Inyectar HttpClient y Router en el constructor
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      step1: this.fb.group({
        nombre: ['', [Validators.required, Validators.pattern(this.soloLetras)]],
        ap: ['', [Validators.required, Validators.pattern(this.soloLetras)]],
        am: ['', [Validators.required, Validators.pattern(this.soloLetras)]]
      }),
      step2: this.fb.group({
        username: ['', [Validators.required, Validators.pattern(this.letrasYNumeros)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.pattern(this.passwordRegex)]],
        confirmPassword: ['', Validators.required]
      }, { validators: passwordsMatchValidator }),
      step3: this.fb.group({
        telefono: ['', [Validators.required, Validators.pattern(this.telefonoRegex)]],
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
validateStep(stepName: string): void {
  const stepGroup = this.registerForm.get(stepName);
  if (stepGroup?.invalid) {
    stepGroup?.markAllAsTouched(); // Marca todos los campos como "touched" para mostrar errores
    Swal.fire({
      icon: 'error',
      title: 'Campos incompletos',
      text: 'Por favor, completa todos los campos de este paso antes de continuar.',
    });
    return; // Detiene la ejecución si el paso es inválido
  }
}
/* */
/*
  // 6. Lógica de 'onSubmit' (la parte que faltaba)
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      // Opcional: Alerta de error de validación
      Swal.fire({
        icon: 'error',
        title: 'Formulario incompleto',
        text: 'Por favor, revisa todos los pasos y corrige los errores.',
      });
      return;
    }

    // Combinamos los datos de los 3 pasos
    const formData = {
      ...this.registerForm.value.step1,
      ...this.registerForm.value.step2,
      ...this.registerForm.value.step3
    };

    // Eliminamos 'confirmPassword' y 'terminos'
    delete formData.confirmPassword;
    delete formData.terminos;

    // Lógica para enviar al backend (la traducción de tu 'fetch')
    this.http.post<any>(this.apiUrl, formData).subscribe({
      // Caso de éxito
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: '¡Bienvenido! Por favor, inicia sesión.',
        }).then(() => {
          this.router.navigate(['/login']); // Redirigir al login
        });
      },
      // Caso de error
      error: (err) => {
        // err.error.error es el formato común de error de tu backend
        const errorMessage = err.error?.error || 'Error al registrar usuario';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
        });
      }
    });
  } */

  onSubmit(): void {
  // Valida específicamente los términos y condiciones
    if (!this.registerForm.get('step3.terminos')?.value) {
    Swal.fire({
      icon: 'error',
      title: 'Términos no aceptados',
      text: 'Debes aceptar los términos y condiciones para registrarte.',
    });
    return;
  }

  // Valida el formulario completo
  if (this.registerForm.invalid) {
    this.registerForm.markAllAsTouched();
    Swal.fire({
      icon: 'error',
      title: 'Formulario incompleto',
      text: 'Por favor, revisa todos los pasos y corrige los errores.',
    });
    return;
  }


  // Si todo está válido, combina los datos y envía al backend
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
