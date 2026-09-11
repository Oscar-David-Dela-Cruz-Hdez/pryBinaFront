import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, Subscription, timer, fromEvent, merge } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { throttleTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject: BehaviorSubject<boolean>;
  private userNameSubject: BehaviorSubject<string | null>;
  private userRoleSubject: BehaviorSubject<string | null>;
  private apiUrl = 'https://prybinaback.onrender.com/api/usuarios';

  private inactivityTimer: Subscription | null = null;
  private warningTimer: Subscription | null = null;
  private activitySubscription: Subscription | null = null;
  private readonly INACTIVITY_TIMEOUT = 15 * 60 * 1000;

  constructor(
    private router: Router,
    private http: HttpClient,
    private socialAuthService: SocialAuthService
  ) {
    const token = localStorage.getItem('user_token');
    const nombre = localStorage.getItem('user_name');
    const rol = localStorage.getItem('user_rol');
    this.isLoggedInSubject = new BehaviorSubject<boolean>(!!token);
    this.userNameSubject = new BehaviorSubject<string | null>(nombre);
    this.userRoleSubject = new BehaviorSubject<string | null>(rol);

    if (token) {
      this.initActivityListeners();
      this.startInactivityTimer();
    }
  }

  private initActivityListeners(): void {
    if (this.activitySubscription) return;

    const events$ = merge(
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'keydown'),
      fromEvent(document, 'click'),
      fromEvent(document, 'scroll')
    );

    this.activitySubscription = events$.pipe(
      throttleTime(5000)
    ).subscribe(() => {
      if (this.isLoggedInSubject.getValue() && !document.querySelector('.swal2-container')) {
        this.resetInactivityTimer();
      }
    });
  }

  private startInactivityTimer(): void {
    this.stopInactivityTimer();

    const warningTime = this.INACTIVITY_TIMEOUT - 60000;

    this.warningTimer = timer(warningTime).subscribe(async () => {
      const Swal = (await import('sweetalert2')).default;
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
          this.resetInactivityTimer();
        } else {
          this.logout();
        }
      });
    });

    this.inactivityTimer = timer(this.INACTIVITY_TIMEOUT).subscribe(async () => {
      const Swal = (await import('sweetalert2')).default;
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
    if (this.warningTimer) {
      this.warningTimer.unsubscribe();
      this.warningTimer = null;
    }
  }

  private resetInactivityTimer(): void {
    this.stopInactivityTimer();
    this.startInactivityTimer();
  }

  public checkUsernameAvailability(username: string): Observable<{ available: boolean }> {
    return this.http.post<{ available: boolean }>(`${this.apiUrl}/check-username`, { username });
  }

  public checkEmailAvailability(email: string): Observable<{ available: boolean }> {
    return this.http.post<{ available: boolean }>(`${this.apiUrl}/check-email`, { email });
  }

  public checkPhoneAvailability(telefono: string): Observable<{ available: boolean }> {
    return this.http.post<{ available: boolean }>(`${this.apiUrl}/check-phone`, { telefono });
  }

  public get isLoggedIn$(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  public get currentUserName$(): Observable<string | null> {
    return this.userNameSubject.asObservable();
  }

  public get userRole$(): Observable<string | null> {
    return this.userRoleSubject.asObservable();
  }

  public loginStep1_requestEmailCode(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      catchError(err => {
        if (err.status === 429) {
          throw err;
        }
        return throwError(() => new Error(err.error?.error || 'Error al iniciar sesión'));
      })
    );
  }

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

  public loginWithGoogle(idToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/google-login`, { idToken: idToken });
  }

  login(token: string, rol: string, nombre: string): void {
    localStorage.setItem('user_token', token);
    localStorage.setItem('user_rol', rol);
    localStorage.setItem('user_name', nombre);
    this.isLoggedInSubject.next(true);
    this.userNameSubject.next(nombre);
    this.userRoleSubject.next(rol);
    this.initActivityListeners();
    this.resetInactivityTimer();
  }

  logout(): void {
    console.log("Cerrando sesión...");
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_rol');
    localStorage.removeItem('user_name');
    this.stopInactivityTimer();
    if (this.activitySubscription) {
      this.activitySubscription.unsubscribe();
      this.activitySubscription = null;
    }
    this.socialAuthService.signOut();
    this.isLoggedInSubject.next(false);
    this.userNameSubject.next(null);
    this.userRoleSubject.next(null);
    this.router.navigate(['/login']);
  }

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

  public getDirecciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/direcciones`, { headers: this.getAuthHeaders() });
  }

  public createDireccion(direccion: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/direcciones`, direccion, { headers: this.getAuthHeaders() });
  }

  public updateDireccion(id: string, direccion: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/direcciones/${id}`, direccion, { headers: this.getAuthHeaders() });
  }

  public deleteDireccion(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/direcciones/${id}`, { headers: this.getAuthHeaders() });
  }

  public setDireccionPredeterminada(id: string): Observable<any[]> {
    return this.http.put<any[]>(`${this.apiUrl}/direcciones/${id}/predeterminada`, {}, { headers: this.getAuthHeaders() });
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
