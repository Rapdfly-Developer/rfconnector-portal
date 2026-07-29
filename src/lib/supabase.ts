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
}

export async function fetchDashboardKPIs(tenantId: string): Promise<DashboardKPIs | null> {
  const { data, error } = await supabase.rpc('get_dashboard_kpis', { p_tenant_id: tenantId });
  if (error) { console.error('fetchDashboardKPIs:', error.message); return null; }
  return data as DashboardKPIs;
}
