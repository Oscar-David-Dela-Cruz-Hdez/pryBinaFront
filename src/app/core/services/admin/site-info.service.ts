import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SiteInfoService {
  private apiUrl = 'https://prybinaback.onrender.com/api/info';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    });
  }

  // --- PUBLICO ---
  getInformacion(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // --- ADMIN ---
  updateInformacion(data: any): Observable<any> {
    return this.http.put(this.apiUrl, data, { headers: this.getAuthHeaders() });
  }

  // FAQs
  addFaq(data: { pregunta: string, respuesta: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/faq`, data, { headers: this.getAuthHeaders() });
  }

  deleteFaq(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/faq/${id}`, { headers: this.getAuthHeaders() });
  }

  // Contactos
  addContacto(data: { tipo: string, valor: string, icono?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/contacto`, data, { headers: this.getAuthHeaders() });
  }

  deleteContacto(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/contacto/${id}`, { headers: this.getAuthHeaders() });
  }

  // Reset Completo
  deleteInformacion(): Observable<any> {
    return this.http.delete(this.apiUrl, { headers: this.getAuthHeaders() });
  }
}
