import { cookies } from "next/headers";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_COOKIE,
  type Language,
  isLanguage,
  languageToLocale,
  translate,
} from "./translations";

export async function getServerLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LANGUAGE_COOKIE)?.value;
  return isLanguage(value) ? value : DEFAULT_LANGUAGE;
}

export async function getServerI18n() {
  const language = await getServerLanguage();

  return {
    language,
    locale: languageToLocale(language),
    t: (key: Parameters<typeof translate>[1]) => translate(language, key),
  };
}
