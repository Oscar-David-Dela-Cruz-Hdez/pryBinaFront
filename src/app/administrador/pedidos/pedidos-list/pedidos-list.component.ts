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
    template: `
    <div class="admin-container">
      <h2>Gestión de Pedidos</h2>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Filtrar pedidos</mat-label>
        <input matInput (keyup)="applyFilter($event)" placeholder="Buscar por ID, usuario, etc." #input>
      </mat-form-field>

      <div class="mat-elevation-z8">
        <table mat-table [dataSource]="dataSource" matSort multiTemplateDataRows>

          <!-- ID -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> ID Pedido </th>
            <td mat-cell *matCellDef="let row"> {{row._id | slice: -6 }} </td>
          </ng-container>

          <!-- Usuario -->
          <ng-container matColumnDef="usuario">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Usuario </th>
            <td mat-cell *matCellDef="let row"> 
                {{ row.usuario?.nombre || 'Desconocido' }} <br>
                <small>{{ row.usuario?.email }}</small>
            </td>
          </ng-container>

          <!-- Fecha -->
          <ng-container matColumnDef="fecha">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Fecha </th>
            <td mat-cell *matCellDef="let row"> {{row.createdAt | date:'short'}} </td>
          </ng-container>

          <!-- Total -->
          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Total </th>
            <td mat-cell *matCellDef="let row"> {{row.total | currency}} </td>
          </ng-container>

           <!-- Estado -->
          <ng-container matColumnDef="estado">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Estado </th>
            <td mat-cell *matCellDef="let row">
              <span [class]="'status-badge ' + getStatusClass(row.estado)">
                {{ row.estado }}
              </span>
            </td>
          </ng-container>

          <!-- Actions -->
           <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef> Acciones </th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button color="primary" (click)="expandRow(row); $event.stopPropagation()">
                <mat-icon>{{ expandedElement === row ? 'expand_less' : 'expand_more' }}</mat-icon>
              </button>
            </td>
          </ng-container>

          <!-- Expanded Content Column - The detail row is made up of this one column that spans across all columns -->
          <ng-container matColumnDef="expandedDetail">
            <td mat-cell *matCellDef="let element" [attr.colspan]="displayedColumns.length">
              <div class="element-detail"
                   [@detailExpand]="element == expandedElement ? 'expanded' : 'collapsed'">
                
                <div class="detail-container">
                    <!-- Productos -->
                    <div class="detail-section">
                        <h4>Productos</h4>
                        <ul>
                            <li *ngFor="let item of element.productos">
                                {{ item.nombre }} x {{ item.cantidad }} - {{ item.precio | currency }}
                            </li>
                        </ul>
                         <p><strong>Envío:</strong> {{ element.costoEnvio | currency }}</p>
                    </div>

                    <!-- Dirección -->
                    <div class="detail-section">
                        <h4>Envío a:</h4>
                        <p>
                            {{ element.direccionEnvio?.calle }}<br>
                            {{ element.direccionEnvio?.ciudad }}, {{ element.direccionEnvio?.estado }}<br>
                            CP: {{ element.direccionEnvio?.cp }}<br>
                            Tel: {{ element.direccionEnvio?.telefono }}
                        </p>
                        <p><strong>Método Pago:</strong> {{ element.metodoPago }}</p>
                    </div>

                    <!-- Actualizar Estado -->
                     <div class="detail-section action-panel">
                        <h4>Actualizar Estado</h4>
                        <mat-form-field appearance="outline">
                            <mat-label>Nuevo Estado</mat-label>
                            <mat-select [(ngModel)]="element.tempEstado" (selectionChange)="updateStatus(element, $event.value)">
                                <mat-option value="Pendiente">Pendiente</mat-option>
                                <mat-option value="Pagado">Pagado</mat-option>
                                <mat-option value="Enviado">Enviado</mat-option>
                                <mat-option value="Entregado">Entregado</mat-option>
                                <mat-option value="Cancelado">Cancelado</mat-option>
                                <mat-option value="Devolución">Devolución</mat-option>
                            </mat-select>
                        </mat-form-field>
                    </div>
                </div>

              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let element; columns: displayedColumns;"
              class="element-row"
              [class.expanded-row]="expandedElement === element"
              (click)="expandRow(element)">
          </tr>
          <tr mat-row *matRowDef="let row; columns: ['expandedDetail']" class="detail-row"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" colspan="6">No hay datos que coincidan con "{{input.value}}"</td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[10, 25, 50]" aria-label="Select page of orders"></mat-paginator>
      </div>
    </div>
  `,
    styles: [`
    .admin-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .filter-field { width: 100%; }
    table { width: 100%; }
    
    tr.detail-row { height: 0; }
    tr.element-row:not(.expanded-row):hover { background: whitesmoke; }
    tr.element-row:not(.expanded-row):active { background: #efefef; }
    
    .element-row td { border-bottom-width: 0; }
    .element-detail { overflow: hidden; display: flex; }
    
    .detail-container { padding: 16px; display: flex; gap: 20px; width: 100%; background-color: #f9f9f9; border-bottom: 1px solid #ddd; }
    .detail-section { flex: 1; }
    
    .status-badge { padding: 5px 10px; border-radius: 12px; font-size: 0.8em; font-weight: bold; }
    .status-pendiente { background-color: #fff3cd; color: #856404; }
    .status-pagado { background-color: #d4edda; color: #155724; }
    .status-enviado { background-color: #cce5ff; color: #004085; }
    .status-entregado { background-color: #d1ecf1; color: #0c5460; }
    .status-cancelado { background-color: #f8d7da; color: #721c24; }
    .status-devolucion { background-color: #e2e3e5; color: #383d41; }

    .action-panel { display: flex; flex-direction: column; justify-content: center; }
  `],
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
