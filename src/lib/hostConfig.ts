/**
 * hostConfig.ts
 *
 * Runtime subdomain detection.
 *
 * Production subdomains (configurable via env):
 *   portal.chargebridge.io  →  PortalType "client"
 *   app.chargebridge.io     →  PortalType "operator"
 *
 * Local dev — append ?_portal=client or ?_portal=operator to override.
 * Falls back to "operator" when no match.
 */

export type PortalType = 'client' | 'operator';

// Env-configurable subdomain prefixes (without the trailing dot).
// Can also be a full hostname if you're using separate domains entirely.
const CLIENT_HOST_HINT   = import.meta.env.VITE_CLIENT_HOST   ?? 'portal';
const OPERATOR_HOST_HINT = import.meta.env.VITE_OPERATOR_HOST ?? 'app';
const LOCAL_PORTAL_OVERRIDE_KEY = 'cb_portal_type_override';

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function normaliseOverride(value: string | null): PortalType | null {
  if (value === 'client' || value === 'operator') return value;
  return null;
}

function detect(): PortalType {
  if (typeof window === 'undefined') return 'operator';

  const { hostname, search } = window.location;

  // ── Local dev: explicit override via ?_portal= ──────────────────────────
  const params = new URLSearchParams(search);
  const override = normaliseOverride(params.get('_portal'));
  if (override !== null) {
    sessionStorage.setItem(LOCAL_PORTAL_OVERRIDE_KEY, override);
    return override;
  }

  // Keep local dev routing stable after login/refresh when query params are
  // dropped by navigation.
  if (isLocalHost(hostname)) {
    const stored = normaliseOverride(sessionStorage.getItem(LOCAL_PORTAL_OVERRIDE_KEY));
    if (stored !== null) return stored;
  }

  // ── Match by subdomain prefix or exact hostname ──────────────────────────
  // Matches both  portal.chargebridge.io  and  portal  (localhost alias)
  if (
    hostname === CLIENT_HOST_HINT ||
    hostname.startsWith(CLIENT_HOST_HINT + '.')
  ) return 'client';

  if (
    hostname === OPERATOR_HOST_HINT ||
    hostname.startsWith(OPERATOR_HOST_HINT + '.')
  ) return 'operator';

  // localhost / 127.0.0.1 without override → default to operator
  return 'operator';
}

/** Which portal is running on this host. Evaluated once at module load. */
export const PORTAL_TYPE: PortalType = detect();

function localAwareBaseUrl(type: PortalType, productionUrl: string): string {
  if (typeof window === 'undefined') return productionUrl;
  if (!isLocalHost(window.location.hostname)) return productionUrl;
  return `${window.location.origin}?_portal=${type}`;
}

/** Full base URL of the client portal (for cross-host links). */
export const CLIENT_BASE_URL: string =
  import.meta.env.VITE_CLIENT_BASE_URL ??
  localAwareBaseUrl('client', 'https://portal.chargebridge.io');

/** Full base URL of the operator dashboard (for cross-host links). */
export const OPERATOR_BASE_URL: string =
  import.meta.env.VITE_OPERATOR_BASE_URL ??
  localAwareBaseUrl('operator', 'https://app.chargebridge.io');
