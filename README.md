# Sistema ERP/CRM Industrial

Plataforma web para la digitalización de procesos operativos, gestión de inventario, producción en planta (mobile-first) y logística.

## Arquitectura

Este repositorio contiene una aplicación empresarial basada en Next.js App Router con un backend enlazado a Prisma y PostgreSQL. Está organizado como monorepo con Turborepo para gestionar el frontend, el paquete fiscal y los servicios compartidos.

## Stack tecnológico

- Next.js (App Router)
- Prisma (PostgreSQL)
- Tailwind CSS
- Docker
- Turborepo
- Bun

## Inicio rápido

Sigue exactamente estos pasos para poner el proyecto en marcha localmente:

1. `bun install`
2. `bun run setup` (Genera automáticamente las variables de entorno).
3. `docker compose up -d db` (Levanta la base de datos).
4. `bun run db:init` (Sincroniza Prisma e inyecta datos de prueba).
5. `bun run dev` (Inicia el entorno de desarrollo).

## Flujo local recomendado

- `bun run setup` crea los archivos `.env` necesarios cuando no existen.
- `docker compose up -d db` arranca el servicio de PostgreSQL.
- `bun run db:init` aplica el esquema Prisma y carga datos de prueba.
- `bun run dev` inicia el entorno de desarrollo enfocado en la aplicación principal.

## Estructura principal

- `apps/web` - aplicación Next.js principal.
- `packages/fiscal` - motor fiscal, lógica de facturación y generación de XML.
- `packages/db` - schema y helpers de base de datos.
- `packages/auth` - integración y utilidades de autenticación.
- `docs` - documentación técnica del sistema.

## Módulos principales

- Inventario y catálogo de productos
- Gestión de clientes
- Producción en planta y control de lotes
- Pedidos y logística con bloqueo de stock transaccional
- Dashboard operativo con métricas clave
- Gestión de facturación y documentos fiscales

## Comandos clave

- `bun run setup` - prepara el entorno local.
- `docker compose up -d db` - levanta el servicio de base de datos.
- `bun run db:init` - sincroniza el esquema Prisma y genera datos iniciales.
- `bun run dev` - arranca la aplicación web en desarrollo.
- `bun run check` - ejecuta Biome para revisión de código.

## Notas

- El repositorio está preparado para desarrollo local y no incluye referencias de plantillas de terceros.
- El sistema está diseñado para priorizar movilidad en planta, seguimiento de stock y procesos logísticos empresariales.

## Licencia

Este proyecto respeta la licencia definida en `LICENSE`.
