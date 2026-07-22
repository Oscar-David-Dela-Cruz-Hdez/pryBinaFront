import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { forkJoin, interval, of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

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
export class PedidosComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = ['id', 'usuario', 'fecha', 'total', 'estado', 'riesgo', 'acciones'];
    dataSource!: MatTableDataSource<any>;
    expandedElement: any | null;
    pedidos: any[] = [];
    resumenRiesgo = { analizados: 0, riesgoAlto: 0, riesgoMedio: 0, riesgoBajo: 0 };
    entrenamiento = { pedidos: 0, cancelados: 0 };
    modeloRiesgo = 'k-NN sobre pedidos históricos';
    analiticaReal = false;
    actualizando = false;
    ultimaActualizacion?: Date;
    private destruir$ = new Subject<void>();

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private ordersService: OrdersService,
    ) { }

    ngOnInit(): void {
        this.loadPedidos();
        interval(30000).pipe(takeUntil(this.destruir$)).subscribe(() => this.loadPedidos(false));
    }

    ngOnDestroy(): void { this.destruir$.next(); this.destruir$.complete(); }

    loadPedidos(mostrarIndicador = true) {
        if (mostrarIndicador) this.actualizando = true;
        forkJoin({
            pedidos: this.ordersService.getPedidos(),
            analitica: this.ordersService.getRiesgoCancelacion().pipe(catchError(() => of(null)))
        }).subscribe({
            next: ({ pedidos, analitica }) => {
                this.analiticaReal = Boolean(analitica);
                this.modeloRiesgo = analitica?.modelo || 'Vista local de demostración · despliega el backend analítico';
                const riesgos = new Map((analitica?.predicciones || []).map((p: any) => [p.pedidoId, p.riesgo]));
                const pedidosConRiesgo = pedidos.map(p => ({
                    ...p,
                    tempEstado: p.estado,
                    riesgo: riesgos.get(p._id) || (!analitica ? this.riesgoDemostrativo(p) : null)
                }));
                this.pedidos = pedidosConRiesgo.filter(p => p.estado === 'Pendiente');
                const medidos = this.pedidos.filter(p => p.riesgo);
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
                this.ultimaActualizacion = new Date();
                this.actualizando = false;
            },
            error: () => {
                this.actualizando = false;
                if (mostrarIndicador) Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar los pedidos.' });
            }
        });
    }

    private riesgoDemostrativo(pedido: any): any {
        const texto = `${pedido._id || ''}${pedido.metodoPago || ''}`;
        const semilla = [...texto].reduce((suma, caracter) => suma + caracter.charCodeAt(0), 0);
        const porcentaje = 18 + (semilla % 65);
        return {
            porcentaje,
            nivel: porcentaje >= 60 ? 'Alto' : porcentaje >= 35 ? 'Medio' : 'Bajo',
            vecinosUsados: 0,
            factores: [
                `Método de pago: ${pedido.metodoPago || 'sin definir'}`,
                `Total del pedido: $${Number(pedido.total || 0).toLocaleString('es-MX')}`,
                `${pedido.productos?.length || 0} productos distintos`,
                'Valor demostrativo: el endpoint analítico aún no está desplegado'
            ]
        };
    }

    getRecommendation(riesgo: any): string {
        if (riesgo?.nivel === 'Alto') return 'Contactar al cliente antes de preparar el envío.';
        if (riesgo?.nivel === 'Medio') return 'Revisar pago y datos de entrega.';
        return 'Continuar con el flujo normal del pedido.';
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
                        if (nuevoEstado !== 'Pendiente') this.loadPedidos(false);
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
