import { ZCODE_VERSION } from "@zcode/shared";

/**
 * Sunsam: «Informar de un problema» y «Solicitar una función» abren un issue en el repositorio
 * de Sunsam Code en GitHub (los diálogos de upstream envían los datos a los servidores de Z.ai,
 * que no los reciben para este fork). Las plantillas viven en .github/ISSUE_TEMPLATE; los
 * parámetros de la URL rellenan los campos del formulario que tienen el mismo id.
 */
export const SUNSAM_REPOSITORY_URL = "https://github.com/jhonsu01/SunsamCode";

/** Avisos de seguridad privados (Private vulnerability reporting de GitHub). */
export const SUNSAM_SECURITY_REPORT_URL = `${SUNSAM_REPOSITORY_URL}/security/advisories/new`;

/**
 * Sustituye a useVulnerabilityReportUrl de upstream, cuya URL llega de la configuración remota de
 * Z.ai (zsrcUrl → src.zhipuai.cn). En Sunsam siempre es el formulario privado de GitHub.
 */
export function useSunsamVulnerabilityReportUrl(_open: boolean): { url: string; loading: false } {
  return { url: SUNSAM_SECURITY_REPORT_URL, loading: false };
}

export type SunsamIssueKind = "bug" | "feature";

const TEMPLATES: Record<SunsamIssueKind, string> = {
  bug: "bug_report.yml",
  feature: "feature_request.yml",
};

function describeSystem(): string {
  const nav = typeof navigator === "undefined" ? undefined : navigator;
  const uaData = (nav as (Navigator & { userAgentData?: { platform?: string } }) | undefined)?.userAgentData;
  return uaData?.platform || nav?.platform || "unknown";
}

export function buildSunsamIssueUrl(
  kind: SunsamIssueKind,
  context: { version?: string; os?: string } = {},
): string {
  const params = new URLSearchParams({ template: TEMPLATES[kind] });
  if (kind === "bug") {
    params.set("version", context.version ?? ZCODE_VERSION);
    params.set("os", context.os ?? describeSystem());
  }
  return `${SUNSAM_REPOSITORY_URL}/issues/new?${params.toString()}`;
}
