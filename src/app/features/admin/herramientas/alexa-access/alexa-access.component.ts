import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

import { AlexaAccessService, AlexaAdminUser } from '../../../../core/services/admin/alexa-access.service';

@Component({
  selector: 'app-alexa-access',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './alexa-access.component.html',
  styleUrls: ['./alexa-access.component.css']
})
export class AlexaAccessComponent implements OnInit {
  admins: AlexaAdminUser[] = [];
  cargando = true;

  constructor(private alexaAccessService: AlexaAccessService) {}

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.cargando = true;
    this.alexaAccessService.getAdmins().subscribe({
      next: (admins) => {
        this.admins = admins;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudieron cargar los administradores.', 'error');
      }
    });
  }

  getNombreCompleto(admin: AlexaAdminUser): string {
    return [admin.nombre, admin.ap, admin.am].filter(Boolean).join(' ');
  }

  generateToken(admin: AlexaAdminUser): void {
    Swal.fire({
      title: 'Generar token para Alexa',
      text: `Se reemplazara el token actual de ${this.getNombreCompleto(admin)}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Generar token',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.alexaAccessService.generateToken(admin._id).subscribe({
        next: (response) => {
          this.loadAdmins();
          Swal.fire({
            icon: 'success',
            title: 'Token generado',
            html: `
              <p>Dicta este token en Alexa para iniciar sesion:</p>
              <strong style="font-size: 28px; letter-spacing: 6px;">${response.tokenAlexa}</strong>
              <p style="margin-top: 12px;">Guardalo ahora. Despues solo se mostraran los ultimos 4 digitos.</p>
            `,
            confirmButtonText: 'Entendido'
          });
        },
        error: () => Swal.fire('Error', 'No se pudo generar el token.', 'error')
      });
    });
  }

  revokeToken(admin: AlexaAdminUser): void {
    Swal.fire({
      title: 'Revocar token',
      text: `${this.getNombreCompleto(admin)} ya no podra entrar desde Alexa con su token actual.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Revocar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.alexaAccessService.revokeToken(admin._id).subscribe({
        next: () => {
          this.loadAdmins();
          Swal.fire('Revocado', 'El token de Alexa fue eliminado.', 'success');
        },
        error: () => Swal.fire('Error', 'No se pudo revocar el token.', 'error')
      });
    });
  }
}
