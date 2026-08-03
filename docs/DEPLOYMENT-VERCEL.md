# Despliegue productivo en Vercel — RDM Digital · Nodo Cero

Proyecto unificado (9 repos fusionados en una sola base de código Vite + React 18 + TypeScript).

## 1. Configuración del proyecto en Vercel

| Campo | Valor |
| --- | --- |
| Framework Preset | Vite |
| Build Command | `vite build` |
| Output Directory | `dist` |
| Install Command | `npm install` (o `bun install`) |
| Node Version | 20.x |

Ya está definido en `vercel.json`, incluyendo el rewrite SPA
(`/(.*) → /index.html`) necesario para que las ~70 rutas del router
funcionen al recargar o al entrar por enlace directo.

## 2. Variables de entorno (Vercel → Settings → Environment Variables)

Agrégalas en los tres entornos: **Production**, **Preview** y **Development**.

| Variable | Obligatoria | Ámbito | Descripción |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | Sí | Frontend | URL del backend Postgres/Supabase (`https://<ref>.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Sí | Frontend | Clave publicable/anon. Es pública por diseño; la protección real es RLS |
| `VITE_SUPABASE_PROJECT_ID` | Sí | Frontend | Referencia del proyecto backend |

> Las variables con prefijo `VITE_` se compilan dentro del bundle. **Nunca**
> coloques ahí claves privadas.

### Secretos que NO van en Vercel

Estos viven en el backend (Edge Functions), no en el frontend:

| Secreto | Uso |
| --- | --- |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Cliente del lado servidor |
| `SUPABASE_SERVICE_ROLE_KEY` | Escrituras privilegiadas (ingesta de federación) |
| `SUPABASE_DB_URL` | Conexión directa Postgres para migraciones/mantenimiento |
| `GITHUB_TOKEN` | `federation-ingest`: sincroniza los repos de OsoPanda1 |
| `STRIPE_SECRET_KEY` | Cobros de membresías, comercios y donativos |
| `LOVABLE_API_KEY` | Gateway de IA para `realito-chat` |

## 3. Storage / buckets

| Bucket | Público | Uso |
| --- | --- | --- |
| `tracks-audio` | No | Audio de la Playlist Soberana. Se sirve con URLs firmadas generadas en tiempo de ejecución; no requiere variable de entorno |

Si en el futuro se hace público, la URL base sería
`${VITE_SUPABASE_URL}/storage/v1/object/public/tracks-audio/<archivo>`.

## 4. Verificación antes de publicar

```bash
bun install
bun run verify   # lint + typecheck + tests + build limpio
```

El workflow `.github/workflows/ci.yml` ejecuta lo mismo en cada push a `main`.

## 5. Comprobación posterior al despliegue

Rutas críticas que deben responder 200 y renderizar sin errores de consola:

- `/` · `/nodo-cero` · `/hub-unificado`
- `/federation` · `/ltos` · `/genesis`
- `/mapa` · `/geoexplorer` · `/playlist`
- `/membresias` · `/comercios` · `/auth`

## 6. Dominio

Tras el primer despliegue, conecta el dominio en Vercel → Settings → Domains
(por ejemplo `rdmdigital.mx` y `www.rdmdigital.mx`).
