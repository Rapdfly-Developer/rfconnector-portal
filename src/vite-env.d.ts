/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Shared API base URL — e.g. https://api.chargebridge.io */
  readonly VITE_API_URL?: string;

  /**
   * Subdomain prefix (or full hostname) that serves the client portal.
   * Default: "portal"  →  portal.chargebridge.io
   */
  readonly VITE_CLIENT_HOST?: string;

  /**
   * Subdomain prefix (or full hostname) that serves the operator dashboard.
   * Default: "app"  →  app.chargebridge.io
   */
  readonly VITE_OPERATOR_HOST?: string;

  /**
   * Full base URL for the client portal — used for cross-host links from the
   * operator dashboard.
   * Example: https://portal.chargebridge.io
   */
  readonly VITE_CLIENT_BASE_URL?: string;

  /**
   * Full base URL for the operator dashboard — used for cross-host links from
   * the client portal (e.g. "Contact your operator").
   * Example: https://app.chargebridge.io
   */
  readonly VITE_OPERATOR_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
