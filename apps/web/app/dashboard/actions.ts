"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth-guard";

type CreateProductData = {
  name: string;
  sku?: string;
  stock: number;
  price: number;
  category?: string;
};

export async function createProduct(data: CreateProductData) {
  const name = data.name?.toString().trim() ?? "";
  const sku = data.sku?.toString().trim() ?? "";
  const stock = Number(data.stock);
  const price = Number(data.price);
  const category = data.category?.toString().trim() ?? "";

  if (!name || Number.isNaN(stock) || Number.isNaN(price) || stock < 0 || price < 0) {
    return;
  }

  const user = await getAuthUser();
  const userUid = user?.id ?? "demo-user";

  await db.insert(products).values({
    name,
    description: null,
    codigo_barras: sku || null,
    in_stock: stock,
    price,
    category: category || null,
    user_uid: userUid,
  });

  revalidatePath("/dashboard");
}

type DeleteProductData = {
  productId: number;
};

export async function deleteProduct(data: DeleteProductData) {
  const id = Number(data.productId);
  if (!Number.isFinite(id) || id <= 0) {
    return;
  }

  const user = await getAuthUser();
  const userUid = user?.id;

  let query = db.delete(products).where(eq(products.id, id));
  if (userUid) {
    query = query.where(eq(products.user_uid, userUid));
  }

  await query;
  revalidatePath("/dashboard");
}
