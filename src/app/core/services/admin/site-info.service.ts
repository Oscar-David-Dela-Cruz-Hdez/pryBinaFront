import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { CompanyOfflineService } from '../company-offline.service';

@Injectable({
  providedIn: 'root'
})
export class SiteInfoService {
  private baseUrl = 'https://prybinaback.onrender.com/api';
  private contactosCache$?: Observable<any>;

  constructor(private http: HttpClient, private authService: AuthService,
    private offline: CompanyOfflineService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    });
  }

  // --- MISION ---
  getMision(): Observable<any> {
    return this.offline.get('mision');
  }

  updateMision(data: { texto: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/mision`, data, { headers: this.getAuthHeaders() });
  }

  // --- VISION ---
  getVision(): Observable<any> {
    return this.offline.get('vision');
  }

  updateVision(data: { texto: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/vision`, data, { headers: this.getAuthHeaders() });
  }

  // --- POLITICAS ---
  getPoliticas(): Observable<any> {
    return this.offline.get('politicas');
  }

  updatePoliticas(data: { texto: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/politicas`, data, { headers: this.getAuthHeaders() });
  }

  // --- TERMINOS ---
  getTerminos(): Observable<any> {
    return this.offline.get('terminos');
  }

  updateTerminos(data: { texto: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/terminos`, data, { headers: this.getAuthHeaders() });
  }

  // --- HISTORIA ---
  getHistoria(): Observable<any> {
    return this.offline.get('historia');
  }

  updateHistoria(data: { texto: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/historia`, data, { headers: this.getAuthHeaders() });
  }

  // --- UBICACION ---
  getUbicacion(): Observable<any> {
    return this.offline.get('ubicacion');
  }

  updateUbicacion(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/ubicacion`, data, { headers: this.getAuthHeaders() });
  }

  // --- FAQS ---
  getFaqs(activo?: boolean): Observable<any> {
    let url = `${this.baseUrl}/faqs`;
    if (activo !== undefined) {
      url += `?activo=${activo}`;
    }
    return activo === false ? this.http.get(url) : this.offline.get(activo === true ? 'faqs?activo=true' : 'faqs');
  }

  addFaq(data: { pregunta: string, respuesta: string, activo?: boolean, orden?: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/faqs`, data, { headers: this.getAuthHeaders() });
  }

  updateFaq(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/faqs/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteFaq(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/faqs/${id}`, { headers: this.getAuthHeaders() });
  }

  // --- CONTACTOS ---
  getContactos(activo?: boolean): Observable<any> {
    if (activo === true) {
      if (!this.contactosCache$) {
        this.contactosCache$ = this.offline.get('contactos?activo=true');
      }
      return this.contactosCache$;
    }

    let url = `${this.baseUrl}/contactos`;
    if (activo !== undefined) {
      url += `?activo=${activo}`;
    }
    return activo === false ? this.http.get(url) : this.offline.get('contactos');
  }

  addContacto(data: { tipo: string, valor: string, icono?: string, activo?: boolean }): Observable<any> {
    this.contactosCache$ = undefined;
    return this.http.post(`${this.baseUrl}/contactos`, data, { headers: this.getAuthHeaders() });
  }

  updateContacto(id: string, data: any): Observable<any> {
    this.contactosCache$ = undefined;
    return this.http.put(`${this.baseUrl}/contactos/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteContacto(id: string): Observable<any> {
    this.contactosCache$ = undefined;
    return this.http.delete(`${this.baseUrl}/contactos/${id}`, { headers: this.getAuthHeaders() });
  }

  // --- DEPRECATED METHODS ---
  getInformacion(): Observable<any> {
    console.warn('getInformacion is deprecated. Use specific methods instead.');
    return this.http.get(`${this.baseUrl}/empresa`);
  }

  updateInformacion(data: any): Observable<any> {
    console.warn('updateInformacion is deprecated. Use specific methods instead.');
    return this.http.put(`${this.baseUrl}/empresa`, data, { headers: this.getAuthHeaders() });
  }
}
