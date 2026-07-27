# Pagina

Pagina é uma plataforma open-source para operação comercial no Brasil, unindo uma experiência moderna de PDV, gestão de estoque, fluxo de clientes e pedidos, além de um motor fiscal completo para NF-e e NFC-e.

O projeto é organizado como um monorepo Turborepo com uma aplicação web, uma aplicação de documentação, pacotes compartilhados e um módulo fiscal independente, que pode ser reutilizado por si só.

> [Read in English](README.md)

## O que este projeto faz

Pagina busca fornecer uma base prática para pequenos negócios que precisam de:

- operar um fluxo de ponto de venda com rapidez,
- gerenciar produtos, clientes, pedidos e movimentos de caixa,
- emitir e acompanhar documentos eletrônicos no contexto fiscal brasileiro,
- manter o sistema modular para que a lógica de negócio e a lógica fiscal evoluam separadamente.

Em resumo, este repositório não é só uma interface. Ele contém uma aplicação full-stack com serviços, acesso a banco, rotas de API e geração de documentos fiscais.

## Principais funcionalidades

### Recursos de negócio
- Dashboard com gráficos para receita, despesas, fluxo de caixa e margem
- Catálogo de produtos com categorias e controle de estoque
- Gestão de clientes com status ativo/inativo
- Fluxo de pedidos e vendas com totais e acompanhamento de status
- Fluxo de PDV para transações rápidas
- Operações de caixa com lançamentos de entrada e saída
- Autenticação com Better Auth
- Documentação interativa da API via Scalar

### Recursos fiscais
- Emissão eletrônica de NF-e e NFC-e
- Cálculo de impostos para ICMS, PIS, COFINS, IPI, II e ISSQN
- Integração com a SEFAZ para autorização, cancelamento, consulta e cenários de contingência
- Assinatura XML com suporte a certificado digital
- Geração de QR Code para NFC-e
- Configurações fiscais para dados da empresa, endereço, certificado, CSC e códigos padrões

## Arquitetura de alto nível

```mermaid
flowchart LR
  Browser["Navegador / UI"] --> Proxy["Proxy do Next.js"]
  Proxy -->|autenticado| TRPC["Rotas tRPC"]
  Proxy -->|rotas de auth| Auth["Better Auth"]
  TRPC --> DB["Drizzle + PGLite/PostgreSQL"]
  TRPC --> Fiscal["Módulo fiscal"]
  Fiscal --> SEFAZ["SEFAZ"]
  TRPC --> Docs["Documentação da API"]
```

A camada de aplicação e a camada fiscal estão separadas de propósito:
- a aplicação web cuida da interface, rotas e persistência,
- o pacote fiscal contém a lógica de impostos e XML,
- os serviços da camada de aplicação orquestram o fluxo de negócio.

## Stack tecnológica

| Camada | Tecnologias |
|---|---|
| Frontend | Next.js, React, Tailwind CSS, Radix UI, Recharts |
| API | tRPC, Better Auth |
| Dados | Drizzle ORM, PGLite, schema pronto para PostgreSQL |
| Motor fiscal | Pacote TypeScript para geração e validação de NF-e/NFC-e |
| Ferramentas | Turborepo, Biome, Bun |
| Internacionalização | next-intl |

## Quick start

### Pré-requisitos
- Bun 1.3+
- Node.js 20+

### Configuração

```bash
git clone https://github.com/LucasJaramilloAreiza/pagina.git
cd pagina
cp apps/web/.env.example apps/web/.env
```

Edite o arquivo de ambiente com um segredo seguro:

```env
BETTER_AUTH_SECRET=gere-com-openssl-rand-base64-32
BETTER_AUTH_URL=http://localhost:3001
```

Em seguida, execute:

```bash
bun install
bun run dev
```

Acesse http://localhost:3001 e use o fluxo de login demo para entrar com a conta de exemplo.

> Na primeira execução, a aplicação inicializa o banco, aplica o schema e popula dados de exemplo.

## Comandos comuns de desenvolvimento

| Comando | Finalidade |
|---|---|
| `bun run dev` | Inicia o monorepo completo |
| `bun run dev:web` | Inicia apenas a aplicação web |
| `bun run check` | Executa lint e formatação |
| `cd apps/web && bun test` | Roda testes da camada web |
| `cd packages/fiscal && bun test` | Roda testes do pacote fiscal |
| `cd apps/web && bun run prepare-prod` | Prepara o app para produção com PostgreSQL |

## Estrutura do repositório

```text
pagina/
├── apps/
│   ├── web/          # Aplicação principal em Next.js
│   └── docs/        # Site de documentação
├── packages/
│   ├── api/          # Helpers compartilhados de API
│   ├── auth/         # Utilidades de autenticação
│   ├── config/       # Configurações compartilhadas
│   ├── db/           # Schema e helpers de banco
│   ├── env/          # Definições de ambiente
│   ├── fiscal/       # Motor fiscal independente
│   └── ui/           # Primitivas de UI compartilhadas
├── docs/             # Documentação de arquitetura e fiscais
├── compose.yaml      # Stack local de desenvolvimento
└── package.json      # Scripts do workspace raiz
```

### Como o código está organizado
- A aplicação web fica em [apps/web](apps/web).
- A aplicação de documentação fica em [apps/docs](apps/docs).
- As bibliotecas compartilhadas e infraestrutura ficam em [packages](packages).
- O motor fiscal está isolado em [packages/fiscal](packages/fiscal).
- As notas técnicas detalhadas ficam em [docs](docs).

## Visão geral do módulo fiscal

O subsistema fiscal está implementado como um pacote independente em [packages/fiscal](packages/fiscal). Ele contém a lógica de domínio, construção de XML, manipulação de certificados, integração com a SEFAZ e cálculos de impostos.

Essa separação é intencional: a aplicação de negócio pode orquestrar o fluxo de notas sem depender diretamente das camadas fiscais mais internas.

## Documentação e contribuição

Se você quiser explorar o projeto com mais profundidade, comece por:
- [docs](docs) para documentação de arquitetura e aspectos fiscais
- [apps/web](apps/web) para a camada de aplicação
- [packages/fiscal](packages/fiscal) para o motor fiscal

Contribuições são bem-vindas. Se você for alterar comportamento, procure manter o código organizado, documentar decisões importantes e seguir a estrutura existente.

## Licença

Este projeto é distribuído sob a licença descrita em [LICENSE](LICENSE).

> **Por que curl?** O `node:https` do Bun nao suporta PFX para mTLS. O workaround extrai PEM do PFX via openssl e usa curl para a requisicao HTTPS.

### Documentacao Detalhada

A pasta [`docs/`](docs/) contem 12 documentos aprofundados:

| Documento | Tema |
|-----------|------|
| [00-architecture.md](docs/00-architecture.md) | Camadas, grafo de dependencias, convencoes numericas |
| [01-tax-engine.md](docs/01-tax-engine.md) | ICMS/PIS/COFINS/IPI, padrao TaxElement |
| [02-xml-generation.md](docs/02-xml-generation.md) | xml-builder, complement, estrutura XML NF-e |
| [03-sefaz-communication.md](docs/03-sefaz-communication.md) | Transporte, URLs, request builders, eventos reforma |
| [04-certificate-signing.md](docs/04-certificate-signing.md) | Extracao PFX, assinatura digital XML |
| [05-value-objects.md](docs/05-value-objects.md) | AccessKey (mod-11), TaxId (CPF/CNPJ) |
| [06-invoice-workflow.md](docs/06-invoice-workflow.md) | Ciclo de vida da nota, repositorios |
| [07-contingency.md](docs/07-contingency.md) | SVC-AN/SVC-RS, EPEC, modos offline |
| [08-qrcode.md](docs/08-qrcode.md) | QR code NFC-e v2.00/v3.00 |
| [09-txt-conversion.md](docs/09-txt-conversion.md) | Conversao formato legado SPED TXT |
| [10-database-schema.md](docs/10-database-schema.md) | Tabelas fiscais, multi-tenancy |
| [11-utilities.md](docs/11-utilities.md) | GTIN, consulta CEP, codigos estaduais |

## API

Todas as procedures exigem autenticacao via cookie de sessao do Better Auth. A API usa **tRPC** para type safety de ponta a ponta — os componentes do frontend consomem as procedures diretamente com inferencia completa de TypeScript.

### Documentacao Interativa

Acesse **`/api/docs`** para a referencia completa e interativa da API, gerada pelo Scalar a partir das definicoes dos routers tRPC.

A spec OpenAPI 3.0 raw esta disponivel em `/api/openapi.json`.

### Procedures tRPC

| Router | Procedures | Descricao |
|--------|-----------|-----------|
| `products` | `list`, `create`, `update`, `delete` | CRUD de produtos com estoque e categorias |
| `customers` | `list`, `create`, `update`, `delete` | CRUD de clientes com status |
| `orders` | `list`, `create`, `update`, `delete` | Gestao de pedidos com itens e transacoes |
| `transactions` | `list`, `create`, `update`, `delete` | Registro de transacoes (receitas/despesas) |
| `paymentMethods` | `list`, `create`, `update`, `delete` | Gestao de metodos de pagamento |
| `dashboard` | `stats` | Receita, despesas, lucro, fluxo de caixa e margens |
| `fiscal` | `list`, `getById`, `issue`, `cancel`, `void`, `sync` | Gestao de notas fiscais |
| `fiscalSettings` | `get`, `upsert`, `testConnection`, `getCertificateInfo` | Configuracao fiscal |
| `cities` | `listByState` | Consulta de municipios IBGE por estado |

## Testes

840 testes em 2 suites (754 fiscal + 86 tRPC), todos passando com 0 falhas.

```bash
# Testes dos routers tRPC
cd apps/web && bun test

# Testes do modulo fiscal
cd packages/fiscal && bun test
```

> **Nota**: Rode testes fiscal e tRPC separadamente — o Bun pode dar segfault em execucoes paralelas grandes.

```mermaid
flowchart TB
  subgraph FiscalTests["Testes Fiscais (754)"]
    TaxTests["Motor de impostos ICMS / PIS / COFINS / IPI"]
    XMLTests["XML builder + complement"]
    PortedTests["Portados do PHP suite sped-nfe"]
    QRTests["QR code + certificado"]
  end

  subgraph tRPCTests["Testes tRPC (86)"]
    PGLite["PGLite (in-memory)"]
    Mock["mock.module (@/lib/db)"]
    Caller["createCallerFactory"]
  end

  Schema["schema.ts"] -->|DDL| PGLite
  Mock -->|injeta| PGLite
  Caller -->|chama router| Mock

  subgraph Verificacoes
    CRUD["CRUD → list() confirma estado"]
    Isolation["cross-user → invisivel"]
    Zod["Zod rejeita → inalterado"]
  end

  Caller --> Verificacoes
```

## Deploy com Docker

O projeto inclui Dockerfile multi-stage baseado em Alpine e Docker Compose com volume persistente.

```bash
docker compose up -d          # Build e start
docker compose logs -f        # Ver logs
docker compose down           # Parar
docker compose down -v        # Parar e apagar dados do banco
```

O `compose.yaml` espera as variaveis de ambiente `BETTER_AUTH_SECRET` e `BETTER_AUTH_URL`. Crie um `apps/web/.env` ou passe via `-e`:

```bash
BETTER_AUTH_SECRET=sua-chave-secreta-de-32-chars-minimo
BETTER_AUTH_URL=https://seu-dominio.com
```

### Coolify / PaaS

O projeto funciona com Coolify e plataformas similares que detectam `compose.yaml`. Configure as variaveis de ambiente na UI da plataforma. A porta interna padrao e `3111` (configuravel via env `PORT`).

## Banco de Dados

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

Todos os valores monetarios sao armazenados como **inteiros em centavos** (ex: R$ 49,99 = `4999`). Isso evita problemas de precisao com ponto flutuante. Todas as tabelas com `user_uid` aplicam multi-tenancy.

### PGLite (padrao)

O PGLite roda PostgreSQL completo via WASM, direto no processo do Node.js. Os dados ficam em `apps/web/data/pglite` (filesystem). Nao precisa de servidor PostgreSQL externo.

**Vantagens:** zero config, sem dependencias, ideal para dev e projetos pequenos.

**Limitacoes:** single-process (sem conexoes concorrentes de fora), performance abaixo de um PostgreSQL nativo para cargas pesadas, sem replicacao.

### Migrando para PostgreSQL

Quando o projeto crescer e precisar de um banco real, a migracao e simples porque o Drizzle ORM abstrai a camada de acesso — o schema e identico.

#### Migração automática

Execute o script que faz todos os passos automaticamente:

```bash
cd apps/web && bun run prepare-prod
```

Depois configure `DATABASE_URL` no seu `apps/web/.env` e rode:

```bash
cd apps/web && bun run db:push
bun run dev
```

#### Migração manual

Se preferir fazer passo a passo:

#### 1. Instale o driver do PostgreSQL

```bash
bun add pg
bun remove @electric-sql/pglite
```

#### 2. Atualize `apps/web/src/lib/db/index.ts`

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export const db = drizzle(process.env.DATABASE_URL!, { schema });
```

#### 3. Atualize `apps/web/drizzle.config.ts`

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

#### 4. Adicione a env

```
DATABASE_URL=postgresql://user:password@host:5432/finopenpos
```

#### 5. Empurre o schema e rode

```bash
cd apps/web && bun run db:push
bun run dev
```

#### 6. Limpe o que nao precisa mais

- Delete `apps/web/scripts/ensure-db.ts` (so existe para recovery do PGLite)
- Remova `db:ensure` do script `dev` e `build` no `apps/web/package.json`
- Remova `serverExternalPackages` do `apps/web/next.config.mjs`
- No Docker, troque o volume PGLite por uma conexao ao PostgreSQL via `DATABASE_URL`

> O schema Drizzle (`apps/web/src/lib/db/schema.ts`) nao muda. Todas as queries, relations e procedures tRPC continuam funcionando sem alteracao.

## Contribuindo

Contribuicoes sao bem-vindas! Abra uma issue ou envie um Pull Request.

## Licenca

MIT License — veja [LICENSE](LICENSE).
