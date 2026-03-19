# TAMV OS × RDM Smart City — Entregable Unificado

Este documento consolida la arquitectura objetivo para continuar la unificación hacia `tamv-digital-nexus`.

## Dominios

- `apps/`: experiencias de portal, gobierno y ciudadanía.
- `core/`: kernel TAMV, identidad soberana y gobernanza.
- `ai/`: orquestación ISABELLA, emocional y predicción.
- `security/`: sentinel, cifrado y detección de amenazas.
- `economy/`: Cattleya Pay, tokenización y contratos.
- `city/`: turismo, movilidad y servicios.
- `data/`: lago de datos, stream y digital twin.
- `experience/`: superficies UX para gobierno/ciudadanía/metaverso.
- `infra/`: Kubernetes, edge nodes, observabilidad.
- `api-gateway/`: BFF y composición de APIs.

## Integraciones implementadas en este repo

1. Kernel de eventos con tipado fuerte (`core/tamv-os-kernel/src/types.ts`).
2. Persistencia de eventos (`core/tamv-os-kernel/src/event-store.ts`).
3. Publicación distribuida hacia Kafka (`core/tamv-os-kernel/src/event-bus.ts`).
4. Frontend con emisión de eventos cívicos desde Orb, Dichos y TerritorialMap.
5. ISABELLA con endpoint `/query` y router multiagente.
6. Webhook Stripe que publica `PAYMENT_COMPLETED` en el kernel.
7. Ingress Kubernetes para exposición de gateway.
