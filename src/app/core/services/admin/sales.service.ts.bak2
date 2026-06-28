import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private apiMetodosPago = 'https://prybinaback.onrender.com/api/metodos-pago';
  private apiOfertas = 'https://prybinaback.onrender.com/api/ofertas';
  private apiCarruseles = 'https://prybinaback.onrender.com/api/carruseles';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    });
  }

  // --- MÉTODOS DE PAGO ---
  getMetodosPago(activo?: boolean): Observable<any[]> {
    let url = this.apiMetodosPago;
    if (activo !== undefined) url += `?activo=${activo}`;
    return this.http.get<any[]>(url); // Publico o Admin
  }

  getMetodoPagoById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiMetodosPago}/${id}`);
  }

  createMetodoPago(data: any): Observable<any> {
    return this.http.post(this.apiMetodosPago, data, { headers: this.getAuthHeaders() });
  }

  updateMetodoPago(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiMetodosPago}/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteMetodoPago(id: string): Observable<any> {
    return this.http.delete(`${this.apiMetodosPago}/${id}`, { headers: this.getAuthHeaders() });
  }


  // --- OFERTAS ---
  getOfertas(activo?: boolean): Observable<any[]> {
    let url = this.apiOfertas;
    if (activo !== undefined) url += `?activo=${activo}`;
    return this.http.get<any[]>(url); // Publico
  }

  getOfertaById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiOfertas}/${id}`);
  }

  createOferta(data: any): Observable<any> {
    return this.http.post(this.apiOfertas, data, { headers: this.getAuthHeaders() });
  }

  updateOferta(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiOfertas}/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteOferta(id: string): Observable<any> {
    return this.http.delete(`${this.apiOfertas}/${id}`, { headers: this.getAuthHeaders() });
  }

  // --- CARRUSELES ---
  getCarruseles(activo?: boolean): Observable<any[]> {
    let url = this.apiCarruseles;
    if (activo !== undefined) url += `?activo=${activo}`;
    return this.http.get<any[]>(url);
  }

  getCarruselById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiCarruseles}/${id}`);
  }

  createCarrusel(data: any): Observable<any> {
    return this.http.post(this.apiCarruseles, data, { headers: this.getAuthHeaders() });
  }

  updateCarrusel(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiCarruseles}/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteCarrusel(id: string): Observable<any> {
    return this.http.delete(`${this.apiCarruseles}/${id}`, { headers: this.getAuthHeaders() });
  }
}
