import { z } from "zod/v4";
import { protectedProcedure, router } from "../init";
import { db } from "@/lib/db";
import { customers, orders } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const customerSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  status: z.string().nullable(),
  user_uid: z.string(),
  created_at: z.date().nullable(),
});

export const customersRouter = router({
  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/customers", tags: ["Customers"], summary: "List all customers" } })
    .input(z.void())
    .output(z.array(customerSchema))
    .query(async ({ ctx }) => {
      return db.select().from(customers).where(eq(customers.user_uid, ctx.user.id));
    }),

  create: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/customers", tags: ["Customers"], summary: "Create a customer" } })
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
      })
    )
    .output(customerSchema)
    .mutation(async ({ ctx, input }) => {
      const [data] = await db
        .insert(customers)
        .values({ ...input, user_uid: ctx.user.id })
        .returning();
      return data;
    }),

  update: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: "/customers/{id}", tags: ["Customers"], summary: "Update a customer" } })
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
      })
    )
    .output(customerSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [updated] = await db
        .update(customers)
        .set({ ...data, user_uid: ctx.user.id })
        .where(and(eq(customers.id, id), eq(customers.user_uid, ctx.user.id)))
        .returning();
      return updated;
    }),

  delete: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: "/customers/{id}", tags: ["Customers"], summary: "Delete a customer" } })
    .input(z.object({ id: z.number() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await db.transaction(async (tx) => {
        await tx
          .update(orders)
          .set({ customer_id: null })
          .where(and(eq(orders.customer_id, input.id), eq(orders.user_uid, ctx.user.id)));

        await tx
          .delete(customers)
          .where(and(eq(customers.id, input.id), eq(customers.user_uid, ctx.user.id)));
      });

      return { success: true };
    }),
});
