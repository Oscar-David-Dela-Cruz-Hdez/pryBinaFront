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
  templateUrl: './contactos.component.html',
  styleUrls: ['./contactos.component.css']
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
