import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { OrdersService } from '../../../core/services/admin/orders.service';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.css']
})
export class ComprasComponent implements OnInit {
  pedidos: any[] = [];
  cargando = true;
  error = '';
  pedidoDestacado = '';
  pedidoExpandido = '';

  constructor(private ordersService: OrdersService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.pedidoDestacado = this.route.snapshot.queryParamMap.get('pedido') || '';
    this.pedidoExpandido = this.pedidoDestacado;
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.cargando = true;
    this.error = '';
    this.ordersService.getPedidos().subscribe({
      next: pedidos => {
        this.pedidos = pedidos || [];
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
}
