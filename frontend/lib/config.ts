export type AppMode = "dev" | "uat" | "prod";

const DEFAULT_APP_MODE: AppMode = "dev";
const DEFAULT_API_BASE_URL = "http://localhost:8000";

function isAppMode(value: string | undefined): value is AppMode {
  return value === "dev" || value === "uat" || value === "prod";
}

function getAppMode(): AppMode {
  const mode = process.env.NEXT_PUBLIC_APP_MODE;

  return isAppMode(mode) ? mode : DEFAULT_APP_MODE;
}

function getApiBaseUrl(mode: AppMode): string {
  const apiBaseUrls: Record<AppMode, string | undefined> = {
    dev: process.env.NEXT_PUBLIC_API_BASE_URL_DEV,
    uat: process.env.NEXT_PUBLIC_API_BASE_URL_UAT,
    prod: process.env.NEXT_PUBLIC_API_BASE_URL_PROD,
  };

  return apiBaseUrls[mode] ?? process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL;
}

const appMode = getAppMode();

export const config = {
  appMode,
  apiBaseUrl: getApiBaseUrl(appMode),
  authGuardsEnabled: appMode !== "dev",
} as const;

export default config;
