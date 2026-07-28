import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import type { PrismaClient } from "@prisma/client";

interface AuthOptions {
  prisma: PrismaClient;
  baseURL?: string;
  trustedOrigins?: string[];
}

export function createAuth({ prisma, baseURL, trustedOrigins }: AuthOptions) {
  return betterAuth({
    baseURL,
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: { enabled: true },
    trustedOrigins,
    plugins: [nextCookies()],
  });
}

export type Auth = ReturnType<typeof createAuth>;
