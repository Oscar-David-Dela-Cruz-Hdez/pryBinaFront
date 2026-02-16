import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiProductos = 'https://prybinaback.onrender.com/api/productos';
  private apiCategorias = 'https://prybinaback.onrender.com/api/categorias';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    });
  }

  // --- PRODUCTOS ---
  getProductos(filters?: { categoria?: string, nombre?: string }): Observable<any[]> {
    let url = this.apiProductos;
    const params = [];
    if (filters?.categoria) params.push(`categoria=${filters.categoria}`);
    if (filters?.nombre) params.push(`nombre=${filters.nombre}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<any[]>(url);
  }

  getProductoById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiProductos}/${id}`);
  }

  createProducto(data: any): Observable<any> {
    return this.http.post(this.apiProductos, data, { headers: this.getAuthHeaders() });
  }

  updateProducto(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiProductos}/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteProducto(id: string): Observable<any> {
    return this.http.delete(`${this.apiProductos}/${id}`, { headers: this.getAuthHeaders() });
  }

  // --- CATEGORÍAS (Para el selector de productos y CRUD) ---
  getCategorias(): Observable<any[]> {
    return this.http.get<any[]>(this.apiCategorias);
  }

  getCategoriaById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiCategorias}/${id}`);
  }

  createCategoria(data: any): Observable<any> {
    return this.http.post(this.apiCategorias, data, { headers: this.getAuthHeaders() });
  }

  updateCategoria(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiCategorias}/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteCategoria(id: string): Observable<any> {
    return this.http.delete(`${this.apiCategorias}/${id}`, { headers: this.getAuthHeaders() });
  }
}
