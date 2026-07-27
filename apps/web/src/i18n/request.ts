import { getRequestConfig } from "next-intl/server";
import { defaultLocale, type Locale } from "./config";

export default getRequestConfig(async () => {
  const locale: Locale = defaultLocale;
  const { default: messages } = await import("../messages/en");

  return {
    locale,
    messages,
  };
});
