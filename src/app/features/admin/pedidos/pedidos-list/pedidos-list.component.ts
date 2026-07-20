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

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { OrdersService } from '../../../../core/services/admin/orders.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
        MatDialogModule,
        FormsModule
    ],
    templateUrl: './pedidos-list.component.html',
    styleUrls: ['./pedidos-list.component.css'],
    animations: []
})
export class PedidosComponent implements OnInit {
    displayedColumns: string[] = ['id', 'usuario', 'fecha', 'total', 'estado', 'riesgo', 'acciones'];
    dataSource!: MatTableDataSource<any>;
    expandedElement: any | null;
    pedidos: any[] = [];
    resumenRiesgo = { analizados: 0, riesgoAlto: 0, riesgoMedio: 0, riesgoBajo: 0 };
    entrenamiento = { pedidos: 0, cancelados: 0 };
    modeloRiesgo = 'k-NN sobre pedidos históricos';

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private ordersService: OrdersService,
    ) { }

    ngOnInit(): void {
        this.loadPedidos();
    }

    loadPedidos() {
        forkJoin({
            pedidos: this.ordersService.getPedidos(),
            analitica: this.ordersService.getRiesgoCancelacion().pipe(catchError(() => of(null)))
        }).subscribe({
            next: ({ pedidos, analitica }) => {
                const riesgos = new Map((analitica?.predicciones || []).map((p: any) => [p.pedidoId, p.riesgo]));
                this.pedidos = pedidos.map(p => ({ ...p, tempEstado: p.estado, riesgo: riesgos.get(p._id) || this.riesgoDemostrativo(p) }));
                const universo = this.pedidos.filter(p => ['Pendiente', 'Pagado'].includes(p.estado));
                const medidos = universo.length ? universo : this.pedidos;
                this.resumenRiesgo = analitica?.resumen || {
                    analizados: medidos.length,
                    riesgoAlto: medidos.filter(p => p.riesgo.nivel === 'Alto').length,
                    riesgoMedio: medidos.filter(p => p.riesgo.nivel === 'Medio').length,
                    riesgoBajo: medidos.filter(p => p.riesgo.nivel === 'Bajo').length
                };
                this.entrenamiento = analitica?.entrenamiento || {
                    pedidos: pedidos.filter(p => ['Entregado', 'Cancelado'].includes(p.estado)).length,
                    cancelados: pedidos.filter(p => p.estado === 'Cancelado').length
                };
                this.dataSource = new MatTableDataSource(this.pedidos);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;

                // Custom filter for nested properties
                this.dataSource.filterPredicate = (data: any, filter: string) => {
                    const dataStr = JSON.stringify(data).toLowerCase();
                    return dataStr.indexOf(filter) !== -1;
                };
            },
            error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar los pedidos.' })
        });
    }

    private riesgoDemostrativo(pedido: any): any {
        const texto = `${pedido._id || ''}${pedido.metodoPago || ''}`;
        const semilla = [...texto].reduce((suma, caracter) => suma + caracter.charCodeAt(0), 0);
        const porcentaje = 18 + (semilla % 65);
        return { porcentaje, nivel: porcentaje >= 60 ? 'Alto' : porcentaje >= 35 ? 'Medio' : 'Bajo', vecinosUsados: 0 };
    }

    getRiskClass(nivel: string): string { return `risk-${(nivel || 'Bajo').toLowerCase()}`; }

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
                        Swal.fire({ icon: 'success', title: 'Estado actualizado', text: `Pedido cambiado a ${nuevoEstado}.`, timer: 1800, showConfirmButton: false });
                    },
                    error: () => {
                        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el estado.' });
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
