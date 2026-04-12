import { Component, Input, Output, EventEmitter, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export interface IconEntry { name: string; label: string; }

export const ICON_SETS: Record<'payment' | 'contact' | 'all', IconEntry[]> = {
  payment: [
    { name: 'credit_card', label: 'Tarjeta' },
    { name: 'payments', label: 'Pagos' },
    { name: 'account_balance', label: 'Banco' },
    { name: 'account_balance_wallet', label: 'Monedero' },
    { name: 'money', label: 'Efectivo' },
    { name: 'local_atm', label: 'ATM' },
    { name: 'attach_money', label: 'Dinero' },
    { name: 'savings', label: 'Ahorros' },
    { name: 'receipt', label: 'Recibo' },
    { name: 'receipt_long', label: 'Factura' },
    { name: 'point_of_sale', label: 'Terminal' },
    { name: 'qr_code', label: 'QR' },
    { name: 'qr_code_2', label: 'QR 2' },
    { name: 'currency_exchange', label: 'Cambio' },
    { name: 'store', label: 'Tienda' },
    { name: 'shopping_bag', label: 'Bolsa' },
    { name: 'shopping_cart', label: 'Carrito' },
    { name: 'monetization_on', label: 'Moneda' },
    { name: 'paid', label: 'Pagado' },
    { name: 'price_check', label: 'Precio' },
    { name: 'contactless', label: 'Sin Contacto' },
    { name: 'nfc', label: 'NFC' },
    { name: 'smartphone', label: 'Celular' },
    { name: 'phone_iphone', label: 'iPhone' }
  ],
  contact: [
    { name: 'call', label: 'Teléfono' },
    { name: 'phone', label: 'Teléfono 2' },
    { name: 'smartphone', label: 'Celular' },
    { name: 'email', label: 'Email' },
    { name: 'mail', label: 'Correo' },
    { name: 'chat', label: 'Chat' },
    { name: 'chat_bubble', label: 'Burbuja' },
    { name: 'message', label: 'Mensaje' },
    { name: 'forum', label: 'Foro' },
    { name: 'language', label: 'Web' },
    { name: 'public', label: 'Global' },
    { name: 'location_on', label: 'Ubicación' },
    { name: 'place', label: 'Lugar' },
    { name: 'map', label: 'Mapa' },
    { name: 'near_me', label: 'Cerca de mí' },
    { name: 'send', label: 'Enviar' },
    { name: 'share', label: 'Compartir' },
    { name: 'link', label: 'Enlace' },
    { name: 'contacts', label: 'Contactos' },
    { name: 'contact_phone', label: 'Contacto Tel.' },
    { name: 'business', label: 'Negocio' },
    { name: 'storefront', label: 'Tienda' },
    { name: 'tag', label: 'Etiqueta' },
    { name: 'alternate_email', label: 'Arroba' }
  ],
  all: []
};

// 'all' es la unión de ambos sets sin duplicados
ICON_SETS.all = [...new Map(
  [...ICON_SETS.payment, ...ICON_SETS.contact].map(i => [i.name, i])
).values()];

@Component({
  selector: 'app-icon-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.css']
})
export class IconPickerComponent implements OnInit {
  @Input() value: string = '';
  @Input() iconSet: 'payment' | 'contact' | 'all' = 'all';
  @Output() iconSelected = new EventEmitter<string>();

  isOpen = false;
  searchQuery = '';
  allIcons: IconEntry[] = [];
  filteredIcons: IconEntry[] = [];
  panelTop = 0;
  panelLeft = 0;
  panelWidth = 0;

  constructor(private elRef: ElementRef) {}

  ngOnInit(): void {
    this.allIcons = ICON_SETS[this.iconSet] || ICON_SETS.all;
    this.filteredIcons = [...this.allIcons];
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchQuery = '';
      this.filteredIcons = [...this.allIcons];
      // Calcular posición del panel relativa al viewport para position:fixed
      const trigger = this.elRef.nativeElement.querySelector('.icon-picker-trigger');
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        this.panelTop = rect.bottom + 6;
        this.panelLeft = rect.left;
        this.panelWidth = rect.width;
      }
    }
  }

  search(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredIcons = q
      ? this.allIcons.filter(i => i.name.includes(q) || i.label.toLowerCase().includes(q))
      : [...this.allIcons];
  }

  select(iconName: string): void {
    this.value = iconName;
    this.iconSelected.emit(iconName);
    this.isOpen = false;
    this.searchQuery = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.isOpen && !this.elRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
