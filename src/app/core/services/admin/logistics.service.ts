import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LogisticsService {
  private apiMetodosEnvio = 'https://prybinaback.onrender.com/api/metodos-envio';
  private apiProveedores = 'https://prybinaback.onrender.com/api/proveedores';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    });
  }

  // --- MÉTODOS DE ENVÍO ---
  getMetodosEnvio(activo?: boolean): Observable<any[]> {
    let url = this.apiMetodosEnvio;
    if (activo !== undefined) url += `?activo=${activo}`;
    return this.http.get<any[]>(url);
  }

  getMetodoEnvioById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiMetodosEnvio}/${id}`);
  }

  createMetodoEnvio(data: any): Observable<any> {
    return this.http.post(this.apiMetodosEnvio, data, { headers: this.getAuthHeaders() });
  }

  updateMetodoEnvio(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiMetodosEnvio}/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteMetodoEnvio(id: string): Observable<any> {
    return this.http.delete(`${this.apiMetodosEnvio}/${id}`, { headers: this.getAuthHeaders() });
  }


  // --- PROVEEDORES ---
  getProveedores(activo?: boolean): Observable<any[]> {
    let url = this.apiProveedores;
    if (activo !== undefined) url += `?activo=${activo}`;
    return this.http.get<any[]>(url);
  }

  getProveedorById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiProveedores}/${id}`);
  }

  createProveedor(data: any): Observable<any> {
    return this.http.post(this.apiProveedores, data, { headers: this.getAuthHeaders() });
  }

  updateProveedor(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiProveedores}/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteProveedor(id: string): Observable<any> {
    return this.http.delete(`${this.apiProveedores}/${id}`, { headers: this.getAuthHeaders() });
  }
}
