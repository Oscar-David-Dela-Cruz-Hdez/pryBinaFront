import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SocialAuthService } from '@abacritt/angularx-social-login';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject: BehaviorSubject<boolean>;
  private userNameSubject: BehaviorSubject<string | null>;
  //private apiUrl = 'http://localhost:4000/api/usuarios';
  private apiUrl = 'https://prybinaback.onrender.com/api/usuarios';

  constructor(
    private router: Router,
    private http: HttpClient,
    private socialAuthService: SocialAuthService
  ) {
    const token = localStorage.getItem('user_token');
    console.log("Token en constructor:", token);
    const nombre = localStorage.getItem('user_name');
    this.isLoggedInSubject = new BehaviorSubject<boolean>(!!token);
    this.userNameSubject = new BehaviorSubject<string | null>(nombre);
  }

  // --- Observables Públicos ---
  public get isLoggedIn$(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  public get currentUserName$(): Observable<string | null> {
    return this.userNameSubject.asObservable();
  }

  // --- Lógica de 2FA ---
  public loginStep1_requestEmailCode(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  public loginStep2_verifyCode(email: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-2fa`, { email, code });
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
  }

  logout(): void {
    console.log("Cerrando sesión...");
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_rol');
    localStorage.removeItem('user_name');
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


