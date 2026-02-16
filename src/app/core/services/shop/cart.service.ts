import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface CartItem {
    _id: string;
    nombre: string;
    precio: number;
    imagen: string;
    cantidad: number;
    slug?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
    public cartItems$ = this.cartItemsSubject.asObservable();

    constructor(private snackBar: MatSnackBar) {
        this.loadCart();
    }

    private loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                this.cartItemsSubject.next(JSON.parse(savedCart));
            } catch (e) {
                console.error('Error loading cart', e);
                this.cartItemsSubject.next([]);
            }
        }
    }

    private saveCart(items: CartItem[]) {
        localStorage.setItem('cart', JSON.stringify(items));
        this.cartItemsSubject.next(items);
    }

    getCartItems(): CartItem[] {
        return this.cartItemsSubject.value;
    }

    addToCart(product: any, quantity: number = 1) {
        const currentItems = this.getCartItems();
        const existingItem = currentItems.find(item => item._id === product._id);

        if (existingItem) {
            existingItem.cantidad += quantity;
            this.saveCart([...currentItems]);
            this.snackBar.open(`${product.nombre} actualizado en el carrito`, 'Ok', { duration: 2000 });
        } else {
            const newItem: CartItem = {
                _id: product._id,
                nombre: product.nombre,
                precio: product.precio,
                imagen: product.imagenUrl || 'assets/images/no-image.png',
                cantidad: quantity,
                slug: product.slug || product._id // Fallback if slug missing
            };
            this.saveCart([...currentItems, newItem]);
            this.snackBar.open(`${product.nombre} agregado al carrito`, 'Ok', { duration: 2000 });
        }
    }

    removeFromCart(productId: string) {
        const currentItems = this.getCartItems();
        const updatedItems = currentItems.filter(item => item._id !== productId);
        this.saveCart(updatedItems);
        this.snackBar.open('Producto eliminado del carrito', 'Ok', { duration: 2000 });
    }

    updateQuantity(productId: string, quantity: number) {
        const currentItems = this.getCartItems();
        const item = currentItems.find(i => i._id === productId);
        if (item) {
            item.cantidad = quantity;
            if (item.cantidad <= 0) {
                this.removeFromCart(productId);
            } else {
                this.saveCart([...currentItems]);
            }
        }
    }

    clearCart() {
        this.saveCart([]);
        this.snackBar.open('Carrito vaciado', 'Ok', { duration: 2000 });
    }

    getTotal(): number {
        return this.getCartItems().reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    }

    getItemCount(): number {
        return this.getCartItems().reduce((acc, item) => acc + item.cantidad, 0);
    }
}
