import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

import { SiteInfoService } from '../../../core/services/admin/site-info.service';

@Component({
  selector: 'app-admin-contactos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatListModule,
    MatSnackBarModule
  ],
  template: `
    <div class="admin-container">
      <div class="header-section">
        <h2>Gestión de Contactos</h2>
        <button mat-raised-button color="primary" (click)="toggleForm()">
          <mat-icon>{{ showForm ? 'remove' : 'add' }}</mat-icon>
          {{ showForm ? 'Cancelar' : 'Nuevo Contacto' }}
        </button>
      </div>

      <!-- Formulario Agregar/Editar -->
      <mat-card *ngIf="showForm" class="mb-4 fade-in">
        <mat-card-header>
          <mat-card-title>{{ editingId ? 'Editar Contacto' : 'Agregar Nuevo Contacto' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Tipo</mat-label>
              <mat-select formControlName="tipo">
                <mat-option value="email">Email</mat-option>
                <mat-option value="telefono">Teléfono</mat-option>
                <mat-option value="whatsapp">WhatsApp</mat-option>
                <mat-option value="facebook">Facebook</mat-option>
                <mat-option value="instagram">Instagram</mat-option>
                <mat-option value="twitter">Twitter/X</mat-option>
                <mat-option value="otro">Otro</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Valor / Enlace</mat-label>
              <input matInput formControlName="valor" placeholder="Ej: +52 55 1234 5678 o enlace al perfil">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Icono (Material Icon)</mat-label>
              <input matInput formControlName="icono" placeholder="Ej: call, email, public">
              <mat-icon matSuffix *ngIf="contactForm.get('icono')?.value">{{ contactForm.get('icono')?.value }}</mat-icon>
            </mat-form-field>

            <div class="actions">
              <button mat-stroked-button type="button" (click)="toggleForm()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="contactForm.invalid || isLoading">
                {{ isLoading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Lista de Contactos -->
      <mat-card *ngIf="contactos.length > 0; else noData">
        <mat-list>
          <div *ngFor="let contacto of contactos">
            <mat-list-item>
              <mat-icon matListItemIcon>{{ getIcon(contacto) }}</mat-icon>
              <div matListItemTitle class="contact-title">
                <strong>{{ contacto.tipo | titlecase }}:</strong> {{ contacto.valor }}
              </div>
              <button mat-icon-button color="primary" (click)="editContacto(contacto)">
                 <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" matListItemMeta (click)="deleteContacto(contacto._id)">
                <mat-icon>delete</mat-icon>
              </button>
            </mat-list-item>
            <mat-divider></mat-divider>
          </div>
        </mat-list>
      </mat-card>

      <ng-template #noData>
        <div class="empty-state">
           <mat-icon>contact_phone</mat-icon>
          <p>No hay contactos registrados.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .admin-container { padding: 20px; max-width: 900px; margin: 0 auto; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .full-width { width: 100%; margin-bottom: 10px; }
    .mb-4 { margin-bottom: 20px; }
    .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
    .empty-state { text-align: center; padding: 40px; color: #777; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 10px; }
    .contact-title { font-size: 1rem; }
  `]
})
export class ContactosComponent implements OnInit {
  contactos: any[] = [];
  contactForm!: FormGroup;
  showForm = false;
  isLoading = false;

  editingId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private siteInfoService: SiteInfoService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      tipo: ['email', Validators.required],
      valor: ['', Validators.required],
      icono: ['']
    });
    this.loadContactos();
  }

  loadContactos() {
    this.siteInfoService.getContactos().subscribe(data => {
      this.contactos = data || [];
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.contactForm.reset({ tipo: 'email' });
      this.editingId = null;
    }
  }

  editContacto(contacto: any) {
    this.editingId = contacto._id;
    this.contactForm.patchValue({
      tipo: contacto.tipo,
      valor: contacto.valor,
      icono: contacto.icono
    });
    this.showForm = true;
  }

  getIcon(contacto: any): string {
    if (contacto.icono) return contacto.icono;
    switch (contacto.tipo) {
      case 'email': return 'email';
      case 'telefono': return 'call';
      case 'whatsapp': return 'chat';
      case 'facebook': return 'facebook'; // Requiere fontawesome o similar, o usar public
      default: return 'public';
    }
  }

  onSubmit() {
    if (this.contactForm.invalid) return;
    this.isLoading = true;

    if (this.editingId) {
      this.siteInfoService.updateContacto(this.editingId, this.contactForm.value).subscribe({
        next: (updatedContacto) => {
          this.isLoading = false;
          const index = this.contactos.findIndex(c => c._id === this.editingId);
          if (index !== -1) {
            this.contactos[index] = updatedContacto;
          }
          this.toggleForm();
          this.snackBar.open('Contacto actualizado correctamente', 'Cerrar', { duration: 3000 });
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open('Error al actualizar contacto', 'Cerrar', { duration: 3000 });
          console.error(err);
        }
      });
    } else {
      this.siteInfoService.addContacto(this.contactForm.value).subscribe({
        next: (newContacto) => {
          this.isLoading = false;
          this.contactos.push(newContacto);
          this.toggleForm();
          this.snackBar.open('Contacto agregado correctamente', 'Cerrar', { duration: 3000 });
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open('Error al agregar contacto', 'Cerrar', { duration: 3000 });
          console.error(err);
        }
      });
    }
  }

  deleteContacto(id: string) {
    Swal.fire({
      title: '¿Eliminar contacto?',
      text: "No podrás recuperarlo",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.siteInfoService.deleteContacto(id).subscribe({
          next: () => {
            this.contactos = this.contactos.filter(c => c._id !== id);
            Swal.fire('Eliminado', 'El contacto ha sido eliminado.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el contacto.', 'error');
          }
        });
      }
    });
  }
}
