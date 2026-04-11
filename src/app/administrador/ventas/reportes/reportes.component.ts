import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { ProductsService } from '../../../core/services/admin/products.service';
import { FamiliasService } from '../../../core/services/admin/familias.service';
import { MatSelectModule } from '@angular/material/select';

interface DataPoint {
  dia: number;
  unidades: number;
  unidadesVendidas: number;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule
  ],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
  // Parámetros del modelo
  inventarioInicial = 0;
  constanteK = 0.026; // Calibrado según Tabla 1 (behavior histórico)
  tiempoTotal = 30; // Días
  puntoReorden = 0;
  totalProductosAnalizados = 0;

  // Selectores dinámicos
  marcas: any[] = [];
  familias: any[] = [];
  selectedMarca = '';
  selectedFamilia = '';
  periodoSeleccionado = 30;

  // Resultados
  datosSimulacion: DataPoint[] = [];
  diaCritico: number | null = null;
  stockFinal = 0;

  // Para el gráfico SVG
  svgPath: string = '';
  svgPoints: string = '';

  constructor(
    private productsService: ProductsService,
    private familiasService: FamiliasService
  ) {}

  ngOnInit() {
    this.loadInitialData();
    this.updateStockFromInventory(); // Carga global inicial
  }

  loadInitialData() {
    this.productsService.getMarcas().subscribe(data => this.marcas = data || []);
  }

  onMarcaChange(marcaId: string) {
    this.selectedMarca = marcaId;
    this.selectedFamilia = '';
    this.familias = [];
    if (marcaId) {
      this.familiasService.getFamilias({ marca: marcaId }).subscribe(data => this.familias = data || []);
    }
    this.updateStockFromInventory();
  }

  onFamiliaChange(familiaId: string) {
    this.selectedFamilia = familiaId;
    this.updateStockFromInventory();
  }

  onPeriodoChange(dias: number) {
    this.tiempoTotal = dias;
    this.simular();
  }

  updateStockFromInventory() {
    const filters: any = {};
    if (this.selectedMarca) filters.marca = this.selectedMarca;
    if (this.selectedFamilia) filters.familia = this.selectedFamilia;

    this.productsService.getProductos(filters).subscribe({
      next: (productos) => {
        // Sumar el stock de todos los productos de esta categoría seleccionada
        const totalStock = productos.reduce((sum, p) => sum + (p.stock || p.stockTotal || 0), 0);
        this.inventarioInicial = totalStock;
        this.totalProductosAnalizados = productos.length;
        
        // Ajustar punto de reorden sugerido: 25% del stock inicial agregado
        this.puntoReorden = Math.round(totalStock * 0.25);
        
        this.simular();
      },
      error: () => {
        console.error('Error al cargar productos para el modelo');
        this.simular();
      }
    });
  }

  simular() {
    this.datosSimulacion = [];
    this.diaCritico = null;

    for (let t = 0; t <= this.tiempoTotal; t++) {
      // Fórmula del modelo: x(t) = x(0) * e^(-kt)
      const unidades = Math.round(this.inventarioInicial * Math.exp(-this.constanteK * t));
      
      // Cálculo de unidades vendidas ese día
      let vendidas = 0;
      if (t > 0) {
        const prevUnidades = Math.round(this.inventarioInicial * Math.exp(-this.constanteK * (t - 1)));
        vendidas = prevUnidades - unidades;
      }

      this.datosSimulacion.push({
        dia: t,
        unidades: unidades,
        unidadesVendidas: vendidas
      });

      // Detectar punto de reorden
      if (unidades <= this.puntoReorden && this.diaCritico === null) {
        this.diaCritico = t;
      }
    }

    this.stockFinal = this.datosSimulacion[this.datosSimulacion.length - 1].unidades;
    this.generarSvgPath();
  }

  generarSvgPath() {
    if (this.datosSimulacion.length === 0) return;

    const width = 400; // Ancho interno del SVG
    const height = 200; // Alto interno del SVG
    const maxUnits = this.inventarioInicial;
    const maxDays = this.tiempoTotal;

    const coords = this.datosSimulacion.map(d => ({
      x: (d.dia / maxDays) * width,
      y: height - (d.unidades / maxUnits) * height
    }));

    // Crear el path string
    this.svgPath = `M ${coords[0].x} ${coords[0].y} ` + 
                   coords.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  }
}
