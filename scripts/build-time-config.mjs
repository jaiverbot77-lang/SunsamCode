import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * 桌面构建期可选能力的唯一解析入口：ARMS RUM 上报、事件上报、自动更新。
 * 优先级：构建进程环境变量 > config/private/build-defaults.json（仅内部仓库存在）> 关闭。
 * 规则见 docs/desktop/build-time-optional-capabilities.md。
 */
export const PRIVATE_BUILD_DEFAULTS_PATH = resolve(
  import.meta.dirname,
  "../config/private/build-defaults.json",
);

const ENABLED_VALUES = new Set(["1", "true", "yes"]);

/**
 * Sunsam: sin el archivo privado de Z.ai la actualización automática quedaba apagada y las versiones
 * dejaban de detectar releases nuevos. Sunsam la activa por defecto (se actualiza desde los GitHub
 * Releases del fork); `ZCODE_AUTO_UPDATE=0` o el archivo privado siguen pudiendo desactivarla.
 * La telemetría de Z.ai sigue apagada.
 */
const SUNSAM_BUILD_DEFAULTS = Object.freeze({ ZCODE_AUTO_UPDATE: "1" });

async function readPrivateDefaults(path) {
  try {
    const parsed = JSON.parse(await readFile(path, "utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(`构建期私有默认配置必须是 JSON 对象：${path}`);
    }
    return parsed;
  } catch (error) {
    if (error?.code === "ENOENT") return {};
    throw error;
  }
}

function pickValue(env, defaults, key) {
  // 环境变量显式设置（包括空字符串）时优先，空字符串表示关闭该项能力
  if (typeof env[key] === "string") return env[key].trim();
  const value = defaults[key];
  return typeof value === "string" ? value.trim() : "";
}

export async function resolveBuildTimeConfig(
  env = process.env,
  { defaultsPath = PRIVATE_BUILD_DEFAULTS_PATH } = {},
) {
  const defaults = { ...SUNSAM_BUILD_DEFAULTS, ...(await readPrivateDefaults(defaultsPath)) };
  return {
    armsRumEndpoint: pickValue(env, defaults, "ZCODE_ARMS_RUM_ENDPOINT"),
    telemetryReportEndpoint: pickValue(env, defaults, "ZCODE_TELEMETRY_REPORT_ENDPOINT"),
    autoUpdateEnabled: ENABLED_VALUES.has(
      pickValue(env, defaults, "ZCODE_AUTO_UPDATE").toLowerCase(),
    ),
  };
}

export function createBuildTimeConfigDefines(config) {
  return {
    __ZCODE_ARMS_RUM_ENDPOINT__: JSON.stringify(config.armsRumEndpoint),
    __ZCODE_TELEMETRY_REPORT_ENDPOINT__: JSON.stringify(config.telemetryReportEndpoint),
    __ZCODE_AUTO_UPDATE_ENABLED__: JSON.stringify(config.autoUpdateEnabled),
  };
}
