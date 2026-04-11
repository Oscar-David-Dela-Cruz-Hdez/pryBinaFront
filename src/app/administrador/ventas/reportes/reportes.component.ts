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
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

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
    MatSelectModule,
    NgxEchartsDirective
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
  selectedMarcaName = '';
  selectedFamilia = '';
  periodoSeleccionado = 30;

  // Resultados
  datosSimulacion: DataPoint[] = [];
  diaCritico: number | null = null;
  stockFinal = 0;

  // ECharts Configuration
  chartOption: EChartsOption = {};

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
    
    // Buscar el nombre de la marca para mostrarlo en la UI
    const marcaSelected = this.marcas.find(m => (m._id || m.nombre) === marcaId);
    this.selectedMarcaName = marcaSelected ? marcaSelected.nombre : '';

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
    this.updateChart();
  }

  updateChart() {
    const days = this.datosSimulacion.map(d => d.dia);
    const units = this.datosSimulacion.map(d => d.unidades);

    this.chartOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const p = params[0];
          return `<strong>Día: ${p.name}</strong><br/>Inventario Restante: ${p.value} unidades`;
        },
        backgroundColor: 'rgba(30, 30, 30, 0.9)',
        borderColor: '#D4AF37',
        textStyle: { color: '#fff' }
      },
      grid: {
        top: '15%',
        left: '5%',
        right: '5%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        name: 'Día (Tiempo Transcurrido)',
        nameLocation: 'middle',
        nameGap: 35,
        data: days,
        axisLine: { lineStyle: { color: '#999' } },
        axisLabel: { color: '#666' }
      },
      yAxis: {
        type: 'value',
        name: 'Cantidad de Inventario',
        nameLocation: 'end',
        nameGap: 20,
        axisLine: { lineStyle: { color: '#999' } },
        axisLabel: { color: '#666' },
        splitLine: { lineStyle: { type: 'dashed', color: 'rgba(153, 153, 153, 0.1)' } }
      },
      series: [
        {
          data: units,
          type: 'line',
          smooth: true,
          symbolSize: 8,
          lineStyle: {
            color: '#D4AF37',
            width: 3,
            shadowColor: 'rgba(212, 175, 55, 0.3)',
            shadowBlur: 10
          },
          itemStyle: { color: '#D4AF37' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(212, 175, 55, 0.2)' },
                { offset: 1, color: 'rgba(212, 175, 55, 0)' }
              ]
            }
          },
          markLine: {
            symbol: ['none', 'none'],
            label: {
              position: 'insideEndTop',
              formatter: 'Umbral: {c}',
              color: '#F44336',
              fontWeight: 'bold'
            },
            lineStyle: {
              color: 'rgba(244, 67, 54, 0.5)',
              type: 'dashed'
            },
            data: [{ yAxis: this.puntoReorden }]
          }
        }
      ]
    };
  }
}
