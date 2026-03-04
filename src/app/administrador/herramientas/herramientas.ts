import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

import { ProductsService } from '../../core/services/admin/products.service';
import { OrdersService } from '../../core/services/admin/orders.service';

@Component({
  selector: 'app-herramientas',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './herramientas.html',
  styleUrls: ['./herramientas.css']
})
export class Herramientas {
  isExportingProducts = false;
  isImportingProducts = false;
  isExportingOrders = false;

  constructor(
    private productsService: ProductsService,
    private ordersService: OrdersService,
    private snackBar: MatSnackBar
  ) {}

  // PRODUCTOS
  exportarProductosExcel() {
    this.isExportingProducts = true;
    this.productsService.exportarProductosExcel().subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = 'productos.xlsx';
        a.click();
        URL.revokeObjectURL(objectUrl);
        this.isExportingProducts = false;
      },
      error: () => {
        this.snackBar.open('Error al exportar productos', 'Cerrar', { duration: 3000 });
        this.isExportingProducts = false;
      }
    });
  }

  onFileSelectedProductos(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isImportingProducts = true;
      this.productsService.importarProductosExcel(file).subscribe({
        next: (res) => {
          let msg = res.mensaje || 'Importación completada';
          if (res.resumen) {
             msg += ` <br> Creados: ${res.resumen.creados}<br>Actualizados: ${res.resumen.actualizados}<br>Errores: ${res.resumen.errores}`;
          }
          Swal.fire({
            title: 'Importación finalizada',
            html: msg,
            icon: 'info'
          });
          this.isImportingProducts = false;
          event.target.value = '';
        },
        error: () => {
          this.snackBar.open('Error al importar productos', 'Cerrar', { duration: 3000 });
          this.isImportingProducts = false;
          event.target.value = '';
        }
      });
    }
  }

  // PEDIDOS
  exportarPedidosExcel() {
    this.isExportingOrders = true;
    this.ordersService.exportarPedidosExcel().subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = 'reporte_pedidos.xlsx';
        a.click();
        URL.revokeObjectURL(objectUrl);
        this.isExportingOrders = false;
      },
      error: () => {
        this.snackBar.open('Error al exportar pedidos', 'Cerrar', { duration: 3000 });
        this.isExportingOrders = false;
      }
    });
  }
}
