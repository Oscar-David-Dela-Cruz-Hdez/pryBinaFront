import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService, CartItem } from '../../../../core/services/shop/cart.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CheckoutService, DireccionEnvio } from '../../../../core/services/shop/checkout.service';

declare global {
    interface Window { paypal: any; }
}

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule],
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
    cartItems$: Observable<CartItem[]>;
    total = 0;
    showCheckout = false;
    paypalLoading = false;
    paypalRendered = false;
    direccion: DireccionEnvio = { calle: '', ciudad: '', estado: '', cp: '', telefono: '' };

    constructor(
        private cartService: CartService,
        private authService: AuthService,
        private checkoutService: CheckoutService,
        private router: Router
    ) {
        this.cartItems$ = this.cartService.cartItems$;
    }

    ngOnInit(): void {
        this.cartItems$.subscribe(() => this.total = this.cartService.getTotal());
    }

    updateQuantity(item: CartItem, quantity: number) {
        if (quantity > 0) this.cartService.updateQuantity(item._id, quantity);
    }

    removeItem(id: string) { this.cartService.removeFromCart(id); }
    clearCart() { this.cartService.clearCart(); }

    checkout() {
        if (!this.authService.getToken()) {
            Swal.fire({
                title: 'Inicia sesión',
                text: 'Para finalizar tu compra, necesitas iniciar sesión.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#D4AF37',
                confirmButtonText: 'Ir al Login',
                cancelButtonText: 'Cancelar'
            }).then(result => {
                if (result.isConfirmed) this.router.navigate(['/login']);
            });
            return;
        }

        this.showCheckout = true;
        setTimeout(() => document.getElementById('checkout-form')?.scrollIntoView({ behavior: 'smooth' }));
    }

    private direccionCompleta(): boolean {
        return Object.values(this.direccion).every(valor => String(valor).trim().length > 0);
    }

    async prepararPaypal() {
        if (!this.direccionCompleta()) {
            await Swal.fire('Dirección incompleta', 'Completa todos los datos de envío antes de pagar.', 'warning');
            return;
        }
        if (this.paypalRendered) return;

        this.paypalLoading = true;
        try {
            const config = await firstValueFrom(this.checkoutService.getPaypalConfig());
            await this.loadPaypalScript(config.clientId, config.currency);
            this.renderPaypalButtons();
            this.paypalRendered = true;
        } catch (error: any) {
            await Swal.fire('PayPal no disponible', error?.error?.error || 'No se pudo cargar PayPal.', 'error');
        } finally {
            this.paypalLoading = false;
        }
    }

    private loadPaypalScript(clientId: string, currency: string): Promise<void> {
        if (window.paypal) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture&components=buttons`;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('No se pudo descargar PayPal'));
            document.body.appendChild(script);
        });
    }

    private renderPaypalButtons() {
        window.paypal.Buttons({
            style: { layout: 'vertical', shape: 'rect', label: 'paypal' },
            createOrder: async () => {
                const productos = this.cartService.getCartItems().map(item => ({ producto: item._id, cantidad: item.cantidad }));
                const respuesta = await firstValueFrom(this.checkoutService.createPaypalOrder(productos, this.direccion));
                return respuesta.orderId;
            },
            onApprove: async (data: any) => {
                const respuesta = await firstValueFrom(this.checkoutService.capturePaypalOrder(data.orderID));
                this.cartService.clearCart();
                this.showCheckout = false;
                await Swal.fire('Pago confirmado', `Tu pedido ${respuesta.pedido._id} quedó registrado y pagado.`, 'success');
            },
            onError: async (error: any) => {
                console.error('PayPal Checkout:', error);
                await Swal.fire('No se completó el pago', 'Tu carrito se conserva. Intenta nuevamente.', 'error');
            }
        }).render('#paypal-button-container');
    }
}
