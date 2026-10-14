/**
 * Sunsam: marketplaces de conectores MCP (.mcpb). Un marketplace es un `marketplace.json` público
 * (ver https://github.com/jhonsu01/marketplace-SunsamCode) con la versión, el icono y la URL + SHA-256
 * del .mcpb de cada conector. Lógica pura: resolver la fuente, validar y comparar versiones.
 */
import type { SunsamMcpbIpcResult, SunsamMcpbInstallResult } from "./sunsamMcpb.js";

export const SUNSAM_MARKETPLACE_CHANNELS = {
  list: "sunsam:marketplace:list",
  add: "sunsam:marketplace:add",
  remove: "sunsam:marketplace:remove",
  install: "sunsam:marketplace:install",
} as const;

/** Marketplace incluido por defecto (se puede quitar). */
export const SUNSAM_DEFAULT_MARKETPLACE = "jhonsu01/marketplace-SunsamCode";

export interface SunsamMarketplaceConnectorEntry {
  name: string;
  displayName: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  brandColor?: string;
  version: string;
  icon?: string;
  platforms?: string[];
  tools?: string[];
  repository?: string;
  mcpb: { url: string; sha256?: string; size?: number };
}

export interface SunsamMarketplaceFile {
  schemaVersion: 1;
  name: string;
  displayName?: string;
  updatedAt?: string;
  connectors: SunsamMarketplaceConnectorEntry[];
}

/** Conector tal como lo ve la UI: catálogo + estado de instalación. */
export interface SunsamMarketplaceConnector {
  name: string;
  serverKey: string;
  displayName: string;
  shortDescription?: string;
  category?: string;
  brandColor?: string;
  version: string;
  iconDataUrl?: string;
  platforms: string[];
  toolCount: number;
  repository?: string;
  installedVersion?: string;
  updateAvailable: boolean;
  /** La plataforma actual no está entre las declaradas. */
  unsupportedPlatform: boolean;
}

export interface SunsamMarketplaceView {
  /** Lo que escribió el usuario ("owner/repo" o URL); identifica el marketplace. */
  source: string;
  url: string;
  name: string;
  displayName: string;
  updatedAt?: string;
  connectors: SunsamMarketplaceConnector[];
  error?: string;
}

export interface SunsamMarketplaceBridge {
  list(refresh?: boolean): Promise<SunsamMcpbIpcResult<SunsamMarketplaceView[]>>;
  add(source: string): Promise<SunsamMcpbIpcResult<SunsamMarketplaceView[]>>;
  remove(source: string): Promise<SunsamMcpbIpcResult<SunsamMarketplaceView[]>>;
  /** Descarga el .mcpb (verificando SHA-256) e instala/actualiza como si se hubiera arrastrado. */
  install(
    source: string,
    connectorName: string,
  ): Promise<SunsamMcpbIpcResult<SunsamMcpbInstallResult>>;
}

const GITHUB_SHORTHAND = /^([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+?)(?:@([A-Za-z0-9._/-]+))?$/u;
const GITHUB_REPO_URL =
  /^https:\/\/github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+?)(?:\.git)?\/?$/u;

/**
 * "owner/repo", "owner/repo@rama", "https://github.com/owner/repo" o la URL https de un
 * marketplace.json → URL del marketplace.json. Lanza Error si no es válido.
 */
export function resolveSunsamMarketplaceUrl(source: string): string {
  const value = source.trim();
  const short = GITHUB_SHORTHAND.exec(value);
  if (short) {
    return `https://raw.githubusercontent.com/${short[1]}/${short[2]}/${short[3] ?? "HEAD"}/marketplace.json`;
  }
  const repoUrl = GITHUB_REPO_URL.exec(value);
  if (repoUrl) {
    return `https://raw.githubusercontent.com/${repoUrl[1]}/${repoUrl[2]}/HEAD/marketplace.json`;
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("use owner/repo or the https URL of a marketplace.json");
  }
  if (url.protocol !== "https:") throw new Error("marketplaces must be served over https");
  return url.toString();
}

/** Normaliza para comparar fuentes ("Owner/Repo" ≡ "owner/repo"). */
export function sunsamMarketplaceSourceKey(source: string): string {
  return resolveSunsamMarketplaceUrl(source).toLowerCase();
}

export function parseSunsamMarketplace(raw: unknown): SunsamMarketplaceFile {
  if (!raw || typeof raw !== "object") throw new Error("marketplace.json is not an object");
  const file = raw as Partial<SunsamMarketplaceFile>;
  if (file.schemaVersion !== 1) throw new Error("unsupported marketplace schemaVersion");
  if (!Array.isArray(file.connectors)) throw new Error("marketplace.json has no connectors");
  const connectors = file.connectors.filter(
    (entry): entry is SunsamMarketplaceConnectorEntry =>
      Boolean(entry) &&
      typeof entry.name === "string" &&
      typeof entry.version === "string" &&
      typeof entry.mcpb?.url === "string" &&
      entry.mcpb.url.startsWith("https://"),
  );
  return {
    schemaVersion: 1,
    name: typeof file.name === "string" ? file.name : "marketplace",
    ...(typeof file.displayName === "string" ? { displayName: file.displayName } : {}),
    ...(typeof file.updatedAt === "string" ? { updatedAt: file.updatedAt } : {}),
    connectors: connectors.map((entry) => ({
      ...entry,
      displayName: typeof entry.displayName === "string" ? entry.displayName : entry.name,
    })),
  };
}

/**
 * Compara versiones tipo semver ("1.10.3" > "1.9.0", "1.0.0" > "1.0.0-beta.2").
 * Devuelve >0 si a es más nueva, <0 si es más vieja, 0 si son iguales.
 */
export function compareSunsamVersions(a: string, b: string): number {
  const parse = (version: string) => {
    const [core = "", pre] = version.trim().replace(/^v/iu, "").split("-", 2);
    return { nums: core.split(".").map((part) => Number.parseInt(part, 10) || 0), pre };
  };
  const left = parse(a);
  const right = parse(b);
  for (let index = 0; index < Math.max(left.nums.length, right.nums.length); index += 1) {
    const diff = (left.nums[index] ?? 0) - (right.nums[index] ?? 0);
    if (diff !== 0) return diff;
  }
  if (left.pre === right.pre) return 0;
  if (left.pre === undefined) return 1;
  if (right.pre === undefined) return -1;
  return left.pre.localeCompare(right.pre, undefined, { numeric: true });
}
