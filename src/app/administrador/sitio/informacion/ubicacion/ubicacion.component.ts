import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';

import { SiteInfoService } from '../../../../core/services/admin/site-info.service';

@Component({
    selector: 'app-admin-ubicacion',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ],
    templateUrl: './ubicacion.component.html',
    styleUrls: ['./ubicacion.component.css']
})
export class AdminUbicacionComponent implements OnInit {
    form!: FormGroup;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private siteInfoService: SiteInfoService
    ) { }

    ngOnInit(): void {
        this.form = this.fb.group({
            direccion: [''],
            latitud: [0],
            longitud: [0],
            googleMapsUrl: [''],
            telefono: [''],
            horario: ['']
        });
        this.loadData();
    }

    loadData() {
        this.siteInfoService.getUbicacion().subscribe({
            next: (data) => {
                if (data) {
                    this.form.patchValue(data);
                }
            },
            error: (err) => console.error('Error al cargar ubicación', err)
        });
    }

    onSubmit() {
        if (this.form.invalid) return;
        this.isLoading = true;

        this.siteInfoService.updateUbicacion(this.form.value).subscribe({
            next: () => {
                this.isLoading = false;
                Swal.fire({ icon: 'success', title: '¡Guardado!', text: 'Ubicación actualizada correctamente.', timer: 2000, showConfirmButton: false });
            },
            error: () => {
                this.isLoading = false;
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar la ubicación.' });
            }
        });
    }
}
