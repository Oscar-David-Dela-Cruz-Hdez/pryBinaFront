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
import { OrdersService } from '../../../core/services/admin/orders.service';
import { MatSelectModule } from '@angular/material/select';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

interface DataPoint {
  dia: number;
  fecha: Date;
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
  selectedProducto = '';
  productosDropdown: any[] = [];
  
  // Opciones de Horizonte Temporal (12 meses dinámicos con cálculo exacto de días)
  opcionesTiempo = (() => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const opciones = [];
    const today = new Date();
    
    for (let i = 1; i <= 12; i++) {
        // Fecha exacta en el futuro, preservando el día actual
        const targetDate = new Date(today.getFullYear(), today.getMonth() + i, today.getDate());
        // Cálculo exacto de los días de diferencia
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let label = meses[targetDate.getMonth()];
        if (i === 12) {
            label += ' sig. año';
        }
        label += ` (${i} mes${i > 1 ? 'es' : ''})`;

        opciones.push({ label, value: diffDays });
    }
    return opciones;
  })();

  // Datos de Ventas Reales (Historial)
  ventasHistoricas: any[] = [];
  ventasScopeActual = 0;

  // Resultados
  datosSimulacion: DataPoint[] = [];
  diaCritico: number | null = null;
  stockFinal = 0;

  // ECharts Configuration
  chartOption: EChartsOption = {};

  // Label del filtro activo para la UI
  get scopeLabel(): string {
    if (!this.selectedMarca) return 'Todo el Almacén (Global)';
    if (!this.selectedFamilia) return `Marca: ${this.selectedMarcaName}`;
    const familia = this.familias.find(f => (f._id || f.nombre) === this.selectedFamilia);
    const mName = this.selectedMarcaName;
    const fName = familia?.nombre ?? this.selectedFamilia;
    
    if (this.selectedProducto) {
       const prod = this.productosDropdown.find(p => p._id === this.selectedProducto);
       const pName = prod?.nombre ?? 'Producto Específico';
       return `${mName} — ${fName} — ${pName}`;
    }
    
    return `${mName} — ${fName}`;
  }

  /**
   * Calcula analíticamente en cuántos días el inventario alcanza el punto de reorden.
   * Despejando t de:  puntoReorden = x0 * e^(-k*t)
   *   → t = ln(x0 / puntoReorden) / k
   * Este valor es independiente del horizonte temporal seleccionado.
   */
  get diasParaRestock(): number | null {
    if (this.constanteK <= 0 || this.inventarioInicial <= 0 || this.puntoReorden <= 0) return null;
    if (this.puntoReorden >= this.inventarioInicial) return 0;
    return Math.ceil(Math.log(this.inventarioInicial / this.puntoReorden) / this.constanteK);
  }

  /** Convierte diasParaRestock a una fecha calendario (hoy + N días). */
  get fechaRestock(): string | null {
    const dias = this.diasParaRestock;
    if (dias === null) return null;
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  constructor(
    private productsService: ProductsService,
    private familiasService: FamiliasService,
    private ordersService: OrdersService
  ) {}

  ngOnInit() {
    this.loadInitialData();
    // No llamamos a updateStock todavía para esperar a que los pedidos carguen
  }

  loadInitialData() {
    this.productsService.getMarcas().subscribe(data => this.marcas = data || []);
    this.loadSalesHistory();
  }

  loadSalesHistory() {
    this.ordersService.getPedidos().subscribe({
      next: (pedidos) => {
        const treintaDiasAtras = new Date();
        treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);

        // Filtrar solo entregados de los últimos 30 días
        this.ventasHistoricas = pedidos.filter(p => 
          p.estado === 'Entregado' && 
          new Date(p.createdAt) >= treintaDiasAtras
        );

        this.updateStockFromInventory(); // Ahora sí, calcular con ventas reales
      },
      error: () => {
        console.error('No se pudo cargar el historial de ventas');
        this.updateStockFromInventory();
      }
    });
  }

  onMarcaChange(marcaId: string) {
    this.selectedMarca = marcaId;
    this.selectedFamilia = '';
    this.selectedProducto = '';
    this.familias = [];
    this.productosDropdown = [];
    
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
    this.selectedProducto = '';
    this.productosDropdown = [];

    if (familiaId) {
      this.productsService.getProductos({ familia: familiaId }).subscribe(data => {
        this.productosDropdown = data || [];
      });
    }
    this.updateStockFromInventory();
  }

  onProductoChange(productoId: string) {
    this.selectedProducto = productoId;
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
        // Filtro local si hay un producto seleccionado
        let productosScope = productos;
        if (this.selectedProducto) {
          productosScope = productos.filter(p => p._id === this.selectedProducto);
        }

        const totalStock = productosScope.reduce((sum, p) => sum + (p.stock || p.stockTotal || 0), 0);
        this.inventarioInicial = totalStock;
        this.totalProductosAnalizados = productosScope.length;
        this.puntoReorden = Math.round(totalStock * 0.25);
        
        this.calculateDynamicK(productosScope);
        this.simular();
      },
      error: () => {
        this.simular();
      }
    });
  }

  calculateDynamicK(productosScope: any[] = []) {
    // 1. Obtener ventas del scope actual (Global, Marca o Familia)
    let totalVentas = 0;
    
    // Crear un Set con los IDs de los productos actualmente filtrados para búsqueda rápida
    const productIdsInScope = new Set(productosScope.map(p => p._id));

    this.ventasHistoricas.forEach(pedido => {
      pedido.productos.forEach((item: any) => {
        // Extraemos el ID del producto (soporta un objeto populado o un ID directo)
        const itemId = item.producto?._id || item.productoId || item.producto;
        
        // Solo sumamos la venta si el producto vendido está dentro del filtro actual
        if (productIdsInScope.has(itemId)) {
          totalVentas += (item.cantidad || 0);
        }
      });
    });

    // Asignamos el total real de ventas que pertenecen a este filtro
    this.ventasScopeActual = totalVentas;

    // Fórmula: k = -ln( x(30) / x(0) ) / 30
    //   Donde:
    //     x(0)  = stock HACE 30 días = stock actual + ventas del período (dato histórico real)
    //     x(30) = stock HOY          = inventarioInicial                  (dato histórico real)
    //
    //   Dos puntos reales observados → k más riguroso para dx/dt = -kx.
    //   k = ln( (x₀ + ventas) / x₀ ) / 30
    if (this.inventarioInicial > 0 && this.ventasScopeActual > 0) {
      const x30 = this.inventarioInicial;                          // hoy
      const x0  = this.inventarioInicial + this.ventasScopeActual; // hace 30 días
      this.constanteK = -Math.log(x30 / x0) / 30;                 // siempre positivo
    } else {
      this.constanteK = 0; // Sin ventas → inventario estable
    }
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

      const fechaSim = new Date();
      fechaSim.setDate(fechaSim.getDate() + t);

      this.datosSimulacion.push({
        dia: t,
        fecha: fechaSim,
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
    const days = this.datosSimulacion.map(d => d.fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }));
    const units = this.datosSimulacion.map(d => d.unidades);

    this.chartOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const p = params[0];
          return `<strong>Fecha: ${p.name}</strong><br/>Inventario Restante: ${p.value} unidades`;
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
        name: 'Fecha de Proyección',
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
