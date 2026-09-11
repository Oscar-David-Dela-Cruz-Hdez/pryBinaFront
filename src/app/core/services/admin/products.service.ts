import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiProductos = 'https://prybinaback.onrender.com/api/productos';
  private apiMarcas = 'https://prybinaback.onrender.com/api/marcas';
  private marcasCache$?: Observable<any[]>;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    });
  }

  // --- PRODUCTOS ---
  getProductos(filters?: { marca?: string, familia?: string, nombre?: string }): Observable<any[]> {
    let url = this.apiProductos;
    const params = [];
    if (filters?.marca) params.push(`marca=${filters.marca}`);
    if (filters?.familia) params.push(`familia=${filters.familia}`);
    if (filters?.nombre) params.push(`nombre=${filters.nombre}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<any[]>(url);
  }

  getProductoById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiProductos}/${id}`);
  }

  getRecomendaciones(productos: string[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiProductos}/recomendaciones`, { productos });
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

  exportarProductosExcel(): Observable<Blob> {
    return this.http.get(`${this.apiProductos}/exportar/excel`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  importarProductosExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', file);
    
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `${token}`
    });

    return this.http.post(`${this.apiProductos}/importar/excel`, formData, { headers });
  }

  // --- MARCAS ---
  getMarcas(): Observable<any[]> {
    if (!this.marcasCache$) {
      this.marcasCache$ = this.http.get<any[]>(this.apiMarcas).pipe(
        shareReplay(1)
      );
    }
    return this.marcasCache$;
  }

  getMarcaById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiMarcas}/${id}`);
  }

  createMarca(data: any): Observable<any> {
    this.marcasCache$ = undefined;
    return this.http.post(this.apiMarcas, data, { headers: this.getAuthHeaders() });
  }

  updateMarca(id: string, data: any): Observable<any> {
    this.marcasCache$ = undefined;
    return this.http.put(`${this.apiMarcas}/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteMarca(id: string): Observable<any> {
    this.marcasCache$ = undefined;
    return this.http.delete(`${this.apiMarcas}/${id}`, { headers: this.getAuthHeaders() });
  }
}
