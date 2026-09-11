import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class FamiliasService {
  private apiFamilias = 'https://prybinaback.onrender.com/api/familias';
  private familiasCache$?: Observable<any[]>;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    });
  }

  getFamilias(Filters?: { marca?: string }): Observable<any[]> {
    if (!Filters?.marca) {
      if (!this.familiasCache$) {
        this.familiasCache$ = this.http.get<any[]>(this.apiFamilias).pipe(
          shareReplay(1)
        );
      }
      return this.familiasCache$;
    }

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
    this.familiasCache$ = undefined;
    return this.http.post(this.apiFamilias, data, { headers: this.getAuthHeaders() });
  }

  updateFamilia(id: string, data: any): Observable<any> {
    this.familiasCache$ = undefined;
    return this.http.put(`${this.apiFamilias}/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteFamilia(id: string): Observable<any> {
    this.familiasCache$ = undefined;
    return this.http.delete(`${this.apiFamilias}/${id}`, { headers: this.getAuthHeaders() });
  }
}
