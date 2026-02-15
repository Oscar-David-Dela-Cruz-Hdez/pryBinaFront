import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {
    private apiUrl = 'https://prybinaback.onrender.com/api/pedidos';

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getAuthHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `${token}`
        });
    }

    // Obtener pedidos (Admin ve todos, Usuario ve suyos)
    getPedidos(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() });
    }

    // Obtener detalle de pedido
    getPedidoById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
    }

    // Actualizar estado (Admin)
    updateEstadoPedido(id: string, estado: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}/estado`, { estado }, { headers: this.getAuthHeaders() });
    }
}
