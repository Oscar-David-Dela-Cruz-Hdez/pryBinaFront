import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

export interface AlexaAdminUser {
  _id: string;
  nombre: string;
  ap?: string;
  am?: string;
  email: string;
  username?: string;
  rol: 'admin';
  alexaTokenLast4?: string;
  alexaTokenUpdatedAt?: string;
}

export interface AlexaTokenResponse {
  mensaje: string;
  tokenAlexa: string;
  usuario: AlexaAdminUser;
}

@Injectable({
  providedIn: 'root'
})
export class AlexaAccessService {
  private apiUrl = 'https://prybinaback.onrender.com/api/usuarios/admin/alexa';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    });
  }

  getAdmins(): Observable<AlexaAdminUser[]> {
    return this.http.get<AlexaAdminUser[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  generateToken(id: string): Observable<AlexaTokenResponse> {
    return this.http.post<AlexaTokenResponse>(`${this.apiUrl}/${id}/token`, {}, { headers: this.getAuthHeaders() });
  }

  revokeToken(id: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}/token`, { headers: this.getAuthHeaders() });
  }
}
