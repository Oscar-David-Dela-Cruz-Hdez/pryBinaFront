import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { OrdersService } from '../../../core/services/admin/orders.service';
import { CheckoutService } from '../../../core/services/shop/checkout.service';

declare global {
  interface Window { paypal: any; }
}

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.css']
})
export class ComprasComponent implements OnInit, OnDestroy {
  pedidos: any[] = [];
  cargando = true;
  error = '';
  pedidoDestacado = '';
  pedidoExpandido = '';
  preparandoPago = '';
  botonesRenderizados = new Set<string>();
  ahora = Date.now();
  private reloj?: ReturnType<typeof setInterval>;

  constructor(
    private ordersService: OrdersService,
    private checkoutService: CheckoutService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.pedidoDestacado = this.route.snapshot.queryParamMap.get('pedido') || '';
    this.pedidoExpandido = this.pedidoDestacado;
    this.cargarPedidos();
    this.reloj = setInterval(() => this.ahora = Date.now(), 30000);
  }

  ngOnDestroy(): void {
    if (this.reloj) clearInterval(this.reloj);
  }

  cargarPedidos(): void {
    this.cargando = true;
    this.error = '';
    this.ordersService.getPedidos().subscribe({
      next: pedidos => {
        this.pedidos = pedidos || [];
        const recordado = this.checkoutService.getPendingPedidoId();
        const pedidoRecordado = this.pedidos.find(p => p._id === recordado);
        if (recordado && (!pedidoRecordado || pedidoRecordado.estado !== 'Pendiente')) {
          this.checkoutService.clearPendingPedido(recordado);
        }
        this.cargando = false;
        if (this.pedidoDestacado) {
          setTimeout(() => document.getElementById(`pedido-${this.pedidoDestacado}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        }
      },
      error: () => {
        this.error = 'No fue posible cargar tus compras. Intenta nuevamente.';
        this.cargando = false;
      }
    });
  }

  alternarDetalle(id: string): void {
    this.pedidoExpandido = this.pedidoExpandido === id ? '' : id;
  }

  claseEstado(estado: string): string {
    const clases: Record<string, string> = {
      Pendiente: 'estado-pendiente',
      Pagado: 'estado-pagado',
      Enviado: 'estado-enviado',
      Entregado: 'estado-entregado',
      Cancelado: 'estado-cancelado',
      'Devolución': 'estado-devolucion'
    };
    return clases[estado] || 'estado-pendiente';
  }

  puedePagar(pedido: any): boolean {
    return pedido.estado === 'Pendiente' && pedido.metodoPago === 'PayPal' &&
      pedido.pago?.estado === 'pendiente' && !this.estaVencido(pedido);
  }

  estaVencido(pedido: any): boolean {
    return !!pedido.pago?.expiraEn && new Date(pedido.pago.expiraEn).getTime() <= this.ahora;
  }

  tiempoRestante(pedido: any): string {
    if (!pedido.pago?.expiraEn) return 'Pendiente de pago';
    const restante = Math.max(0, new Date(pedido.pago.expiraEn).getTime() - this.ahora);
    const minutos = Math.ceil(restante / 60000);
    if (minutos <= 0) return 'Reserva vencida';
    return `${Math.floor(minutos / 60)} h ${minutos % 60} min`;
  }

  async pagarAhora(pedido: any): Promise<void> {
    if (!this.puedePagar(pedido) || this.botonesRenderizados.has(pedido._id)) return;
    this.preparandoPago = pedido._id;
    try {
      const config = await firstValueFrom(this.checkoutService.getPaypalConfig());
      await this.cargarPaypal(config.clientId, config.currency);
      this.renderizarBotonPaypal(pedido);
      this.botonesRenderizados.add(pedido._id);
    } catch (error: any) {
      await Swal.fire('PayPal no disponible', error?.error?.error || 'No fue posible iniciar el pago.', 'error');
    } finally {
      this.preparandoPago = '';
    }
  }

  private cargarPaypal(clientId: string, currency: string): Promise<void> {
    if (window.paypal) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture&components=buttons`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo descargar PayPal'));
      document.body.appendChild(script);
    });
  }

  private renderizarBotonPaypal(pedido: any): void {
    window.paypal.Buttons({
      style: { layout: 'vertical', shape: 'rect', label: 'paypal', height: 42 },
      createOrder: async () => {
        const respuesta = await firstValueFrom(this.checkoutService.retryPaypalOrder(pedido._id));
        return respuesta.orderId;
      },
      onApprove: async (data: any) => {
        const respuesta = await firstValueFrom(this.checkoutService.capturePaypalOrder(data.orderID));
        Object.assign(pedido, respuesta.pedido);
        this.checkoutService.clearPendingPedido(pedido._id);
        this.botonesRenderizados.delete(pedido._id);
        await Swal.fire('Pago confirmado', 'Tu pedido ahora aparece como pagado.', 'success');
      },
      onError: async (error: any) => {
        console.error('Reintento PayPal:', error);
        await Swal.fire('No se completó el pago', 'El pedido seguirá pendiente para que puedas intentarlo después.', 'error');
      }
    }).render(`#paypal-retry-${pedido._id}`);
  }

  async cancelarPedido(pedido: any): Promise<void> {
    const confirmacion = await Swal.fire({
      title: '¿Cancelar pedido?',
      text: 'La reserva se eliminará y los productos volverán al inventario.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar pedido',
      cancelButtonText: 'Conservar pedido',
      confirmButtonColor: '#d14343'
    });
    if (!confirmacion.isConfirmed) return;

    try {
      const respuesta = await firstValueFrom(this.checkoutService.cancelPaypalOrder(pedido._id));
      Object.assign(pedido, respuesta.pedido);
      this.botonesRenderizados.delete(pedido._id);
      this.checkoutService.clearPendingPedido(pedido._id);
      await Swal.fire('Pedido cancelado', 'La reserva fue cancelada y el inventario quedó disponible.', 'success');
    } catch (error: any) {
      await Swal.fire('No se pudo cancelar', error?.error?.error || 'Actualiza la página e intenta nuevamente.', 'error');
      this.cargarPedidos();
    }
  }
}
