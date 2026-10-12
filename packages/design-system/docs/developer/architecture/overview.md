# Sistema de Diseño PLT

Sistema de componentes visuales portátil para Play, love & Toys, construido sobre daisyUI 5 y Tailwind CSS 4.

## Introducción

El **PLT Design System** es una capa de diseño modular que proporciona fundamentos visuales, componentes primitivos, patrones compuestos y renderizadores multiplataforma para la marca Play, love & Toys. Este sistema está diseñado con una filosofía **daisyUI-first**, aprovechando la anatomía de componentes probada de daisyUI mientras aplica la identidad visual única de PLT.

### Alcance del Sistema

El sistema de diseño se enfoca exclusivamente en la capa visual y de componentes:

- **Tokens de diseño PLT** (`--plt-*`)
- **Tipografía y geometría** de marca
- **Tema `brand`** personalizado para daisyUI
- **Extensiones visuales PLT** como `theme-bordered`, `theme-elevated` y tipografía de etiquetas
- **Patrones compuestos** específicos de PLT
- **Renderizadores normalizados** para Liquid (Shopify) y Astro

**Fuera del alcance**: esquemas editoriales, lógica CMS, comportamiento de negocio Shopify, enrutamiento, estado del carrito, ciclo de vida de aplicación.

### Características Principales

- 🎨 **Identidad visual coherente** con dirección neo-brutalista suave
- 🧩 **Componentes reutilizables** basados en contratos visuales claros
- 🔄 **Renderizadores multiplataforma** (Liquid/Astro) que garantizan anatomía equivalente
- 📦 **Sistema de temas** con múltiples variantes de marca
- 🛒 **Componentes de comercio** especializados para e-commerce
- ⚡ **Integración Shopify CDN** optimizada para imágenes responsivas
- ✅ **Verificación automatizada** de conformidad y contratos

## Arquitectura del Sistema

### Diagrama de Capas

```mermaid
graph TB
    subgraph "Fundamentos Base"
        TW[Tailwind CSS 4<br/>Utilidades de Layout]
        DAISY[daisyUI 5<br/>Anatomía de Componentes]
    end
    
    subgraph "Capa PLT"
        TOKENS[Tokens PLT<br/>--plt-*]
        THEME[Tema Brand<br/>daisyUI theme]
        TYPO[Tipografía<br/>theme-*]
        GEO[Geometría<br/>Bordes & Sombras]
    end
    
    subgraph "Composiciones PLT"
        PRIMS[Primitivos<br/>Extensiones visuales]
        PATTERNS[Patrones<br/>Componentes compuestos]
        COMMERCE[Commerce<br/>Componentes de e-commerce]
    end
    
    subgraph "Renderizadores"
        LIQUID[Liquid<br/>Shopify]
        ASTRO[Astro<br/>Headless/CMS]
    end
    
    TW --> TOKENS
    DAISY --> THEME
    TOKENS --> THEME
    TOKENS --> TYPO
    TOKENS --> GEO
    THEME --> PRIMS
    TYPO --> PRIMS
    GEO --> PRIMS
    PRIMS --> PATTERNS
    PRIMS --> COMMERCE
    PATTERNS --> LIQUID
    PATTERNS --> ASTRO
    COMMERCE --> LIQUID
    COMMERCE --> ASTRO
    
    style TOKENS fill:#533278,color:#fff
    style THEME fill:#F4436C,color:#fff
    style COMMERCE fill:#0C7489,color:#fff
```

### Estructura de Archivos

```mermaid
graph LR
    subgraph "Tokens & Fundamentos"
        T1[tokens/colors.css]
        T2[tokens/typography.css]
        T3[tokens/shadows.css]
        T4[tokens/spacing.css]
        T5[tokens/radius.css]
    end
    
    subgraph "Estilos Base"
        B1[base.css]
        B2[typography.css]
        B3[geometry.css]
        B4[daisyui-theme.css]
    end
    
    subgraph "Componentes"
        C1[primitives.css]
        C2[patterns.css]
        C3[utilities.css]
    end
    
    subgraph "Especializados"
        S1[commerce/*.js,ts]
        S2[shopify/*.ts]
    end
    
    T1 & T2 & T3 & T4 & T5 --> B4
    B1 & B2 & B3 & B4 --> C1
    C1 --> C2
    C2 --> S1
    S2 --> S1
    
    style B4 fill:#533278,color:#fff
    style C2 fill:#F4436C,color:#fff
    style S1 fill:#0C7489,color:#fff
```

## Tokens de Diseño

### Sistema de Tokens

Los **custom properties `--plt-*`** son la fuente de verdad para todas las decisiones de marca PLT. Estos tokens se mapean al sistema de temas de daisyUI y se organizan en categorías semánticas.

```mermaid
graph TD
    subgraph "Tokens PLT"
        COL[Colores<br/>Primary, Secondary, Accent]
        TYP[Tipografía<br/>Display, Body, Label]
        SPC[Espaciado<br/>Escala consistente]
        RAD[Radio<br/>Bordes redondeados]
        SHA[Sombras<br/>Hard shadows offset]
        BRK[Breakpoints<br/>Responsividad]
        MOT[Motion<br/>Transiciones]
    end
    
    subgraph "daisyUI Theme"
        THEME_VARS[Variables de Tema<br/>--p, --s, --a, --b, etc.]
    end
    
    COL --> THEME_VARS
    TYP --> THEME_VARS
    SPC --> THEME_VARS
    RAD --> THEME_VARS
    SHA --> THEME_VARS
    
    style COL fill:#533278,color:#fff
    style THEME_VARS fill:#F4436C,color:#fff
```

### Paleta de Color

Definida en `src/tokens/colors.css`:

- **Primary**: `#533278` (Morado PLT)
- **Secondary**: `#F4436C` (Rosa vibrante)
- **Accent**: `#0C7489` (Azul verdoso)
- **Base surface**: `#FAF7F2` (Off-white)
- **Base content**: `oklch(37% 0.044 257.287)` (Texto oscuro)

### Tipografía

Definida en `src/tokens/typography.css`:

- **Display**: Fjalla One (Titulares uppercase, bold)
- **Body**: Atkinson Hyperlegible (Texto de lectura)
- **Accent/Labels**: Space Grotesk (Etiquetas y UI)

### Geometría

Definida en `src/tokens/shadows.css` y `src/tokens/radius.css`:

- **Radio de campo**: `0.25rem`
- **Borde base**: `2px`
- **Borde de sección PLT**: `3px`
- **Offset de sombra base**: `4px`
- **Offset de sombra hover**: `8px`
- **Offset de sombra active**: `2px`

## Principio daisyUI-First

### Invariante de Diseño

**Todo componente con equivalente en daisyUI debe usar la clase prefijada oficial como base.**

Este principio fundamental asegura:
- Anatomía de componentes consistente y probada
- Estados y variantes mantenidos por daisyUI
- Actualizaciones del framework sin breaking changes
- Separación clara entre fundamentos y marca

```mermaid
graph LR
    A[Componente PLT] --> B{¿Existe en<br/>daisyUI?}
    B -->|Sí| C[Usar d-* clase base]
    B -->|No| D[Crear plt-* composición]
    C --> E[Añadir theme-* extensiones]
    D --> F[Usar d-* primitivos internos]
    E --> G[Componente final]
    F --> G
    
    style C fill:#533278,color:#fff
    style E fill:#F4436C,color:#fff
```

### Ejemplos de Uso

```html
<!-- Botón con tratamiento PLT -->
<button class="d-btn d-btn-primary theme-bordered theme-elevated theme-label-bold">
  Shop now
</button>

<!-- Card con estilo PLT -->
<article class="d-card bg-base-100 theme-bordered theme-elevated">
  <div class="d-card-body">
    <h2 class="d-card-title theme-headline-sm">Título</h2>
    <div class="d-card-actions">...</div>
  </div>
</article>

<!-- Badge con tipografía PLT -->
<span class="d-badge d-badge-secondary theme-label-bold">Nuevo</span>

<!-- Input base de daisyUI -->
<input class="d-input" type="email">
```

### Clases Prohibidas

- ❌ Primitivos paralelos: `plt-button`, `plt-card`, `plt-badge`, `plt-input`
- ❌ Modificadores obsoletos de daisyUI v5: `d-input-bordered`, `d-select-bordered`, `d-textarea-bordered`, `d-card-bordered`

Las extensiones `theme-*` se usan para tipografía y tratamiento de marca; `plt-*` se reserva para composiciones que daisyUI no proporciona.

## Sistema de Temas

### Temas Disponibles

El sistema incluye múltiples temas predefinidos en el directorio `themes/`:

- **plt.css**: Tema principal de la marca
- **neutral.css**: Variante neutral
- **nocturne.css**: Tema oscuro
- **playdoh.css**: Variante juguetona
- **konstrukt.css**: Estilo constructivista
- **capricho.css**: Tema caprichoso
- **broadsheet.css**: Estilo editorial
- **workbench.css**: Tema de trabajo
- **unconventionals.css**: Variante no convencional
- **playlovetoys.css**: Tema corporativo
- **cheesecake.css**: Variante dulce
- **docs.css** / **docs-light.css**: Temas para documentación

### Flujo de Generación de Temas

```mermaid
graph LR
    A[Tokens PLT<br/>--plt-*] --> B[build-themes.mjs]
    C[Plantilla de tema] --> B
    B --> D[Tema compilado CSS]
    D --> E[check-theme-rules.mjs]
    E --> F{¿Válido?}
    F -->|Sí| G[Tema disponible]
    F -->|No| H[Error de build]
    
    style A fill:#533278,color:#fff
    style D fill:#F4436C,color:#fff
    style G fill:#0C7489,color:#fff
```

### Aplicación de Temas

Los temas se aplican mediante el atributo `data-theme`:

```html
<div data-theme="brand">
  <!-- Contenido con tema brand -->
</div>

<div data-theme="nocturne">
  <!-- Contenido con tema oscuro -->
</div>
```

## Componentes de Commerce

### Arquitectura de Componentes

El sistema incluye componentes especializados para e-commerce organizados en `src/commerce/`:

```mermaid
graph TB
    subgraph "Componentes Web"
        QV[ProductQuickView<br/>quick-view.js]
        GAL[ProductGallery<br/>gallery.js]
    end
    
    subgraph "Utilidades"
        FMT[formatMoney<br/>format-money.ts]
        PRC[formatPriceDisplay<br/>format-money.ts]
    end
    
    subgraph "Integración Shopify"
        CDN[shopifyCdnUrl<br/>cdn-image.ts]
        SRCSET[shopifyCdnSrcSet<br/>cdn-image.ts]
    end
    
    QV --> FMT
    GAL --> CDN
    QV --> PRC
    
    style QV fill:#533278,color:#fff
    style FMT fill:#F4436C,color:#fff
    style CDN fill:#0C7489,color:#fff
```

### ProductQuickView

Custom element que implementa un diálogo modal para vista rápida de productos.

**Características**:
- Gestión de diálogos múltiples abiertos simultáneamente
- Control del scroll del body cuando hay modales activos
- Restauración de foco al cerrar
- Cierre al hacer click fuera del contenido
- Event listeners limpios al desconectar

**Flujo de Interacción**:

```mermaid
sequenceDiagram
    participant U as Usuario
    participant B as Botón Open
    participant C as ProductQuickView
    participant D as Dialog
    participant Body as document.body
    
    U->>B: Click
    B->>C: open()
    C->>C: Guardar previousFocus
    C->>Body: style.overflow = 'hidden'
    C->>D: showModal()
    
    U->>D: Click fuera
    D->>C: handleOutsideClick()
    C->>D: close()
    D->>C: handleDialogClose()
    C->>Body: Restaurar overflow
    C->>C: Restaurar focus
```

**Uso**:

```html
<plt-quick-view>
  <button data-quick-view-open>Ver detalles</button>
  <dialog>
    <div>
      <!-- Contenido del producto -->
      <button data-quick-view-close>Cerrar</button>
    </div>
  </dialog>
</plt-quick-view>
```

### ProductGallery

Custom element para galerías de imágenes de productos con miniaturas.

**Características**:
- Cambio de imagen principal al hacer click en miniaturas
- Gestión de estado `aria-current` para accesibilidad
- Sincronización automática de `src` y `alt`
- Inicialización de primera miniatura como actual

**Flujo de Datos**:

```mermaid
graph LR
    A[Miniaturas<br/>thumbs] --> B[Click evento]
    B --> C[handleThumbClick]
    C --> D[Actualizar<br/>mainImage.src]
    C --> E[Actualizar<br/>aria-current]
    D --> F[Imagen principal<br/>actualizada]
    E --> F
    
    style A fill:#533278,color:#fff
    style C fill:#F4436C,color:#fff
    style F fill:#0C7489,color:#fff
```

**Uso**:

```html
<plt-product-gallery>
  <div class="plt-product-detail__gallery-main">
    <img src="main.jpg" alt="Producto principal">
  </div>
  <div class="plt-product-detail__thumbs">
    <button class="plt-product-detail__thumb" aria-current="true">
      <img src="thumb1.jpg" alt="Vista 1">
    </button>
    <button class="plt-product-detail__thumb">
      <img src="thumb2.jpg" alt="Vista 2">
    </button>
  </div>
</plt-product-gallery>
```

### Utilidades de Formato de Dinero

Conjunto de funciones para formatear precios de manera consistente.

**Interface Money**:

```typescript
interface Money {
  amount: string;
  currencyCode: string;
}
```

**Funciones**:

1. **formatMoney**: Formatea un objeto Money usando Intl.NumberFormat
2. **formatPriceRange**: Formatea un rango de precios (min – max)
3. **formatPriceDisplay**: Formatea precio con precio comparativo opcional

**Flujo de Formato**:

```mermaid
graph TD
    A[Money object] --> B{formatMoney}
    B --> C[Parse amount]
    C --> D{¿Válido?}
    D -->|Sí| E[Intl.NumberFormat]
    D -->|No| F[Retornar amount raw]
    E --> G[Precio formateado]
    
    H[Min + Max] --> I{formatPriceRange}
    I --> B
    I --> J[Concatenar con –]
    
    K[Price + Options] --> L{formatPriceDisplay}
    L --> B
    L --> M{¿Range?}
    M -->|Sí| I
    M -->|No| B
    L --> N{¿Compare at?}
    N -->|Sí| O[Formatear compare]
    N -->|No| P[null]
    
    style B fill:#533278,color:#fff
    style I fill:#F4436C,color:#fff
    style L fill:#0C7489,color:#fff
```

**Ejemplo de uso**:

```typescript
const price = { amount: "48.00", currencyCode: "USD" };
const compareAt = { amount: "62.00", currencyCode: "USD" };

const { display, compareDisplay } = formatPriceDisplay("en-US", price, {
  compareAtPrice: compareAt
});
// display: "$48.00"
// compareDisplay: "$62.00"
```

## Integración con Shopify CDN

### Optimización de Imágenes

El módulo `src/shopify/cdn-image.ts` proporciona utilidades para optimizar imágenes servidas desde Shopify CDN.

```mermaid
graph TB
    A[URL de imagen] --> B{isShopifyCdnUrl}
    B -->|Sí| C[shopifyCdnUrl]
    B -->|No| D[Retornar URL original]
    
    C --> E[Parse URL]
    E --> F[Agregar width param]
    F --> G{¿height?}
    G -->|Sí| H[Agregar height param]
    G -->|No| I[URL optimizada]
    H --> I
    
    J[URL + widths array] --> K[shopifyCdnSrcSet]
    K --> L[Map cada width]
    L --> C
    L --> M[Generar srcset]
    
    style C fill:#533278,color:#fff
    style K fill:#F4436C,color:#fff
    style I fill:#0C7489,color:#fff
```

### Presets de Layout

Anchos predefinidos para diferentes contextos:

```typescript
const SHOPIFY_CDN_WIDTHS = {
  card: [200, 400, 600, 800],
  collection: [300, 600, 900],
  gallery: [400, 800, 1200, 1600],
};

const SHOPIFY_CDN_SIZES = {
  card: "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
  collection: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  gallery: "(min-width: 1024px) 50vw, 100vw",
};
```

**Ejemplo de uso**:

```typescript
const imageUrl = "https://cdn.shopify.com/s/files/1/0001/product.jpg";

// URL con ancho específico
const optimized = shopifyCdnUrl(imageUrl, { width: 800 });
// https://cdn.shopify.com/s/files/1/0001/product.jpg?width=800

// Srcset para imagen responsiva
const srcset = shopifyCdnSrcSet(imageUrl, SHOPIFY_CDN_WIDTHS.card);
// "...?width=200 200w, ...?width=400 400w, ..."
```

## Contratos y Renderizadores

### Arquitectura de Contratos

El sistema define **contratos visuales** que garantizan anatomía equivalente entre plataformas.

```mermaid
graph TB
    subgraph "Contratos Visuales"
        C1[ProductCard]
        C2[Hero]
        C3[Newsletter]
        C4[ProductGrid]
        C5[ProductDetail]
        C6[CartDrawer]
        C7[Otros...]
    end
    
    subgraph "Fuentes de Datos"
        S1[Shopify Product]
        S2[API/CMS Data]
    end
    
    subgraph "Presenters"
        P1[Shopify Presenter]
        P2[API Presenter]
    end
    
    subgraph "Renderizadores"
        R1[Liquid Renderer]
        R2[Astro Renderer]
    end
    
    S1 --> P1
    S2 --> P2
    P1 --> C1
    P2 --> C1
    C1 --> R1
    C1 --> R2
    
    C2 & C3 & C4 --> R1
    C2 & C3 & C4 --> R2
    
    style C1 fill:#533278,color:#fff
    style P1 fill:#F4436C,color:#fff
    style R1 fill:#0C7489,color:#fff
```

### Flujo de Normalización

```mermaid
sequenceDiagram
    participant Data as Fuente de Datos
    participant Presenter as Presenter
    participant Contract as Contrato
    participant Renderer as Renderizador
    participant Output as HTML Output
    
    Data->>Presenter: Datos raw (Shopify/API)
    Presenter->>Presenter: Normalizar estructura
    Presenter->>Contract: Props normalizados
    Contract->>Renderer: Estructura de contrato
    Renderer->>Renderer: Generar markup
    Renderer->>Output: HTML + clases daisyUI/PLT
```

### Renderizadores Disponibles

**Liquid** (`renderers/liquid/*`):
- Para temas Shopify
- Acceso directo a objetos Shopify
- Filtros Liquid nativos

**Astro** (`renderers/astro/*`):
- Para headless/CMS
- Componentes tipados
- Props validados en build time

Ambos conjuntos emiten:
- ✅ Anatomía daisyUI equivalente
- ✅ Mismas clases de composición PLT
- ✅ Mismas clases `theme-*`

## Sistema de Preview de Islands

### Arquitectura de Islands

El archivo `docs/javascripts/plt-island-preview.js` implementa un sistema de preview para componentes PLT usando arquitectura de islands.

```mermaid
graph TB
    subgraph "Markup Inicial"
        I1[data-plt-island='Hero']
        I2[data-plt-island='ProductGrid']
        I3[data-plt-island='Newsletter']
    end
    
    subgraph "Lectura de Props"
        P[script data-plt-props]
        J[JSON.parse]
    end
    
    subgraph "Renderizadores"
        R1[renderHero]
        R2[renderProductGrid]
        R3[renderNewsletter]
    end
    
    subgraph "Hydration"
        H[hydrateIsland]
    end
    
    I1 --> H
    I2 --> H
    I3 --> H
    H --> P
    P --> J
    J --> R1
    J --> R2
    J --> R3
    R1 --> O1[Preview HTML]
    R2 --> O2[Preview HTML]
    R3 --> O3[Preview HTML]
    
    style H fill:#533278,color:#fff
    style J fill:#F4436C,color:#fff
    style O1 fill:#0C7489,color:#fff
```

### Flujo de Hydration

```mermaid
sequenceDiagram
    participant DOM as DOM
    participant Init as init()
    participant Hydrate as hydrateIsland()
    participant Read as readProps()
    participant Render as render*()
    participant Output as Preview Element
    
    DOM->>Init: DOMContentLoaded
    Init->>DOM: querySelectorAll('[data-plt-island]')
    
    loop Para cada island
        Init->>Hydrate: island element
        Hydrate->>Read: island
        Read->>Read: Buscar script[data-plt-props]
        Read->>Read: JSON.parse
        Read-->>Hydrate: props objeto
        Hydrate->>Render: props
        Render->>Render: Generar HTML
        Render-->>Hydrate: HTML string
        Hydrate->>Output: Crear preview div
        Output->>DOM: replaceChildren
    end
```

### Componentes de Preview

**Hero**:
```javascript
renderHero(props)
// props: { heading, body, primaryLabel, primaryUrl, secondaryLabel, secondaryUrl }
// output: <section class="d-hero plt-hero">...</section>
```

**ProductGrid**:
```javascript
renderProductGrid(props)
// props: { title, products: ['handle-1', 'handle-2', ...] }
// output: <section class="plt-section"><div class="plt-product-grid">...</div></section>
```

**Newsletter**:
```javascript
renderNewsletter(props)
// props: { heading, body, placeholder, buttonLabel }
// output: <section class="plt-newsletter">...</section>
```

### Datos Mock

El sistema incluye productos mock para previews:

```javascript
const MOCK_PRODUCTS = {
  "product-handle-1": {
    title: "Velvet Pulse",
    price: "$48.00",
    vendor: "PLT Essentials",
    badge: "New",
  },
  // ...
};
```

## Verificación y Testing

### Sistema de Verificación

El paquete incluye múltiples niveles de verificación automatizada:

```mermaid
graph TB
    A[npm run check] --> B[check:conformance]
    A --> C[check:renderers]
    A --> D[check:contracts]
    A --> E[test]
    A --> F[check:css]
    A --> G[check:themes]
    A --> H[build:demo]
    A --> I[build:themes]
    
    B --> J{check-daisyui-conformance.mjs}
    C --> K{check-renderer-safety.mjs}
    D --> L{check-commerce-contracts.mjs}
    E --> M{vitest run}
    F --> N{stylelint}
    G --> O{check-theme-rules.mjs}
    
    J --> P[✓ Sin primitivos paralelos]
    J --> Q[✓ Sin modificadores obsoletos]
    J --> R[✓ Anatomía de renderizador completa]
    
    K --> S[✓ Escapado correcto]
    K --> T[✓ Registro en Tailwind]
    
    L --> U[✓ Contratos cumplidos]
    
    style A fill:#533278,color:#fff
    style J fill:#F4436C,color:#fff
    style M fill:#0C7489,color:#fff
```

### Verificaciones de Conformidad

**check-daisyui-conformance.mjs**:
- ❌ Rechaza primitivos paralelos PLT (`plt-button`, `plt-card`, etc.)
- ❌ Rechaza modificadores obsoletos de daisyUI v5
- ✅ Valida anatomía completa de renderizadores

**check-renderer-safety.mjs**:
- ✅ Verifica escapado de HTML en renderizadores
- ✅ Confirma registro de fuentes Tailwind

**check-commerce-contracts.mjs**:
- ✅ Valida que los renderizadores cumplen contratos definidos

**check-theme-rules.mjs**:
- ✅ Verifica consistencia de reglas en temas

### Testing con Vitest

Configuración en `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
  },
});
```

**Tests de componentes**:
- `src/commerce/__tests__/gallery.test.ts`
- `src/commerce/__tests__/quick-view.test.ts`
- `src/commerce/format-money.test.ts`
- `src/shopify/cdn-image.test.ts`

### Flujo de CI

```mermaid
graph LR
    A[Commit] --> B[Conformidad]
    B --> C[Renderizadores]
    C --> D[Contratos]
    D --> E[Tests]
    E --> F[Lint CSS]
    F --> G[Temas]
    G --> H[Build Demo]
    H --> I[Build Temas]
    I --> J{¿Todo OK?}
    J -->|Sí| K[✓ Listo]
    J -->|No| L[✗ Falla]
    
    style B fill:#533278,color:#fff
    style E fill:#F4436C,color:#fff
    style K fill:#0C7489,color:#fff
```

## Instalación y Uso

### Instalación

```bash
npm install @playlovetoys/design-system
```

### Dependencias Peer

- **daisyUI**: `>=5.7.8 <6`
- **Tailwind CSS**: `>=4 <5`

La versión mínima de daisyUI (5.7.8) evita problemas conocidos con prefijos corregidos durante la serie 5.7.

### Importación Base

```css
@import "tailwindcss";
@import "@playlovetoys/design-system";
```

Esto configura automáticamente:
- daisyUI con tema `brand` PLT
- Prefijo `d-` para componentes daisyUI
- Tokens y extensiones visuales PLT

### Importaciones Modulares

```css
/* Solo tokens */
@import "@playlovetoys/design-system/tokens";

/* Tipografía */
@import "@playlovetoys/design-system/typography";

/* Geometría */
@import "@playlovetoys/design-system/geometry";

/* Primitivos */
@import "@playlovetoys/design-system/primitives";

/* Patrones */
@import "@playlovetoys/design-system/patterns";

/* Adaptador Shopify */
@import "@playlovetoys/design-system/shopify";

/* Adaptador Astro */
@import "@playlovetoys/design-system/astro";

/* Tema específico */
@import "@playlovetoys/design-system/themes/nocturne.css";
```

### Uso en JavaScript/TypeScript

```typescript
// Utilidades de formato de dinero
import { formatMoney, formatPriceDisplay } from '@playlovetoys/design-system/commerce/format-money';

// Utilidades Shopify CDN
import { 
  shopifyCdnUrl, 
  shopifyCdnSrcSet,
  SHOPIFY_CDN_WIDTHS 
} from '@playlovetoys/design-system/shopify/cdn-image';

// Custom elements (se auto-registran)
import '@playlovetoys/design-system/commerce/quick-view';
import '@playlovetoys/design-system/commerce/gallery';
```

### Uso de Renderizadores

**Liquid (Shopify)**:

```liquid
{% render 'product-card',
  title: product.title,
  price: product.price,
  image: product.featured_image,
  url: product.url
%}
```

**Astro**:

```astro
---
import ProductCard from '@playlovetoys/design-system/renderers/astro/ProductCard.astro';
---

<ProductCard
  title={product.title}
  price={product.price}
  image={product.image}
  url={product.url}
/>
```

## Dirección Visual

### Lenguaje Neo-Brutalista Suave

El sistema implementa un lenguaje visual de **comercio editorial neo-brutalista suave**:

- **Limpio**: Superficies off-white, espaciado generoso
- **Audaz**: Tipografía display uppercase
- **Juguetón**: Colores vibrantes, interacciones divertidas
- **Alto contraste**: Bordes visibles, sombras duras

### Principios Visuales

```mermaid
graph TD
    A[Dirección Visual] --> B[Superficies]
    A --> C[Tipografía]
    A --> D[Bordes]
    A --> E[Sombras]
    
    B --> B1[Near-white backgrounds]
    B --> B2[Alto contraste con texto]
    
    C --> C1[Display uppercase]
    C --> C2[Tracking ajustado]
    C --> C3[Weights bold]
    
    D --> D1[2-3px visibles]
    D --> D2[Sin esquinas pill]
    D --> D3[Radio moderado 0.25rem]
    
    E --> E1[Hard offset sin blur]
    E --> E2[4px base, 8px hover]
    E --> E3[Sin glassmorphism]
    
    style A fill:#533278,color:#fff
    style B fill:#F4436C,color:#fff
    style C fill:#0C7489,color:#fff
```

### Elementos Prohibidos

- ❌ Glassmorphism (fondos con blur)
- ❌ Gradientes suaves por defecto
- ❌ Bordes pill-shaped en UI base
- ❌ Sombras con blur

### Elementos Recomendados

- ✅ Bordes sólidos 2-3px
- ✅ Sombras hard offset
- ✅ Superficies flat de color sólido
- ✅ Tipografía uppercase en titulares
- ✅ Contraste visual fuerte

## Extensibilidad

### Creación de Nuevos Temas

1. **Definir tokens** en archivo CSS:

```css
/* themes/mi-tema.css */
@layer theme {
  [data-theme="mi-tema"] {
    /* Mapear a variables daisyUI */
    --p: 220 100% 50%;
    --s: 340 100% 50%;
    --a: 180 100% 50%;
    /* ... */
  }
}
```

2. **Ejecutar verificación**:

```bash
npm run check:themes
```

3. **Compilar**:

```bash
npm run build:themes
```

### Creación de Nuevos Patrones

1. **Usar primitivos daisyUI** como base
2. **Añadir clase `plt-*`** para composición
3. **Extender con `theme-*`** para marca
4. **Documentar contrato** en `contracts/components.md`
5. **Crear renderizadores** en Liquid y Astro
6. **Añadir tests** en `src/__tests__/`

### Ejemplo de Nuevo Patrón

```css
/* src/patterns.css */
.plt-feature-card {
  /* Composición usando primitivos daisyUI */
  @apply d-card bg-base-100;
}

.plt-feature-card__icon {
  @apply theme-bordered theme-elevated;
  /* Estilos específicos */
}
```

## Roadmap y Evolución

### Dependencias de Framework

```mermaid
graph LR
    A[Tailwind CSS 4] --> B[PLT Design System]
    C[daisyUI 5.7.8+] --> B
    B --> D[Temas]
    B --> E[Componentes]
    B --> F[Renderizadores]
    
    style A fill:#533278,color:#fff
    style C fill:#F4436C,color:#fff
    style B fill:#0C7489,color:#fff
```

### Compatibilidad

- **Tailwind CSS**: `>=4 <5` (v4.x)
- **daisyUI**: `>=5.7.8 <6` (v5.7.8+)
- **Node.js**: Compatible con entornos modernos
- **Navegadores**: Últimas versiones evergreen

### Límites del Sistema

**Dentro del alcance**:
- ✅ Tokens de diseño visual
- ✅ Componentes UI reutilizables
- ✅ Temas de marca
- ✅ Renderizadores multiplataforma
- ✅ Utilidades de commerce

**Fuera del alcance**:
- ❌ Lógica de negocio Shopify
- ❌ Gestión de estado de carrito
- ❌ Enrutamiento de aplicación
- ❌ Esquemas CMS/editoriales
- ❌ Ciclo de vida de framework

## Referencias

### Documentación Interna

- `DESIGN.md`: Filosofía y principios de diseño
- `docs/primitives.md`: Primitivos visuales
- `docs/patterns.md`: Patrones compuestos
- `docs/renderers.md`: Sistema de renderizadores
- `docs/adapters.md`: Adaptadores de plataforma
- `docs/themes.md`: Sistema de temas
- `docs/daisyui-conformance.md`: Reglas de conformidad
- `contracts/components.md`: Contratos de componentes

### Dependencias Externas

- [Tailwind CSS v4](https://tailwindcss.com/): Framework de utilidades
- [daisyUI v5](https://daisyui.com/): Biblioteca de componentes
- [Vitest](https://vitest.dev/): Framework de testing

### Estructura del Paquete

**Exports principales** (`package.json`):

```json
{
  ".": "./src/index.css",
  "./tokens": "./src/tokens.css",
  "./typography": "./src/typography.css",
  "./geometry": "./src/geometry.css",
  "./primitives": "./src/primitives.css",
  "./patterns": "./src/patterns.css",
  "./shopify": "./adapters/shopify.css",
  "./astro": "./adapters/astro.css",
  "./renderers/liquid/*": "./renderers/liquid/*",
  "./renderers/astro/*": "./renderers/astro/*",
  "./themes/*": "./themes/*.css"
}
```

### Scripts de Desarrollo

```bash
# Build demo
npm run build:demo

# Verificar conformidad daisyUI
npm run check:conformance

# Verificar seguridad de renderizadores
npm run check:renderers

# Verificar contratos de commerce
npm run check:contracts

# Ejecutar tests
npm run test

# Lint CSS
npm run check:css

# Verificar reglas de temas
npm run check:themes

# Build temas
npm run build:themes

# Ejecutar todo
npm run check
```

## Diagrama de Flujo Completo

```mermaid
graph TB
    subgraph "Tokens & Fundamentos"
        T[Tokens PLT<br/>--plt-*]
        TW[Tailwind CSS 4]
        DAISY[daisyUI 5]
    end
    
    subgraph "Capa de Temas"
        THEME[Tema Brand]
        TYPO[Tipografía]
        GEO[Geometría]
    end
    
    subgraph "Primitivos & Patrones"
        PRIM[Primitivos CSS]
        PATT[Patrones CSS]
        COMM[Commerce Components]
    end
    
    subgraph "Utilidades"
        MONEY[Format Money]
        CDN[Shopify CDN]
    end
    
    subgraph "Renderizadores"
        LIQ[Liquid]
        AST[Astro]
    end
    
    subgraph "Verificación"
        CONF[Conformidad]
        REND[Renderer Safety]
        CONT[Contratos]
        TEST[Tests]
    end
    
    subgraph "Output"
        HTML[HTML + CSS]
        PREVIEW[Island Previews]
    end
    
    T --> THEME
    TW --> PRIM
    DAISY --> PRIM
    THEME --> PRIM
    TYPO --> PRIM
    GEO --> PRIM
    
    PRIM --> PATT
    PATT --> COMM
    COMM --> MONEY
    COMM --> CDN
    
    PATT --> LIQ
    PATT --> AST
    COMM --> LIQ
    COMM --> AST
    
    LIQ --> CONF
    AST --> CONF
    LIQ --> REND
    AST --> REND
    COMM --> CONT
    COMM --> TEST
    
    LIQ --> HTML
    AST --> HTML
    HTML --> PREVIEW
    
    style T fill:#533278,color:#fff
    style COMM fill:#F4436C,color:#fff
    style HTML fill:#0C7489,color:#fff
```
