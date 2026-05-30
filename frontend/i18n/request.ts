import { getRequestConfig } from "next-intl/server";

import { defaultLocale, isLocale } from "./config";
import { getDictionary } from "./get-dictionary";

export default getRequestConfig(async ({ requestLocale }) => {
  const localeHeader = await requestLocale;
  const locale = isLocale(localeHeader) ? localeHeader : defaultLocale;

  return {
    locale,
    messages: await getDictionary(locale),
  };
});
