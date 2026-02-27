import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterModule } from '@angular/router';

import { OrdersService } from '../../core/services/admin/orders.service';
import { ProductsService } from '../../core/services/admin/products.service';
import { AdminUsersService } from '../../core/services/admin/admin-users.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatGridListModule,
        RouterModule
    ],
    template: `
    <div class="dashboard-container fade-in">
      <h2>Panel de Administración</h2>
      
      <div class="stats-grid">
        <!-- Ventas Totales -->
        <mat-card class="stat-card sales-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>monetization_on</mat-icon>
            <mat-card-title>Ventas Totales</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-value">{{ totalVentas | currency }}</div>
            <div class="stat-label">{{ totalPedidos }} pedidos realizados</div>
          </mat-card-content>
        </mat-card>

        <!-- Productos -->
        <mat-card class="stat-card products-card">
           <mat-card-header>
            <mat-icon mat-card-avatar>inventory_2</mat-icon>
            <mat-card-title>Productos</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-value">{{ totalProductos }}</div>
            <div class="stat-label">Activos en catálogo</div>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-button routerLink="/admin/inventario/productos">GESTIONAR</button>
          </mat-card-actions>
        </mat-card>

        <!-- Usuarios -->
        <mat-card class="stat-card users-card">
           <mat-card-header>
            <mat-icon mat-card-avatar>group</mat-icon>
            <mat-card-title>Usuarios</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-value">{{ totalUsuarios }}</div>
            <div class="stat-label">Registrados</div>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-button routerLink="/admin/usuarios">VER TODOS</button>
          </mat-card-actions>
        </mat-card>

        <!-- Pedidos Pendientes -->
        <mat-card class="stat-card pending-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>pending_actions</mat-icon>
            <mat-card-title>Pendientes</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-value">{{ pedidosPendientes }}</div>
            <div class="stat-label">Pedidos por procesar</div>
          </mat-card-content>
           <mat-card-actions align="end">
            <button mat-button routerLink="/admin/pedidos/listado">ATENDER</button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="recent-section mt-4">
        <h3>Accesos Rápidos</h3>
        <div class="quick-actions">
           <button mat-raised-button color="primary" routerLink="/admin/pedidos/listado">
              <mat-icon>list_alt</mat-icon> Ver Pedidos
           </button>
           <button mat-raised-button color="accent" routerLink="/admin/inventario/productos">
              <mat-icon>add_circle</mat-icon> Nuevo Producto
           </button>
           <button mat-raised-button routerLink="/admin/ventas/ofertas">
              <mat-icon>local_offer</mat-icon> Gestionar Ofertas
           </button>
           <button mat-raised-button routerLink="/admin/ventas/carrusel">
              <mat-icon>view_carousel</mat-icon> Gestionar Carrusel
           </button>
        </div>
      </div>

    </div>
  `,
    styles: [`
    .dashboard-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
    
    .stat-card { border-left: 4px solid transparent; }
    .stat-value { font-size: 2rem; font-weight: bold; margin: 10px 0; }
    .stat-label { color: #666; font-size: 0.9rem; }
    
    .sales-card { border-left-color: #4caf50; }
    .sales-card mat-icon { color: #4caf50; }
    
    .products-card { border-left-color: #2196f3; }
    .products-card mat-icon { color: #2196f3; }
    
    .users-card { border-left-color: #ff9800; }
    .users-card mat-icon { color: #ff9800; }
    
    .pending-card { border-left-color: #f44336; }
    .pending-card mat-icon { color: #f44336; }
    .pending-card .stat-value { color: #f44336; }

    .mt-4 { margin-top: 30px; }
    .quick-actions { display: flex; gap: 15px; flex-wrap: wrap; }
    
    .fade-in { animation: fadeIn 0.5s ease-in; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class DashboardComponent implements OnInit {
    totalVentas = 0;
    totalPedidos = 0;
    pedidosPendientes = 0;
    totalProductos = 0;
    totalUsuarios = 0;

    constructor(
        private ordersService: OrdersService,
        private productsService: ProductsService,
        private adminUsersService: AdminUsersService
    ) { }

    ngOnInit() {
        this.loadStats();
    }

    loadStats() {
        // Cargar Pedidos y calcular ventas
        this.ordersService.getPedidos().subscribe(pedidos => {
            this.totalPedidos = pedidos.length;
            this.totalVentas = pedidos
                .filter(p => p.estado !== 'Cancelado' && p.estado !== 'Devolución') // Solo ventas válidas
                .reduce((sum, p) => sum + p.total, 0);

            this.pedidosPendientes = pedidos.filter(p => p.estado === 'Pendiente').length;
        });

        // Cargar Productos
        this.productsService.getProductos().subscribe(productos => {
            this.totalProductos = productos.length;
        });

        // Cargar Usuarios
        this.adminUsersService.getUsuarios().subscribe(usuarios => {
            this.totalUsuarios = usuarios.length;
        });
    }
}
