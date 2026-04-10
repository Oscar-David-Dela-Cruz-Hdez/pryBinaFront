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
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
    totalVentas = 0;
    totalPedidos = 0;
    pedidosPendientes = 0;
    totalProductos = 0;
    totalUsuarios = 0;
    productosBajoStock: any[] = [];

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
                .filter(p => p.estado !== 'Cancelado' && p.estado !== 'Devolución')
                .reduce((sum, p) => sum + p.total, 0);

            this.pedidosPendientes = pedidos.filter(p => p.estado === 'Pendiente').length;
        });

        // Cargar Productos y detectar stock bajo
        this.productsService.getProductos().subscribe(productos => {
            this.totalProductos = productos.length;
            this.productosBajoStock = productos
                .filter(p => (p.stock || p.stockTotal || 0) < 10)
                .sort((a, b) => (a.stock || 0) - (b.stock || 0));
        });

        // Cargar Usuarios
        this.adminUsersService.getUsuarios().subscribe(usuarios => {
            this.totalUsuarios = usuarios.length;
        });
    }
}