
import { IndexComponent } from './pages/index/index.component';
import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { RecupcontraComponent } from './auth/recupcontra/recupcontra.component';
import { PrivacidadComponent } from './static/privacidad/privacidad.component';
import { TerminosComponent } from './static/terminos/terminos.component';
import {UserdataComponent} from "./usuario/userdata/userdata.component";
import {PasswordComponent} from "./usuario/password/password.component";
import {PreguntaComponent} from "./usuario/pregunta/pregunta.component";

import { ProfileComponent } from './pages/profile/profile.component';



import { Error400Component } from './pages/errores/error400/error400.component';
import { Error404Component } from './pages/errores/error404/error404.component';
import { UbicacionComponent } from './pages/ubicacion/ubicacion.component';
import { InfoGeneralComponent } from './administrador/sitio/informacion/info-general.component';
import { FaqsComponent } from './administrador/sitio/faqs/faqs.component';
import { ContactosComponent } from './administrador/sitio/contactos/contactos.component';
import { UserListComponent } from './administrador/usuarios/user-list/user-list.component';
import { MetodosPagoComponent } from './administrador/ventas/metodos-pago/metodos-pago.component';
import { OfertasComponent } from './administrador/ventas/ofertas/ofertas.component';
import { ProductsComponent } from './administrador/inventario/productos/products.component';
import { CategoriasComponent } from './administrador/inventario/categorias/categorias.component';
import { ProveedoresComponent } from './administrador/inventario/proveedores/proveedores.component';
import { MetodosEnvioComponent } from './administrador/pedidos/metodos-envio/metodos-envio.component';

export const routes: Routes = [
  {
    path: '',
    component: IndexComponent,
    data: { breadcrumb: 'Inicio' }
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
    path: 'ubicacion',
    component: UbicacionComponent,
    data: { breadcrumb: 'Ubicación' }
  },

  // --- RUTAS DE ADMINISTRADOR ---
  {
    path: 'admin/sitio/informacion',
    component: InfoGeneralComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Información General' }
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
    path: 'admin/inventario/productos',
    component: ProductsComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Productos' }
  },
  {
    path: 'admin/inventario/categorias',
    component: CategoriasComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Categorías' }
  },
  {
    path: 'admin/inventario/proveedores',
    component: ProveedoresComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Proveedores' }
  },
  {
    path: 'admin/pedidos/metodos-envio',
    component: MetodosEnvioComponent,
    canActivate: [authGuard],
    data: { breadcrumb: 'Admin / Métodos de Envío' }
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
