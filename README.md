# TaskApp - Aplicación de Gestión de Tareas

Aplicación móvil híbrida de gestión de tareas construida con **Ionic 8**, **Angular 20** y **Cordova**, compilable para Android e iOS.

---

## Tabla de Contenidos

1. [Descripción](#descripción)
2. [Tecnologías](#tecnologías)
3. [Arquitectura](#arquitectura)
4. [Funcionalidades](#funcionalidades)
5. [Prerrequisitos](#prerrequisitos)
6. [Instalación](#instalación)
7. [Ejecución en Navegador](#ejecución-en-navegador)
8. [Compilación Android (APK)](#compilación-android-apk)
9. [Compilación iOS (IPA)](#compilación-ios-ipa)
10. [Tests](#tests)
11. [Firebase Remote Config](#firebase-remote-config)
12. [Optimizaciones de Rendimiento](#optimizaciones-de-rendimiento)
13. [Estructura del Proyecto](#estructura-del-proyecto)
14. [Respuestas Técnicas](#respuestas-técnicas)

---

## Descripción

TaskApp permite crear, editar, eliminar y filtrar tareas organizadas por categorías. Implementa **Firebase Remote Config** para feature flags que controlan la visibilidad de funcionalidades en tiempo real sin necesidad de actualizar la app.

## Tecnologías

| Tecnología         | Versión | Propósito                          |
| ------------------ | ------- | ---------------------------------- |
| Ionic              | 8.x     | Framework UI móvil                 |
| Angular            | 20.x    | Framework frontend                 |
| TypeScript         | 5.9     | Tipado estático                    |
| Cordova            | 13.x    | Compilación nativa Android/iOS     |
| RxJS               | 7.8     | Programación reactiva              |
| Firebase           | 12.x    | Remote Config / Feature Flags      |
| @ionic/storage     | 4.x     | Persistencia local (IndexedDB)     |
| Jasmine + Karma    | 5.x/6.x | Testing unitario                   |

## Arquitectura

La aplicación sigue una **Clean Architecture** organizada por features:

```
src/app/
├── core/              # Servicios singleton (Storage, FeatureFlags)
├── shared/            # Modelos compartidos (Task, Category, FeatureFlags)
└── features/
    ├── tasks/         # Feature principal: gestión de tareas
    │   ├── services/  # TaskService (BehaviorSubject + RxJS)
    │   ├── pages/     # Smart components (TaskList, TaskDetail)
    │   └── components/# Dumb components (TaskItem, TaskFilter)
    └── categories/    # Feature: categorías
        ├── services/  # CategoryService
        ├── pages/     # CategoryList
        └── components/# CategoryItem, CategoryFormModal
```

**Patrones aplicados:**
- **Smart/Dumb Components**: Pages gestionan estado, Components solo presentan datos
- **Reactive State**: BehaviorSubject + combineLatest para estado reactivo
- **OnPush Change Detection**: Optimización de detección de cambios
- **Lazy Loading**: Módulos cargados bajo demanda con PreloadAllModules
- **takeUntil pattern**: Limpieza automática de subscripciones en OnDestroy
- **trackBy**: En todos los *ngFor para optimizar renderizado de listas

## Funcionalidades

### Tareas
- Crear, editar y eliminar tareas
- Marcar como completada/pendiente (toggle)
- Filtrar por estado (todas, pendientes, completadas)
- Filtrar por categoría
- Búsqueda por título
- Ordenamiento: pendientes primero, luego por fecha

### Categorías
- Crear, editar y eliminar categorías
- Selector de color e icono
- Validación de nombres únicos
- Categorías por defecto (Personal, Trabajo, Salud)

### Feature Flags (Firebase Remote Config)
- `enableCategories`: Oculta/muestra toda la funcionalidad de categorías
- `enableDarkMode`: Control de tema oscuro
- `enableExport`: Control de funcionalidad de exportación
- `maxTasksPerUser`: Límite configurable de tareas
- `maintenanceMode`: Modo mantenimiento
- `welcomeMessage`: Mensaje personalizable
- **Fallback**: Si Firebase no está configurado, usa valores por defecto

## Prerrequisitos

```bash
# Node.js 18+ y npm
node -v    # v18.x o superior

# Ionic CLI
npm install -g @ionic/cli

# Cordova CLI
npm install -g cordova

# Para Android:
# - Java JDK 17+
# - Android SDK (via Android Studio)
# - Gradle 8+ (se descarga automáticamente)
# - Variable ANDROID_HOME configurada

# Para iOS (solo macOS):
# - Xcode 15+
# - CocoaPods
```

## Instalación

```bash
cd frontend-mobile/app
npm install
```

## Ejecución en Navegador

```bash
ionic serve
```

Abre automáticamente en `http://localhost:8100`

## Compilación Android (APK)

### 1. Configurar variables de entorno

```bash
# Windows (PowerShell)
$env:ANDROID_HOME = "C:\Users\<tu-usuario>\AppData\Local\Android\Sdk"

# Linux/macOS
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
```

### 2. Build de la app web

```bash
ng build --configuration production
```

### 3. Build APK debug

```bash
cordova build android
```

El APK se genera en:
```
platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

### 4. Build APK release

```bash
cordova build android --release
```

El AAB (Android App Bundle) se genera en:
```
platforms/android/app/build/outputs/bundle/release/app-release.aab
```

### 5. Instalar en dispositivo/emulador

```bash
# Dispositivo conectado por USB
adb install platforms/android/app/build/outputs/apk/debug/app-debug.apk

# O ejecutar directamente
cordova run android
```

## Compilación iOS (IPA)

> **Nota:** Requiere macOS con Xcode instalado.

### 1. Agregar plataforma iOS

```bash
ionic cordova platform add ios
```

### 2. Build

```bash
cordova build ios
```

### 3. Abrir en Xcode

```bash
open platforms/ios/TaskApp.xcworkspace
```

Desde Xcode:
1. Seleccionar el dispositivo o simulador
2. **Product > Run** para ejecutar en simulador
3. **Product > Archive** para generar el IPA

### 4. Ejecutar en simulador

```bash
cordova run ios --target="iPhone-15"
```

## Tests

### Ejecutar tests unitarios

```bash
# Con interfaz de navegador
ng test

# Headless (CI/CD)
ng test --watch=false --browsers=ChromeHeadless

# Con cobertura
ng test --watch=false --browsers=ChromeHeadless --code-coverage
```

### Cobertura actual

| Métrica     | Porcentaje |
| ----------- | ---------- |
| Statements  | 83.33%     |
| Branches    | 51.85%     |
| Functions   | 91.04%     |
| Lines       | 81.88%     |

**Archivos de test:**
- `storage.service.spec.ts` - 6 tests (init, CRUD, clear)
- `task.service.spec.ts` - 12 tests (CRUD, filtros, búsqueda, categorías)
- `category.service.spec.ts` - 8 tests (CRUD, defaults, validación)
- `feature-flag.service.spec.ts` - 6 tests (defaults, flags, isEnabled)
- Componentes: 3 tests auto-generados

## Firebase Remote Config

### Configuración

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Registrar la app con el package `com.taskapp.mobile`
3. Copiar las credenciales de Firebase al archivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'TU_API_KEY',
    authDomain: 'tu-proyecto.firebaseapp.com',
    projectId: 'tu-proyecto',
    storageBucket: 'tu-proyecto.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abc123',
  },
};
```

4. En Firebase Console > Remote Config, crear los parámetros:
   - `enableCategories` (Boolean, default: `true`)
   - `enableDarkMode` (Boolean, default: `false`)
   - `enableExport` (Boolean, default: `false`)
   - `maxTasksPerUser` (Number, default: `100`)
   - `maintenanceMode` (Boolean, default: `false`)
   - `welcomeMessage` (String, default: `""`)

5. Publicar los cambios en Remote Config

### Sin Firebase configurado

La app funciona sin Firebase. Usa valores por defecto definidos en `DEFAULT_FLAGS`:
- Todas las features habilitadas
- Modo mantenimiento desactivado
- 100 tareas máximo por usuario

## Optimizaciones de Rendimiento

### Detección de Cambios
- **OnPush** en todos los componentes: solo se re-renderizan cuando cambian las inputs o se dispara manualmente (`markForCheck`)
- Reduce ciclos innecesarios de change detection

### Renderizado de Listas
- **trackBy** en todos los `*ngFor`: Angular reutiliza elementos DOM en lugar de recrearlos
- Mejora significativa con listas largas de tareas

### Carga Diferida
- **Lazy Loading** con módulos por feature: `TasksModule` y `CategoriesModule` se cargan bajo demanda
- **PreloadAllModules**: Precarga en segundo plano después del bootstrap
- Reduce el bundle inicial

### Estado Reactivo
- **BehaviorSubject + combineLatest**: Flujo de datos reactivo sin polling
- **takeUntil**: Limpieza automática de subscripciones, previene memory leaks

### Almacenamiento
- **@ionic/storage (IndexedDB)**: Persistencia asíncrona no bloqueante
- Inicialización lazy del storage

## Estructura del Proyecto

```
frontend-mobile/app/
├── config.xml                    # Configuración Cordova
├── package.json                  # Dependencias
├── tsconfig.json                 # TypeScript con path aliases
├── karma.conf.js                 # Configuración de tests
├── resources/                    # Iconos y splash screens
├── platforms/
│   └── android/                  # Proyecto Android (Cordova)
├── plugins/                      # Plugins Cordova
├── www/                          # Build output (para Cordova)
└── src/
    ├── index.html
    ├── main.ts
    ├── environments/
    │   ├── environment.ts        # Config desarrollo
    │   └── environment.prod.ts   # Config producción
    └── app/
        ├── app.module.ts         # Módulo raíz con APP_INITIALIZER
        ├── app-routing.module.ts # Routing con lazy loading
        ├── app.component.ts      # Componente raíz
        ├── core/
        │   └── services/
        │       ├── storage.service.ts
        │       ├── storage.service.spec.ts
        │       ├── feature-flag.service.ts
        │       └── feature-flag.service.spec.ts
        ├── shared/
        │   └── models/
        │       ├── task.model.ts
        │       ├── category.model.ts
        │       └── feature-flags.model.ts
        └── features/
            ├── tasks/
            │   ├── tasks.module.ts
            │   ├── tasks-routing.module.ts
            │   ├── services/
            │   │   ├── task.service.ts
            │   │   └── task.service.spec.ts
            │   ├── pages/
            │   │   ├── task-list/
            │   │   └── task-detail/
            │   └── components/
            │       ├── task-item/
            │       └── task-filter/
            └── categories/
                ├── categories.module.ts
                ├── categories-routing.module.ts
                ├── services/
                │   ├── category.service.ts
                │   └── category.service.spec.ts
                ├── pages/
                │   └── category-list/
                └── components/
                    ├── category-item/
                    └── category-form-modal/
```

## Respuestas Técnicas

### 1. ¿Cómo organizaría los componentes en una aplicación Ionic + Angular de gran escala?

Organizaría los componentes siguiendo una **arquitectura modular por features** con tres capas:

- **Core Module (`core/`)**: Servicios singleton globales (autenticación, HTTP interceptors, guards). Se importa una sola vez en AppModule.
- **Shared Module (`shared/`)**: Componentes reutilizables (botones, pipes, directivas, modelos). Se importa en cada feature module que lo necesite.
- **Feature Modules (`features/`)**: Cada funcionalidad de negocio es un módulo independiente con lazy loading. Internamente cada feature tiene su propia estructura de pages (smart components), components (dumb/presentational), services y models.

Los **smart components** (pages) gestionan el estado y llaman a servicios. Los **dumb components** reciben datos por @Input() y emiten eventos por @Output(), sin dependencias de servicios. Esto facilita testing, reutilización y separación de responsabilidades.

Para escalar, aplicaría además: **state management** con NgRx o señales de Angular para features complejas, **barrel exports** (index.ts) para simplificar imports, y **path aliases** en tsconfig para imports limpios.

### 2. ¿Qué estrategias utilizaría para optimizar el rendimiento de una aplicación Ionic con muchos datos?

Aplicaría las siguientes estrategias escalonadas:

1. **Virtual Scrolling** (`ion-virtual-scroll` o `@angular/cdk/scrolling`): Renderiza solo los elementos visibles en viewport, crucial para listas de cientos/miles de items.

2. **OnPush Change Detection**: Reducir los ciclos de detección de cambios. Solo se re-evalúan componentes cuando cambian sus inputs explícitamente.

3. **trackBy en *ngFor**: Evita recrear elementos DOM al mutar la lista. Angular reutiliza nodos existentes basándose en el identificador.

4. **Lazy Loading de módulos**: Cargar solo el código necesario para la vista actual. Reduce el bundle inicial y el tiempo de First Contentful Paint.

5. **Paginación o infinite scroll**: No cargar todos los datos de golpe. `ion-infinite-scroll` carga más datos conforme el usuario hace scroll.

6. **Memoización y pipes puros**: Usar pipes puros para transformaciones costosas que Angular cachea automáticamente.

7. **Web Workers**: Para operaciones pesadas de procesamiento (filtrado complejo, cálculos), mover la lógica a un web worker para no bloquear el main thread.

8. **Índices en almacenamiento**: Si se usa SQLite/IndexedDB, crear índices en campos de búsqueda/filtrado frecuentes.

### 3. ¿Cómo implementaría un sistema de caché offline con sincronización para una app híbrida?

Implementaría un sistema de **offline-first** con las siguientes capas:

1. **Capa de almacenamiento local**: Usar `@ionic/storage` (IndexedDB) o SQLite para almacenar datos estructurados. Cada registro tiene un campo `syncStatus` ('synced', 'pending', 'conflict') y `updatedAt` timestamp.

2. **Cola de operaciones pendientes**: Las operaciones CRUD se ejecutan localmente primero y se encolan en una "sync queue" con el tipo de operación, payload y timestamp. Si hay red, se sincronizan inmediatamente; si no, quedan en cola.

3. **Detección de conectividad**: Usar el plugin `Network` de Capacitor/Cordova y `navigator.onLine` para detectar cambios de conectividad. Al recuperar conexión, procesar la cola FIFO.

4. **Resolución de conflictos**: Estrategia "last-write-wins" basada en timestamps para casos simples. Para datos críticos, implementar CRDT (Conflict-free Replicated Data Types) o presentar al usuario las versiones en conflicto para resolución manual.

5. **Sincronización delta**: Enviar solo los cambios desde el último `lastSyncTimestamp`, no todos los datos. El servidor responde con los cambios remotos desde esa fecha.

6. **Service Worker**: Para cachear assets estáticos y respuestas API con estrategias (@angular/service-worker): Cache First para assets, Network First para API calls.
