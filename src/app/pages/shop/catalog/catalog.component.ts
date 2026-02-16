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
    categories: any[] = [];
    isLoading = true;
    selectedCategory: string | null = null;
    searchQuery: string = '';

    constructor(
        private productsService: ProductsService,
        private cartService: CartService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.loadCategories();
        this.route.queryParams.subscribe(params => {
            this.selectedCategory = params['category'] || null;
            this.searchQuery = params['q'] || '';
            this.loadProducts();
        });
    }

    loadCategories() {
        this.productsService.getCategorias().subscribe({
            next: (data) => this.categories = data,
            error: (err) => console.error('Error loading categories', err)
        });
    }

    loadProducts() {
        this.isLoading = true;
        const filters: any = {};
        if (this.selectedCategory) filters.categoria = this.selectedCategory;
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

    // applyFilters ya no es necesario si el backend filtra, pero podemos mantenerlo si queremos filtro híbrido
    // Por ahora eliminamos la lógica local para confiar en el backend
    onCategoryChange(event: any) {
        const selectedOption = event.options[0];
        // MatSelectionList toggle behavior: if unselected, event value might differ
        // Simply check selectedCategory model update or handle directly
        if (selectedOption) {
            this.selectedCategory = selectedOption.selected ? selectedOption.value : null;
            this.loadProducts(); // Call API with new filter
        }
    }

    addToCart(product: any) {
        this.cartService.addToCart(product);
    }
}
