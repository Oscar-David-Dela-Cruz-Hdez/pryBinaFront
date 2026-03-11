import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { RespaldoService } from '../../../core/services/admin/respaldo.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-respaldos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './respaldos.html',
  styleUrls: ['./respaldos.css']
})
export class Respaldos implements OnInit {
  colecciones: string[] = [];
  seleccionadas: { [key: string]: boolean } = {};
  isLoading = true;
  isDownloading = false;

  constructor(
    private respaldoService: RespaldoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarColecciones();
  }

  cargarColecciones() {
    this.isLoading = true;
    this.respaldoService.obtenerColecciones().subscribe({
      next: (data) => {
        this.colecciones = data;
        // Seleccionar todas por defecto
        this.colecciones.forEach(col => this.seleccionadas[col] = true);
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Error al obtener la lista de colecciones', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  toggleAll(event: any) {
    const checked = event.checked;
    this.colecciones.forEach(col => this.seleccionadas[col] = checked);
  }

  get allSelected(): boolean {
    return this.colecciones.length > 0 && this.colecciones.every(col => this.seleccionadas[col]);
  }

  get someSelected(): boolean {
    return this.colecciones.some(col => this.seleccionadas[col]) && !this.allSelected;
  }

  descargarRespaldo() {
    const aDescargar = this.colecciones.filter(col => this.seleccionadas[col]);
    
    if (aDescargar.length === 0) {
      this.snackBar.open('Debes seleccionar al menos una colección', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isDownloading = true;
    this.respaldoService.generarRespaldo(aDescargar).subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = `respaldo_bd_${new Date().toISOString().split('T')[0]}.zip`;
        a.click();
        URL.revokeObjectURL(objectUrl);
        this.isDownloading = false;
        this.snackBar.open('Respaldo descargado con éxito', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error al generar el respaldo', 'Cerrar', { duration: 3000 });
        this.isDownloading = false;
      }
    });
  }
}
