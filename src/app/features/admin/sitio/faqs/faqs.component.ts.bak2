import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

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
    MatExpansionModule
  ],
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.css']
})
export class FaqsComponent implements OnInit {
  faqs: any[] = [];
  faqForm!: FormGroup;
  showForm = false;
  isLoading = false;

  editingId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private siteInfoService: SiteInfoService,
  ) { }

  ngOnInit(): void {
    this.faqForm = this.fb.group({
      pregunta: ['', Validators.required],
      respuesta: ['', Validators.required]
    });
    this.loadFaqs();
  }

  loadFaqs() {
    this.siteInfoService.getFaqs().subscribe(data => {
      this.faqs = data || [];
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.faqForm.reset();
      this.editingId = null;
    }
  }

  editFaq(faq: any) {
    this.editingId = faq._id;
    this.faqForm.patchValue({
      pregunta: faq.pregunta,
      respuesta: faq.respuesta
    });
    this.showForm = true;
  }

  onSubmit() {
    if (this.faqForm.invalid) return;
    this.isLoading = true;

    if (this.editingId) {
      this.siteInfoService.updateFaq(this.editingId, this.faqForm.value).subscribe({
        next: (updatedFaq) => {
          this.isLoading = false;
          const index = this.faqs.findIndex(f => f._id === this.editingId);
          if (index !== -1) {
            this.faqs[index] = updatedFaq;
          }
          this.toggleForm();
          Swal.fire({ icon: 'success', title: '¡Guardado!', text: 'Pregunta actualizada correctamente.', timer: 2000, showConfirmButton: false });
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar la pregunta.' });
          console.error(err);
        }
      });
    } else {
      this.siteInfoService.addFaq(this.faqForm.value).subscribe({
        next: (newFaq) => {
          this.isLoading = false;
          this.faqs.unshift(newFaq); // Add to top
          this.toggleForm();
          Swal.fire({ icon: 'success', title: '¡Guardado!', text: 'Pregunta agregada correctamente.', timer: 2000, showConfirmButton: false });
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo agregar la pregunta.' });
          console.error(err);
        }
      });
    }
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
        this.siteInfoService.deleteFaq(id).subscribe({
          next: () => {
            this.faqs = this.faqs.filter(f => f._id !== id);
            Swal.fire('Eliminado', 'La pregunta ha sido eliminada.', 'success');
          },
          error: (err) => {
            Swal.fire('Error', 'No se pudo eliminar la pregunta.', 'error');
          }
        });
      }
    });
  }
}
