import { createAuth } from "@finopenpos/auth";
import { prisma } from "./db";
import { serverUrls } from "@finopenpos/env/server";

export const auth = createAuth({
  prisma,
  baseURL: serverUrls.betterAuthUrl,
});
