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
    selector: 'app-admin-politicas',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ],
    templateUrl: './politicas.component.html',
    styleUrls: ['./politicas.component.css']
})
export class PoliticasComponent implements OnInit {
    form!: FormGroup;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private siteInfoService: SiteInfoService
    ) { }

    ngOnInit(): void {
        this.form = this.fb.group({
            politicas: ['']
        });
        this.loadData();
    }

    loadData() {
        this.siteInfoService.getPoliticas().subscribe({
            next: (data) => {
                if (data && data.texto) {
                    this.form.patchValue({ politicas: data.texto });
                }
            },
            error: (err) => console.error('Error al cargar políticas', err)
        });
    }

    onSubmit() {
        if (this.form.invalid) return;
        this.isLoading = true;

        const payload = { texto: this.form.value.politicas };

        this.siteInfoService.updatePoliticas(payload).subscribe({
            next: () => {
                this.isLoading = false;
                Swal.fire({ icon: 'success', title: '¡Guardado!', text: 'Políticas actualizadas correctamente.', timer: 2000, showConfirmButton: false });
            },
            error: () => {
                this.isLoading = false;
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar las políticas.' });
            }
        });
    }
}
