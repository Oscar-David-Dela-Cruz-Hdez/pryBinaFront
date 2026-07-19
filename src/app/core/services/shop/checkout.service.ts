import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

export interface DireccionEnvio {
  calle: string;
  ciudad: string;
  estado: string;
  cp: string;
  telefono: string;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly apiUrl = 'https://prybinaback.onrender.com/api/pagos';
  private readonly pendingKey = 'paypal_pending_pedido';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `${this.authService.getToken()}`
    });
  }

  getPaypalConfig(): Observable<{ clientId: string; currency: string }> {
    return this.http.get<{ clientId: string; currency: string }>(`${this.apiUrl}/paypal/config`);
  }

  createPaypalOrder(productos: { producto: string; cantidad: number }[], direccionEnvio: DireccionEnvio): Observable<any> {
    return this.http.post(`${this.apiUrl}/paypal/orden`, { productos, direccionEnvio }, { headers: this.authHeaders() });
  }

  capturePaypalOrder(orderId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/paypal/orden/${encodeURIComponent(orderId)}/capturar`, {}, { headers: this.authHeaders() });
  }

  retryPaypalOrder(pedidoId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/paypal/pedido/${encodeURIComponent(pedidoId)}/orden`,
      {},
      { headers: this.authHeaders() }
    );
  }

  cancelPaypalOrder(pedidoId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/paypal/pedido/${encodeURIComponent(pedidoId)}/cancelar`,
      {},
      { headers: this.authHeaders() }
    );
  }

  getPendingPedidoId(): string | null {
    return localStorage.getItem(this.pendingKey);
  }

  rememberPendingPedido(pedidoId: string): void {
    localStorage.setItem(this.pendingKey, pedidoId);
  }

  clearPendingPedido(pedidoId?: string): void {
    if (!pedidoId || this.getPendingPedidoId() === pedidoId) localStorage.removeItem(this.pendingKey);
  }
}
