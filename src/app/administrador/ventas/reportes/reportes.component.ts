import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

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
    MatTableModule
  ],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
  // Parámetros del modelo
  inventarioInicial = 1500;
  constanteK = 0.012;
  tiempoTotal = 30; // Días
  puntoReorden = 500;

  // Resultados
  datosSimulacion: DataPoint[] = [];
  diaCritico: number | null = null;
  stockFinal = 0;

  // Para el gráfico SVG
  svgPath: string = '';
  svgPoints: string = '';

  ngOnInit() {
    this.simular();
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
