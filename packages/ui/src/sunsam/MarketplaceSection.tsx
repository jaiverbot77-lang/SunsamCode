/**
 * Sunsam: marketplaces de conectores MCP en la pantalla "Servidores MCP" (estilo Codex): lista con
 * icono, nombre, etiqueta del marketplace y descripción, con Instalar / Actualizar / Instalado.
 * Instalar descarga el .mcpb del marketplace y sigue el mismo flujo que arrastrar un archivo.
 */
import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Plus, RefreshCw, Store, X } from "lucide-react";
import type {
  SunsamMarketplaceBridge,
  SunsamMarketplaceConnector,
  SunsamMarketplaceView,
  SunsamMcpbInstallResult,
} from "@zcode/shared";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { toast } from "@/components/ui/toast.js";
import { useZCodeIntl } from "@/i18n/IntlProvider.js";

type SunsamMarketplaceWindow = Window & { zcode?: { sunsamMarketplace?: SunsamMarketplaceBridge } };

function getMarketplaceBridge(): SunsamMarketplaceBridge | undefined {
  return typeof window === "undefined"
    ? undefined
    : (window as SunsamMarketplaceWindow).zcode?.sunsamMarketplace;
}

interface MarketplaceSectionProps {
  /** Continúa el flujo normal de instalación (formulario de ajustes, registro, aviso de reinicio). */
  onInstalled: (result: SunsamMcpbInstallResult) => Promise<void>;
  /** Cambia cuando termina una instalación, para refrescar "Instalado" / "Actualizar". */
  refreshToken: number;
}

function ConnectorIcon({ connector }: { connector: SunsamMarketplaceConnector }) {
  if (connector.iconDataUrl) {
    return (
      <img
        src={connector.iconDataUrl}
        alt=""
        className="size-10 shrink-0 rounded-lg object-contain"
        draggable={false}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-lg text-ui-lg font-semibold text-white"
      style={{ backgroundColor: connector.brandColor ?? "#52525b" }}
    >
      {connector.displayName.slice(0, 1).toUpperCase()}
    </div>
  );
}

export function SunsamMarketplaceSection({ onInstalled, refreshToken }: MarketplaceSectionProps) {
  const { intl } = useZCodeIntl();
  const bridge = getMarketplaceBridge();
  const [views, setViews] = useState<SunsamMarketplaceView[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [source, setSource] = useState("");
  const [working, setWorking] = useState<string | null>(null);

  const t = useCallback(
    (id: string, values?: Record<string, string | number>) => intl.formatMessage({ id }, values),
    [intl],
  );

  const load = useCallback(
    async (refresh: boolean) => {
      if (!bridge) return;
      setLoading(true);
      try {
        const listed = await bridge.list(refresh);
        if (listed.ok) setViews(listed.value);
        else toast(t("sunsam.market.error", { error: listed.error }), { variant: "warning" });
      } finally {
        setLoading(false);
      }
    },
    [bridge, t],
  );

  useEffect(() => {
    void load(false);
  }, [load, refreshToken]);

  if (!bridge) return null;

  const addMarketplace = async () => {
    const value = source.trim();
    if (!value) return;
    setWorking("add");
    try {
      const added = await bridge.add(value);
      if (added.ok) {
        setViews(added.value);
        setSource("");
        setAdding(false);
        toast(t("sunsam.market.added", { source: value }), { variant: "info" });
      } else {
        toast(t("sunsam.market.error", { error: added.error }), { variant: "warning" });
      }
    } finally {
      setWorking(null);
    }
  };

  const removeMarketplace = async (view: SunsamMarketplaceView) => {
    setWorking(`remove:${view.source}`);
    try {
      const removed = await bridge.remove(view.source);
      if (removed.ok) setViews(removed.value);
    } finally {
      setWorking(null);
    }
  };

  const install = async (view: SunsamMarketplaceView, connector: SunsamMarketplaceConnector) => {
    const key = `${view.source}:${connector.name}`;
    setWorking(key);
    try {
      const installed = await bridge.install(view.source, connector.name);
      if (!installed.ok) {
        toast(t("sunsam.mcpb.error", { error: installed.error }), { variant: "warning" });
        return;
      }
      await onInstalled(installed.value);
      await load(false);
    } finally {
      setWorking(null);
    }
  };

  return (
    <section className="mt-6 space-y-3" data-sunsam-marketplaces="true">
      <div className="flex flex-wrap items-center gap-2">
        <Store className="size-4 text-foreground-subtle" aria-hidden="true" />
        <h3 className="mr-auto text-ui-lg font-medium text-foreground">
          {t("sunsam.market.title")}
        </h3>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label={t("sunsam.market.refresh")}
          title={t("sunsam.market.refresh")}
          disabled={loading}
          onClick={() => void load(true)}
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => setAdding((open) => !open)}
        >
          <Plus data-icon="inline-start" aria-hidden="true" />
          {t("sunsam.market.add")}
        </Button>
      </div>

      {adding ? (
        <form
          className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3"
          onSubmit={(event) => {
            event.preventDefault();
            void addMarketplace();
          }}
        >
          <Input
            className="min-w-0 flex-1"
            autoFocus
            value={source}
            placeholder={t("sunsam.market.sourcePlaceholder")}
            onChange={(event) => setSource(event.target.value)}
          />
          <Button type="submit" size="lg" disabled={working === "add" || !source.trim()}>
            {working === "add" ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : null}
            {t("sunsam.market.addConfirm")}
          </Button>
          <p className="basis-full text-ui-sm text-foreground-subtle">
            {t("sunsam.market.sourceHint")}
          </p>
        </form>
      ) : null}

      {views === null ? (
        <p className="text-ui-base text-foreground-subtle">{t("common.loading")}</p>
      ) : views.length === 0 ? (
        <p className="text-ui-base text-foreground-subtle">{t("sunsam.market.empty")}</p>
      ) : (
        views.map((view) => (
          <div key={view.source} className="space-y-1">
            <div className="flex items-center gap-2 px-1">
              <span className="text-ui-base font-medium text-foreground">{view.displayName}</span>
              <span className="truncate text-ui-sm text-foreground-subtle">{view.source}</span>
              <button
                type="button"
                className="ml-auto flex size-6 items-center justify-center rounded-md text-foreground-subtle hover:bg-surface-hover hover:text-foreground"
                aria-label={t("sunsam.market.remove", { source: view.source })}
                title={t("sunsam.market.remove", { source: view.source })}
                disabled={working === `remove:${view.source}`}
                onClick={() => void removeMarketplace(view)}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
            {view.error ? (
              <p className="rounded-lg border border-border bg-card px-3 py-2 text-ui-sm text-foreground-subtle">
                {t("sunsam.market.loadError", { error: view.error })}
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                {view.connectors.map((connector, index) => {
                  const key = `${view.source}:${connector.name}`;
                  const busy = working === key;
                  return (
                    <div
                      key={connector.name}
                      className={`flex items-center gap-3 px-4 py-3 ${index > 0 ? "border-t border-border" : ""}`}
                      data-sunsam-connector={connector.name}
                    >
                      <ConnectorIcon connector={connector} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-ui-base font-medium text-foreground">
                            {connector.displayName}
                          </span>
                          <span className="text-ui-sm text-foreground-subtle">{view.name}</span>
                          <span className="text-ui-sm text-foreground-subtle">
                            v{connector.version}
                          </span>
                        </div>
                        {connector.shortDescription ? (
                          <p className="truncate text-ui-sm text-foreground-subtle">
                            {connector.shortDescription}
                          </p>
                        ) : null}
                      </div>
                      {connector.installedVersion && !connector.updateAvailable ? (
                        <span className="flex shrink-0 items-center gap-1 text-ui-sm text-foreground-subtle">
                          <Check className="size-3.5" aria-hidden="true" />
                          {t("sunsam.market.installed")}
                        </span>
                      ) : (
                        <Button
                          type="button"
                          size="lg"
                          variant={connector.updateAvailable ? "default" : "outline"}
                          disabled={busy || working !== null}
                          title={
                            connector.unsupportedPlatform
                              ? t("sunsam.mcpb.platformWarning", {
                                  platforms: connector.platforms.join(", "),
                                })
                              : undefined
                          }
                          onClick={() => void install(view, connector)}
                        >
                          {busy ? (
                            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                          ) : null}
                          {connector.updateAvailable
                            ? t("sunsam.market.update", { version: connector.version })
                            : t("sunsam.market.install")}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))
      )}
    </section>
  );
}
