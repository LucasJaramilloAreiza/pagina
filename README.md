# Pagina

Pagina is an open-source business platform for retail operations in Brazil, combining a modern POS experience, inventory management, customer and order workflows, and a full Brazilian fiscal engine for NF-e and NFC-e.

The project is organized as a Turborepo monorepo with a web application, a documentation app, shared packages, and a standalone fiscal module that can be reused independently.

> [Leia em Português](README.ptBR.md)

## What this project does

Pagina aims to provide a practical foundation for small businesses that need to:

- run a point-of-sale workflow quickly,
- manage products, customers, orders, and cash movements,
- generate and track electronic invoices in the Brazilian fiscal context,
- keep the system modular so business logic and fiscal logic can evolve independently.

In short, this repository is not just a UI prototype. It is a full-stack application with backend services, database access, API routes, and fiscal document generation.

## Main capabilities

### Business features
- Dashboard with charts for revenue, expenses, cash flow, and margin
- Product catalog with categories and stock control
- Customer management with active/inactive states
- Order and sales workflow with totals and status tracking
- POS flow for fast transactions
- Cashier operations with income and expense entries
- Authentication with Better Auth
- Interactive API documentation via Scalar

### Fiscal features
- Electronic invoicing for NF-e and NFC-e
- Tax calculation for ICMS, PIS, COFINS, IPI, II, and ISSQN
- SEFAZ integration for authorization, cancellation, query, and contingency scenarios
- XML signing with digital certificate support
- NFC-e QR code generation
- Fiscal settings for company data, address, certificate, CSC, and default tax configuration

## High-level architecture

```mermaid
flowchart LR
  Browser["Browser / UI"] --> Proxy["Next.js proxy"]
  Proxy -->|authenticated| TRPC["tRPC routers"]
  Proxy -->|auth routes| Auth["Better Auth"]
  TRPC --> DB["Drizzle + PGLite/PostgreSQL"]
  TRPC --> Fiscal["Fiscal module"]
  Fiscal --> SEFAZ["SEFAZ"]
  TRPC --> Docs["Scalar API docs"]
```

The app layer and the fiscal layer are intentionally separated:
- the web app handles presentation, routes, and persistence,
- the fiscal package contains the tax and XML logic,
- the services in the app layer orchestrate the business workflow.

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, Tailwind CSS, Radix UI, Recharts |
| API | tRPC, Better Auth |
| Data | Drizzle ORM, PGLite, PostgreSQL-ready schema |
| Fiscal engine | TypeScript package for NF-e/NFC-e generation and validation |
| Tooling | Turborepo, Biome, Bun |
| Internationalization | next-intl |

## Quick start

### Prerequisites
- Bun 1.3+
- Node.js 20+

### Setup

```bash
git clone https://github.com/LucasJaramilloAreiza/pagina.git
cd pagina
cp apps/web/.env.example apps/web/.env
```

Edit the environment file with a secure secret:

```env
BETTER_AUTH_SECRET=generate-with-openssl-rand-base64-32
BETTER_AUTH_URL=http://localhost:3001
```

Then run:

```bash
bun install
bun run dev
```

Open http://localhost:3001 and use the demo sign-in flow to access the sample account.

> On the first run, the app initializes the database, applies the schema, and seeds demo data.

## Common development commands

| Command | Purpose |
|---|---|
| `bun run dev` | Start the full monorepo |
| `bun run dev:web` | Start only the web app |
| `bun run check` | Run linting and formatting |
| `cd apps/web && bun test` | Run web-side tests |
| `cd packages/fiscal && bun test` | Run fiscal package tests |
| `cd apps/web && bun run prepare-prod` | Prepare the app for PostgreSQL-based production |

## Repository structure

```text
pagina/
├── apps/
│   ├── web/          # Main Next.js application
│   └── docs/        # Documentation site
├── packages/
│   ├── api/          # Shared API helpers
│   ├── auth/         # Authentication utilities
│   ├── config/       # Shared config
│   ├── db/           # Database schema and helpers
│   ├── env/          # Environment definitions
│   ├── fiscal/       # Standalone fiscal engine
│   └── ui/           # Shared UI primitives
├── docs/             # Architecture and fiscal documentation
├── compose.yaml      # Local development stack
└── package.json      # Root workspace scripts
```

### How the code is organized
- The web app lives in [apps/web](apps/web).
- The documentation app lives in [apps/docs](apps/docs).
- Shared libraries and infrastructure live in [packages](packages).
- The fiscal engine is isolated in [packages/fiscal](packages/fiscal).
- Detailed technical notes live in [docs](docs).

## Fiscal module overview

The fiscal subsystem is implemented as a standalone package in [packages/fiscal](packages/fiscal). It contains the domain logic, XML building, certificate handling, SEFAZ integration, and tax calculations.

That separation is intentional: the business app can orchestrate invoice workflows without depending directly on the lower-level fiscal internals.

## Documentation and contribution

If you want to explore the project in more depth, start with:
- [docs](docs) for architecture and billing-specific documentation
- [apps/web](apps/web) for the application layer
- [packages/fiscal](packages/fiscal) for the fiscal engine

Contributions are welcome. If you plan to change behavior, please keep the code organized, document important decisions, and follow the existing structure.

## License

This project is distributed under the license described in [LICENSE](LICENSE).

> **Why curl?** Bun's `node:https` Agent does not support PFX for mTLS. The workaround extracts PEM from PFX via openssl and uses curl for the HTTPS request.

### Detailed Documentation

The [`docs/`](docs/) folder contains 12 in-depth documents:

| Document | Topic |
|----------|-------|
| [00-architecture.md](docs/00-architecture.md) | Layers, dependency graph, numeric conventions |
| [01-tax-engine.md](docs/01-tax-engine.md) | ICMS/PIS/COFINS/IPI, TaxElement pattern |
| [02-xml-generation.md](docs/02-xml-generation.md) | xml-builder, complement, NF-e XML structure |
| [03-sefaz-communication.md](docs/03-sefaz-communication.md) | Transport, URLs, request builders, reform events |
| [04-certificate-signing.md](docs/04-certificate-signing.md) | PFX extraction, XML digital signature |
| [05-value-objects.md](docs/05-value-objects.md) | AccessKey (mod-11), TaxId (CPF/CNPJ) |
| [06-invoice-workflow.md](docs/06-invoice-workflow.md) | Invoice service lifecycle, repositories |
| [07-contingency.md](docs/07-contingency.md) | SVC-AN/SVC-RS, EPEC, offline modes |
| [08-qrcode.md](docs/08-qrcode.md) | NFC-e QR code v2.00/v3.00 |
| [09-txt-conversion.md](docs/09-txt-conversion.md) | SPED TXT legacy format conversion |
| [10-database-schema.md](docs/10-database-schema.md) | Fiscal tables, multi-tenancy |
| [11-utilities.md](docs/11-utilities.md) | GTIN, CEP lookup, state codes |

## API

All API procedures require authentication via Better Auth session cookie. The API uses **tRPC** for end-to-end type safety — frontend components consume procedures directly with full TypeScript inference.

### Interactive Docs

Visit **`/api/docs`** for the full interactive API reference powered by Scalar, auto-generated from the tRPC router definitions.

The raw OpenAPI 3.0 spec is available at `/api/openapi.json`.

### tRPC Procedures

| Router | Procedures | Description |
|--------|-----------|-------------|
| `products` | `list`, `create`, `update`, `delete` | Product CRUD with stock and categories |
| `customers` | `list`, `create`, `update`, `delete` | Customer CRUD with status |
| `orders` | `list`, `create`, `update`, `delete` | Order management with items and transactions |
| `transactions` | `list`, `create`, `update`, `delete` | Income/expense transaction logging |
| `paymentMethods` | `list`, `create`, `update`, `delete` | Payment method management |
| `dashboard` | `stats` | Aggregated revenue, expenses, profit, cash flow, margins |
| `fiscal` | `list`, `getById`, `issue`, `cancel`, `void`, `sync` | Invoice management |
| `fiscalSettings` | `get`, `upsert`, `testConnection`, `getCertificateInfo` | Fiscal configuration |
| `cities` | `listByState` | IBGE city lookup for fiscal address |

## Testing

840 tests across 2 test suites (754 fiscal + 86 tRPC), all passing with 0 failures.

```bash
# tRPC router tests (from apps/web)
cd apps/web && bun test

# Fiscal module tests (from packages/fiscal)
cd packages/fiscal && bun test

# Coverage report
cd apps/web && bun run test:coverage
```

> **Note**: Run fiscal and tRPC tests separately — Bun can segfault on large parallel runs.

```mermaid
flowchart TB
  subgraph FiscalTests["Fiscal Tests (754)"]
    TaxTests["Tax engine ICMS / PIS / COFINS / IPI"]
    XMLTests["XML builder + complement"]
    PortedTests["Ported from PHP sped-nfe test suite"]
    QRTests["QR code + certificate"]
  end

  subgraph tRPCTests["tRPC Tests (86)"]
    PGLite["PGLite (in-memory)"]
    Mock["mock.module (@/lib/db)"]
    Caller["createCallerFactory"]
  end

  Schema["schema.ts"] -->|DDL| PGLite
  Mock -->|injects| PGLite
  Caller -->|calls router| Mock

  subgraph Verifications
    CRUD["CRUD → list() confirms state"]
    Isolation["cross-user → invisible"]
    Zod["Zod reject → unchanged"]
  end

  Caller --> Verifications
```

## Docker Deploy

The project includes a multi-stage Alpine-based Dockerfile and Docker Compose with a persistent volume.

```bash
docker compose up -d          # Build and start
docker compose logs -f        # View logs
docker compose down           # Stop
docker compose down -v        # Stop and delete database data
```

The `compose.yaml` expects `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` environment variables. For local dev, configure `apps/web/.env`. For Docker, create a root `.env` file or pass them via `-e`:

```bash
BETTER_AUTH_SECRET=your-secret-key-at-least-32-chars
BETTER_AUTH_URL=https://your-domain.com
```

### Coolify / PaaS

The project works with Coolify and similar platforms that detect `compose.yaml`. Set the environment variables in the platform UI. The default internal port is `3111` (configurable via `PORT` env).

## Database

### Schema

<!-- ER_START -->

```mermaid
erDiagram
    products {
        serial id PK
        varchar name
        text description
        integer price
        integer in_stock
        varchar user_uid
        varchar category
        varchar codigo_barras UK
        timestamp created_at
    }

    customers {
        serial id PK
        varchar name
        varchar email UK
        varchar phone
        varchar user_uid
        varchar status
        timestamp created_at
    }

    payment_methods {
        serial id PK
        varchar name UK
        timestamp created_at
    }

    orders {
        serial id PK
        integer customer_id FK
        integer total_amount
        varchar user_uid
        varchar status
        timestamp created_at
    }

    order_items {
        serial id PK
        integer order_id FK
        integer product_id FK
        integer quantity
        integer price
        timestamp created_at
    }

    transactions {
        serial id PK
        text description
        integer order_id FK
        integer payment_method_id FK
        integer amount
        varchar user_uid
        varchar type
        varchar category
        varchar status
        timestamp created_at
    }

    customers |o--o{ orders : "has"
    orders |o--o{ order_items : "contains"
    products |o--o{ order_items : "references"
    orders |o--o{ transactions : "generates"
    payment_methods |o--o{ transactions : "uses"
```

<!-- ER_END -->

All monetary values are stored as **integer cents** (e.g., $49.99 = `4999`). This avoids floating-point precision issues. All tables with `user_uid` enforce multi-tenancy.

### PGLite (default)

PGLite runs full PostgreSQL via WASM, directly in the Node.js process. Data is stored at `apps/web/data/pglite` (filesystem). No external PostgreSQL server required.

**Pros:** zero config, no dependencies, ideal for dev and small projects.

**Limitations:** single-process (no external concurrent connections), lower performance than native PostgreSQL under heavy load, no replication.

### Migrating to PostgreSQL

When the project grows and needs a real database, migration is straightforward because Drizzle ORM abstracts the data access layer — the schema is identical.

#### Automatic migration

Run the built-in script that handles all steps automatically:

```bash
cd apps/web && bun run prepare-prod
```

Then set `DATABASE_URL` in your `apps/web/.env` file and run:

```bash
cd apps/web && bun run db:push
cd apps/web && bun run dev
```

#### Manual migration

If you prefer to do it step by step:

#### 1. Install the PostgreSQL driver

```bash
bun add pg
bun remove @electric-sql/pglite
```

#### 2. Update `apps/web/src/lib/db/index.ts`

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export const db = drizzle(process.env.DATABASE_URL!, { schema });
```

#### 3. Update `apps/web/drizzle.config.ts`

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

#### 4. Add the env variable to `apps/web/.env`

```
DATABASE_URL=postgresql://user:password@host:5432/finopenpos
```

#### 5. Push schema and run

```bash
cd apps/web && bun run db:push
bun run dev
```

#### 6. Clean up what's no longer needed

- Delete `scripts/ensure-db.ts` (only exists for PGLite recovery)
- Remove `db:ensure` from `dev` and `build` scripts in `package.json`
- Remove `serverExternalPackages` from `next.config.mjs`
- In Docker, replace the PGLite volume with a PostgreSQL connection via `DATABASE_URL`

> The Drizzle schema (`apps/web/src/lib/db/schema.ts`) doesn't change. All queries, relations and tRPC procedures keep working without modification.

## Contributing

Contributions are welcome! Open an issue or submit a Pull Request.

## License

MIT License — see [LICENSE](LICENSE).
