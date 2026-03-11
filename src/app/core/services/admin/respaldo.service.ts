import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RespaldoService {
  private apiUrl = 'https://prybinaback.onrender.com/api/respaldos';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    });
  }

  obtenerColecciones(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  generarRespaldo(colecciones: string[]): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.authService.getToken() || ''
    });

    return this.http.post(`${this.apiUrl}/generar`, { colecciones }, {
      headers: headers,
      responseType: 'blob'
    });
  }
}
