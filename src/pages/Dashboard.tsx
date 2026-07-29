import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CLIENT_BASE_URL } from '../lib/hostConfig.ts';
import {
  Zap, Copy, CheckCircle, Activity, LayoutDashboard,
  Key, Webhook, BookOpen, ChevronRight, RefreshCw,
  TrendingUp, Clock, AlertCircle, Terminal, Settings,
  Network, FileText, AlertTriangle, Receipt, MessageSquare,
  Cpu, MapPin, Globe, Handshake, Database, BarChart3,
  ArrowRight, X, Filter, Download, Send, Bell, Lock,
  Mail,
} from 'lucide-react';

interface Tenant {
  company:  string;
  email:    string;
  region:   string;
  plan:     string;
  status?:  string;   // 'pending_license' until activated
  apiKey?:  string;   // only present after license activation
}

const REGION_LABELS: Record<string, string> = {
  AF: '🇬🇭 Africa',
  EU: '🇪🇺 Europe',
  SA: '🌎 South America',
  GLOBAL: '🌍 Global',
};

const PLAN_LABELS: Record<string, string> = {
  sandbox: 'Sandbox',
  starter: 'Starter',
  growth: 'Growth',
  enterprise: 'Enterprise',
  // legacy
  scale: 'Scale',
};

// Mock session data for sparkline
const mockSessions = [12, 19, 8, 24, 31, 18, 27, 22, 35, 29, 41, 38];
const mockHours    = ['12a','2a','4a','6a','8a','10a','12p','2p','4p','6p','8p','10p'];

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 200},${40 - (v / max) * 36}`).join(' ');
  return (
    <svg viewBox="0 0 200 40" className="w-full h-10 overflow-visible">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,40 ${pts} 200,40`} fill="url(#sg)" />
      <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const QUICK_START_TABS = ['cURL', 'Node.js', 'Python'] as const;
type QsTab = typeof QUICK_START_TABS[number];

function quickStartCode(tab: QsTab, key: string): string {
  const masked = key.slice(0, 20) + '…';
  if (tab === 'cURL') return `curl -X POST https://api.chargebridge.io/v1/sessions/start \\
  -H "Authorization: Bearer ${masked}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "driverId":         "drv_abc123",
    "stationId":        "sta_gh_001",
    "portId":           "port_gh_001",
    "driverToken":      "APP_TOKEN_XYZ",
    "walletBalance":    20.00,
    "currency":         "GHS",
    "tariffRatePerKwh": 0.50,
    "roaming":          true
  }'`;

  if (tab === 'Node.js') return `import fetch from 'node-fetch';

const res = await fetch(
  'https://api.chargebridge.io/v1/sessions/start',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ${masked}',
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      driverId:         'drv_abc123',
      portId:           'port_gh_001',
      walletBalance:    20.00,
      tariffRatePerKwh: 0.50,
      currency:         'GHS',
      roaming:          true,
    }),
  }
);
const { data } = await res.json();
console.log(data.sessionId); // ses_01J…`;

  return `import requests

resp = requests.post(
    "https://api.chargebridge.io/v1/sessions/start",
    headers={"Authorization": "Bearer ${masked}"},
    json={
        "driverId":         "drv_abc123",
        "portId":           "port_gh_001",
        "walletBalance":    20.00,
        "tariffRatePerKwh": 0.50,
        "currency":         "GHS",
        "roaming":          True,
    }
)
session = resp.json()["data"]
print(session["sessionId"])`;
}

// ── Mock data for new sections ─────────────────────────────────

const mockNetworks = [
  { id: 'net_001', name: 'Volta Networks', country: '🇬🇭', evses: 142, status: 'Active partner', protocol: 'OCPI 2.2' },
  { id: 'net_002', name: 'EasyCharge EU',  country: '🇩🇪', evses: 3820, status: 'Pending agreement', protocol: 'OCPI 2.2' },
  { id: 'net_003', name: 'PowerGrid LatAm',country: '🇧🇷', evses: 680,  status: 'Active partner', protocol: 'eMIP 3.0' },
  { id: 'net_004', name: 'Meridian CPO',   country: '🇫🇷', evses: 2100, status: 'In negotiation', protocol: 'OCPI 2.2' },
  { id: 'net_005', name: 'SunCharge Africa',country: '🇿🇦', evses: 95,  status: 'Active partner', protocol: 'OCPP+OCPI' },
];

const mockCdrs = [
  { id: 'cdr_01J4A', session: 'ses_01J4A', driver: 'drv_abc', kwh: '18.42', duration: '47 min', cost: 'GHS 9.21', status: 'Eichrecht ✓', ts: '2025-05-24 09:14' },
  { id: 'cdr_01J3Z', session: 'ses_01J3Z', driver: 'drv_xyz', kwh: '9.80',  duration: '22 min', cost: 'GHS 4.90', status: 'Eichrecht ✓', ts: '2025-05-24 07:52' },
  { id: 'cdr_01J3Y', session: 'ses_01J3Y', driver: 'drv_qrs', kwh: '32.10', duration: '1h 18m', cost: 'GHS 16.05', status: 'Eichrecht ✓', ts: '2025-05-23 21:33' },
  { id: 'cdr_01J3X', session: 'ses_01J3X', driver: 'drv_lmn', kwh: '5.60',  duration: '14 min', cost: 'GHS 2.80', status: 'Pending',      ts: '2025-05-23 18:09' },
  { id: 'cdr_01J3W', session: 'ses_01J3W', driver: 'drv_opq', kwh: '22.00', duration: '54 min', cost: 'GHS 11.00', status: 'Eichrecht ✓', ts: '2025-05-23 14:44' },
];

const mockDisputes = [
  { id: 'dsp_001', cdr: 'cdr_01J3X', partner: 'EasyCharge EU', amount: 'GHS 2.80', reason: 'Energy mismatch', status: 'Open',     opened: '2025-05-23' },
  { id: 'dsp_002', cdr: 'cdr_01J2A', partner: 'Meridian CPO',  amount: '€4.50',    reason: 'Session not started', status: 'Resolved', opened: '2025-05-20' },
  { id: 'dsp_003', cdr: 'cdr_01J1B', partner: 'Volta Networks', amount: 'GHS 1.20', reason: 'Tariff discrepancy', status: 'In review', opened: '2025-05-18' },
];

const mockInvoices = [
  { id: 'inv_001', period: 'May 2025',   partner: 'Volta Networks',   sessions: 38, total: 'GHS 142.80', status: 'Draft' },
  { id: 'inv_002', period: 'Apr 2025',   partner: 'PowerGrid LatAm',  sessions: 71, total: '$218.40',    status: 'Sent' },
  { id: 'inv_003', period: 'Mar 2025',   partner: 'Volta Networks',   sessions: 52, total: 'GHS 196.40', status: 'Paid' },
];

const mockMessages = [
  { id: 'msg_001', from: 'EasyCharge EU',  subject: 'Roaming agreement terms',       time: '2h ago',   unread: true },
  { id: 'msg_002', from: 'ChargeBridge',   subject: 'Your CDR for ses_01J3X is ready', time: '5h ago', unread: false },
  { id: 'msg_003', from: 'Meridian CPO',   subject: 'Re: Dispute dsp_002 resolved',  time: '1d ago',   unread: false },
  { id: 'msg_004', from: 'SunCharge Africa', subject: 'New tariff effective June 1', time: '2d ago',   unread: false },
];

const mockSupervision = [
  { name: 'REST API', status: 'Operational', latency: '42ms', uptime: '99.98%', color: 'text-charge-400' },
  { name: 'OCPP WebSocket', status: 'Operational', latency: '8ms', uptime: '99.95%', color: 'text-charge-400' },
  { name: 'OCPI Gateway', status: 'Operational', latency: '61ms', uptime: '99.90%', color: 'text-charge-400' },
  { name: 'eMIP Gateway', status: 'Operational', latency: '74ms', uptime: '99.87%', color: 'text-charge-400' },
  { name: 'Wallet Engine', status: 'Operational', latency: '12ms', uptime: '100%', color: 'text-charge-400' },
  { name: 'CDR Processor', status: 'Degraded', latency: '320ms', uptime: '99.20%', color: 'text-amber-400' },
  { name: 'TimescaleDB', status: 'Operational', latency: '18ms', uptime: '99.99%', color: 'text-charge-400' },
  { name: 'Redis Cache', status: 'Operational', latency: '2ms', uptime: '100%', color: 'text-charge-400' },
];

// ── Nav ────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: 'Core',
    items: [
      { id: 'overview',   label: 'Overview',      icon: LayoutDashboard },
      { id: 'apikeys',    label: 'API Keys',       icon: Key },
      { id: 'quickstart', label: 'Quick Start',    icon: Terminal },
      { id: 'webhooks',   label: 'Webhooks',       icon: Webhook },
    ],
  },
  {
    label: 'Roaming',
    items: [
      { id: 'marketplace', label: 'Marketplace',  icon: Network },
      { id: 'cdr',         label: 'CDR Tracking', icon: FileText },
      { id: 'disputes',    label: 'Disputes',      icon: AlertTriangle },
      { id: 'invoicing',   label: 'Invoicing',     icon: Receipt },
      { id: 'messages',    label: 'Messages',      icon: MessageSquare },
    ],
  },
  {
    label: 'Platform',
    items: [
      { id: 'supervision', label: 'Supervision',  icon: Cpu },
      { id: 'docs',        label: 'Docs',         icon: BookOpen },
      { id: 'settings',    label: 'Settings',     icon: Settings },
    ],
  },
];

type NavId =
  | 'overview' | 'apikeys' | 'quickstart' | 'webhooks'
  | 'marketplace' | 'cdr' | 'disputes' | 'invoicing' | 'messages'
  | 'supervision' | 'docs' | 'settings';

export default function Dashboard() {
  const raw    = localStorage.getItem('cb_tenant');
  const tenant: Tenant | null = raw ? JSON.parse(raw) : null;

  // API key is only available after license activation
  const apiKey        = tenant?.apiKey ?? null;
  const licenseActive = apiKey !== null && tenant?.status !== 'pending_license';

  const [activeNav, setActiveNav]   = useState<NavId>('overview');
  const [maskedKey, setMaskedKey]   = useState(true);
  const [copied, setCopied]         = useState(false);
  const [qsTab, setQsTab]           = useState<QsTab>('cURL');
  const [codeCopied, setCodeCopied] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  function copyKey() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }
  function copyCode() {
    if (!apiKey) return;
    navigator.clipboard.writeText(quickStartCode(qsTab, apiKey));
    setCodeCopied(true); setTimeout(() => setCodeCopied(false), 2000);
  }

  const displayKey = apiKey
    ? (maskedKey ? apiKey.slice(0, 10) + '••••••••••••••••••••' + apiKey.slice(-6) : apiKey)
    : null;

  // ── Section renderers ──────────────────────────────────────

  function renderOverview() {
    return (
      <>
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'API Calls today',    value: '—',    icon: Activity,    color: 'text-brand-400',  note: 'Connect DB to track' },
            { label: 'Active sessions',    value: '0',    icon: TrendingUp,  color: 'text-charge-400', note: 'No live session' },
            { label: 'Avg response time',  value: '48ms', icon: Clock,       color: 'text-cyan-400',   note: 'Health endpoint' },
            { label: 'Errors (24h)',       value: '0',    icon: AlertCircle, color: 'text-amber-400',  note: 'No errors logged' },
          ].map(({ label, value, icon: Icon, color, note }) => (
            <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-500">{label}</p>
                <Icon size={14} className={color} />
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-600 mt-1">{note}</p>
            </div>
          ))}
        </div>

        {/* Sessions chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Session activity</h3>
              <p className="text-xs text-slate-500">Last 24 hours (sample data)</p>
            </div>
            <button className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors">
              <RefreshCw size={11} /> Refresh
            </button>
          </div>
          <Sparkline data={mockSessions} />
          <div className="flex justify-between mt-1">
            {mockHours.map(h => (
              <span key={h} className="text-[9px] text-slate-600">{h}</span>
            ))}
          </div>
        </div>

        {/* Quick roaming summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active partners', value: '3', icon: Handshake, color: 'text-sky-400' },
            { label: 'CDRs this month', value: '5', icon: FileText,  color: 'text-teal-400' },
            { label: 'Open disputes',   value: '1', icon: AlertTriangle, color: 'text-amber-400' },
            { label: 'Pending invoices',value: '1', icon: Receipt,   color: 'text-violet-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 flex items-center gap-3">
              <Icon size={18} className={color} />
              <div>
                <p className="text-lg font-bold text-white">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Client Portal CTA */}
        <div className="rounded-2xl border border-charge-500/25 bg-gradient-to-r from-charge-500/10 to-teal-500/5 p-5 mb-6 flex items-center gap-5">
          <div className="w-10 h-10 rounded-xl bg-charge-500/20 flex items-center justify-center shrink-0">
            <Globe size={18} className="text-charge-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white mb-0.5">Client Portal</p>
            <p className="text-xs text-slate-400">Give your B2B clients a dedicated portal to view usage, sessions, CDRs, invoices, disputes, and real-time roaming data.</p>
          </div>
          <a
            href={CLIENT_BASE_URL}
            target="_blank" rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-charge-600 hover:bg-charge-500 px-4 py-2 text-xs font-semibold text-white transition-colors"
          >
            Open Portal <ArrowRight size={12} />
          </a>
        </div>

        {/* Endpoint reference */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Key endpoints</h3>
          <div className="space-y-2">
            {[
              { method: 'GET',    path: '/health',                    desc: 'Liveness probe',           ok: true  },
              { method: 'POST',   path: '/v1/sessions/start',         desc: 'Start charging session',   ok: false },
              { method: 'POST',   path: '/v1/sessions/:id/stop',      desc: 'Stop charging session',    ok: false },
              { method: 'GET',    path: '/v1/wallet/:id/balance',     desc: 'Get wallet balance',       ok: false },
              { method: 'POST',   path: '/v1/wallet/topup',           desc: 'Credit wallet',            ok: false },
              { method: 'POST',   path: '/v1/drivers',                desc: 'Register a driver',        ok: false },
              { method: 'GET',    path: '/v1/roaming/networks',       desc: 'List partner networks',    ok: false },
              { method: 'GET',    path: '/v1/roaming/evses',          desc: 'EVSE repository search',   ok: false },
              { method: 'GET',    path: '/v1/cdrs',                   desc: 'List CDRs',                ok: false },
              { method: 'GET',    path: '/v1/supervision/status',     desc: 'Platform health summary',  ok: false },
            ].map(({ method, path, desc, ok }) => (
              <div key={path} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-800/40 transition-colors">
                <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold font-mono ${
                  method === 'GET'  ? 'bg-charge-500/10 text-charge-400' : 'bg-brand-500/10 text-brand-400'
                }`}>{method}</span>
                <code className="text-xs text-slate-300 font-mono flex-1">{path}</code>
                <span className="text-xs text-slate-500 hidden sm:block">{desc}</span>
                {ok
                  ? <span className="shrink-0 text-xs text-charge-400 flex items-center gap-1"><CheckCircle size={11} /> Live</span>
                  : <span className="shrink-0 text-xs text-slate-600">Needs DB</span>
                }
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  function renderApiKeys() {
    // ── License active: show real key ────────────────────────────────────────
    if (licenseActive && displayKey) {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key size={15} className="text-brand-400" />
              <h3 className="text-sm font-semibold text-white">API Key</h3>
              <span className="ml-auto text-[10px] font-semibold rounded-full bg-charge-500/15 text-charge-400 border border-charge-500/25 px-2 py-0.5">
                Active
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 p-3 mb-3">
              <code className="flex-1 font-mono text-xs text-slate-300 truncate">{displayKey}</code>
              <button onClick={() => setMaskedKey(m => !m)}
                className="shrink-0 rounded-lg bg-slate-700 hover:bg-slate-600 px-2.5 py-1.5 text-xs text-slate-400 transition-colors">
                {maskedKey ? 'Show' : 'Hide'}
              </button>
              <button onClick={copyKey}
                className="shrink-0 flex items-center gap-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 px-2.5 py-1.5 text-xs text-slate-300 transition-colors">
                {copied ? <CheckCircle size={12} className="text-charge-400" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-slate-600 flex items-center gap-1">
              <AlertCircle size={11} />
              Use this key in the <code className="text-slate-500 mx-0.5">Authorization: Bearer</code> header on every request.
            </p>
          </div>
        </div>
      );
    }

    // ── No active license: locked state ──────────────────────────────────────
    return (
      <div className="space-y-5">
        {/* Locked card */}
        <div className="rounded-2xl border border-amber-500/20 bg-slate-900/60 p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
            <Lock size={28} className="text-amber-400" />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">API key locked</h3>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-1">
            Your API key will be generated and sent to{' '}
            <span className="text-slate-200 font-medium">{tenant?.email ?? 'your registered email'}</span>{' '}
            once your license is confirmed.
          </p>
          <p className="text-xs text-slate-600 mb-6">
            Keys are never shown on-screen — they are only delivered via email after payment is verified.
          </p>

          {/* Steps */}
          <div className="w-full max-w-sm rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 mb-6 text-left">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-3">How to get your key</p>
            <ol className="space-y-2.5">
              {[
                'Check your inbox for a license confirmation email',
                'Complete payment via the secure link in that email',
                'Your API key will be emailed within minutes of payment',
                'Paste it into your integration — you\'re live',
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-[9px] font-bold text-brand-400 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <Link
              to="/register"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              Purchase license <ArrowRight size={14} />
            </Link>
            <a
              href={`mailto:hello@chargebridge.io?subject=License enquiry — ${encodeURIComponent(tenant?.company ?? '')}&body=Hi, I registered as ${encodeURIComponent(tenant?.email ?? '')} and would like to activate my license.`}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-700 hover:border-slate-500 px-4 py-2.5 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <Mail size={13} /> Contact us
            </a>
          </div>
        </div>

        {/* Status card */}
        {tenant && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200">
                Application received — <span className="text-amber-300">pending license activation</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {tenant.company} · {PLAN_LABELS[tenant.plan] ?? tenant.plan} plan · {tenant.email}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderQuickStart() {
    const placeholderKey = 'cb_<your_api_key_from_email>';
    const codeKey        = licenseActive && apiKey ? apiKey : placeholderKey;

    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Terminal size={15} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Quick Start</h3>
        </div>

        {/* License-pending notice */}
        {!licenseActive && (
          <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 mb-4">
            <Lock size={12} className="text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300">
              Your API key is shown as a placeholder below. Replace it with the real key once your license is activated.
            </p>
          </div>
        )}

        <div className="flex gap-1 mb-3 bg-slate-800/60 rounded-lg p-1 w-fit">
          {QUICK_START_TABS.map(tab => (
            <button key={tab} onClick={() => setQsTab(tab)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${qsTab === tab ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-300'}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="relative rounded-xl bg-slate-800/80 border border-slate-700/50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50">
            <span className="text-xs text-slate-500 font-mono">start_session.{qsTab === 'cURL' ? 'sh' : qsTab === 'Node.js' ? 'ts' : 'py'}</span>
            {licenseActive && (
              <button onClick={copyCode} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors">
                {codeCopied ? <CheckCircle size={11} className="text-charge-400" /> : <Copy size={11} />}
                {codeCopied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
          <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-6">
            {quickStartCode(qsTab, codeKey)}
          </pre>
        </div>
      </div>
    );
  }

  function renderMarketplace() {
    return (
      <div className="space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'CPO networks',        value: '1 000+', icon: Network,  color: 'text-sky-400' },
            { label: 'eMSP partners',       value: '320+',   icon: Globe,    color: 'text-teal-400' },
            { label: 'Roaming agreements',  value: '13 000+',icon: Handshake,color: 'text-brand-400' },
            { label: 'Countries',           value: '32',     icon: MapPin,   color: 'text-charge-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <Icon size={16} className={`${color} mb-2`} />
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Network directory */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Network directory</h3>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors">
                <Filter size={11} /> Filter
              </button>
              <button className="flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 px-3 py-1.5 text-xs text-white transition-colors">
                <ArrowRight size={11} /> Discover networks
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {mockNetworks.map(net => (
              <div key={net.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/40 transition-colors border border-transparent hover:border-slate-700">
                <span className="text-2xl">{net.country}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{net.name}</p>
                  <p className="text-xs text-slate-500">{net.evses.toLocaleString()} EVSEs · {net.protocol}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  net.status === 'Active partner'
                    ? 'bg-charge-500/10 text-charge-400 border border-charge-500/20'
                    : net.status === 'In negotiation'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-slate-700 text-slate-400'
                }`}>{net.status}</span>
                <button className="text-xs text-brand-400 hover:text-brand-300 transition-colors whitespace-nowrap">View →</button>
              </div>
            ))}
          </div>
        </div>

        {/* Roaming pipeline */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Roaming pipeline</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Discover',  done: true },
              { label: 'Negotiate', done: true },
              { label: 'Sign',      done: true },
              { label: 'Configure', done: false },
              { label: 'Test',      done: false },
              { label: 'Go live',   done: false },
            ].map(({ label, done }) => (
              <div key={label} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border ${
                done ? 'bg-charge-500/10 border-charge-500/30 text-charge-300' : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}>
                {done ? <CheckCircle size={11} /> : <div className="w-2.5 h-2.5 rounded-full border border-slate-600" />}
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderCDR() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">CDR Tracking</h3>
            <p className="text-xs text-slate-500 mt-0.5">Charge Detail Records with Eichrecht-compliant signing</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors">
              <Download size={11} /> Export
            </button>
            <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors">
              <Filter size={11} /> Filter
            </button>
          </div>
        </div>

        {/* CDR stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'CDRs this month', value: '5',       color: 'text-teal-400' },
            { label: 'Total energy',    value: '88.32 kWh', color: 'text-charge-400' },
            { label: 'Total billed',    value: 'GHS 44.16', color: 'text-brand-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-center">
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* CDR table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/60">
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">CDR ID</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Driver</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">kWh</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">Duration</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">Cost</th>
                  <th className="text-center px-4 py-3 text-slate-400 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {mockCdrs.map((cdr, i) => (
                  <tr key={cdr.id} className={`border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                    <td className="px-4 py-3 font-mono text-slate-300">{cdr.id}</td>
                    <td className="px-4 py-3 text-slate-400">{cdr.driver}</td>
                    <td className="px-4 py-3 text-right text-white font-medium">{cdr.kwh}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{cdr.duration}</td>
                    <td className="px-4 py-3 text-right text-charge-400 font-medium">{cdr.cost}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        cdr.status.includes('✓') ? 'bg-charge-500/10 text-charge-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>{cdr.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{cdr.ts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CDRi info */}
        <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
          <div className="flex items-start gap-3">
            <Database size={16} className="text-teal-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-teal-300 mb-1">CDRi — Intermediate CDRs enabled</p>
              <p className="text-xs text-slate-400">Live energy consumption updates stream during active sessions. CDRi snapshots are stored every 60 seconds so billing is never lost if connectivity drops.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderDisputes() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Dispute Management</h3>
            <p className="text-xs text-slate-500 mt-0.5">Centralised dispute tracking across all roaming partners</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 px-3 py-1.5 text-xs text-white transition-colors">
            + New dispute
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Open',     value: '1', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
            { label: 'In review',value: '1', color: 'text-sky-400',   bg: 'bg-sky-500/10 border-sky-500/20' },
            { label: 'Resolved', value: '1', color: 'text-charge-400',bg: 'bg-charge-500/10 border-charge-500/20' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-xl border p-4 text-center ${bg}`}>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Dispute table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/60">
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">ID</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">CDR</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Partner</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Reason</th>
                  <th className="text-center px-4 py-3 text-slate-400 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Opened</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {mockDisputes.map(d => (
                  <tr key={d.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-300">{d.id}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{d.cdr}</td>
                    <td className="px-4 py-3 text-slate-300">{d.partner}</td>
                    <td className="px-4 py-3 text-right text-white font-medium">{d.amount}</td>
                    <td className="px-4 py-3 text-slate-400">{d.reason}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        d.status === 'Open'      ? 'bg-amber-500/10 text-amber-400'  :
                        d.status === 'In review' ? 'bg-sky-500/10 text-sky-400'      :
                                                   'bg-charge-500/10 text-charge-400'
                      }`}>{d.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{d.opened}</td>
                    <td className="px-4 py-3">
                      <button className="text-brand-400 hover:text-brand-300 transition-colors">View →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function renderInvoicing() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Invoicing</h3>
            <p className="text-xs text-slate-500 mt-0.5">Automated invoice generation and partner billing</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 px-3 py-1.5 text-xs text-white transition-colors">
            + Generate invoice
          </button>
        </div>

        {/* Invoices table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/60">
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Invoice</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Period</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Partner</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">Sessions</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">Total</th>
                  <th className="text-center px-4 py-3 text-slate-400 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {mockInvoices.map(inv => (
                  <tr key={inv.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-300">{inv.id}</td>
                    <td className="px-4 py-3 text-slate-400">{inv.period}</td>
                    <td className="px-4 py-3 text-white">{inv.partner}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{inv.sessions}</td>
                    <td className="px-4 py-3 text-right text-charge-400 font-bold">{inv.total}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        inv.status === 'Paid'  ? 'bg-charge-500/10 text-charge-400' :
                        inv.status === 'Sent'  ? 'bg-sky-500/10 text-sky-400'       :
                                                 'bg-slate-700 text-slate-400'
                      }`}>{inv.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors">
                        <Download size={11} /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
          <div className="flex items-start gap-3">
            <Receipt size={16} className="text-violet-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-violet-300 mb-1">Delegation available</p>
              <p className="text-xs text-slate-400">Delegate invoicing to a billing partner. They'll handle VAT, currency conversion, and distribution on your behalf.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderMessages() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-semibold text-white">In-platform Messaging</h3>
            <p className="text-xs text-slate-500 mt-0.5">Secure messaging with roaming partners</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 px-3 py-1.5 text-xs text-white transition-colors">
            <MessageSquare size={11} /> New thread
          </button>
        </div>

        {/* Message list */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          {mockMessages.map((msg, i) => (
            <div key={msg.id} className={`flex items-start gap-4 px-5 py-4 hover:bg-slate-800/30 transition-colors cursor-pointer ${i < mockMessages.length - 1 ? 'border-b border-slate-800' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.from === 'ChargeBridge' ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                {msg.from.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={`text-sm font-medium ${msg.unread ? 'text-white' : 'text-slate-300'}`}>{msg.from}</p>
                  {msg.unread && <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />}
                </div>
                <p className={`text-xs truncate ${msg.unread ? 'text-slate-300' : 'text-slate-500'}`}>{msg.subject}</p>
              </div>
              <p className="text-xs text-slate-600 shrink-0">{msg.time}</p>
            </div>
          ))}
        </div>

        {/* Compose */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <p className="text-xs font-medium text-slate-400 mb-3">Quick reply</p>
          <textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            rows={3}
            placeholder="Type a message to your roaming partner…"
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 resize-none transition-colors"
          />
          <div className="flex justify-end mt-3">
            <button className="flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition-colors">
              <Send size={12} /> Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderSupervision() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Supervision Dashboard</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time platform and partner health monitoring</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors">
            <Bell size={11} /> Configure alerts
          </button>
        </div>

        {/* Overall status */}
        <div className="rounded-xl border border-charge-500/20 bg-charge-500/5 p-4 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-charge-400 animate-pulse shrink-0" />
          <div>
            <p className="text-sm font-semibold text-charge-300">Most systems operational</p>
            <p className="text-xs text-slate-500">CDR Processor is experiencing elevated latency · Last checked 30s ago</p>
          </div>
          <button className="ml-auto text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
            <RefreshCw size={11} /> Refresh
          </button>
        </div>

        {/* Service list */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 grid grid-cols-4 text-xs text-slate-500 font-medium">
            <span>Service</span>
            <span className="text-center">Status</span>
            <span className="text-right">Latency</span>
            <span className="text-right">Uptime (30d)</span>
          </div>
          {mockSupervision.map(svc => (
            <div key={svc.name} className="px-5 py-3.5 border-b border-slate-800/60 last:border-0 grid grid-cols-4 items-center hover:bg-slate-800/20 transition-colors">
              <p className="text-sm text-white">{svc.name}</p>
              <p className={`text-xs text-center font-medium ${svc.color}`}>{svc.status}</p>
              <p className="text-xs text-right text-slate-400">{svc.latency}</p>
              <p className={`text-xs text-right font-medium ${svc.color}`}>{svc.uptime}</p>
            </div>
          ))}
        </div>

        {/* Partner supervision */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={14} className="text-indigo-400" />
            Partner gateway health
          </h4>
          <div className="space-y-3">
            {mockNetworks.filter(n => n.status === 'Active partner').map(net => (
              <div key={net.id} className="flex items-center gap-4">
                <span className="text-lg">{net.country}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-slate-300">{net.name}</p>
                    <p className="text-xs text-charge-400">99.9%</p>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800">
                    <div className="h-1.5 rounded-full bg-charge-500" style={{ width: '99.9%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderWebhooks() {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Webhook size={15} className="text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Webhooks</h3>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Subscribe to events and receive real-time POST notifications to your endpoint.</p>
          <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-4">
            <p className="text-xs text-slate-500 font-mono mb-2"># Available events</p>
            <pre className="font-mono text-xs text-slate-300 leading-6">{[
              'session.started',
              'session.stopped',
              'session.meter_value',
              'cdr.created',
              'cdr.eichrecht_signed',
              'wallet.low_balance',
              'wallet.zero_balance',
              'roaming.agreement_accepted',
              'dispute.opened',
              'dispute.resolved',
              'invoice.generated',
              'supervision.alert',
            ].join('\n')}</pre>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-colors">
            + Add webhook endpoint
          </button>
        </div>
      </div>
    );
  }

  function renderSettings() {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings size={15} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-white">Settings</h3>
        </div>
        <div className="space-y-6">
          {[
            { label: 'Company', value: tenant?.company ?? '—' },
            { label: 'Email',   value: tenant?.email   ?? '—' },
            { label: 'Region',  value: REGION_LABELS[tenant?.region ?? 'AF'] },
            { label: 'Plan',    value: licenseActive ? (PLAN_LABELS[tenant?.plan ?? 'starter']) : '⏳ Pending activation' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-slate-800">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-sm text-white font-medium">{value}</p>
            </div>
          ))}
          <Link
            to="/register"
            className="block text-center rounded-xl border border-brand-500 text-brand-400 hover:bg-brand-500/10 px-4 py-2.5 text-sm font-medium transition-colors"
          >
            Upgrade plan
          </Link>
        </div>
      </div>
    );
  }

  function renderDocs() {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen size={15} className="text-charge-400" />
          <h3 className="text-sm font-semibold text-white">Documentation</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Client Integration Guide', desc: 'REST API, auth, wallet, sessions', icon: Terminal, color: 'text-brand-400' },
            { title: 'Vendor Integration Guide', desc: 'OCPP, OCPI, eMIP, custom adapters', icon: Network, color: 'text-sky-400' },
            { title: 'GDPR Data Flows', desc: 'Article 30 ROPA, erasure, residency', icon: Globe, color: 'text-violet-400' },
            { title: 'Security Reference', desc: 'Threat model, key rotation, incident', icon: AlertCircle, color: 'text-amber-400' },
            { title: 'Roaming Marketplace', desc: 'Agreements, tariffs, eMIP/OCPI setup', icon: Handshake, color: 'text-teal-400' },
            { title: 'CDR & Eichrecht', desc: 'CDRi, signing, metering law compliance', icon: FileText, color: 'text-rose-400' },
          ].map(({ title, desc, icon: Icon, color }) => (
            <a key={title} href="#" className="flex items-start gap-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900 p-4 transition-all group">
              <Icon size={18} className={`${color} shrink-0 mt-0.5 group-hover:scale-110 transition-transform`} />
              <div>
                <p className="text-sm font-medium text-white mb-1">{title}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors ml-auto shrink-0 mt-0.5" />
            </a>
          ))}
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────

  const SECTION_TITLES: Record<NavId, string> = {
    overview:    'Overview',
    apikeys:     'API Keys',
    quickstart:  'Quick Start',
    webhooks:    'Webhooks',
    marketplace: 'Roaming Marketplace',
    cdr:         'CDR Tracking',
    disputes:    'Dispute Management',
    invoicing:   'Invoicing',
    messages:    'Messages',
    supervision: 'Supervision',
    docs:        'Documentation',
    settings:    'Settings',
  };

  function renderSection() {
    switch (activeNav) {
      case 'overview':    return renderOverview();
      case 'apikeys':     return renderApiKeys();
      case 'quickstart':  return renderQuickStart();
      case 'webhooks':    return renderWebhooks();
      case 'marketplace': return renderMarketplace();
      case 'cdr':         return renderCDR();
      case 'disputes':    return renderDisputes();
      case 'invoicing':   return renderInvoicing();
      case 'messages':    return renderMessages();
      case 'supervision': return renderSupervision();
      case 'docs':        return renderDocs();
      case 'settings':    return renderSettings();
      default:            return null;
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col noise-bg">
      {/* Top bar */}
      <header className="h-14 border-b border-slate-800 flex items-center px-4 gap-4 shrink-0 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2 mr-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600">
            <Zap size={13} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm hidden sm:block">ChargeBridge</span>
        </Link>
        <div className="h-5 w-px bg-slate-800 hidden sm:block" />
        <span className="text-xs text-slate-500 hidden sm:block">Operator Dashboard</span>
        <div className="ml-auto flex items-center gap-3">
          <a
            href={`${CLIENT_BASE_URL}/login`}
            target="_blank" rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-charge-500/30 bg-charge-500/10 hover:bg-charge-500/20 px-3 py-1.5 text-xs font-medium text-charge-300 transition-colors"
          >
            <Globe size={11} /> Client Portal
          </a>
          {licenseActive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-charge-500/10 border border-charge-500/20 px-2.5 py-1 text-xs text-charge-400">
              <span className="w-1.5 h-1.5 rounded-full bg-charge-400 animate-pulse" />
              {PLAN_LABELS[tenant?.plan ?? 'starter']}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Pending license
            </span>
          )}
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
            {(tenant?.company ?? 'U').charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-slate-800 py-4 px-3 hidden md:flex flex-col gap-4 overflow-y-auto">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-1">{group.label}</p>
              {group.items.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveNav(id as NavId)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full text-left ${
                    activeNav === id
                      ? 'bg-brand-500/10 text-brand-300'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                  {activeNav === id && <ChevronRight size={11} className="ml-auto text-brand-400" />}
                  {id === 'apikeys'  && !licenseActive && activeNav !== 'apikeys' && <Lock size={10} className="ml-auto text-amber-500" />}
                  {id === 'disputes' && <span className="ml-auto text-[10px] font-bold bg-amber-500/20 text-amber-400 rounded-full px-1.5 py-0.5">1</span>}
                  {id === 'messages' && <span className="ml-auto text-[10px] font-bold bg-brand-500/20 text-brand-400 rounded-full px-1.5 py-0.5">1</span>}
                </button>
              ))}
            </div>
          ))}

          <div className="mt-auto px-3 py-4 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-xs text-slate-500 mb-1">Region</p>
            <p className="text-sm font-medium text-slate-200">{REGION_LABELS[tenant?.region ?? 'AF']}</p>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8">
          {/* Page header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">
                {activeNav === 'overview'
                  ? (tenant ? `Welcome back, ${tenant.company}` : 'Developer Dashboard')
                  : SECTION_TITLES[activeNav]
                }
              </h1>
              {activeNav === 'overview' && (
                <p className="text-sm text-slate-400 mt-1">{tenant?.email ?? 'Configure your integration below.'}</p>
              )}
            </div>
            <a
              href="https://docs.chargebridge.io"
              target="_blank"
              rel="noreferrer"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm text-slate-300 hover:border-slate-600 hover:text-white transition-colors"
            >
              <BookOpen size={14} /> View Docs
            </a>
          </div>

          {renderSection()}
        </main>
      </div>
    </div>
  );
}
