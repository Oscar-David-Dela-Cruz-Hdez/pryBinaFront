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
import { ProductsService } from '../../../../core/services/admin/products.service';
import { CartService } from '../../../../core/services/shop/cart.service';
import { FamiliasService } from '../../../../core/services/admin/familias.service';

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
    allProducts: any[] = []; // Almacena todos los productos filtrados para paginación cliente
    marcas: any[] = [];
    familias: any[] = [];
    isLoading = true;
    selectedMarca: string | null = null;
    selectedFamilia: string | null = null;
    searchQuery: string = '';

    // Paginación
    currentPage: number = 1;
    pageSize: number = 12; // 12 productos por página por defecto (se ajusta perfecto a rejilla de 3 o 4 columnas)
    pageSizeOptions: number[] = [10, 12, 15, 24, 36, 48];
    totalPages: number = 1;

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
                this.allProducts = data;
                this.currentPage = 1;
                this.updatePagination();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading products', err);
                this.isLoading = false;
            }
        });
    }

    updatePagination() {
        this.totalPages = Math.ceil(this.allProducts.length / this.pageSize) || 1;
        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
        }
        if (this.currentPage < 1) {
            this.currentPage = 1;
        }
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.products = this.allProducts.slice(startIndex, endIndex);
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
            this.currentPage = page;
            this.updatePagination();
            this.scrollToCatalogTop();
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updatePagination();
            this.scrollToCatalogTop();
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePagination();
            this.scrollToCatalogTop();
        }
    }

    onPageSizeChange(newSize: any) {
        this.pageSize = Number(newSize);
        this.currentPage = 1;
        this.updatePagination();
    }

    get pagesArray(): number[] {
        const pages: number[] = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = startPage + maxVisiblePages - 1;

        if (endPage > this.totalPages) {
            endPage = this.totalPages;
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    }

    get startIndex(): number {
        return this.allProducts.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
    }

    get endIndex(): number {
        return Math.min(this.currentPage * this.pageSize, this.allProducts.length);
    }

    private scrollToCatalogTop() {
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 120, behavior: 'smooth' });
        }
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
