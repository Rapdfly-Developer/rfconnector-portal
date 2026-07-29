import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

export const VOLTA_TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

export interface DashboardKPIs {
  sessions_this_month:   number;
  sessions_total:        number;
  energy_this_month:     number;
  revenue_this_month:    number;
  revenue_total:         number;
  invoices_pending:      number;
  invoices_outstanding:  number;
  disputes_open:         number;
  stations_total:        number;
  stations_online:       number;
  revenue_last_6_months: { m: string; revenue: number }[];
  cdr_last_6_months:     { m: string; cur: number; prev: number }[];
}

export async function fetchDashboardKPIs(tenantId: string): Promise<DashboardKPIs | null> {
  const { data, error } = await supabase.rpc('get_dashboard_kpis', { p_tenant_id: tenantId });
  if (error) { console.error('fetchDashboardKPIs:', error.message); return null; }
  return data as DashboardKPIs;
}

export interface DbNetwork {
  id: string;
  name: string;
  country_code: string;
  party_id: string;
  role: string;
  protocol: string;
  ocpi_version: string | null;
  evse_count: number;
  status: string;
  metadata: {
    city: string; latency: string; quality: string; coverage: string;
    avail: number; evseAvail: number; evseChrg: number; evseInop: number;
    health: string; partnerSince: string | null; description: string;
  };
  has_agreement: boolean;
  agreement_status: string | null;
  valid_from: string | null;
  valid_to: string | null;
}

export async function fetchMarketplaceNetworks(tenantId: string): Promise<DbNetwork[]> {
  const { data, error } = await supabase.rpc('get_marketplace_networks', { p_tenant_id: tenantId });
  if (error) { console.error('fetchMarketplaceNetworks:', error.message); return []; }
  return (data as DbNetwork[]) ?? [];
}

export interface DbDispute {
  id: string; cdr: string; partner: string; amount: number; currency: string;
  reason: string; status: string; priority: string;
  createdAt: string; updatedAt: string; agingDays: number;
  description: string; evidence: string[]; resolution: string | null;
}

export async function fetchDisputes(tenantId: string): Promise<DbDispute[]> {
  const { data, error } = await supabase.rpc('get_disputes', { p_tenant_id: tenantId });
  if (error) { console.error('fetchDisputes:', error.message); return []; }
  return (data as DbDispute[]) ?? [];
}

export interface DbInvoice {
  id: string; partner: string; period: string; cdrCount: number;
  amount: number; issued: string; due: string; status: string;
}

export async function fetchInvoices(tenantId: string): Promise<DbInvoice[]> {
  const { data, error } = await supabase.rpc('get_invoices', { p_tenant_id: tenantId });
  if (error) { console.error('fetchInvoices:', error.message); return []; }
  return (data as DbInvoice[]) ?? [];
}

// ── Hubject marketplace ───────────────────────────────────────────────────────

export interface HubjectNetworkSummary {
  operatorId:   string;
  operatorName: string;
  totalEVSEs:   number;
  available:    number;
  occupied:     number;
  charging:     number;
  reserved:     number;
  outOfService: number;
  offline:      number;
  unknown:      number;
}

export interface HubjectMarketplaceResponse {
  ok:         boolean;
  configured: boolean;
  fetchedAt:  string;
  data:       HubjectNetworkSummary[];
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string | undefined;

export async function fetchHubjectNetworks(): Promise<HubjectMarketplaceResponse> {
  const base = BACKEND_URL ?? 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/api/marketplace/networks`);
    if (!res.ok) return { ok: false, configured: false, fetchedAt: new Date().toISOString(), data: [] };
    return (await res.json()) as HubjectMarketplaceResponse;
  } catch (e) {
    console.warn('fetchHubjectNetworks:', e);
    return { ok: false, configured: false, fetchedAt: new Date().toISOString(), data: [] };
  }
}
