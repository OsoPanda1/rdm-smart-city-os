# RDM Smart City OS

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
