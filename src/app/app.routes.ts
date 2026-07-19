
import { IndexComponent } from './features/public/index/index.component';
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { RecupcontraComponent } from './features/auth/recupcontra/recupcontra.component';
import { PrivacidadComponent } from './features/public-static/privacidad/privacidad.component';
import { TerminosComponent } from './features/public-static/terminos/terminos.component';
import { HistoriaPublicComponent } from './features/public-static/historia/historia.component';
import { MisionVisionPublicComponent } from './features/public-static/mision-vision/mision-vision.component';
import { AyudaPublicComponent } from './features/public-static/ayuda/ayuda.component';
import { ContactoPublicComponent } from './features/public-static/contacto/contacto.component';
import { UserdataComponent } from "./features/user/userdata/userdata.component";
import { PasswordComponent } from "./features/user/password/password.component";
import { PreguntaComponent } from "./features/user/pregunta/pregunta.component";
import { ComprasComponent } from './features/user/compras/compras.component';

import { ProfileComponent } from './features/public/profile/profile.component';



import { Error400Component } from './features/public/errores/error400/error400.component';
import { Error404Component } from './features/public/errores/error404/error404.component';
import { UbicacionComponent } from './features/public/ubicacion/ubicacion.component';
import { MisionComponent } from './features/admin/sitio/informacion/mision/mision.component';
import { HistoriaComponent } from './features/admin/sitio/informacion/historia/historia.component';
import { VisionComponent } from './features/admin/sitio/informacion/vision/vision.component';
import { PoliticasComponent } from './features/admin/sitio/informacion/politicas/politicas.component';
import { TerminosComponent as AdminTerminosComponent } from './features/admin/sitio/informacion/terminos/terminos.component';
import { AdminUbicacionComponent } from './features/admin/sitio/informacion/ubicacion/ubicacion.component';
import { FaqsComponent } from './features/admin/sitio/faqs/faqs.component';
import { ContactosComponent } from './features/admin/sitio/contactos/contactos.component';
import { UserListComponent } from './features/admin/usuarios/user-list/user-list.component';
import { MetodosPagoComponent } from './features/admin/ventas/metodos-pago/metodos-pago.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { OfertasComponent } from './features/admin/ventas/ofertas/ofertas.component';
import { CarruselComponent } from './features/admin/ventas/carrusel/carrusel.component';
import { ProductsComponent } from './features/admin/inventario/productos/products.component';
import { MarcasComponent } from './features/admin/inventario/marcas/marcas.component';
import { FamiliasComponent } from './features/admin/inventario/familias/familias.component';
import { MetodosEnvioComponent } from './features/admin/pedidos/metodos-envio/metodos-envio.component';
import { PedidosComponent } from './features/admin/pedidos/pedidos-list/pedidos-list.component';
import { CatalogComponent } from './features/public/shop/catalog/catalog.component';
import { CartComponent } from './features/public/shop/cart/cart.component';
import { Herramientas } from './features/admin/herramientas/herramientas';
import { Respaldos } from './features/admin/herramientas/respaldos/respaldos';
import { MonitoreoComponent } from './features/admin/herramientas/monitoreo/monitoreo.component';
import { ReportesComponent } from './features/admin/ventas/reportes/reportes.component';
import { AlexaAccessComponent } from './features/admin/herramientas/alexa-access/alexa-access.component';

export const routes: Routes = [
  {
    path: '',
    component: IndexComponent,
    data: { breadcrumb: 'Inicio' }
  },

  // ... (keep existing lines until 150)

  {
    path: 'admin/pedidos/metodos-envio',
    component: MetodosEnvioComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Métodos de Envío' }
  },
  {
    path: 'admin/pedidos/listado',
    component: PedidosComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Gestión de Pedidos' }
  },

  {
    path: 'login',
    component: LoginComponent,
    data: { breadcrumb: 'Iniciar Sesión' }
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: { breadcrumb: 'Registro' }
  },
  {
    path: 'password-recovery',
    component: RecupcontraComponent,
    data: { breadcrumb: 'Recuperar Contraseña' }
  },

  {
    path: 'perfil',
    component: ProfileComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Mi Perfil' }
  },

  {
    path: 'privacidad',
    component: PrivacidadComponent
  },

  {
    path: 'terminos',
    component: TerminosComponent
  },
  {
    path: 'historia',
    component: HistoriaPublicComponent,
    data: { breadcrumb: 'Historia' }
  },
  {
    path: 'mision-vision',
    component: MisionVisionPublicComponent,
    data: { breadcrumb: 'Misión y Visión' }
  },
  {
    path: 'ayuda',
    component: AyudaPublicComponent,
    data: { breadcrumb: 'Ayuda' }
  },
  {
    path: 'contacto',
    component: ContactoPublicComponent,
    data: { breadcrumb: 'Contacto' }
  },

  {
    path: 'datos',
    component: UserdataComponent,
    data: { breadcrumb: 'Mis Datos' }
  },
  {
    path: 'password',
    component: PasswordComponent,
    data: { breadcrumb: 'Cambiar Contraseña' }
  },
  {
    path: 'pregunta',
    component: PreguntaComponent,
    data: { breadcrumb: 'Pregunta de Seguridad' }
  },
  {
    path: 'mis-compras',
    component: ComprasComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Mis compras' }
  },

  {
    path: 'ubicacion',
    component: UbicacionComponent,
    data: { breadcrumb: 'Ubicación' }
  },
  {
    path: 'productos',
    component: CatalogComponent,
    data: { breadcrumb: 'Catálogo' }
  },
  {
    path: 'carrito',
    component: CartComponent,
    data: { breadcrumb: 'Carrito de Compras' }
  },

  // --- RUTAS DE ADMINISTRADOR ---
  {
    path: 'admin/dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Dashboard' }
  },
  {
    path: 'admin/sitio/mision',
    component: MisionComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Misión' }
  },
  {
    path: 'admin/sitio/historia',
    component: HistoriaComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Historia' }
  },
  {
    path: 'admin/sitio/vision',
    component: VisionComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Visión' }
  },
  {
    path: 'admin/sitio/politicas',
    component: PoliticasComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Políticas' }
  },
  {
    path: 'admin/sitio/terminos',
    component: AdminTerminosComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Términos' }
  },
  {
    path: 'admin/sitio/ubicacion',
    component: AdminUbicacionComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Ubicación' }
  },
  {
    path: 'admin/sitio/faqs',
    component: FaqsComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / FAQs' }
  },
  {
    path: 'admin/sitio/contactos',
    component: ContactosComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Contactos' }
  },
  {
    path: 'admin/usuarios',
    component: UserListComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Usuarios' }
  },
  {
    path: 'admin/ventas/reportes',
    component: ReportesComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Reportes Estadísticos' }
  },
  {
    path: 'admin/ventas/metodos-pago',
    component: MetodosPagoComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Métodos de Pago' }
  },
  {
    path: 'admin/ventas/ofertas',
    component: OfertasComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Ofertas' }
  },
  {
    path: 'admin/ventas/carrusel',
    component: CarruselComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Carrusel' }
  },
  {
    path: 'admin/inventario/productos',
    component: ProductsComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Productos' }
  },
  {
    path: 'admin/inventario/marcas',
    component: MarcasComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Marcas' }
  },
  {
    path: 'admin/inventario/familias',
    component: FamiliasComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Familias' }
  },

  {
    path: 'admin/pedidos/metodos-envio',
    component: MetodosEnvioComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Métodos de Envío' }
  },
  {
    path: 'admin/pedidos/listado',
    component: PedidosComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Gestión de Pedidos' }
  },
  {
    path: 'admin/herramientas',
    component: Herramientas,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Importar Exportar Datos' }
  },
  {
    path: 'admin/herramientas/respaldos',
    component: Respaldos,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Respaldos BD' }
  },
  {
    path: 'admin/herramientas/monitoreo',
    component: MonitoreoComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Monitor de Rendimiento' }
  },
  {
    path: 'admin/herramientas/alexa',
    component: AlexaAccessComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Acceso de Alexa' }
  },

  // Ruta Wildcard para manejar 404 (Debe ir siempre al final)
  {
    path: 'error-400',
    component: Error400Component
  },
  {
    path: '**',
    component: Error404Component
  }
];
