"use server";

import { revalidatePath } from "next/cache";
import { PrismaClient, ItemType, ItemUnit } from "@prisma/client";
import { getAuthUser } from "@/lib/auth-guard";

const prisma = new PrismaClient();

type CreateProductData = {
  name: string;
  sku?: string;
  stock: number;
  category?: string;
};

export async function createProduct(data: CreateProductData) {
  const name = data.name?.toString().trim() ?? "";
  // Si no envían SKU, generamos uno temporal porque es obligatorio y único en la base de datos
  const sku = data.sku?.toString().trim() ?? `SKU-${Date.now()}`; 
  const stock = Number(data.stock);

  if (!name || Number.isNaN(stock) || stock < 0) {
    return { success: false, error: "Datos inválidos" };
  }

  // Verificamos el usuario por si necesitas usar su información para logs más adelante
  const user = await getAuthUser();

  try {
    await prisma.inventoryItem.create({
      data: {
        name,
        sku,
        stock,
        type: ItemType.FINISHED, // Asumimos que desde el dashboard crean productos para la venta
        unit: ItemUnit.UNIT,
        // categoryId: category, // Descomenta si tu formulario envía el ID real de la categoría
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al crear el producto:", error);
    return { success: false, error: "No se pudo crear el producto en la base de datos." };
  }
}

type DeleteProductData = {
  productId: string; // ¡Ojo aquí! Cambió de 'number' a 'string' (CUID)
};

export async function deleteProduct(data: DeleteProductData) {
  const id = data.productId;
  
  if (!id) {
    return { success: false, error: "ID de producto inválido" };
  }

  try {
    // 1. VALIDACIÓN DE SEGURIDAD (Kardex y Ventas)
    // No podemos borrar un producto que ya tiene historial o romperá la contabilidad
    const hasTransactions = await prisma.inventoryTransaction.findFirst({ where: { itemId: id } });
    const hasOrders = await prisma.orderItem.findFirst({ where: { itemId: id } });

    if (hasTransactions || hasOrders) {
      return { 
        success: false, 
        error: "No se puede eliminar. Este producto tiene un historial de producción o pedidos asociados." 
      };
    }

    // 2. Si está limpio, procedemos a borrarlo físicamente
    await prisma.inventoryItem.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    return { success: false, error: "Hubo un problema de base de datos al intentar eliminar el ítem." };
  }
}