import type { Locale } from "@/i18n/config";
import en from "./dictionaries/en.json";

export type Dictionary = typeof en;

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default as Dictionary),
  fa: () => import("./dictionaries/fa.json").then((m) => m.default as Dictionary),
} satisfies Record<Locale, () => Promise<Dictionary>>;

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
