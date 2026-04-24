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

interface DataPoint {
  dia: number;
  fecha: Date;
  unidades: number;
  unidadesVendidas: number;
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
  // Parámetros del modelo
  inventarioInicial = 0;
  inventarioInicialHistorico = 0; // Stock al inicio del rango seleccionado
  constanteK = 0.026; 
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
  productosActuales: any[] = []; // Cache para evitar subscribes en simular()

  // Granularidad
  selectedGranularidad: 'dia' | 'semana' | 'mes' = 'mes';
  diasHistorial = 0;

  // Estado de Simulación Dinámica (Rango de datos fuente)
  fechaInicio: Date = new Date(); 
  fechaFin: Date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()); // +1 mes por defecto
  todayDate: Date = new Date();
  diasProyeccion = 0;

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
    return `desde el 01 de Enero (${this.diasHistorial} días)`;
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

  getTotalVentasPeriodo(): number {
    return this.resumenMensual.reduce((sum, item) => sum + item.totalVentas, 0);
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
          // Encontrar el rango total real de los datos para inicializar los calendarios
          const fechas = this.ventasHistoricas.map(p => new Date(p.createdAt).getTime());
          this.fechaInicio = new Date(Math.min(...fechas));
          this.fechaFin = new Date(); // Hoy
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
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);

    // Si no viene un scope, usar el actual (Producto seleccionado o toda la familia)
    if (productosScope.length === 0) {
      if (this.selectedProducto) {
        productosScope = this.productosActuales.filter(p => p._id === this.selectedProducto);
      } else {
        productosScope = this.productosActuales;
      }
    }

    // 1. Filtrar ventas desde fechaInicio hasta HOY
    const productIdsInScope = new Set(productosScope.map(p => p._id));
    let totalVentas = 0;

    this.ventasHistoricas.forEach(pedido => {
      const fechaPedido = new Date(pedido.createdAt);
      if (fechaPedido >= this.fechaInicio && fechaPedido <= hoy) {
        pedido.productos.forEach((item: any) => {
          const itemId = item.producto?._id || item.productoId || item.producto;
          if (productIdsInScope.has(itemId)) {
            totalVentas += (item.cantidad || 0);
          }
        });
      }
    });

    this.ventasScopeActual = totalVentas;
    this.inventarioInicialHistorico = this.inventarioInicial + totalVentas;

    // 2. Calcular días de historial (Desde fechaInicio hasta hoy)
    const diffTime = Math.abs(hoy.getTime() - this.fechaInicio.getTime());
    this.diasHistorial = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // 3. k = ln( (x_today + ventas) / x_today ) / dias_historial
    if (this.inventarioInicial > 0 && this.ventasScopeActual > 0 && this.diasHistorial > 0) {
      const xToday = this.inventarioInicial;
      const xStart = this.inventarioInicial + this.ventasScopeActual;
      this.constanteK = -Math.log(xToday / xStart) / this.diasHistorial;
    } else {
      this.constanteK = 0; 
    }
  }

  simular() {
    // 1. Recalcular el ritmo de venta (k) con las nuevas fechas
    this.calculateDynamicK();

    this.datosSimulacion = [];
    this.diaCritico = null;
    this.resumenMensual = [];
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // 0. Recalcular días de proyeccion (Desde hoy hasta fechaFin)
    const diffPred = this.fechaFin.getTime() - hoy.getTime();
    this.tiempoTotal = Math.max(0, Math.ceil(diffPred / (1000 * 60 * 60 * 24)));
    this.diasProyeccion = this.tiempoTotal;

    const inicioHistorial = new Date(this.fechaInicio);
    inicioHistorial.setHours(0, 0, 0, 0);

    // 1. Agrupar ventas reales por día
    const ventasPorDia = new Map<string, number>();
    
    // Identificar productos en el scope actual
    let ids = this.productosActuales.map((p: any) => p._id);
    if (this.selectedProducto) ids = [this.selectedProducto];
    const scopeSet = new Set(ids);

    this.ventasHistoricas.forEach(p => {
      const fPedido = new Date(p.createdAt);
      if (fPedido >= inicioHistorial && fPedido <= hoy) {
        const dKey = fPedido.toDateString();
        let cant = 0;
        p.productos.forEach((item: any) => {
          const itemId = item.producto?._id || item.productoId || item.producto;
          if (scopeSet.has(itemId)) cant += (item.cantidad || 0);
        });
        if (cant > 0) {
          ventasPorDia.set(dKey, (ventasPorDia.get(dKey) || 0) + cant);
        }
      }
    });

    // 2. Generar Historial (Retrocediendo desde hoy hasta inicioHistorial)
    const puntosHistoricos: DataPoint[] = [];
    let currentStock = this.inventarioInicial;
    
    // Hoy (Día 0)
    puntosHistoricos.push({
      dia: 0,
      fecha: new Date(hoy),
      unidades: currentStock,
      unidadesVendidas: ventasPorDia.get(hoy.toDateString()) || 0,
      tipo: 'Real'
    });

    for (let i = 1; i <= this.diasHistorial; i++) {
      const d = new Date(hoy);
      d.setDate(d.getDate() - i);
      if (d < inicioHistorial) break;

      const vendidas = ventasPorDia.get(d.toDateString()) || 0;
      currentStock += vendidas; // Retrocedemos el inventario

      puntosHistoricos.push({
        dia: -i,
        fecha: d,
        unidades: currentStock,
        unidadesVendidas: vendidas,
        tipo: 'Real'
      });
    }
    // Invertir para que vaya de Enero a Hoy
    this.datosSimulacion = puntosHistoricos.reverse();

    // 3. Generar Predicción (Desde mañana hasta tiempoTotal)
    for (let t = 1; t <= this.tiempoTotal; t++) {
      const unidades = Math.round(this.inventarioInicial * Math.exp(-this.constanteK * t));
      let vendidas = 0;
      const prevUnidades = Math.round(this.inventarioInicial * Math.exp(-this.constanteK * (t - 1)));
      vendidas = Math.max(0, prevUnidades - unidades);

      const fechaSim = new Date(hoy);
      fechaSim.setDate(fechaSim.getDate() + t);

      this.datosSimulacion.push({
        dia: t,
        fecha: fechaSim,
        unidades: unidades,
        unidadesVendidas: vendidas,
        tipo: 'Predictivo'
      });

      // Detectar punto de reorden
      if (unidades <= this.puntoReorden && this.diaCritico === null) {
        this.diaCritico = t;
      }
    }

    // 4. Resumen Mensual (Real + Predictivo)
    const agrupacionMensual = new Map<string, number>();
    this.datosSimulacion.forEach(dp => {
      const mesKey = dp.fecha.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
      const mesCapitalized = mesKey.charAt(0).toUpperCase() + mesKey.slice(1);
      agrupacionMensual.set(mesCapitalized, (agrupacionMensual.get(mesCapitalized) || 0) + dp.unidadesVendidas);
    });

    agrupacionMensual.forEach((total, mes) => {
      this.resumenMensual.push({ mes: mes, totalVentas: Math.round(total) });
    });

    this.stockFinal = this.datosSimulacion[this.datosSimulacion.length - 1].unidades;
    this.updateChart();
    this.agruparVentasHistorial(); // Sincronizar el detalle de historial
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
        data: ['Inventario Real', 'Inventario Proyectado', 'Ventas Reales', 'Ventas Proyectadas'],
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
          name: 'Inventario',
          axisLine: { show: false },
          axisLabel: { color: '#666' },
          splitLine: { lineStyle: { type: 'solid', color: '#f0f0f0' } },
          min: 0
        }
      ],
      series: [
        {
          name: 'Ventas Históricas',
          type: 'line',
          data: inventoryReal,
          smooth: true,
          lineStyle: { color: '#4CAF50', width: 4 },
          itemStyle: { color: '#4CAF50' },
          symbol: 'none'
        },
        {
          name: 'Predicción',
          type: 'line',
          data: inventoryPred,
          smooth: true,
          lineStyle: { color: '#D4AF37', width: 4 },
          itemStyle: { color: '#D4AF37' },
          symbol: 'none'
        },
        {
          type: 'line',
          markLine: {
            silent: true,
            symbol: ['none', 'none'],
            data: [
              { 
                xAxis: dates[lastRealIdx] || dates[0], 
                label: { show: true, formatter: 'HOY', position: 'end', backgroundColor: '#F44336', color: '#fff', padding: [2, 4], borderRadius: 4 },
                lineStyle: { color: '#F44336', type: 'solid', width: 2 } 
              },
              {
                yAxis: this.puntoReorden,
                label: { show: true, formatter: 'Umbral: {c}', position: 'end', color: '#F44336' },
                lineStyle: { color: '#F44336', type: 'dashed', width: 1.5 }
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
