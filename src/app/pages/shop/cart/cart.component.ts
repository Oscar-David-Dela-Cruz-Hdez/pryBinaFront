import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Services
import { CartService, CartItem } from '../../../core/services/shop/cart.service';

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

    constructor(private cartService: CartService) {
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
}
