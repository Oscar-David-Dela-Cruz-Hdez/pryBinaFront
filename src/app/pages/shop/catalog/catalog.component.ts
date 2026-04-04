import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Services
import { ProductsService } from '../../../core/services/admin/products.service';
import { CartService } from '../../../core/services/shop/cart.service';
import { FamiliasService } from '../../../core/services/admin/familias.service';

@Component({
    selector: 'app-catalog',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatProgressSpinnerModule,
        MatSnackBarModule
    ],
    templateUrl: './catalog.component.html',
    styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {
    products: any[] = [];
    allProducts: any[] = []; // Store all to filter client-side if needed
    marcas: any[] = [];
    familias: any[] = [];
    isLoading = true;
    selectedMarca: string | null = null;
    selectedFamilia: string | null = null;
    searchQuery: string = '';

    constructor(
        private productsService: ProductsService,
        private familiasService: FamiliasService,
        private cartService: CartService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.loadMarcas();
        this.route.queryParams.subscribe(params => {
            this.selectedMarca = params['marca'] || null;
            this.selectedFamilia = params['familia'] || null;
            this.searchQuery = params['nombre'] || '';
            
            if (this.selectedMarca) {
                this.loadFamilias(this.selectedMarca);
            }
            
            this.loadProducts();
        });
    }

    loadMarcas() {
        this.productsService.getMarcas().subscribe({
            next: (data) => this.marcas = data,
            error: (err) => console.error('Error loading marcas', err)
        });
    }

    loadFamilias(marcaId: string) {
        this.familiasService.getFamilias({ marca: marcaId }).subscribe({
            next: (data) => this.familias = data,
            error: (err) => console.error('Error loading familias', err)
        });
    }

    loadProducts() {
        this.isLoading = true;
        const filters: any = {};
        if (this.selectedMarca) filters.marca = this.selectedMarca;
        if (this.selectedFamilia) filters.familia = this.selectedFamilia;
        if (this.searchQuery) filters.nombre = this.searchQuery;

        this.productsService.getProductos(filters).subscribe({
            next: (data) => {
                this.products = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading products', err);
                this.isLoading = false;
            }
        });
    }

    onMarcaChange(event: any) {
        const selectedOption = event.options[0];
        if (selectedOption) {
            this.selectedMarca = selectedOption.selected ? selectedOption.value : null;
            this.selectedFamilia = null; // Reset
            if (this.selectedMarca) {
                this.loadFamilias(this.selectedMarca);
            } else {
                this.familias = [];
            }
            this.loadProducts(); 
        }
    }

    onFamiliaChange(event: any) {
        const selectedOption = event.options[0];
        if (selectedOption) {
            this.selectedFamilia = selectedOption.selected ? selectedOption.value : null;
            this.loadProducts(); 
        }
    }

    addToCart(product: any) {
        this.cartService.addToCart(product);
    }
}
