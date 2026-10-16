# ACTIVIDAD 3 - PRÁCTICA: REPORTE DE CONFIGURACIÓN DEL ENTORNO DE DESARROLLO PWA

---

## 1. PORTADA

- **Nombre de la Institución:** Universidad / Instituto Tecnológico
- **Carrera / Programa:** Ingeniería en Sistemas Computacionales / Desarrollo de Software
- **Asignatura:** Aplicaciones Web Progresivas (PWA)
- **Nombre de la Actividad:** Actividad 3.- Práctica: Entrega de Reporte con la Configuración del Entorno de Desarrollo
- **Nombre del Alumno:** Oscar David De la Cruz Hernández
- **Nombre del Docente:** [Nombre del Profesor]
- **Fecha de Entrega:** 29 de Septiembre de 2026
- **Proyecto:** Distribuidora Panamericana PWA

---

## 2. INTRODUCCIÓN Y CONTEXTO DEL ENTORNO DE DESARROLLO

El entorno de desarrollo para una **Aplicación Web Progresiva (PWA)** abarca el conjunto de herramientas, runtimes, controladores de versión, frameworks y archivos de configuración que permiten construir, ejecutar, compilar y auditar una aplicación web moderna capaz de comportarse como una aplicación nativa.

El objetivo principal de esta configuración es garantizar que la aplicación cuente con la capacidad de **funcionar de forma offline (sin conexión a internet)**, permitiendo a los usuarios interactuar con la interfaz, consultar productos precargados y almacenar elementos en el carrito de compras sin perder su información al recuperar la conectividad.

---

## 3. LISTA DE HERRAMIENTAS UTILIZADAS

| Categoría                 | Herramienta                  | Versión / Tipo             | Descripción y Función en el Proyecto                                                                          |
| :------------------------ | :--------------------------- | :------------------------- | :------------------------------------------------------------------------------------------------------------ |
| **Entorno de Ejecución**  | Node.js                      | v18+ / v20+                | Runtime de JavaScript del lado del servidor para gestionar paquetes y ejecutar el entorno local.              |
| **Gestor de Paquetes**    | npm                          | v9+ / v10+                 | Administrador de dependencias del proyecto para instalar librerías como Angular, Material UI y RxJS.          |
| **Framework Frontend**    | Angular                      | v18+                       | Framework SPA de base para la estructuración de la PWA basada en componentes standalone.                      |
| **CLI de Desarrollo**     | Angular CLI                  | `@angular/cli`             | Herramienta de línea de comandos para compilar, servidor de pruebas (`ng serve`) y compilación de producción. |
| **Editor de Código**      | Visual Studio Code           | IDE                        | Entorno de desarrollo integrado para la edición de código TypeScript, HTML, CSS y JSON.                       |
| **Control de Versiones**  | Git & GitHub                 | VCS                        | Sistema de control de versiones distribuido para el seguimiento de cambios y repositorio remoto.              |
| **Hosting Frontend**      | Vercel                       | Cloud Deployment           | Plataforma de despliegue continuo donde se hospeda la versión pública de la PWA.                              |
| **Hosting Backend**       | Render.com                   | Cloud Platform             | Servidor backend que aloja la API REST desarrollada en Node.js/Express y MongoDB Atlas.                       |
| **Auditoría & Debugging** | Chrome DevTools / Lighthouse | Herramientas del Navegador | Suite de inspección de Service Workers, almacenamiento local (`localStorage`) y auditoría PWA.                |

---

## 4. PARÁMETROS DE CONFIGURACIÓN DEL ENTORNO

A continuación se detallan los archivos de configuración clave dentro de la estructura de la PWA y los parámetros establecidos:

### 4.1. Configuración de Compilación (`angular.json`)

Define los parámetros de construcción del proyecto frontend:

- **`assets`**: Declara las carpetas públicas (`src/assets`, `favicon.ico`, `_redirects`) que se distribuyen estáticamente.
- **`optimization`**:
  - `scripts: true`: Minificación de código JavaScript.
  - `styles.inlineCritical: true`: Inlining de CSS crítico para acelerar el renderizado inicial.
  - `fonts.inline: true`: Optimización de fuentes de Google Fonts.
- **`budgets`**: Establece límites de tamaño para advertencias y errores en los bundles compilados (máximo 1 MB inicial).

### 4.2. Gestión de Dependencias (`package.json`)

Configuración de librerías y comandos del proyecto:

- **Comandos de script principales**:
  - `npm start`: Ejecuta el servidor de desarrollo local.
  - `npm run build`: Compila la versión optimizada de producción en la carpeta `dist/prynuevo`.
- **Dependencias principales**: `@angular/core`, `@angular/router`, `@angular/material`, `rxjs`, `zone.js`.

### 4.3. Web App Manifest (`manifest.webmanifest` / `manifest.json`)

Archivo de configuración que permite la instalabilidad de la PWA en dispositivos móviles y de escritorio:

- **`name`**: "Distribuidora Panamericana"
- **`short_name`**: "Panamericana"
- **`start_url`**: `"/"` (Ruta de inicio de la aplicación)
- **`display`**: `"standalone"` (Ejecución en ventana independiente sin barras de navegador)
- **`theme_color`**: `"#111111"`
- **`background_color`**: `"#FFFFFF"`
- **`icons`**: Arreglo de íconos en resoluciones 192x192 px y 512x512 px para accesos directos en pantalla de inicio.

---

## 5. CONFIGURACIÓN Y FUNCIONALIDADES NATIVAS PWA IMPLEMENTADAS

Para cumplir con los requerimientos de navegabilidad offline y experiencia de aplicación nativa, se integran las siguientes tecnologías y Web APIs:

### 5.1. Almacenamiento Local del Carrito (`localStorage` / `CartService`)

- La PWA implementa un servicio dedicado `CartService` que se suscribe a los cambios del carrito de compras.
- Cada vez que el usuario añade, modifica o elimina un producto (estando online u offline), el estado del carrito se serializa automáticamente en formato JSON dentro de `localStorage` bajo la clave `cart`.
- Al cerrar la pestaña o perder la conexión a internet, el carrito conserva los productos precargados. Al abrir la PWA sin internet, los productos siguen disponibles de inmediato.

### 5.2. Indicador del Estado de Conexión en Tiempo Real (`navigator.onLine` / Eventos `online` y `offline`)

- Se configura la detección del estado de la red mediante los eventos nativos `window.addEventListener('online')` y `window.addEventListener('offline')`.
- Despliega un banner al perder conexión y lo oculta al recuperar la red. `navigator.onLine` indica conectividad del dispositivo; no garantiza que el servidor esté disponible.

### 5.3. Retroalimentación Háptica al Agregar al Carrito (`Vibration API`)

- Mediante la Web API `navigator.vibrate()`, la aplicación ejecuta una ligera vibración táctil (50 ms) al presionar los botones de acción principal (agregar productos al carrito o confirmar pedido).
- La vibración depende del navegador y dispositivo; se omite cuando la API no está disponible.

### 5.4. Compartido Nativo de Productos (`Web Share API`)

- Integración del método `navigator.share()` en la vista de detalle de catálogo.
- Permite al usuario compartir directamente enlaces e información de productos a aplicaciones externas (WhatsApp, Facebook, Telegram, SMS) mediante la hoja de compartido del sistema operativo.

### 5.5. Indicador Numérico en el Ícono de la PWA (`App Badge API`)

- Haciendo uso de `navigator.setAppBadge()`, cuando la PWA se encuentra instalada en el dispositivo del usuario, se refleja un contador dinámico en el ícono de la pantalla de inicio correspondiente a la cantidad de ítems dentro del carrito.

---

## 6. CONCLUSIÓN

### Configuración actualizada — 11 de octubre de 2026

- El service worker se registra inmediatamente en producción. En desarrollo (`npm start`) permanece desactivado.
- Se conserva el aviso de instalación con SweetAlert2 cuando el navegador emite `beforeinstallprompt`, con espera de ocho segundos y aplazamiento de siete días al rechazarlo. La instalación y las APIs nativas dependen del navegador.
- Se precargan los archivos de código y recursos locales del grupo `assets`. Las imágenes externas se guardan al consultarlas. No se garantiza contenido que nunca se descargó.
- La caché de catálogo permite únicamente rutas públicas GET y HEAD, con vigencia de un día, máximo 100 respuestas y espera de red de diez segundos. Perfil, direcciones, pedidos, pagos y exportaciones quedan fuera.
- Las imágenes consultadas de `https://res.cloudinary.com/da8xounzu/image/upload/` tienen una caché de hasta 150 respuestas durante siete días. Otros proveedores requieren reglas adicionales.
- Hay aviso de nueva versión con acción Actualizar y aviso de recuperación con acción Recargar. La recarga requiere una acción del usuario; puede perder cambios de formularios no guardados. Se comprueban actualizaciones al recuperar conexión y periódicamente.
- El carrito persiste en `localStorage`. El checkout y la creación de órdenes requieren conexión; no se encolan pagos offline. Ante errores se debe revisar Mis compras y PayPal antes de reintentar.
- El compartido expresa precios en MXN y dispone de alternativa mediante portapapeles. Los fallos asíncronos de la API del badge se manejan sin interrumpir la aplicación.

### Información de empresa sin conexión — 12 de octubre de 2026

- El grupo `empresa-publica` almacena contactos, FAQs, historia, misión, visión, políticas, términos y ubicación, incluidas las consultas públicas `activo=true`. Mantiene hasta 30 respuestas durante 30 días. Intenta actualizar desde la red y utiliza la copia guardada después de un segundo de espera o ante fallo de conexión.
- Cuando el service worker controla la aplicación, se descargan automáticamente los apartados montados en el servidor al iniciar online y al recuperar conexión. Esto permite abrirlos posteriormente sin haber visitado cada sección. La primera descarga requiere internet y una respuesta correcta del servidor; el navegador puede desalojar datos por falta de almacenamiento.
- También se contemplan las URLs exactas `/api/empresa` y `/api/informacion` para compatibilidad. Actualmente sus archivos de rutas existen en el backend pero no están montados en `server.js`: no se precargan ni se inventa contenido para esas rutas. La información pública actual se obtiene desde los endpoints separados.
- Los recursos locales se precargan para disponer de logos e iconos offline. La dirección y el horario se consultan desde la copia guardada; el iframe de Google Maps se sustituye por una explicación sin conexión.
- Para validar: abrir online, esperar la instalación/control del service worker y comprobar respuestas en Cache Storage (`empresa-publica`). Activar Offline y abrir contacto, ayuda, historia, misión/visión, privacidad, términos y ubicación. Las operaciones de administración, inicio de sesión y pagos continúan requiriendo conexión.

### Panel y disponibilidad — 12 de octubre de 2026

- En las páginas públicas se ofrece «Consultar información sin conexión», con botón de preparación/actualización, progreso, resultado parcial y lista de los ocho apartados. En las páginas de empresa se muestra la fecha de la copia correspondiente y un aviso si falta el contenido al estar offline o no disponible el servidor.
- Las respuestas públicas se guardan en `panamericana-empresa-fechada-v1`, con fecha real de descarga confirmada, sin credenciales de usuario. Las consultas de estos apartados evitan el service worker y la caché HTTP para no atribuir una fecha nueva a una respuesta antigua. Ante fallo de red se utiliza la copia sin cambiar su fecha. La copia fechada se conserva hasta actualizarla o hasta que se elimine el almacenamiento del navegador; el grupo de compatibilidad del service worker conserva su límite de 30 días.
- Las copias antiguas del grupo `empresa-publica` siguen siendo consultables; sin fecha registrada se informa «fecha no disponible». No se inventa una fecha. La información guardada puede estar desactualizada; debe actualizarse antes de tomar decisiones basadas en horarios o políticas.
- Una comprobación de `/api/health` cada minuto, al iniciar y al reconectar distingue red offline y servidor/base de datos no disponibles, sin usar respuestas cacheadas. El aviso ofrece Reintentar. Un dispositivo conectado no garantiza acceso a internet o al servidor; el mensaje expresa que no se puede contactar al servicio.
- Validación automatizada: `node scripts/test-company-offline.cjs` cubre fechas, lectura offline, ausencia de contenido, red fallida, almacenamiento fallido, descargas parciales y exclusión de rutas privadas. Para validar en navegador: preparar online, revisar fechas, activar Offline, abrir los ocho apartados; borrar una copia y confirmar el aviso; bloquear el backend con la red activa y confirmar el aviso del servidor.

### Comprobaciones de producción

### Avisos de conexión — 16 de octubre de 2026

- El pie de página ofrece Activar/Desactivar avisos de conexión. El permiso se solicita solo al pulsar el botón y la preferencia se conserva localmente. Si está bloqueado o no hay soporte, los avisos dentro de la aplicación siguen disponibles.
- Se notifica la pérdida y recuperación de conectividad del dispositivo, sin avisos al abrir la página y agrupando cambios rápidos. Se usa `showNotification` del registro activo en dispositivos móviles, con alternativa de escritorio cuando no hay worker. La reconexión muestra también un aviso temporal dentro de la aplicación.
- No son notificaciones push del servidor ni un monitor permanente: requieren que la aplicación siga ejecutándose. El sistema puede suspenderla en segundo plano; con la PWA cerrada no se garantiza detectar cambios. La reconexión de red no confirma que el backend esté disponible.
- Prueba: `node scripts/test-connection-notifications.cjs`. Validar además en teléfono instalado con permiso concedido y denegado, alternando Wi-Fi/datos o modo avión con la aplicación abierta.

### Vista pública simplificada — 16 de octubre de 2026

- Se retira el panel desplegable de preparación y reparación, sus botones y lista técnica de descargas. Solo se conservan la fecha y avisos pertinentes en las páginas de empresa; no se muestra un panel vacío en inicio o catálogo.
- La preparación de los ocho apartados públicos se inicia en segundo plano desde la primera apertura con conexión, sin navegación por sus páginas ni botones. Reintenta pendientes cada minuto y al reconectar; las copias correctas se actualizan automáticamente después de 24 horas. La primera descarga debe completarse antes de desconectar internet.
- La comprobación y reparación del shell se conservan en los servicios para mantenimiento, pero sus controles ya no se exponen en la vista pública.

### Descarga automática independiente de datos de empresa

- Los ocho apartados públicos se descargan al abrir la aplicación con conexión, sin esperar al registro o a la verificación del service worker. Se reintentan los pendientes cada minuto y al recuperar conexión. Los apartados descargados correctamente no se vuelven a solicitar automáticamente durante 24 horas; el botón manual permite actualizarlos antes.
- La preparación manual guarda primero los datos y después verifica los archivos de la aplicación. Si la verificación falla, conserva y comunica los datos guardados, sin anunciar que toda la PWA puede recargarse offline. Esto corrige el bloqueo por el que una comprobación del shell impedía preparar Historia, Misión/Visión, FAQs, Contacto, Ubicación, Políticas y Términos.
- La primera descarga de cada contenido requiere conexión y respuesta válida del servidor; no se incluyen textos de empresa inventados como sustituto.

### Reparación de descarga incompleta — 15 de octubre de 2026

- El diagnóstico de Chrome identificó `EXISTING_CLIENTS_ONLY` tras fallar la descarga de un chunk JavaScript con 504. Tener un worker activo y muchos MB guardados no confirma que exista una versión completa de la aplicación.
- El botón de preparación comprueba primero la versión publicada, el estado NORMAL del worker y todos los recursos de los grupos `prefetch`, incluidos `index.html` y los chunks, comparando SHA-1 de las respuestas almacenadas con `ngsw.json`. No anuncia éxito si falta un archivo, su contenido está dañado o las versiones no coinciden. Después prepara los ocho apartados públicos.
- La revisión del diagnóstico y de los nombres de caché usa el formato de Angular 20.1.x; deberá revisarse al actualizar Angular. La verificación es de solo lectura y no modifica las cachés internas del worker.
- «Reparar descarga de la aplicación» requiere internet y confirmación en pantalla por la recarga. Comprueba primero que el HTML del sitio responde, elimina únicamente el registro y cachés Angular del alcance de la aplicación y vuelve a abrir mediante un bypass temporal. Conserva `localStorage` (carrito) y `panamericana-empresa-fechada-v1`. Después de la recarga debe completarse nuevamente la preparación antes de desconectar internet.
- Esta revisión cambia `appData` para generar una versión nueva que Angular pueda instalar al recuperar conexión. Se añaden cabeceras de revalidación para los archivos de control en Vercel. Los cambios solo se aplican al desplegar la compilación completa.
- Pruebas: `node scripts/test-shell-offline.cjs` cubre descarga completa, archivo faltante/dañado, estado degradado y versiones incompatibles; `node scripts/verify-pwa.mjs` verifica además las huellas de todos los archivos de la compilación.
- Prueba de aceptación en Chrome: desplegar, abrir online, pulsar Preparar y esperar la confirmación tanto de archivos como de información; activar Offline y recargar tres veces, abrir rutas internas y reiniciar la pestaña. Para probar reparación, interrumpir una descarga en un perfil de prueba, recuperar internet y usar Reparar. No borrar almacenamiento durante la prueba offline normal. Borrar todos los datos y desconectar antes de reinstalar no puede funcionar.

1. Ejecutar `npm run build` y `node scripts/verify-pwa.mjs` para validar exclusión de rutas privadas, recursos e iconos.
2. Servir la compilación con HTTPS o localhost y esperar a que el service worker se active. Visitar catálogo y productos y añadir artículos al carrito.
3. Activar Offline en DevTools y recargar: comprobar contenido previamente guardado, persistencia del carrito y aviso al intentar pagar.
4. En un navegador compatible, comprobar instalación y apertura independiente. En una pestaña abierta publicar una segunda versión y verificar el aviso y la recarga al aceptar.


La correcta configuración del entorno de desarrollo es la base sobre la cual se construye una Aplicación Web Progresiva robusta. Gracias a la integración de herramientas como Angular CLI, Git, Vercel y DevTools, junto con archivos de configuración estandarizados (`angular.json`, `manifest.json`, `package.json`) y Web APIs modernas (`Vibration API`, `Web Share API`, `App Badge API`, `localStorage`), se garantiza un flujo de trabajo eficiente y una aplicación capaz de ofrecer alta disponibilidad, instalabilidad y tolerancia a fallos de red mediante almacenamiento local persistente.
