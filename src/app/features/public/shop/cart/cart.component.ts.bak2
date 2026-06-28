import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Services
import { CartService, CartItem } from '../../../core/services/shop/cart.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
    cartItems$: Observable<CartItem[]>;
    total: number = 0;

    constructor(
        private cartService: CartService,
        private authService: AuthService,
        private router: Router
    ) {
        this.cartItems$ = this.cartService.cartItems$;
    }

    ngOnInit(): void {
        this.cartItems$.subscribe(() => {
            this.total = this.cartService.getTotal();
        });
    }

    updateQuantity(item: CartItem, quantity: number) {
        if (quantity > 0) {
            this.cartService.updateQuantity(item._id, quantity);
        }
    }

    removeItem(id: string) {
        this.cartService.removeFromCart(id);
    }

    clearCart() {
        this.cartService.clearCart();
    }

    checkout() {
        if (!this.authService.getToken()) {
            Swal.fire({
                title: 'Inicia sesión',
                text: 'Para finalizar tu compra corporativa, necesitas iniciar sesión gratis.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#D4AF37',
                cancelButtonColor: '#e2dcd6',
                confirmButtonText: 'Ir al Login',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.router.navigate(['/login']);
                }
            });
            return;
        }

        Swal.fire({
            title: 'Procesando pago',
            text: 'Serás redirigido a la pasarela de pago...',
            icon: 'info',
            timer: 2000,
            showConfirmButton: false
        });
    }
}
