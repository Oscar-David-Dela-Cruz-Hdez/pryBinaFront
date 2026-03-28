import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

import { SalesService } from '../../../core/services/admin/sales.service';
import { ProductsService } from '../../../core/services/admin/products.service';

@Component({
  selector: 'app-admin-ofertas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './ofertas.component.html',
  styleUrls: ['./ofertas.component.css']
})
export class OfertasComponent implements OnInit {
  ofertas: any[] = [];
  categoriasDisponibles: any[] = [];
  productosDisponibles: any[] = [];
  
  offerForm!: FormGroup;
  showForm = false;
  isEditing = false;
  editingId: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService,
    private productsService: ProductsService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.offerForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      tipoDescuento: ['porcentaje', Validators.required],
      valorDescuento: [0, [Validators.required, Validators.min(0)]],
      productos: [[]],
      categorias: [[]],
      fechaInicio: [new Date(), Validators.required],
      fechaFin: [new Date(), Validators.required],
      activo: [true]
    });
    this.loadData();
  }

  loadData() {
    this.salesService.getOfertas().subscribe(data => {
      this.ofertas = data || [];
    });
    
    this.productsService.getCategorias().subscribe(data => {
       this.categoriasDisponibles = data || [];
    });
    
    this.productsService.getProductos().subscribe(data => {
       this.productosDisponibles = data || [];
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.offerForm.reset({ 
        tipoDescuento: 'porcentaje', 
        valorDescuento: 0, 
        activo: true, 
        productos: [], 
        categorias: [],
        fechaInicio: new Date(),
        fechaFin: new Date()
      });
      this.isEditing = false;
      this.editingId = null;
    }
  }

  editOffer(offer: any) {
    this.isEditing = true;
    this.editingId = offer._id;
    
    const formData = { ...offer };
    if (offer.productos && offer.productos.length > 0) {
      formData.productos = offer.productos.map((p: any) => p._id || p);
    }
    if (offer.categorias && offer.categorias.length > 0) {
      formData.categorias = offer.categorias.map((c: any) => c._id || c);
    }

    this.offerForm.patchValue(formData);
    this.showForm = true;
  }

  onSubmit() {
    if (this.offerForm.invalid) return;
    this.isLoading = true;

    if (this.isEditing && this.editingId) {
      this.salesService.updateOferta(this.editingId, this.offerForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Oferta actualizada correctamente');
          this.loadData(); 
        },
        error: () => this.handleError()
      });
    } else {
      this.salesService.createOferta(this.offerForm.value).subscribe({
        next: (res) => {
          this.finishSubmit('Oferta creada correctamente');
          this.loadData();
        },
        error: () => this.handleError()
      });
    }
  }

  finishSubmit(msg: string) {
    this.isLoading = false;
    this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
    this.toggleForm();
  }

  handleError() {
    this.isLoading = false;
    this.snackBar.open('Error al guardar', 'Cerrar', { duration: 3000 });
  }

  deleteOffer(offer: any) {
    Swal.fire({
      title: '¿Eliminar oferta?',
      text: "No podrás revertir esto",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.salesService.deleteOferta(offer._id).subscribe({
          next: () => {
             this.loadData();
             Swal.fire('Eliminado', 'La oferta ha sido eliminada.', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }
}
