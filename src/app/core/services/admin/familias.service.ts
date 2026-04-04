import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FamiliasService {
  private apiFamilias = 'https://prybinaback.onrender.com/api/familias';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    });
  }

  getFamilias(Filters?: { marca?: string }): Observable<any[]> {
    let url = this.apiFamilias;
    const params = [];
    if (Filters?.marca) params.push(`marca=${Filters.marca}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    return this.http.get<any[]>(url);
  }

  getFamiliaById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiFamilias}/${id}`);
  }

  createFamilia(data: any): Observable<any> {
    return this.http.post(this.apiFamilias, data, { headers: this.getAuthHeaders() });
  }

  updateFamilia(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiFamilias}/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteFamilia(id: string): Observable<any> {
    return this.http.delete(`${this.apiFamilias}/${id}`, { headers: this.getAuthHeaders() });
  }
}
