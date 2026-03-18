# RDM Smart City OS

Plataforma digital turística para **Real del Monte, Hidalgo** con enfoque en narrativa cultural, exploración de lugares, telemetría operativa y módulos de inteligencia territorial en tiempo real.

---

## Tabla de contenido

1. [Descripción del proyecto](#descripción-del-proyecto)
2. [Problema que resuelve](#problema-que-resuelve)
3. [Características principales](#características-principales)
4. [Arquitectura y stack](#arquitectura-y-stack)
5. [Estructura del repositorio](#estructura-del-repositorio)
6. [Flujos funcionales](#flujos-funcionales)
7. [Módulo GEN-7+ (inteligencia territorial)](#módulo-gen-7-inteligencia-territorial)
8. [Configuración local](#configuración-local)
9. [Variables de entorno](#variables-de-entorno)
10. [Scripts disponibles](#scripts-disponibles)
11. [Base de datos y Supabase](#base-de-datos-y-supabase)
12. [Observabilidad y métricas](#observabilidad-y-métricas)
13. [Pruebas y validación](#pruebas-y-validación)
14. [Deploy](#deploy)
15. [Troubleshooting](#troubleshooting)
16. [Roadmap sugerido](#roadmap-sugerido)

---

## Descripción del proyecto

RDM Smart City OS es una web app en React/Vite orientada a:

- mostrar contenido turístico/cultural de Real del Monte,
- organizar navegación por rutas y verticales temáticas (historia, gastronomía, cultura, aventura, comunidad, etc.),
- integrar telemetría operacional para panel administrativo,
- habilitar módulos de decisión territorial en tiempo real para activar experiencias contextuales.

---

## Problema que resuelve

En muchos destinos turísticos, la información está fragmentada y no existe una capa de decisión contextual para activar experiencias en el momento correcto. Este proyecto busca:

- centralizar la experiencia digital del destino,
- mejorar descubrimiento de lugares y contenido,
- instrumentar datos de operación y experiencia,
- preparar la base para recomendaciones inteligentes y orquestación en tiempo real.

---

## Características principales

### Frontend turístico

- Landing inmersiva con secciones de historia, gastronomía, aventura, cultura y hospedaje.
- Navegación por múltiples páginas temáticas.
- UI moderna con Tailwind + componentes Radix.
- Vistas de exploración, dashboard y telemetría.

### Núcleo de recomendaciones (Realito Kernel)

- Inferencia de intención por consulta (`gastronomia`, `historia`, `aventura`, etc.).
- Recomendación de lugares por intención.
- Narrativa contextual aleatoria por categoría.
- Métricas simuladas de sistema para paneles.

### Integración GEN-7+ (nuevo)

- Motor de decisión territorial con scoring desacoplado por reglas.
- Optimización geoespacial (BBox + Haversine + cache LRU con TTL).
- Suavizado de movimiento.
- Orquestación determinista con reloj inyectable.
- Event bus con backpressure.
- Stream SSE endurecido (heartbeat + reconexión).
- Métricas técnicas y de negocio con salida tipo Prometheus.
- Correlación por `traceId` y protecciones de cardinalidad/throttling.

---

## Arquitectura y stack

### Frontend

- **React 18** + **TypeScript**
- **Vite** como bundler
- **React Router**
- **Tailwind CSS** + **shadcn/ui** + **Radix UI**
- **Framer Motion** para animaciones
- **TanStack Query** para estado de datos remotos

### Integraciones

- **Supabase JS** (cliente frontend)
- **Supabase Edge Function** para chat (`realito-chat`)

### Módulos internos relevantes

- `src/lib/kernel.ts`: motor de recomendaciones y narrativa.
- `src/lib/heptafederation.ts`: modelo heptafederado (telemetría/health/score).
- `src/core/*` + `src/orchestrator/*`: motor territorial GEN-7+.

---

## Estructura del repositorio

```bash
.
├── public/
├── src/
│   ├── app/api/                    # Rutas estilo API internas (SSE, feedback, metrics)
│   ├── assets/                     # Imágenes y recursos visuales
│   ├── components/                 # Componentes UI y secciones de pantalla
│   ├── core/                       # Núcleo GEN-7+ (geo, engine, rules, infra, context)
│   ├── hooks/
│   ├── infra/metrics/              # Métricas y registro interno
│   ├── integrations/supabase/      # Cliente y tipos de Supabase
│   ├── lib/                        # Kernel, federation y utilidades de dominio
│   ├── orchestrator/               # Orquestación de experiencia territorial
│   ├── pages/                      # Rutas/páginas de la aplicación
│   ├── test/                       # Pruebas (vitest)
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── functions/realito-chat/     # Edge function de chat
│   └── migrations/
├── package.json
└── README.md
```

---

## Flujos funcionales

### 1) Navegación principal

`src/App.tsx` define las rutas principales (`/`, `/dashboard`, `/historia`, `/gastronomia`, `/rutas`, etc.) y provee contexto global de toasts, tooltips y query client.

### 2) Experiencia Home

`src/pages/Index.tsx` orquesta intro cinematográfica, navegación flotante y secciones narrativas/visuales (Hero, ExperienceGrid, History, Gastronomy, etc.).

### 3) Kernel narrativo

`src/lib/kernel.ts` interpreta consultas del usuario, infiere intención, recomienda lugares y genera narrativa contextual para la experiencia asistida.

### 4) Chat cognitivo (Supabase Function)

`supabase/functions/realito-chat/index.ts` recibe mensajes, aplica prompt de sistema y proxyea stream al gateway AI para respuestas en español con contexto territorial.

---

## Módulo GEN-7+ (inteligencia territorial)

### Capacidades incluidas

- **Modelos base**: `Coordenadas`, `TuristaEstado`, `Decision`.
- **Geo performance**:
  - `withinBBox`: filtro rápido inicial.
  - `fastDistance`: cálculo geodésico rápido.
  - `LRUCache`: O(1) con expiración TTL.
- **Comportamiento**: `MovementFilter` (EMA de velocidad).
- **Motor de scoring**: reglas desacopladas (`ScoreRule`, `ThresholdRule`, `ScoringEngine`).
- **Orquestación**: `ExperienceOrchestrator` con reloj inyectable y throttling por turista.
- **Event bus**: cola con backpressure y descarte controlado.
- **SSE hardened**: `retry`, `heartbeat`, anti-buffering.
- **Métricas**:
  - `decision_latency_ms`
  - `decision_score`
  - `reviews_total`
  - `consent_events_total`
  - `sse_connections`
- **Correlación**: `traceId` por decisión.

### Flujo resumido de decisión

1. Llega `TuristaEstado` al orquestador.
2. Se calcula salida más cercana y se filtra por BBox.
3. Se obtiene/calcula distancia con cache geo.
4. Se calcula velocidad suavizada e inactividad.
5. Se evalúa scoring por reglas.
6. Si score >= umbral, se emite `Decision` al bus.
7. SSE distribuye eventos a clientes conectados.

---

## Configuración local

### Requisitos

- Node.js 20+
- npm 10+

### Instalación

```bash
npm install
```

### Ejecutar en desarrollo

```bash
npm run dev
```

### Ejecutar tests

```bash
npm test
```

### Build de producción

```bash
npm run build
```

---

## Variables de entorno

Crear `.env` (o `.env.local`) con:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Para Edge Functions (Supabase):

```bash
LOVABLE_API_KEY=...
```

---

## Scripts disponibles

- `npm run dev` → servidor de desarrollo Vite.
- `npm run build` → build producción.
- `npm run build:dev` → build modo desarrollo.
- `npm run preview` → previsualización de build.
- `npm run lint` → linting con ESLint.
- `npm test` → pruebas con Vitest.
- `npm run test:watch` → Vitest en modo watch.

---

## Base de datos y Supabase

El tipado de base (`src/integrations/supabase/types.ts`) incluye al menos estas tablas en `public`:

- `dichos`
- `interactions`
- `places`

Además, existe una migración en `supabase/migrations/` y una función edge (`realito-chat`) para respuestas conversacionales con contexto del destino.

---

## Observabilidad y métricas

El módulo `src/infra/metrics/prometheus.ts` expone primitivas de `Counter`, `Gauge`, `Histogram` y un `Registry` con salida de texto para scrapers.

Endpoints internos:

- `GET /api/metrics` → métricas en texto.
- `GET /api/isabella/stream` → stream SSE de decisiones.
- `POST /api/isabella/feedback` → captura rating + consentimiento.

> Nota: la carpeta `src/app/api` está modelada como rutas internas estilo API para desacoplar dominio y transporte; su conexión exacta depende del runtime que exponga estos handlers.

---

## Pruebas y validación

Archivo principal de simulación:

- `src/test/experience-orchestrator.test.ts`

Escenarios cubiertos:

1. decisión crítica válida,
2. throttling por usuario,
3. backpressure de cola,
4. expiración TTL de cache.

---

## Deploy

### Frontend

1. Generar build con `npm run build`.
2. Servir `dist/` en plataforma estática (Vercel/Netlify/Nginx/S3+CDN).

### Supabase

1. Aplicar migraciones.
2. Desplegar `supabase/functions/realito-chat`.
3. Configurar secrets (`LOVABLE_API_KEY`).

---

## Troubleshooting

### `npm install` falla con 403

- Causa: políticas de red/registry del entorno.
- Acción: instalar dependencias en CI o entorno con acceso a npm registry.

### `vitest: not found` / `vite: not found`

- Causa: dependencias no instaladas.
- Acción: ejecutar `npm install` antes de `npm test` o `npm run build`.

### No hay datos en Supabase

- Verificar `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Confirmar migraciones aplicadas y tablas disponibles.

---

## Roadmap sugerido

- Conectar métricas a Prometheus/Grafana real.
- Persistir decisiones/eventos en Redis Streams o Kafka.
- Añadir panel de mando operativo con heatmaps.
- Integrar modelos predictivos de abandono/retención turística.
- Conectar canal AR/XR en front para activaciones contextuales.

---

Si mantienes este README actualizado en cada PR, cualquier nuevo colaborador podrá entender rápidamente **qué hace el repo, cómo corre, cómo se prueba y cómo se despliega**.
Plataforma de experiencia turística para Real del Monte con frontend React/Vite y un nuevo núcleo de **inteligencia territorial en tiempo real (GEN-7+)**.

## Qué se integró

Se añadió una integración completa del motor Isabella con:

- Motor de decisión territorial con reglas desacopladas y scoring dinámico.
- Optimización geoespacial (`withinBBox` + `fastDistance`) con cache LRU O(1) y TTL.
- Filtro de movimiento suavizado.
- Orquestación determinista con reloj inyectable (`Clock`/`FixedClock`).
- Event Bus con cola, backpressure y conteo de eventos descartados.
- Endpoints SSE hardened (heartbeat + retry + headers anti-buffering).
- Observabilidad: métricas técnicas y de negocio en formato Prometheus.
- Correlación end-to-end con `traceId`.
- Protecciones productivas: throttling por turista, TTL, límite de cardinalidad en labels.

## Estructura nueva

```bash
src/
 ├── core/
 │    ├── behavior/
 │    ├── context/
 │    ├── engine/
 │    ├── geo/
 │    ├── infra/
 │    ├── models.ts
 │    └── rules/
 ├── orchestrator/
 ├── infra/metrics/
 ├── app/api/
 │    ├── isabella/feedback/route.ts
 │    ├── isabella/stream/route.ts
 │    └── metrics/route.ts
 ├── instrumentation.node.ts
 └── lib/isabella.ts
```

## Flujo de decisión

1. `ExperienceOrchestrator.evaluar()` recibe estado del turista.
2. Selecciona salida más cercana y filtra por BBox.
3. Reutiliza distancia por cache LRU+TTL o calcula Haversine.
4. Calcula velocidad suavizada + inactividad.
5. Ejecuta scoring por reglas desacopladas.
6. Si score >= 40 emite decisión con `traceId` al Event Bus.
7. SSE publica decisiones a clientes en tiempo real.
8. Se registran métricas técnicas y de negocio.

## API interna (módulos)

- `src/lib/isabella.ts`: fachada para evaluar turistas desde UI/servicios.
- `src/app/api/isabella/stream/route.ts`: stream SSE endurecido.
- `src/app/api/isabella/feedback/route.ts`: reseñas/consentimiento.
- `src/app/api/metrics/route.ts`: exposición de métricas en texto.

## Simulación de escenarios (tests)

Se implementaron pruebas automatizadas para simular escenarios críticos:

1. **Decisión crítica positiva**: turista cerca de salida + poca estadía + inactividad.
2. **Throttle anti-spam**: segunda notificación bloqueada dentro de ventana.
3. **Backpressure**: cola saturada y descarte controlado de eventos.
4. **TTL cache**: expiración de distancias para evitar datos obsoletos.

Archivo: `src/test/experience-orchestrator.test.ts`.

## Observabilidad y protección

- Métricas incluidas:
  - `decision_latency_ms`
  - `decision_score`
  - `reviews_total{territory,type}`
  - `consent_events_total{territory,status}`
  - `sse_connections`
- Anti-cardinalidad: territorios permitidos (`RDM`, `PACHUCA`, `HIDALGO`).
- SSE con heartbeat cada 25s y `retry` recomendado para reconexión.

## Notas de ejecución local

```bash
npm install
npm run dev
npm test
```

> Si el entorno no tiene acceso al registry de npm, la instalación de dependencias puede fallar y bloquear `test/build`.
