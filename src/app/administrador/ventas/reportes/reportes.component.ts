import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { ProductsService } from '../../../core/services/admin/products.service';
import { FamiliasService } from '../../../core/services/admin/familias.service';
import { OrdersService } from '../../../core/services/admin/orders.service';
import { MatSelectModule } from '@angular/material/select';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

import Swal from 'sweetalert2';

interface DataPoint {
  dia: number;
  fecha: Date;
  unidades: number; // Ahora representará: Ventas Estimadas (Modelo)
  unidadesVendidas: number; // Ahora representará: Ventas Reales Observadas
  tipo: 'Real' | 'Predictivo';
}

interface MesProyeccion {
  mes: string;
  totalVentas: number;
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
    NgxEchartsDirective,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
  // Parámetros del modelo (Ventas por Día)
  ventasFecha1 = 0; // P_0
  ventasFecha2 = 0; // P_t
  constanteK = 0.026; 
  tiempoTotal = 30; // Días
  totalProductosAnalizados = 0;

  // Selectores dinámicos
  marcas: any[] = [];
  familias: any[] = [];
  selectedMarca = '';
  selectedMarcaName = '';
  selectedFamilia = '';
  selectedProducto = '';
  productosDropdown: any[] = [];
  productosActuales: any[] = []; 

  // Granularidad
  selectedGranularidad: 'dia' | 'semana' | 'mes' = 'mes';
  diasHistorial = 10; // Rango entre fecha1 y fecha2

  // Estado de Simulación
  fecha1: Date = new Date(new Date().setDate(new Date().getDate() - 10)); // Día 0 (hace 10 días por defecto)
  fecha2: Date = new Date(); // Día T (hoy)
  todayDate: Date = new Date();
  diasProyeccion = 30; // Días a predecir

  // Estado del Detalle de Historial
  historialPeriodo: 'dia' | 'semana' | 'mes' = 'dia';
  historialVista: 'tabla' | 'grafica' = 'tabla';
  datosHistorialAgrupados: { label: string, total: number, sortKey: string }[] = [];
  chartHistorialOption: EChartsOption = {};
  
  // Opciones de Horizonte Temporal dinámicas
  get opcionesTiempo() {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const today = new Date();
    const opciones = [];

    if (this.selectedGranularidad === 'dia') {
      [7, 14, 30, 60, 90].forEach(d => opciones.push({ label: `${d} días`, value: d }));
    } else if (this.selectedGranularidad === 'semana') {
      [1, 2, 4, 8, 12, 24].forEach(w => opciones.push({ label: `${w} semana${w > 1 ? 's' : ''}`, value: w * 7 }));
    } else {
      for (let i = 1; i <= 12; i++) {
        const targetDate = new Date(today.getFullYear(), today.getMonth() + i, today.getDate());
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let label = meses[targetDate.getMonth()];
        if (i === 12) label += ' sig. año';
        label += ` (${i} mes${i > 1 ? 'es' : ''})`;
        opciones.push({ label, value: diffDays });
      }
    }
    return opciones;
  }

  // Datos de Ventas Reales (Historial)
  ventasHistoricas: any[] = [];
  ventasScopeActual = 0;

  // Resultados
  datosSimulacion: DataPoint[] = [];
  resumenMensual: MesProyeccion[] = [];
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

  get historicalRangeLabel(): string {
    return `entre el ${this.fecha1.toLocaleDateString()} y el ${this.fecha2.toLocaleDateString()} (${this.diasHistorial} días)`;
  }

  get selectedProductImage(): string {
    const prod = this.productosDropdown.find(p => p._id === this.selectedProducto);
    return prod?.imagenUrl || 'assets/no-image.png';
  }

  /**
   * Calcula analíticamente en cuántos días el inventario alcanza el punto de reorden.
   * Despejando t de:  puntoReorden = x0 * e^(-k*t)
   *   → t = ln(x0 / puntoReorden) / k
   * Este valor es independiente del horizonte temporal seleccionado.
   */
  get diasParaRestock(): number | null {
    return null; // Ya no aplica para el modelo de ventas
  }

  get fechaRestock(): string | null {
    return null;
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

  getTotalVentasPeriodo(): number {
    return this.resumenMensual.reduce((sum, item) => sum + item.totalVentas, 0);
  }

  getTotalVentasProyectadas(): number {
    return this.datosSimulacion
      .filter(dp => dp.tipo === 'Predictivo')
      .reduce((sum, dp) => sum + dp.unidadesVendidas, 0);
  }

  getStockEnDia(diaProyeccion: number): number {
    const diaRedondeado = Math.round(diaProyeccion);
    if (diaRedondeado === 0) return this.inventarioInicial;
    const item = this.datosSimulacion.find(d => d.tipo === 'Predictivo' && d.dia === diaRedondeado);
    return item ? item.unidades : 0;
  }

  loadInitialData() {
    this.productsService.getMarcas().subscribe(data => this.marcas = data || []);
    this.loadSalesHistory();
  }

  loadSalesHistory() {
    this.ordersService.getPedidos().subscribe({
      next: (pedidos) => {
        // Filtrar solo entregados
        this.ventasHistoricas = pedidos.filter(p => p.estado === 'Entregado');

        if (this.ventasHistoricas.length > 0) {
          // Inicializar fechas con datos recientes si existen
          this.fecha2 = new Date();
          this.fecha1 = new Date(new Date().setDate(new Date().getDate() - 10));
        }

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
        this.productosActuales = productos;
        // Filtro local si hay un producto seleccionado
        let productosScope = productos;
        if (this.selectedProducto) {
          productosScope = productos.filter(p => p._id === this.selectedProducto);
        }

        const totalStock = productosScope.reduce((sum, p) => sum + (p.stock || p.stockTotal || 0), 0);
        this.totalProductosAnalizados = productosScope.length;
        
        this.simular();
      },
      error: () => {
        this.simular();
      }
    });
  }

  calculateDynamicK(productosScope: any[] = []) {
    const d1 = new Date(this.fecha1); d1.setHours(0, 0, 0, 0);
    const d2 = new Date(this.fecha2); d2.setHours(0, 0, 0, 0);

    // Si no viene un scope, usar el actual (Producto seleccionado o toda la familia)
    if (productosScope.length === 0) {
      if (this.selectedProducto) {
        productosScope = this.productosActuales.filter(p => p._id === this.selectedProducto);
      } else {
        productosScope = this.productosActuales;
      }
    }

    const productIdsInScope = new Set(productosScope.map(p => p._id));
    let v1 = 0;
    let v2 = 0;

    this.ventasHistoricas.forEach(pedido => {
      const fechaPedido = new Date(pedido.createdAt);
      fechaPedido.setHours(0, 0, 0, 0);
      
      if (fechaPedido.getTime() === d1.getTime() || fechaPedido.getTime() === d2.getTime()) {
        pedido.productos.forEach((item: any) => {
          const itemId = item.producto?._id || item.productoId || item.producto;
          if (productIdsInScope.has(itemId)) {
            if (fechaPedido.getTime() === d1.getTime()) v1 += (item.cantidad || 0);
            if (fechaPedido.getTime() === d2.getTime()) v2 += (item.cantidad || 0);
          }
        });
      }
    });

    this.ventasFecha1 = v1;
    this.ventasFecha2 = v2;
    this.ventasScopeActual = v1 + v2; // Como indicador global

    const diffTime = d2.getTime() - d1.getTime();
    this.diasHistorial = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

    if (v1 === 0 || v2 === 0) {
      Swal.fire('Atención', 'Una de las fechas seleccionadas tiene 0 ventas para estos productos. El modelo requiere ventas en ambos días para calcular el crecimiento.', 'warning');
      this.constanteK = 0;
    } else if (this.diasHistorial <= 0) {
      Swal.fire('Error de Fechas', 'La Fecha 2 debe ser posterior a la Fecha 1.', 'warning');
      this.constanteK = 0;
    } else {
      this.constanteK = Math.log(v2 / v1) / this.diasHistorial;
    }
  }

  simular() {
    this.calculateDynamicK();

    this.datosSimulacion = [];
    this.resumenMensual = [];
    
    const f1 = new Date(this.fecha1);
    f1.setHours(0, 0, 0, 0);

    this.tiempoTotal = Number(this.diasProyeccion);
    const totalDaysToGraph = this.diasHistorial + this.tiempoTotal;

    // 1. Agrupar ventas reales por día para graficar historial vs predicción
    const ventasPorDia = new Map<string, number>();
    const ids = this.selectedProducto ? [this.selectedProducto] : this.productosActuales.map((p: any) => p._id);
    const scopeSet = new Set(ids);

    this.ventasHistoricas.forEach(p => {
      const fPedido = new Date(p.createdAt);
      fPedido.setHours(0, 0, 0, 0);
      if (fPedido >= f1) {
        const dKey = fPedido.toDateString();
        let cant = 0;
        p.productos.forEach((item: any) => {
          const itemId = item.producto?._id || item.productoId || item.producto;
          if (scopeSet.has(itemId)) cant += (item.cantidad || 0);
        });
        if (cant > 0) ventasPorDia.set(dKey, (ventasPorDia.get(dKey) || 0) + cant);
      }
    });

    // 2. Generar Predicción desde Fecha 1 (t=0) hasta el horizonte
    for (let t = 0; t <= totalDaysToGraph; t++) {
      const currentDate = new Date(f1);
      currentDate.setDate(currentDate.getDate() + t);
      
      const realSales = ventasPorDia.get(currentDate.toDateString()) || 0;
      
      let expectedSales = 0;
      if (this.ventasFecha1 > 0) {
        expectedSales = this.ventasFecha1 * Math.exp(this.constanteK * t);
      }

      this.datosSimulacion.push({
        dia: t,
        fecha: currentDate,
        unidades: expectedSales,
        unidadesVendidas: realSales,
        tipo: t <= this.diasHistorial ? 'Real' : 'Predictivo'
      });
    }

    // 4. Resumen Mensual (Real + Predictivo)
    const agrupacionMensual = new Map<string, number>();
    this.datosSimulacion.forEach(dp => {
      const mesKey = dp.fecha.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
      const mesCapitalized = mesKey.charAt(0).toUpperCase() + mesKey.slice(1);
      // Usar las ventas esperadas para el resumen del negocio
      agrupacionMensual.set(mesCapitalized, (agrupacionMensual.get(mesCapitalized) || 0) + dp.unidades);
    });

    agrupacionMensual.forEach((total, mes) => {
      this.resumenMensual.push({ mes: mes, totalVentas: Math.round(total) });
    });

    this.stockFinal = this.datosSimulacion[this.datosSimulacion.length - 1].unidades;
    this.updateChart();
    this.agruparVentasHistorial(); 
  }

  updateChart() {
    const dates = this.datosSimulacion.map(d => d.fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }));
    const inventoryReal = this.datosSimulacion.map(d => d.tipo === 'Real' ? d.unidades : null);
    const inventoryPred = this.datosSimulacion.map(d => d.tipo === 'Predictivo' ? d.unidades : null);
    
    // Conectar el último punto real con el primero predictivo para continuidad visual
    const lastRealIdx = this.datosSimulacion.findIndex((d, i) => d.tipo === 'Real' && this.datosSimulacion[i+1]?.tipo === 'Predictivo');
    if (lastRealIdx !== -1) {
      inventoryPred[lastRealIdx] = inventoryReal[lastRealIdx];
    }

    const salesReal = this.datosSimulacion.map(d => d.tipo === 'Real' ? d.unidadesVendidas : null);
    const salesPred = this.datosSimulacion.map(d => d.tipo === 'Predictivo' ? d.unidadesVendidas : null);

    this.chartOption = {
      backgroundColor: 'transparent',
      legend: {
        data: ['Modelo Estimado (Exponencial)', 'Ventas Reales Detectadas'],
        textStyle: { color: '#666' },
        top: '2%'
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(30, 30, 30, 0.95)',
        borderColor: '#D4AF37',
        textStyle: { color: '#fff' },
        formatter: (params: any) => {
          let html = `<div style="padding: 5px;"><b style="color: #D4AF37;">${params[0].name}</b><br/>`;
          params.forEach((p: any) => {
            if (p.value !== null && p.value !== undefined) {
              const marker = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${p.color};"></span>`;
              html += `${marker} ${p.seriesName}: <b>${Math.round(p.value)}</b><br/>`;
            }
          });
          html += '</div>';
          return html;
        }
      },
      grid: {
        top: '12%',
        left: '4%',
        right: '12%',
        bottom: '8%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#e2dcd6' } },
        axisLabel: { 
          color: '#666', 
          rotate: 45,
          interval: dates.length > 30 ? 'auto' : 0
        }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Cant. Ventas',
          axisLine: { show: false },
          axisLabel: { color: '#666' },
          splitLine: { lineStyle: { type: 'solid', color: '#f0f0f0' } },
          min: 0
        }
      ],
      series: [
        {
          name: 'Modelo Estimado (Exponencial)',
          type: 'line',
          data: inventoryReal.map((val, i) => val || inventoryPred[i]), // Unimos la curva estimada entera
          smooth: true,
          lineStyle: { color: '#D4AF37', width: 4 },
          itemStyle: { color: '#D4AF37' },
          symbol: 'none'
        },
        {
          name: 'Ventas Reales Detectadas',
          type: 'bar',
          data: salesReal,
          itemStyle: { color: '#4CAF50', opacity: 0.6 },
          barWidth: '50%'
        },
        {
          type: 'line',
          markLine: {
            silent: true,
            symbol: ['none', 'none'],
            data: [
              { 
                xAxis: dates[lastRealIdx] || dates[0], 
                label: { show: true, formatter: 'DÍA X (Fórmula K)', position: 'end', backgroundColor: '#F44336', color: '#fff', padding: [2, 4], borderRadius: 4 },
                lineStyle: { color: '#F44336', type: 'solid', width: 2 } 
              }
            ]
          }
        }
      ]
    };
  }

  // --- NUEVOS MÉTODOS PARA EL DETALLE DE HISTORIAL ---

  setHistorialPeriodo(p: 'dia' | 'semana' | 'mes') {
    this.historialPeriodo = p;
    this.agruparVentasHistorial();
  }

  setHistorialVista(v: 'tabla' | 'grafica') {
    this.historialVista = v;
    if (v === 'grafica') this.updateChartHistorial();
  }

  agruparVentasHistorial() {
    const agrupado = new Map<string, { label: string, total: number, sortKey: string }>();
    
    // Scope actual
    let ids = this.productosActuales.map((p: any) => p._id);
    if (this.selectedProducto) ids = [this.selectedProducto];
    const scopeSet = new Set(ids);

    this.ventasHistoricas.forEach(p => {
      const fecha = new Date(p.createdAt);
      let label = '';
      let sortKey = '';

      if (this.historialPeriodo === 'dia') {
        sortKey = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
        label = sortKey;
      } else if (this.historialPeriodo === 'semana') {
        const d = new Date(fecha);
        const day = d.getDay() || 7;
        d.setDate(d.getDate() - (day - 1));
        sortKey = d.toISOString().split('T')[0];
        label = `Semana ${d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}`;
      } else {
        const d = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
        sortKey = d.toISOString().split('T')[0]; // YYYY-MM-01
        label = fecha.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
        label = label.charAt(0).toUpperCase() + label.slice(1);
      }

      let cant = 0;
      p.productos.forEach((item: any) => {
        const itemId = item.producto?._id || item.productoId || item.producto;
        if (scopeSet.has(itemId)) cant += (item.cantidad || 0);
      });

      if (cant > 0) {
        const existing = agrupado.get(label);
        if (existing) {
          existing.total += cant;
        } else {
          agrupado.set(label, { label, total: cant, sortKey });
        }
      }
    });

    // Convertir a array y ordenar ASCENDENTE por sortKey
    this.datosHistorialAgrupados = Array.from(agrupado.values())
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    if (this.historialVista === 'grafica') this.updateChartHistorial();
  }

  updateChartHistorial() {
    this.chartHistorialOption = {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: this.datosHistorialAgrupados.map(d => d.label),
        axisLabel: { rotate: 45 }
      },
      yAxis: { type: 'value', name: 'Ventas' },
      series: [{
        data: this.datosHistorialAgrupados.map(d => d.total),
        type: 'bar',
        itemStyle: { color: '#D4AF37' },
        showBackground: true,
        backgroundStyle: { color: 'rgba(180, 180, 180, 0.2)' }
      }]
    };
  }
}
