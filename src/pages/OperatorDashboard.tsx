/**
 * ChargeBridge — Operator Back-office Dashboard
 * Route: /dashboard  (on app.chargebridge.io)
 *
 * Sections: Overview · Clients · Vendors · Payments · API Keys
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OPERATOR_SESSION_KEY, type OperatorSession } from './DeveloperLogin.tsx';
import { CLIENT_BASE_URL } from '../lib/hostConfig.ts';
import {
  Zap, LayoutDashboard, Building2, Network, CreditCard, Key,
  LogOut, Plus, Search, MoreHorizontal, CheckCircle, XCircle,
  Clock, AlertTriangle, Copy, Eye, EyeOff, RefreshCw, Trash2,
  Globe, ArrowUpRight, TrendingUp, Users, Activity, DollarSign,
  Wifi, WifiOff, ChevronDown, X, Check, ExternalLink,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type NavId = 'overview' | 'clients' | 'vendors' | 'payments' | 'apikeys';

interface Client {
  id: string; company: string; contact: string; email: string;
  plan: 'starter' | 'growth' | 'enterprise'; status: 'active' | 'pending' | 'suspended';
  portalUsers: number; contractSince: string; mrr: number;
}

interface Vendor {
  id: string; name: string; type: string; country: string;
  ocpiVersion: string; status: 'connected' | 'pending' | 'error';
  endpoint: string; sessions: number;
}

interface Invoice {
  id: string; client: string; period: string; amount: number;
  status: 'paid' | 'pending' | 'overdue'; dueDate: string;
}

interface ApiKeyEntry {
  id: string; label: string; keyPreview: string;
  created: string; lastUsed: string;
  permissions: string[]; revealed: boolean;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_CLIENTS: Client[] = [
  { id: 'c1', company: 'Volta Networks',  contact: 'João Silva',    email: 'joao@volta.io',         plan: 'growth',      status: 'active',    portalUsers: 3, contractSince: '2024-01-15', mrr: 299  },
  { id: 'c2', company: 'PowerGrid LatAm', contact: 'Maria Santos',  email: 'maria@powergrid.io',    plan: 'starter',     status: 'active',    portalUsers: 1, contractSince: '2024-03-01', mrr: 99   },
  { id: 'c3', company: 'EV Fleet Co',     contact: 'Carlos Lima',   email: 'carlos@evfleet.com',    plan: 'enterprise',  status: 'active',    portalUsers: 5, contractSince: '2023-11-20', mrr: 1400 },
  { id: 'c4', company: 'GreenMobility SA',contact: 'Ana Costa',     email: 'ana@greenmobility.sa',  plan: 'growth',      status: 'pending',   portalUsers: 0, contractSince: '2025-05-01', mrr: 299  },
  { id: 'c5', company: 'ChargeFlow GH',   contact: 'Kwame Asante',  email: 'kwame@chargeflow.gh',   plan: 'starter',     status: 'suspended', portalUsers: 2, contractSince: '2024-07-10', mrr: 0    },
];

const MOCK_VENDORS: Vendor[] = [
  { id: 'v1', name: 'Hubject',        type: 'eMSP + CPO', country: 'DE', ocpiVersion: '2.2.1', status: 'connected', endpoint: 'https://api.hubject.com/ocpi',         sessions: 12450 },
  { id: 'v2', name: 'Gireve',         type: 'eMSP + CPO', country: 'FR', ocpiVersion: '2.2',   status: 'connected', endpoint: 'https://ocpi.gireve.com',               sessions: 8920  },
  { id: 'v3', name: 'PlugSurfing',    type: 'eMSP',       country: 'DE', ocpiVersion: '2.1.1', status: 'connected', endpoint: 'https://api.plugsurfing.com/ocpi',      sessions: 3210  },
  { id: 'v4', name: 'Allego',         type: 'CPO',        country: 'NL', ocpiVersion: '2.2.1', status: 'pending',   endpoint: 'https://ocpi.allego.eu',                sessions: 0     },
  { id: 'v5', name: 'Total Energies', type: 'CPO',        country: 'FR', ocpiVersion: '2.2',   status: 'error',     endpoint: 'https://api.totalenergies.com/ocpi',    sessions: 0     },
];

const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-0041', client: 'EV Fleet Co',      period: 'May 2025', amount: 1400, status: 'pending', dueDate: '2025-06-01' },
  { id: 'INV-0040', client: 'GreenMobility SA', period: 'May 2025', amount: 299,  status: 'overdue', dueDate: '2025-05-15' },
  { id: 'INV-0039', client: 'Volta Networks',   period: 'May 2025', amount: 299,  status: 'pending', dueDate: '2025-06-01' },
  { id: 'INV-0038', client: 'PowerGrid LatAm',  period: 'May 2025', amount: 99,   status: 'pending', dueDate: '2025-06-01' },
  { id: 'INV-0037', client: 'EV Fleet Co',      period: 'Apr 2025', amount: 1400, status: 'paid',    dueDate: '2025-05-01' },
  { id: 'INV-0036', client: 'Volta Networks',   period: 'Apr 2025', amount: 299,  status: 'paid',    dueDate: '2025-05-01' },
  { id: 'INV-0035', client: 'PowerGrid LatAm',  period: 'Apr 2025', amount: 99,   status: 'paid',    dueDate: '2025-05-01' },
];

const MOCK_API_KEYS: ApiKeyEntry[] = [
  { id: 'k1', label: 'Production — Main',          keyPreview: 'cb_live_prod_a8f3…d92c', created: '2024-01-15', lastUsed: '2 hours ago',  permissions: ['sessions:read', 'cdrs:read', 'billing:write', 'vendors:read'], revealed: false },
  { id: 'k2', label: 'Staging',                    keyPreview: 'cb_test_stag_c3e1…b07a', created: '2024-06-01', lastUsed: '3 days ago',   permissions: ['sessions:read', 'cdrs:read'], revealed: false },
  { id: 'k3', label: 'Vendor Sync — Hubject',      keyPreview: 'cb_live_hub_f9a2…3441', created: '2024-09-10', lastUsed: '1 hour ago',   permissions: ['vendors:read', 'ocpi:write'], revealed: false },
];

// ── Helper chips ──────────────────────────────────────────────────────────────

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    connected: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    paid:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending:   'bg-amber-500/10  text-amber-400  border-amber-500/20',
    error:     'bg-red-500/10    text-red-400    border-red-500/20',
    overdue:   'bg-red-500/10    text-red-400    border-red-500/20',
    suspended: 'bg-slate-500/10  text-slate-400  border-slate-500/20',
  };
  const icon: Record<string, React.ReactNode> = {
    active: <CheckCircle size={10} />, connected: <Wifi size={10} />, paid: <CheckCircle size={10} />,
    pending: <Clock size={10} />, error: <WifiOff size={10} />, overdue: <AlertTriangle size={10} />,
    suspended: <XCircle size={10} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${map[status] ?? map.pending}`}>
      {icon[status]} {status}
    </span>
  );
}

function PlanChip({ plan }: { plan: string }) {
  const map: Record<string, string> = {
    starter:    'bg-slate-700 text-slate-300',
    growth:     'bg-brand-600/20 text-brand-300',
    enterprise: 'bg-violet-600/20 text-violet-300',
  };
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold capitalize ${map[plan] ?? ''}`}>
      {plan}
    </span>
  );
}

// ── Add Client Modal ──────────────────────────────────────────────────────────

function AddClientModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (c: Client) => void;
}) {
  const [form, setForm] = useState({ company: '', contact: '', email: '', plan: 'growth' as Client['plan'] });
  function submit(e: React.FormEvent) {
    e.preventDefault();
    onAdd({
      id: `c${Date.now()}`, ...form, status: 'pending',
      portalUsers: 0, contractSince: new Date().toISOString().slice(0, 10),
      mrr: form.plan === 'starter' ? 99 : form.plan === 'growth' ? 299 : 0,
    });
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Add client</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {([['company','Company name','Volta Networks'],['contact','Contact name','João Silva'],['email','Work email','joao@volta.io']] as [keyof typeof form, string, string][]).map(([k, label, ph]) => (
            <div key={k}>
              <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
              <input required type={k === 'email' ? 'email' : 'text'} placeholder={ph}
                value={form[k] as string} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition-colors" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Plan</label>
            <div className="flex gap-2">
              {(['starter', 'growth', 'enterprise'] as Client['plan'][]).map(p => (
                <button key={p} type="button" onClick={() => setForm(f => ({ ...f, plan: p }))}
                  className={`flex-1 rounded-xl border py-2 text-xs font-medium capitalize transition-colors ${
                    form.plan === p ? 'bg-brand-600 border-brand-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}>{p}</button>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-500 pt-1">
            Portal login credentials will be emailed to the contact after confirmation.
          </p>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-slate-700 py-2 text-sm text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 rounded-xl bg-brand-600 hover:bg-brand-500 py-2 text-sm font-semibold text-white transition-colors">
              Add client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Add Vendor Modal ──────────────────────────────────────────────────────────

function AddVendorModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (v: Vendor) => void;
}) {
  const [form, setForm] = useState({ name: '', type: 'CPO', country: 'DE', ocpiVersion: '2.2.1', endpoint: '' });
  function submit(e: React.FormEvent) {
    e.preventDefault();
    onAdd({ id: `v${Date.now()}`, ...form, status: 'pending', sessions: 0 });
    onClose();
  }
  const field = (k: keyof typeof form, label: string, ph: string, type = 'text') => (
    <div key={k}>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <input required type={type} placeholder={ph}
        value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition-colors" />
    </div>
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Add vendor</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {field('name',     'Vendor name',     'Hubject')}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors">
                {['CPO','eMSP','eMSP + CPO'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">OCPI version</label>
              <select value={form.ocpiVersion} onChange={e => setForm(f => ({ ...f, ocpiVersion: e.target.value }))}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors">
                {['2.1.1','2.2','2.2.1'].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
          {field('country',  'Country code',    'DE')}
          {field('endpoint', 'OCPI endpoint URL','https://api.vendor.com/ocpi', 'url')}
          <p className="text-[10px] text-slate-500 pt-1">
            A connection test will run after adding. The vendor will be listed as "pending" until handshake completes.
          </p>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-slate-700 py-2 text-sm text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 rounded-xl bg-brand-600 hover:bg-brand-500 py-2 text-sm font-semibold text-white transition-colors">
              Add vendor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

export default function OperatorDashboard() {
  const navigate = useNavigate();

  const rawSession = sessionStorage.getItem(OPERATOR_SESSION_KEY);
  const session: OperatorSession | null = rawSession ? JSON.parse(rawSession) : null;

  const [activeNav,       setActiveNav]       = useState<NavId>('overview');
  const [clients,         setClients]         = useState<Client[]>(MOCK_CLIENTS);
  const [vendors,         setVendors]         = useState<Vendor[]>(MOCK_VENDORS);
  const [apiKeys,         setApiKeys]         = useState<ApiKeyEntry[]>(MOCK_API_KEYS);
  const [search,          setSearch]          = useState('');
  const [showAddClient,   setShowAddClient]   = useState(false);
  const [showAddVendor,   setShowAddVendor]   = useState(false);
  const [copiedId,        setCopiedId]        = useState<string | null>(null);

  function signOut() {
    sessionStorage.removeItem(OPERATOR_SESSION_KEY);
    navigate('/login', { replace: true });
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  function toggleReveal(id: string) {
    setApiKeys(ks => ks.map(k => k.id === id ? { ...k, revealed: !k.revealed } : k));
  }

  // ── KPIs ──────────────────────────────────────────────────────────────────

  const activeClients   = clients.filter(c => c.status === 'active').length;
  const totalMrr        = clients.filter(c => c.status === 'active').reduce((s, c) => s + c.mrr, 0);
  const connectedVendors = vendors.filter(v => v.status === 'connected').length;
  const totalSessions   = vendors.reduce((s, v) => s + v.sessions, 0);
  const outstanding     = MOCK_INVOICES.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
  const overdue         = MOCK_INVOICES.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);

  // ── Sections ──────────────────────────────────────────────────────────────

  function renderOverview() {
    const kpis: { label: string; value: string | number; sub: string; icon: React.ElementType; color: string; iconBg: string; nav: typeof activeNav; trend?: string; trendUp?: boolean }[] = [
      { label: 'Active clients',    value: activeClients,                    sub: `${clients.length} total`,        icon: Building2,  color: 'text-brand-400',   iconBg: 'bg-brand-500/10',   nav: 'clients',  trend: '+2 this month',  trendUp: true  },
      { label: 'Monthly recurring', value: `$${totalMrr.toLocaleString()}`,  sub: 'from active contracts',          icon: DollarSign, color: 'text-emerald-400', iconBg: 'bg-emerald-500/10', nav: 'payments', trend: '+12% vs last mo', trendUp: true  },
      { label: 'Connected vendors', value: connectedVendors,                 sub: `${vendors.length} total`,        icon: Network,    color: 'text-violet-400',  iconBg: 'bg-violet-500/10',  nav: 'vendors',  trend: '1 error',         trendUp: false },
      { label: 'Total sessions',    value: totalSessions.toLocaleString(),   sub: 'across all vendors',             icon: Activity,   color: 'text-amber-400',   iconBg: 'bg-amber-500/10',   nav: 'vendors',  trend: '+8% vs last mo',  trendUp: true  },
    ];
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-lg font-bold text-white mb-1">Overview</h1>
          <p className="text-sm text-slate-500">Platform health at a glance</p>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map(({ label, value, sub, icon: Icon, color, iconBg, nav, trend, trendUp }) => (
            <button
              key={label}
              onClick={() => setActiveNav(nav)}
              className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-left transition-all hover:border-slate-600 hover:bg-slate-800/60 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 active:translate-y-0"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-500">{label}</p>
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg} transition-transform group-hover:scale-110`}>
                  <Icon size={13} className={color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">{sub}</p>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800">
                {trend && (
                  <span className={`text-[10px] font-medium ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                    {trendUp ? '↑' : '↓'} {trend}
                  </span>
                )}
                <span className={`text-[10px] text-slate-600 group-hover:text-brand-400 transition-colors ml-auto`}>
                  View →
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Alerts */}
        {overdue > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
            <AlertTriangle size={14} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-300">
              <span className="font-semibold">${overdue} overdue</span> — 1 invoice past due. Review in Payments.
            </p>
            <button onClick={() => setActiveNav('payments')} className="ml-auto text-xs text-red-400 hover:text-red-300 shrink-0">
              View →
            </button>
          </div>
        )}
        {outstanding > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <Clock size={14} className="text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300">
              <span className="font-semibold">${outstanding} outstanding</span> — {MOCK_INVOICES.filter(i => i.status === 'pending').length} invoices pending this cycle.
            </p>
          </div>
        )}
        {vendors.some(v => v.status === 'error') && (
          <div className="flex items-center gap-3 rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-3">
            <WifiOff size={14} className="text-orange-400 shrink-0" />
            <p className="text-sm text-orange-300">
              <span className="font-semibold">{vendors.filter(v => v.status === 'error').length} vendor connection error</span> — check API credentials.
            </p>
            <button onClick={() => setActiveNav('vendors')} className="ml-auto text-xs text-orange-400 hover:text-orange-300 shrink-0">
              Fix →
            </button>
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recent clients */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Recent clients</p>
              <button onClick={() => setActiveNav('clients')} className="text-[11px] text-brand-400 hover:text-brand-300">View all →</button>
            </div>
            <div className="space-y-2">
              {clients.slice(0, 4).map(c => (
                <div key={c.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{c.company}</p>
                    <p className="text-[11px] text-slate-500">{c.contact}</p>
                  </div>
                  <StatusChip status={c.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Vendor status */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Vendor connections</p>
              <button onClick={() => setActiveNav('vendors')} className="text-[11px] text-brand-400 hover:text-brand-300">View all →</button>
            </div>
            <div className="space-y-2">
              {vendors.map(v => (
                <div key={v.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{v.name}
                      <span className="ml-2 text-[10px] text-slate-500">{v.type}</span>
                    </p>
                    <p className="text-[11px] text-slate-600 font-mono">{v.ocpiVersion}</p>
                  </div>
                  <StatusChip status={v.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderClients() {
    const filtered = clients.filter(c =>
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
    return (
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white mb-1">Clients</h1>
            <p className="text-sm text-slate-500">{activeClients} active · {clients.length} total</p>
          </div>
          <button onClick={() => setShowAddClient(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors">
            <Plus size={14} /> Add client
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition-colors" />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 border-b border-slate-800">
              <tr>
                {['Company','Contact','Plan','Portal users','MRR','Status',''].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} className={`border-b border-slate-800/60 last:border-0 ${i % 2 === 0 ? 'bg-slate-900/30' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{c.company}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{c.contact}</td>
                  <td className="px-4 py-3"><PlanChip plan={c.plan} /></td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <Users size={11} /> {c.portalUsers}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    {c.mrr > 0 ? `$${c.mrr}` : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3"><StatusChip status={c.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <a href={`${CLIENT_BASE_URL}/login`} target="_blank" rel="noopener noreferrer"
                      className="text-[11px] text-brand-400 hover:text-brand-300 inline-flex items-center gap-1">
                      Portal <ExternalLink size={10} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-10 text-center text-slate-600 text-sm">No clients match your search.</div>
          )}
        </div>
      </div>
    );
  }

  function renderVendors() {
    return (
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white mb-1">Vendors</h1>
            <p className="text-sm text-slate-500">
              {connectedVendors} connected · vendors listed here appear in the client portal marketplace
            </p>
          </div>
          <button onClick={() => setShowAddVendor(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors">
            <Plus size={14} /> Add vendor
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {vendors.map(v => (
            <div key={v.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-white">{v.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{v.type} · {v.country}</p>
                </div>
                <StatusChip status={v.status} />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-600 w-16 shrink-0">Endpoint</span>
                  <span className="text-[11px] text-slate-400 font-mono truncate">{v.endpoint}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-600 w-16 shrink-0">OCPI</span>
                  <span className="text-[11px] text-slate-400">{v.ocpiVersion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-600 w-16 shrink-0">Sessions</span>
                  <span className="text-[11px] text-slate-400 font-mono">{v.sessions.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                {v.status === 'error' && (
                  <button className="flex-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 py-1.5 text-xs text-red-400 transition-colors inline-flex items-center justify-center gap-1">
                    <RefreshCw size={11} /> Reconnect
                  </button>
                )}
                {v.status === 'pending' && (
                  <button className="flex-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 py-1.5 text-xs text-amber-400 transition-colors inline-flex items-center justify-center gap-1">
                    <RefreshCw size={11} /> Test connection
                  </button>
                )}
                {v.status === 'connected' && (
                  <button className="flex-1 rounded-lg bg-slate-800 hover:bg-slate-700 py-1.5 text-xs text-slate-400 transition-colors inline-flex items-center justify-center gap-1">
                    <RefreshCw size={11} /> Sync now
                  </button>
                )}
                <button className="rounded-lg bg-slate-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-slate-700 p-1.5 text-slate-500 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600/15 border border-brand-600/20 flex items-center justify-center shrink-0 mt-0.5">
            <Network size={14} className="text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Vendors drive the client portal</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Only vendors you add here appear in the client portal's Market Place and roaming sections.
              Clients can only contract with and see data from these vendors.
            </p>
          </div>
        </div>
      </div>
    );
  }

  function renderPayments() {
    const paidTotal = MOCK_INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
    return (
      <div className="p-6 space-y-5">
        <div>
          <h1 className="text-lg font-bold text-white mb-1">Payments & Billing</h1>
          <p className="text-sm text-slate-500">Client invoices and revenue</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Collected (all time)', value: `$${paidTotal.toLocaleString()}`, color: 'text-emerald-400' },
            { label: 'Outstanding',           value: `$${outstanding}`,               color: 'text-amber-400'  },
            { label: 'Overdue',               value: `$${overdue}`,                   color: 'text-red-400'    },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-xs text-slate-500 mb-2">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Invoice table */}
        <div className="rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 border-b border-slate-800">
              <tr>
                {['Invoice','Client','Period','Amount','Due date','Status'].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_INVOICES.map((inv, i) => (
                <tr key={inv.id} className={`border-b border-slate-800/60 last:border-0 ${i % 2 === 0 ? 'bg-slate-900/30' : ''}`}>
                  <td className="px-4 py-3 font-mono text-slate-400 text-xs">{inv.id}</td>
                  <td className="px-4 py-3 font-medium text-white">{inv.client}</td>
                  <td className="px-4 py-3 text-slate-400">{inv.period}</td>
                  <td className="px-4 py-3 font-mono text-white">${inv.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-400">{inv.dueDate}</td>
                  <td className="px-4 py-3"><StatusChip status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderApiKeys() {
    return (
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white mb-1">API Keys & Integrations</h1>
            <p className="text-sm text-slate-500">Manage programmatic access to the ChargeBridge API</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors">
            <Plus size={14} /> Generate key
          </button>
        </div>

        <div className="space-y-3">
          {apiKeys.map(k => (
            <div key={k.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-medium text-white text-sm">{k.label}</p>
                    <span className="text-[10px] text-slate-600">Created {k.created}</span>
                    <span className="text-[10px] text-slate-600">· Used {k.lastUsed}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800/60 rounded-lg px-3 py-2 max-w-sm">
                    <span className="text-xs font-mono text-slate-400 flex-1 truncate">
                      {k.revealed ? `cb_live_${k.id}_FULL_KEY_DEMO_VALUE` : k.keyPreview}
                    </span>
                    <button onClick={() => toggleReveal(k.id)} className="text-slate-500 hover:text-slate-300 shrink-0 transition-colors">
                      {k.revealed ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button onClick={() => copyText(k.keyPreview, k.id)} className="text-slate-500 hover:text-slate-300 shrink-0 transition-colors">
                      {copiedId === k.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {k.permissions.map(p => (
                      <span key={p} className="rounded px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-500 font-mono">{p}</span>
                    ))}
                  </div>
                </div>
                <button className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Webhooks placeholder */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-white">Webhook endpoints</p>
            <button className="text-xs text-brand-400 hover:text-brand-300 inline-flex items-center gap-1">
              <Plus size={11} /> Add endpoint
            </button>
          </div>
          <div className="text-center py-6 text-slate-600 text-sm">
            No webhook endpoints configured.
          </div>
        </div>
      </div>
    );
  }

  // ── Nav items ──────────────────────────────────────────────────────────────

  const NAV: { id: NavId; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Overview',    icon: LayoutDashboard },
    { id: 'clients',  label: 'Clients',     icon: Building2,  badge: clients.filter(c => c.status === 'pending').length || undefined },
    { id: 'vendors',  label: 'Vendors',     icon: Network,    badge: vendors.filter(v => v.status === 'error').length || undefined },
    { id: 'payments', label: 'Payments',    icon: CreditCard, badge: MOCK_INVOICES.filter(i => i.status === 'overdue').length || undefined },
    { id: 'apikeys',  label: 'API Keys',    icon: Key },
  ];

  // ── Layout ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-slate-800/60 flex flex-col bg-slate-900/40 h-screen sticky top-0">

        {/* Logo */}
        <div className="h-14 border-b border-slate-800/60 flex items-center px-4 gap-2 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600">
            <Zap size={13} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">ChargeBridge</p>
            <p className="text-[9px] text-slate-600 uppercase tracking-widest mt-0.5">Operator Console</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} onClick={() => setActiveNav(id)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                activeNav === id
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}>
              <Icon size={14} />
              <span className="flex-1 text-left">{label}</span>
              {badge ? (
                <span className="rounded-full bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                  {badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800/60 space-y-1.5">
          <a href={CLIENT_BASE_URL} target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-500 hover:text-white hover:bg-slate-800/60 transition-colors">
            <Globe size={12} /> Client Portal <ExternalLink size={10} className="ml-auto" />
          </a>

          {/* User row */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/40">
            <div className="w-7 h-7 rounded-full bg-brand-600/30 border border-brand-600/20 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-brand-300">
                {session?.email?.[0]?.toUpperCase() ?? 'O'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-300 font-medium truncate">{session?.email ?? 'operator'}</p>
              <p className="text-[10px] text-slate-600">Operator</p>
            </div>
          </div>

          {/* Sign out button */}
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/40 px-3 py-2 text-xs font-medium text-slate-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {activeNav === 'overview' && renderOverview()}
        {activeNav === 'clients'  && renderClients()}
        {activeNav === 'vendors'  && renderVendors()}
        {activeNav === 'payments' && renderPayments()}
        {activeNav === 'apikeys'  && renderApiKeys()}
      </main>

      {/* Modals */}
      {showAddClient && (
        <AddClientModal
          onClose={() => setShowAddClient(false)}
          onAdd={c => setClients(cs => [c, ...cs])}
        />
      )}
      {showAddVendor && (
        <AddVendorModal
          onClose={() => setShowAddVendor(false)}
          onAdd={v => setVendors(vs => [v, ...vs])}
        />
      )}
    </div>
  );
}
