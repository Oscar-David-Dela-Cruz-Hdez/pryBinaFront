import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';

export interface ResumenMonitoreo {
  timestamp: string;
  sistema: {
    cpu: { usoPorcentaje: number; nucleos: number; modelo: string };
    ram: { totalMb: number; usadaMb: number; libreMb: number; usoPorcentaje: number };
    nodejs: { heapUsadoMb: number; heapTotalMb: number; rssMb: number; uptimeSegundos: number };
    sistema: { uptimeSegundos: number; plataforma: string; version: string };
  };
  mongo: {
    conexiones: { actuales: number; disponibles: number; totalCreadas: number };
    operaciones: { inserts: number; queries: number; updates: number; deletes: number; getmores: number; commands: number };
    red: { bytesEntradaKb: number; bytesSalidaKb: number; totalRequests: number };
    uptime: { segundos: number };
    version: string;
  };
  http: {
    totalRequests: number;
    errores4xx: number;
    errores5xx: number;
    latenciaPromedioMs: number;
  };
  historialPuntos: number;
}

@Injectable({
  providedIn: 'root'
})
export class MonitoreoService {
  private apiUrl = 'https://prybinaback.onrender.com/api/monitoreo';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    });
  }

  getResumen(): Observable<ResumenMonitoreo> {
    return this.http.get<ResumenMonitoreo>(`${this.apiUrl}/resumen`, {
      headers: this.getAuthHeaders()
    });
  }
}
