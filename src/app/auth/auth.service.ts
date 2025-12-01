import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, Subscription, timer } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import Swal from 'sweetalert2';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject: BehaviorSubject<boolean>;
  private userNameSubject: BehaviorSubject<string | null>;
  private apiUrl = 'http://localhost:4000/api/usuarios';
  //private apiUrl = 'https://prybinaback.onrender.com/api/usuarios';

  //se agrega aqui eso de la expiracion de inicio de sesion
  private inactivityTimer: Subscription | null = null;
  //////////////////////////////////////////////////////////////////
  //mover a 15 cuando lo suba a vercel
  private readonly INACTIVITY_TIMEOUT = 1 * 60 * 1000; //15 minutos, para pruebas poner 1 a un minuto

  constructor(
    private router: Router,
    private http: HttpClient,
    private socialAuthService: SocialAuthService
  ) {
    const token = localStorage.getItem('user_token');
    //console.log("Token en constructor:", token);
    const nombre = localStorage.getItem('user_name');
    this.isLoggedInSubject = new BehaviorSubject<boolean>(!!token);
    this.userNameSubject = new BehaviorSubject<string | null>(nombre);

    if (token) {
      this.startInactivityTimer();
    }
  }
  //controlar los tiempos de inicio de sesion
  //codigo 2
  /* private startInactivityTimer(): void {
    this.stopInactivityTimer();

    this.inactivityTimer = timer(this.INACTIVITY_TIMEOUT).subscribe(() => {
      this.logout();
    });
  } */
  //codigo 3
  private startInactivityTimer(): void {
    this.stopInactivityTimer();

    // Mostrar una alerta 5 segundos antes de que expire la sesión
    const warningTime = this.INACTIVITY_TIMEOUT - 5000;

    timer(warningTime).subscribe(() => {
      Swal.fire({
        icon: 'warning',
        title: 'Sesión a punto de expirar',
        text: 'Tu sesión está a punto de expirar debido a inactividad. ¿Quieres mantenerla activa?',
        showCancelButton: true,
        confirmButtonText: 'Sí, mantener activa',
        cancelButtonText: 'No, cerrar sesión',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          this.resetInactivityTimer(); // Reiniciar el temporizador si el usuario quiere mantener la sesión activa
        } else {
          this.logout(); // Cerrar sesión si el usuario no responde o elige cerrar sesión
        }
      });
    });

    // Cerrar sesión si no hay actividad
    this.inactivityTimer = timer(this.INACTIVITY_TIMEOUT).subscribe(() => {
      Swal.fire({
        icon: 'info',
        title: 'Sesión expirada',
        text: 'Tu sesión ha expirado debido a inactividad.',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        this.logout();
      });
    });
  }


  private stopInactivityTimer(): void {
    if (this.inactivityTimer) {
      this.inactivityTimer.unsubscribe();
      this.inactivityTimer = null;
    }
  }

  private resetInactivityTimer(): void {
    this.stopInactivityTimer();
    this.startInactivityTimer();
  }

  //controlar los tiempos de inicio de sesion


  // el username nombre de usuario, me da flojera escribir todo pero todo lo que dice check()availability es que verifica si el username, correo o telefono esta disponible
  public checkUsernameAvailability(username: string): Observable<{ available: boolean }> {
    return this.http.post<{ available: boolean }>(`${this.apiUrl}/check-username`, { username });
  }

  // correo
  public checkEmailAvailability(email: string): Observable<{ available: boolean }> {
    return this.http.post<{ available: boolean }>(`${this.apiUrl}/check-email`, { email });
  }

  // telefono
  public checkPhoneAvailability(telefono: string): Observable<{ available: boolean }> {
    return this.http.post<{ available: boolean }>(`${this.apiUrl}/check-phone`, { telefono });
  }

  public get isLoggedIn$(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  public get currentUserName$(): Observable<string | null> {
    return this.userNameSubject.asObservable();
  }

  // --- Lógica de 2FA ---
  //codigo 1, sirve
  /* public loginStep1_requestEmailCode(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  } */

  //codigo 2, experimental

  public loginStep1_requestEmailCode(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      catchError(err => {
        if (err.status === 429) {
          throw err; // Dejar que el componente maneje este error
        }
        return throwError(() => new Error(err.error?.error || 'Error al iniciar sesión'));
      })
    );
  }

  //sirve, codigo 1
  /* public loginStep2_verifyCode(email: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-2fa`, { email, code });
  } */

  //codigo 2, experimental
  public loginStep2_verifyCode(email: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-2fa`, { email, code }).pipe(
      catchError(err => {
        if (err.status === 401) {
          this.logout();
        }
        return throwError(() => new Error(err.error?.error || 'Error al verificar el código'));
      })
    );
  }


  // --- NUEVA FUNCIÓN PARA GOOGLE ---
  public loginWithGoogle(idToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/google-login`, { idToken: idToken });
  }
  // ---------------------------------

  // --- Funciones Locales de Auth ---
  login(token: string, rol: string, nombre: string): void {
    localStorage.setItem('user_token', token);
    localStorage.setItem('user_rol', rol);
    localStorage.setItem('user_name', nombre);
    this.isLoggedInSubject.next(true);
    this.userNameSubject.next(nombre);
    //control de tiempo
    this.resetInactivityTimer();
  }

  logout(): void {
    console.log("Cerrando sesión...");
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_rol');
    localStorage.removeItem('user_name');
    //control de tiempo
    this.stopInactivityTimer();
    //control de tiempo
    this.socialAuthService.signOut();
    this.isLoggedInSubject.next(false);
    this.userNameSubject.next(null);
    this.router.navigate(['/login']);
  }

  // --- Métodos de Perfil ---
  public getToken(): string | null {
    return localStorage.getItem('user_token');
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    });
  }

  public getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil`, {
      headers: this.getAuthHeaders()
    });
  }

  public updateProfile(userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil`, userData, {
      headers: this.getAuthHeaders()
    });
  }

  public updateLocalUserName(newName: string): void {
    localStorage.setItem('user_name', newName);
    this.userNameSubject.next(newName);
  }

  updatePassword(data: { currentPassword: string, newPassword: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-password`, data, { headers: this.getAuthHeaders() });
  }

  updateSecret(data: { preguntaSecreta: string, respuestaSecreta: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-secret`, data, { headers: this.getAuthHeaders() });
  }

}


