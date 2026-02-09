import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminUsersService {
  private apiUrl = 'https://prybinaback.onrender.com/api/usuarios/admin/usuarios';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    });
  }

  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  updateRol(id: string, rol: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/rol`, { rol }, { headers: this.getAuthHeaders() });
  }

  deleteUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
