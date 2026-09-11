import { Routes } from '@angular/router';
import { IndexComponent } from './features/public/index/index.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: IndexComponent,
    data: { breadcrumb: 'Inicio' }
  },

  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    data: { breadcrumb: 'Iniciar Sesión' }
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    data: { breadcrumb: 'Registro' }
  },
  {
    path: 'password-recovery',
    loadComponent: () => import('./features/auth/recupcontra/recupcontra.component').then(m => m.RecupcontraComponent),
    data: { breadcrumb: 'Recuperar Contraseña' }
  },

  {
    path: 'perfil',
    loadComponent: () => import('./features/public/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Mi Perfil' }
  },

  {
    path: 'privacidad',
    loadComponent: () => import('./features/public-static/privacidad/privacidad.component').then(m => m.PrivacidadComponent)
  },

  {
    path: 'terminos',
    loadComponent: () => import('./features/public-static/terminos/terminos.component').then(m => m.TerminosComponent)
  },
  {
    path: 'historia',
    loadComponent: () => import('./features/public-static/historia/historia.component').then(m => m.HistoriaPublicComponent),
    data: { breadcrumb: 'Historia' }
  },
  {
    path: 'mision-vision',
    loadComponent: () => import('./features/public-static/mision-vision/mision-vision.component').then(m => m.MisionVisionPublicComponent),
    data: { breadcrumb: 'Misión y Visión' }
  },
  {
    path: 'ayuda',
    loadComponent: () => import('./features/public-static/ayuda/ayuda.component').then(m => m.AyudaPublicComponent),
    data: { breadcrumb: 'Ayuda' }
  },
  {
    path: 'contacto',
    loadComponent: () => import('./features/public-static/contacto/contacto.component').then(m => m.ContactoPublicComponent),
    data: { breadcrumb: 'Contacto' }
  },

  {
    path: 'datos',
    loadComponent: () => import('./features/user/userdata/userdata.component').then(m => m.UserdataComponent),
    data: { breadcrumb: 'Mis Datos' }
  },
  {
    path: 'password',
    loadComponent: () => import('./features/user/password/password.component').then(m => m.PasswordComponent),
    data: { breadcrumb: 'Cambiar Contraseña' }
  },
  {
    path: 'pregunta',
    loadComponent: () => import('./features/user/pregunta/pregunta.component').then(m => m.PreguntaComponent),
    data: { breadcrumb: 'Pregunta de Seguridad' }
  },
  {
    path: 'mis-compras',
    loadComponent: () => import('./features/user/compras/compras.component').then(m => m.ComprasComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Mis compras' }
  },

  {
    path: 'ubicacion',
    loadComponent: () => import('./features/public/ubicacion/ubicacion.component').then(m => m.UbicacionComponent),
    data: { breadcrumb: 'Ubicación' }
  },
  {
    path: 'productos',
    loadComponent: () => import('./features/public/shop/catalog/catalog.component').then(m => m.CatalogComponent),
    data: { breadcrumb: 'Catálogo' }
  },
  {
    path: 'productos/:id',
    loadComponent: () => import('./features/public/shop/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
    data: { breadcrumb: 'Detalle del producto' }
  },
  {
    path: 'carrito',
    loadComponent: () => import('./features/public/shop/cart/cart.component').then(m => m.CartComponent),
    data: { breadcrumb: 'Carrito de Compras' }
  },

  // --- RUTAS DE ADMINISTRADOR ---
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Dashboard' }
  },
  {
    path: 'admin/sitio/mision',
    loadComponent: () => import('./features/admin/sitio/informacion/mision/mision.component').then(m => m.MisionComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Misión' }
  },
  {
    path: 'admin/sitio/historia',
    loadComponent: () => import('./features/admin/sitio/informacion/historia/historia.component').then(m => m.HistoriaComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Historia' }
  },
  {
    path: 'admin/sitio/vision',
    loadComponent: () => import('./features/admin/sitio/informacion/vision/vision.component').then(m => m.VisionComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Visión' }
  },
  {
    path: 'admin/sitio/politicas',
    loadComponent: () => import('./features/admin/sitio/informacion/politicas/politicas.component').then(m => m.PoliticasComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Políticas' }
  },
  {
    path: 'admin/sitio/terminos',
    loadComponent: () => import('./features/admin/sitio/informacion/terminos/terminos.component').then(m => m.TerminosComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Términos' }
  },
  {
    path: 'admin/sitio/ubicacion',
    loadComponent: () => import('./features/admin/sitio/informacion/ubicacion/ubicacion.component').then(m => m.AdminUbicacionComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Ubicación' }
  },
  {
    path: 'admin/sitio/faqs',
    loadComponent: () => import('./features/admin/sitio/faqs/faqs.component').then(m => m.FaqsComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / FAQs' }
  },
  {
    path: 'admin/sitio/contactos',
    loadComponent: () => import('./features/admin/sitio/contactos/contactos.component').then(m => m.ContactosComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Contactos' }
  },
  {
    path: 'admin/usuarios',
    loadComponent: () => import('./features/admin/usuarios/user-list/user-list.component').then(m => m.UserListComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Usuarios' }
  },
  {
    path: 'admin/ventas/reportes',
    loadComponent: () => import('./features/admin/ventas/reportes/reportes.component').then(m => m.ReportesComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Reportes Estadísticos' }
  },
  {
    path: 'admin/ventas/metodos-pago',
    loadComponent: () => import('./features/admin/ventas/metodos-pago/metodos-pago.component').then(m => m.MetodosPagoComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Métodos de Pago' }
  },
  {
    path: 'admin/ventas/ofertas',
    loadComponent: () => import('./features/admin/ventas/ofertas/ofertas.component').then(m => m.OfertasComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Ofertas' }
  },
  {
    path: 'admin/ventas/carrusel',
    loadComponent: () => import('./features/admin/ventas/carrusel/carrusel.component').then(m => m.CarruselComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Carrusel' }
  },
  {
    path: 'admin/inventario/productos',
    loadComponent: () => import('./features/admin/inventario/productos/products.component').then(m => m.ProductsComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Productos' }
  },
  {
    path: 'admin/inventario/marcas',
    loadComponent: () => import('./features/admin/inventario/marcas/marcas.component').then(m => m.MarcasComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Marcas' }
  },
  {
    path: 'admin/inventario/familias',
    loadComponent: () => import('./features/admin/inventario/familias/familias.component').then(m => m.FamiliasComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Familias' }
  },

  {
    path: 'admin/pedidos/metodos-envio',
    loadComponent: () => import('./features/admin/pedidos/metodos-envio/metodos-envio.component').then(m => m.MetodosEnvioComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Métodos de Envío' }
  },
  {
    path: 'admin/pedidos/listado',
    loadComponent: () => import('./features/admin/pedidos/pedidos-list/pedidos-list.component').then(m => m.PedidosComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Gestión de Pedidos' }
  },
  {
    path: 'admin/herramientas',
    loadComponent: () => import('./features/admin/herramientas/herramientas').then(m => m.Herramientas),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Importar Exportar Datos' }
  },
  {
    path: 'admin/herramientas/respaldos',
    loadComponent: () => import('./features/admin/herramientas/respaldos/respaldos').then(m => m.Respaldos),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Respaldos BD' }
  },
  {
    path: 'admin/herramientas/monitoreo',
    loadComponent: () => import('./features/admin/herramientas/monitoreo/monitoreo.component').then(m => m.MonitoreoComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Monitor de Rendimiento' }
  },
  {
    path: 'admin/herramientas/alexa',
    loadComponent: () => import('./features/admin/herramientas/alexa-access/alexa-access.component').then(m => m.AlexaAccessComponent),
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Acceso de Alexa' }
  },

  // Ruta Wildcard para manejar 404 (Debe ir siempre al final)
  {
    path: 'error-400',
    loadComponent: () => import('./features/public/errores/error400/error400.component').then(m => m.Error400Component)
  },
  {
    path: 'error-500',
    loadComponent: () => import('./features/public/errores/error500/error500.component').then(m => m.Error500Component)
  },
  {
    path: '**',
    loadComponent: () => import('./features/public/errores/error404/error404.component').then(m => m.Error404Component)
  }
];
