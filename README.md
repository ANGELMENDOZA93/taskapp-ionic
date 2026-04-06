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

### 1. ¿Cuáles fueron los principales desafíos que enfrentaste al implementar las nuevas funcionalidades?

**a) Compatibilidad Angular 20 con Cordova:**
El mayor desafío fue que Ionic CLI genera proyectos con Capacitor por defecto, pero el requisito exigía Cordova. Al integrar Cordova con Angular 20, el comando `ionic cordova build android --prod` falló porque el flag `--platform` no es reconocido por `@angular-devkit/build-angular` en la versión 20. La solución fue separar el proceso: primero compilar la app web con `ng build --configuration production` y luego ejecutar `cordova build android` por separado.

**b) SDK y Gradle desactualizados:**
Cordova Android 15 requiere `build-tools;36.0.0` y Gradle 8+, pero el entorno solo tenía build-tools 34 y Gradle 7.5. Fue necesario instalar Gradle 8.12 manualmente (descarga del ZIP a `$HOME/gradle/`) y actualizar los build-tools del SDK con `sdkmanager --install "build-tools;36.0.0" "platforms;android-36"`. El Gradle wrapper de Cordova además descargó Gradle 8.14.2 automáticamente.

**c) Firebase Remote Config sin credenciales:**
Implementar el FeatureFlagService requería manejar el caso donde Firebase no está configurado (credenciales vacías). Se implementó un patrón de **graceful degradation**: si `environment.firebase.projectId` está vacío, el servicio usa `DEFAULT_FLAGS` locales sin intentar conectar a Firebase, evitando errores en tiempo de ejecución.

**d) Estado reactivo con filtros compuestos:**
Combinar múltiples filtros (estado, categoría, texto de búsqueda) de forma reactiva requirió usar `combineLatest` sobre BehaviorSubjects. El desafío fue mantener la inmutabilidad y que los filtros se aplicaran en cadena sin mutar el array original de tareas.

### 2. ¿Qué técnicas de optimización de rendimiento aplicaste y por qué?

| Técnica | Implementación | Por qué |
|---------|---------------|---------|
| **OnPush Change Detection** | En todos los componentes | Reduce los ciclos de detección de cambios. Angular solo re-evalúa el componente cuando cambian sus `@Input()` o se llama `markForCheck()`. En una lista de +100 tareas, esto evita re-renderizados innecesarios |
| **trackBy en *ngFor** | En todas las listas (tareas, categorías, chips) | Sin trackBy, Angular destruye y recrea todos los nodos DOM al cambiar la lista. Con trackBy por `id`, solo actualiza los elementos que realmente cambiaron |
| **Lazy Loading** | Módulos `TasksModule` y `CategoriesModule` con `loadChildren` | Reduce el bundle inicial de ~300KB a ~150KB. El usuario solo descarga el módulo de categorías cuando navega a esa sección |
| **PreloadAllModules** | Configurado en `app-routing.module.ts` | Después del bootstrap inicial, precarga los módulos lazy en segundo plano. Así la primera carga es rápida y la navegación posterior es instantánea |
| **takeUntil + destroy$** | En todos los componentes con subscripciones | Previene memory leaks al destruir componentes. Cada componente tiene un `Subject` que se completa en `ngOnDestroy`, cancelando todas las subscripciones automáticamente |
| **BehaviorSubject + combineLatest** | En TaskService y CategoryService | Estado reactivo sin polling. Los componentes reciben actualizaciones push cuando cambian los datos, en lugar de consultar periódicamente |
| **Inmutabilidad con spread** | En todas las operaciones de mutación de arrays | `[...current, newItem]` en vez de `current.push()`. Esto permite a OnPush detectar el cambio de referencia y también facilita debugging y time-travel |

### 3. ¿Cómo aseguraste la calidad y mantenibilidad del código?

**Typing estricto (TypeScript strict mode):**
- `strict: true` en tsconfig.json fuerza tipado explícito, null checks, y prohíbe `any` implícito
- Interfaces definidas para todos los modelos (`Task`, `Category`, `FeatureFlags`, `TaskFilter`)
- Los servicios devuelven `Observable<Task>` en vez de `Observable<any>`

**Arquitectura modular Clean Architecture:**
- Separación en capas: `core/` (singleton services), `shared/` (modelos), `features/` (funcionalidades)
- **Smart/Dumb component pattern**: Las pages (smart) gestionan estado y lógica. Los components (dumb) solo reciben `@Input()` y emiten `@Output()`. Esto hace que los dumb components sean fáciles de testear y reutilizar
- Path aliases (`@core`, `@shared`, `@features`) para imports limpios sin rutas relativas largas

**Tests unitarios (35 tests, 83% cobertura):**
- Tests para los 3 servicios principales con mocks de dependencias
- Cobertura de CRUD completo, filtros, validaciones y edge cases
- Karma + Jasmine con ChromeHeadless para CI/CD

**Patrones reactivos consistentes:**
- Todos los servicios usan el mismo patrón: `BehaviorSubject` privado + método público que retorna `Observable`
- Cleanup consistente con `takeUntil(this.destroy$)` en cada componente
- No hay subscripciones huérfanas ni `subscribe()` sin cleanup

**Convenciones de código:**
- Nomenclatura consistente: `*.service.ts`, `*.page.ts`, `*.component.ts`, `*.model.ts`
- Un archivo por componente/servicio
- Commits semánticos (feat, chore, docs, test, build)
