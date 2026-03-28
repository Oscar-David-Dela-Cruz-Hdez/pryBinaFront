import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { OrdersService } from '../../../core/services/admin/orders.service';

@Component({
    selector: 'app-admin-pedidos',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatExpansionModule,
        MatSnackBarModule,
        MatDialogModule,
        FormsModule
    ],
    templateUrl: './pedidos-list.component.html',
    styleUrls: ['./pedidos-list.component.css'],
    animations: []
})
export class PedidosComponent implements OnInit {
    displayedColumns: string[] = ['id', 'usuario', 'fecha', 'total', 'estado', 'acciones'];
    dataSource!: MatTableDataSource<any>;
    expandedElement: any | null;
    pedidos: any[] = [];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private ordersService: OrdersService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadPedidos();
    }

    loadPedidos() {
        this.ordersService.getPedidos().subscribe({
            next: (data) => {
                this.pedidos = data.map(p => ({ ...p, tempEstado: p.estado })); // init tempEstado
                this.dataSource = new MatTableDataSource(this.pedidos);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;

                // Custom filter for nested properties
                this.dataSource.filterPredicate = (data: any, filter: string) => {
                    const dataStr = JSON.stringify(data).toLowerCase();
                    return dataStr.indexOf(filter) !== -1;
                };
            },
            error: () => this.snackBar.open('Error al cargar pedidos', 'Cerrar', { duration: 3000 })
        });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    expandRow(row: any) {
        this.expandedElement = this.expandedElement === row ? null : row;
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'Pendiente': return 'status-pendiente';
            case 'Pagado': return 'status-pagado';
            case 'Enviado': return 'status-enviado';
            case 'Entregado': return 'status-entregado';
            case 'Cancelado': return 'status-cancelado';
            case 'Devolución': return 'status-devolucion';
            default: return '';
        }
    }

    updateStatus(pedido: any, nuevoEstado: string) {
        Swal.fire({
            title: '¿Cambiar estado?',
            text: `Cambiar estado de ${pedido.estado} a ${nuevoEstado}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.ordersService.updateEstadoPedido(pedido._id, nuevoEstado).subscribe({
                    next: (res) => {
                        pedido.estado = nuevoEstado;
                        this.snackBar.open('Estado actualizado', 'Cerrar', { duration: 3000 });
                    },
                    error: () => {
                        this.snackBar.open('Error al actualizar estado', 'Cerrar', { duration: 3000 });
                        // Revert temp selection if needed, though ui binds to ngModel
                        pedido.tempEstado = pedido.estado;
                    }
                });
            } else {
                // Reset selection if cancelled
                pedido.tempEstado = pedido.estado;
            }
        });
    }
}
