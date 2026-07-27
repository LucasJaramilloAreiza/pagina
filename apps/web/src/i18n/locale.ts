"use server";

import { cookies } from "next/headers";
import { defaultLocale } from "./config";

export async function setLocale() {
  const cookieStore = await cookies();
  cookieStore.set("locale", defaultLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

export async function getLocale() {
  return defaultLocale;
}
