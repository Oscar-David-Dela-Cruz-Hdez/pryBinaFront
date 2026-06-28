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
    selector: 'app-admin-historia',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ],
    templateUrl: './historia.component.html',
    styleUrls: ['./historia.component.css']
})
export class HistoriaComponent implements OnInit {
    form!: FormGroup;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private siteInfoService: SiteInfoService
    ) { }

    ngOnInit(): void {
        this.form = this.fb.group({
            historia: ['']
        });
        this.loadData();
    }

    loadData() {
        this.siteInfoService.getHistoria().subscribe({
            next: (data) => {
                if (data && data.texto) {
                    this.form.patchValue({ historia: data.texto });
                }
            },
            error: (err) => console.error('Error al cargar historia', err)
        });
    }

    onSubmit() {
        if (this.form.invalid) return;
        this.isLoading = true;

        const payload = { texto: this.form.value.historia };

        this.siteInfoService.updateHistoria(payload).subscribe({
            next: () => {
                this.isLoading = false;
                Swal.fire({ icon: 'success', title: '¡Guardado!', text: 'Historia actualizada correctamente.', timer: 2000, showConfirmButton: false });
            },
            error: () => {
                this.isLoading = false;
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar la historia.' });
            }
        });
    }
}
