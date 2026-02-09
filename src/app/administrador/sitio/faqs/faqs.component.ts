import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

import { SiteInfoService } from '../../../core/services/admin/site-info.service';

@Component({
  selector: 'app-admin-faqs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatSnackBarModule
  ],
  template: `
    <div class="admin-container">
      <div class="header-section">
        <h2>Gestión de Preguntas Frecuentes (FAQs)</h2>
        <button mat-raised-button color="primary" (click)="toggleForm()">
          <mat-icon>{{ showForm ? 'remove' : 'add' }}</mat-icon>
          {{ showForm ? 'Cancelar' : 'Nueva Pregunta' }}
        </button>
      </div>

      <!-- Formulario Agregar -->
      <mat-card *ngIf="showForm" class="mb-4 fade-in">
        <mat-card-header>
          <mat-card-title>Agregar Nueva FAQ</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="faqForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Pregunta</mat-label>
              <input matInput formControlName="pregunta" placeholder="Ej: ¿Cuáles son los métodos de pago?">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Respuesta</mat-label>
              <textarea matInput formControlName="respuesta" rows="3" placeholder="Respuesta detallada..."></textarea>
            </mat-form-field>

            <div class="actions">
              <button mat-stroked-button type="button" (click)="toggleForm()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="faqForm.invalid || isLoading">
                {{ isLoading ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Lista de FAQs -->
      <div class="faqs-list" *ngIf="faqs.length > 0; else noFaqs">
        <mat-accordion>
          <mat-expansion-panel *ngFor="let faq of faqs">
            <mat-expansion-panel-header>
              <mat-panel-title>
                {{ faq.pregunta }}
              </mat-panel-title>
            </mat-expansion-panel-header>
            
            <p>{{ faq.respuesta }}</p>

            <mat-action-row>
              <button mat-button color="warn" (click)="deleteFaq(faq._id)">
                <mat-icon>delete</mat-icon> Eliminar
              </button>
            </mat-action-row>
          </mat-expansion-panel>
        </mat-accordion>
      </div>

      <ng-template #noFaqs>
        <div class="empty-state">
          <mat-icon>quiz</mat-icon>
          <p>No hay preguntas frecuentes registradas.</p>
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
    .fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class FaqsComponent implements OnInit {
  faqs: any[] = [];
  faqForm!: FormGroup;
  showForm = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private siteInfoService: SiteInfoService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.faqForm = this.fb.group({
      pregunta: ['', Validators.required],
      respuesta: ['', Validators.required]
    });
    this.loadFaqs();
  }

  loadFaqs() {
    this.siteInfoService.getInformacion().subscribe(data => {
      this.faqs = data.preguntasFrecuentes || [];
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.faqForm.reset();
  }

  onSubmit() {
    if (this.faqForm.invalid) return;
    this.isLoading = true;

    this.siteInfoService.addFaq(this.faqForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.faqs = res.faqs; // Backend returns updated array
        this.toggleForm();
        this.snackBar.open('Pregunta agregada correctamente', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Error al agregar pregunta', 'Cerrar', { duration: 3000 });
      }
    });
  }

  deleteFaq(id: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esto",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.siteInfoService.deleteFaq(id).subscribe(res => {
          this.faqs = res.faqs;
          Swal.fire('Eliminado', 'La pregunta ha sido eliminada.', 'success');
        });
      }
    });
  }
}
