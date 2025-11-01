import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // --- BehaviorSubjects para el estado ---
  private isLoggedInSubject: BehaviorSubject<boolean>;
  private userNameSubject: BehaviorSubject<string | null>;

  // URL de tu API de backend
  private apiUrl = 'http://localhost:4000/api/usuarios';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    // Leemos de localStorage AL INICIAR
    const token = localStorage.getItem('user_token');
    const nombre = localStorage.getItem('user_name');

    // Inicializamos los subjects con el estado guardado
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

  // --- LÓGICA DE LOGIN AHORA EN 3 PARTES ---

  /**
   * PASO 1: Pide al backend que verifique las credenciales y envíe un código 2FA.
   * (Esta es la función que te faltaba)
   */
  public loginStep1_requestEmailCode(credentials: any): Observable<any> {
    // Llama a tu endpoint de login existente
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  /**
   * PASO 2: Envía el código 2FA para verificar.
   * (Esta también te faltaba)
   */
  public loginStep2_verifyCode(email: string, code: string): Observable<any> {
    // Llama al nuevo endpoint que creamos en el backend
    return this.http.post(`${this.apiUrl}/verify-2fa`, { email, code });
  }

  /**
   * PASO 3: Función local.
   * Se llama DESPUÉS de que loginStep2_verifyCode tiene éxito.
   * Guarda el token y actualiza el estado de la UI.
   */
  login(token: string, rol: string, nombre: string): void {
    localStorage.setItem('user_token', token);
    localStorage.setItem('user_rol', rol);
    localStorage.setItem('user_name', nombre);
    this.isLoggedInSubject.next(true);
    this.userNameSubject.next(nombre);
  }

  // --- Lógica de Logout ---
  logout(): void {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_rol');
    localStorage.removeItem('user_name');
    this.isLoggedInSubject.next(false);
    this.userNameSubject.next(null);
    this.router.navigate(['/login']);
  }

  // --- MÉTODOS PARA EL PERFIL (Estos ya los tenías) ---

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
}
