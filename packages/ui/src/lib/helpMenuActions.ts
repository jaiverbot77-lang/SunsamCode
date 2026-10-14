import type { IPlatformService } from "@zcode/shared";
import type { IntlInstance } from "@/i18n/IntlProvider.js";
import type { FeedbackSubmitDraft } from "@/feedback/feedbackStore.js";
import { runExportLogsAction } from "@/lib/exportLogsAction.js";
import { ZCODE_PRODUCT_DOCS_URL } from "@/lib/productDocs.js";
import { buildSunsamIssueUrl } from "@/sunsam/githubIssues.js";

export interface HelpMenuActionHandlers {
  openIssueReport: () => Promise<void>;
  openFeatureRequest: () => void;
  openProductDocs: () => void;
  exportLogs: () => void;
}

export function createHelpMenuActionHandlers({
  platform,
  intl,
}: {
  platform: Pick<IPlatformService, "captureWindowScreenshot" | "exportLogs" | "openExternal">;
  intl: IntlInstance;
  openSubmit: (draft?: FeedbackSubmitDraft) => void;
}): HelpMenuActionHandlers {
  return {
    // Sunsam: los problemas y las solicitudes de funciones se publican como issues en GitHub.
    // `openSubmit` sigue en el tipo para no tocar a quien crea estos manejadores.
    openIssueReport: async () => {
      platform.openExternal(buildSunsamIssueUrl("bug"));
    },
    openFeatureRequest: () => {
      platform.openExternal(buildSunsamIssueUrl("feature"));
    },
    openProductDocs: () => {
      platform.openExternal(ZCODE_PRODUCT_DOCS_URL);
    },
    exportLogs: () => {
      void runExportLogsAction(platform, intl);
    },
  };
}
