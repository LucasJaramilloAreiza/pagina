# 🌿 ERP Jabonera Natural

> **Sistema integral de gestión de inventario, producción y ventas.** 
> Construido con Next.js (App Router), Tailwind CSS y Prisma ORM.

---

## 🚀 Estado Actual (v1.2)

El sistema ha sido migrado exitosamente a una arquitectura de datos unificada, eliminando dependencias obsoletas (Drizzle) y consolidando la lógica de negocio 100% en Prisma.

### 📦 Módulos Implementados

| Módulo | Estado | Core Técnico | Descripción |
| :--- | :---: | :--- | :--- |
| **Inventario** | 🟢 Listo | `InventoryItem` | Modelo centralizado. Separa Materias Primas (`RAW_MATERIAL`) y Productos Terminados (`FINISHED`). |
| **Producción** | 🟢 Listo | `ProductionBatch` | Transacciones atómicas: Descuenta insumos y suma productos al instante mediante lotes. |
| **Pedidos** | 🟢 Listo | `Order` / `OrderItem` | Creación de órdenes de venta que descuentan exclusivamente productos terminados del stock. |
| **Kardex** | 🟢 Listo | `InventoryTransaction`| Auditoría inmutable de movimientos. Interfaz UI integrada con clasificación de Entradas (+) y Salidas (-). |

---

## 🗄️ Arquitectura de Base de Datos

El sistema utiliza una base de datos relacional PostgreSQL (alojada en Neon), estructurada mediante Prisma ORM. El esquema se compone de las siguientes tablas principales:

*   **📦 Inventario y Catálogo:** `inventory_items`, `inventory_transactions`, `categories`
*   **🏭 Motor de Producción:** `production_batches`, `production_stations`, `batch_inputs`, `batch_outputs`
*   **🛒 Ventas y Clientes:** `orders`, `order_items`, `customers`
*   **🔐 Autenticación y Seguridad:** `users`, `sessions`, `role_permissions`, `audit_logs`
*   **⚙️ Monitoreo:** `incidents`

---

## 🛠️ Mejoras de Arquitectura (Refactorización)

* **Server Actions Seguras:** Manejo correcto de `redirect()` de Next.js fuera de los bloques `try...catch` para evitar fallos de servidor.
* **Integridad de Datos:** Uso estricto de `prisma.$transaction` para asegurar que ningún lote o venta quede a medias si hay un error.
* **Guardrails (Barreras de seguridad):** Prevención de eliminación accidental de productos que ya tengan un historial de movimientos o ventas asociado, evitando colisiones de llaves foráneas.
* **UI Consistente:** Nueva ruta `/kardex` acoplada exitosamente al `NavShell` con diseño minimalista en Tailwind CSS.

---
*Versión 1.2 - Desarrollado para mantener la trazabilidad absoluta y eficiencia de la producción jabonera.*
