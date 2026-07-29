import { Link } from 'react-router-dom';
import {
  Zap, Globe, Shield, Wallet, Activity, ArrowRight,
  CheckCircle, Code2, Plug, BarChart3, Lock, Network,
  Database, FileText, MessageSquare, AlertTriangle, MapPin,
  TrendingUp, Layers, GitMerge, Cpu, Receipt,
  User, Building2, Terminal, BatteryCharging, Wifi,
  LineChart, HandshakeIcon, Rocket, MousePointerClick,
} from 'lucide-react';
import Navbar from '../components/Navbar.tsx';
import Footer from '../components/Footer.tsx';

const features = [
  { icon: Plug,          title: 'OCPP 1.6J & 2.0.1',        desc: 'Native WebSocket adapter for any OCPP-compliant charger. Auto protocol negotiation, heartbeat watchdog, remote start/stop.',                                                                              color: 'text-cyan-500',    bg: 'bg-cyan-50 dark:bg-cyan-400/10',     border: 'border-cyan-200 dark:border-cyan-400/20' },
  { icon: Globe,         title: 'OCPI 2.2 + eMIP',           desc: '3-step credential exchange, location sync, CDR push, token whitelist — plus full eMIP protocol support for pan-European interoperability.',                                                              color: 'text-brand-500',   bg: 'bg-brand-50 dark:bg-brand-400/10',   border: 'border-brand-200 dark:border-brand-400/20' },
  { icon: Wallet,        title: 'Real-time Wallet Engine',    desc: 'Reserve on start → deduct per meter event → auto-stop at zero. Idempotent deductions with SHA-256 keyed ledger.',                                                                                        color: 'text-charge-500',  bg: 'bg-emerald-50 dark:bg-charge-400/10',border: 'border-emerald-200 dark:border-charge-400/20' },
  { icon: Shield,        title: 'GDPR + Ghana DPA Ready',     desc: 'AES-256-GCM PII encryption, right-to-erasure pipeline, immutable audit logs, and per-region data residency pools.',                                                                                      color: 'text-violet-500',  bg: 'bg-violet-50 dark:bg-violet-400/10', border: 'border-violet-200 dark:border-violet-400/20' },
  { icon: Activity,      title: 'Multi-tenant Isolation',     desc: 'PostgreSQL Row-Level Security + Redis key namespacing. Tenant A can never touch Tenant B data — enforced at the DB layer.',                                                                              color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-400/10',   border: 'border-amber-200 dark:border-amber-400/20' },
  { icon: BarChart3,     title: 'TimescaleDB Meter History',  desc: 'Every watt-hour recorded as a time-series event. Query session energy curves, power peaks, and billing data in milliseconds.',                                                                           color: 'text-rose-500',    bg: 'bg-rose-50 dark:bg-rose-400/10',     border: 'border-rose-200 dark:border-rose-400/20' },
  { icon: Network,       title: 'Roaming Marketplace',        desc: 'B2B marketplace connecting CPOs and eMSPs globally. Browse networks, negotiate roaming agreements, and activate one-click e-signatures.',                                                                color: 'text-sky-500',     bg: 'bg-sky-50 dark:bg-sky-400/10',       border: 'border-sky-200 dark:border-sky-400/20' },
  { icon: Database,      title: 'Real-time EVSE Repository',  desc: 'Centralised charge point data with live availability status. Filter by location, connector type, power level, and operator network.',                                                                   color: 'text-teal-500',    bg: 'bg-teal-50 dark:bg-teal-400/10',     border: 'border-teal-200 dark:border-teal-400/20' },
  { icon: TrendingUp,    title: 'Tariff Exchange',            desc: 'Real-time tariff database with OCPI and eMIP APIs. Push and pull pricing per kWh, per minute, and flat fees across roaming partners.',                                                                  color: 'text-lime-600',    bg: 'bg-lime-50 dark:bg-lime-400/10',     border: 'border-lime-200 dark:border-lime-400/20' },
  { icon: FileText,      title: 'CDR Exchange + Eichrecht',   desc: 'Intermediate CDRs (CDRi) with live energy updates during the session. Full Eichrecht-compliant CDR with 3-identifier tracking for metering law.',                                                      color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-400/10', border: 'border-orange-200 dark:border-orange-400/20' },
  { icon: Cpu,           title: 'Supervision Dashboard',      desc: 'Real-time status monitoring for your platform and all roaming partners. Instant alerts on protocol errors, timeout anomalies, and network outages.',                                                     color: 'text-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-400/10', border: 'border-indigo-200 dark:border-indigo-400/20' },
  { icon: Receipt,       title: 'Check & Bill Automation',    desc: 'Automated quality control, price recalculation, and benchmarking against roaming agreements. Detect billing discrepancies before they become disputes.',                                                 color: 'text-fuchsia-500', bg: 'bg-fuchsia-50 dark:bg-fuchsia-400/10',border: 'border-fuchsia-200 dark:border-fuchsia-400/20' },
  { icon: AlertTriangle, title: 'Dispute Management',         desc: 'Centralised dispute repository with creation, follow-up, and email notifications. Track every challenge across sessions, CDRs, and billing cycles.',                                                    color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-400/10',       border: 'border-red-200 dark:border-red-400/20' },
  { icon: MessageSquare, title: 'In-platform Messaging',      desc: 'Secure messaging with roaming partners, CPOs, and eMSPs — all without leaving the portal. Thread history and read receipts included.',                                                                  color: 'text-pink-500',    bg: 'bg-pink-50 dark:bg-pink-400/10',     border: 'border-pink-200 dark:border-pink-400/20' },
  { icon: Layers,        title: 'Automated Invoicing',        desc: 'Generate, delegate, and distribute invoices for roaming sessions automatically. Supports multi-currency, cross-border VAT rules, and PDF export.',                                                      color: 'text-yellow-600',  bg: 'bg-yellow-50 dark:bg-yellow-400/10', border: 'border-yellow-200 dark:border-yellow-400/20' },
  { icon: GitMerge,      title: 'Smart Onboarding',           desc: 'IT Workshop documentation, sandbox certification environment, and guided testing tools so every new CPO or eMSP goes live in days, not months.',                                                       color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-400/10',border: 'border-emerald-200 dark:border-emerald-400/20' },
];

const steps = [
  { n: '01', title: 'Register your tenant',  desc: 'Create an account, choose your data-residency region, and select a plan. Our team confirms your license and sends your API key within 24 hours.' },
  { n: '02', title: 'Connect a charger',     desc: 'Point your OCPP client at wss://api.rfconnector.io/ocpp/<chargerId>. Auto-negotiates 1.6J or 2.0.1.' },
  { n: '03', title: 'Join the Marketplace',  desc: 'Browse CPO and eMSP networks, negotiate roaming agreements, and activate with one-click e-signature.' },
  { n: '04', title: 'Start sessions & bill', desc: 'POST /v1/sessions/start — wallet reserved, CDRi generated live, automatic Check & Bill, Eichrecht-compliant CDR.' },
];

const stats = [
  { label: 'API endpoints', value: '32+' },
  { label: 'OCPP versions', value: '2' },
  { label: 'Protocols',     value: '3' },
  { label: 'Uptime SLA',    value: '99.9%' },
];

const roamingStats = [
  { label: 'Charge point networks', value: '1 000+' },
  { label: 'eMSP partners',         value: '320+' },
  { label: 'Roaming agreements',    value: '13 000+' },
  { label: 'Countries covered',     value: '32' },
];

const pipelineSteps = [
  { label: 'Market Place', color: 'bg-brand-500' },
  { label: 'Negotiation',  color: 'bg-sky-500' },
  { label: 'Signature',    color: 'bg-teal-500' },
  { label: 'Repository',   color: 'bg-lime-500' },
  { label: 'Tariffs',      color: 'bg-amber-500' },
  { label: 'Auth',         color: 'bg-orange-500' },
  { label: 'CDRi',         color: 'bg-rose-500' },
  { label: 'CDR',          color: 'bg-violet-500' },
  { label: 'Supervision',  color: 'bg-indigo-500' },
  { label: 'Check & Bill', color: 'bg-fuchsia-500' },
  { label: 'Disputes',     color: 'bg-red-500' },
  { label: 'Invoicing',    color: 'bg-pink-500' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 noise-bg">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-600/10 dark:bg-brand-600/20 blur-3xl" />
          <div className="absolute top-20 right-0 w-80 h-80 rounded-full bg-cyan-500/5 dark:bg-cyan-500/10 blur-3xl" />
          <div className="absolute top-60 left-1/2 w-72 h-72 rounded-full bg-violet-500/5 dark:bg-violet-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-500/20 dark:via-brand-500/30 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-300 mb-8">
            <Zap size={11} className="text-brand-500 dark:text-brand-400" />
            Built for Ghana, EU & LatAm · OCPP + OCPI + eMIP · v1.0
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.08] mb-6">
            The Universal{' '}
            <span className="gradient-text">EV Charging</span>
            <br />Connector SDK
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect any charge point network to any mobile or web app with one API.
            OCPP · OCPI · eMIP · Real-time wallet · Roaming Marketplace · GDPR-compliant · Multi-tenant.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="group flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-brand-500 transition-all shadow-xl shadow-brand-600/30 glow-brand"
            >
              Request Access
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 rounded-xl border border-gray-300 dark:border-slate-700 px-8 py-3.5 text-sm font-medium text-gray-600 dark:text-slate-300 hover:border-gray-400 dark:hover:border-slate-500 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              <Code2 size={15} />
              See the code
            </a>
          </div>

          {/* Code snippet preview */}
          <div className="mt-16 mx-auto max-w-2xl rounded-2xl gradient-border bg-gray-900 dark:bg-slate-900 p-0 overflow-hidden shadow-2xl text-left">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 dark:border-slate-800">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-charge-500/60" />
              <span className="ml-2 text-xs text-gray-500 font-mono">start_session.sh</span>
            </div>
            <div className="p-5 font-mono text-xs leading-6 overflow-x-auto">
              <p><span className="text-gray-500"># Start a roaming-enabled charging session</span></p>
              <p className="mt-1">
                <span className="text-cyan-400">curl</span>
                <span className="text-gray-300"> -X POST https://api.rfconnector.io/v1/sessions/start \</span>
              </p>
              <p>
                <span className="text-gray-300">  -H </span>
                <span className="text-amber-300">"Authorization: Bearer rfc_your_api_key"</span>
                <span className="text-gray-300"> \</span>
              </p>
              <p>
                <span className="text-gray-300">  -d </span>
                <span className="text-amber-300">'{"{"}"driverId":"drv_abc","portId":"port_gh_001","tariffRatePerKwh":0.50,"roaming":true{"}"}'</span>
              </p>
              <p className="mt-3 text-gray-500"># Response — CDRi begins streaming immediately</p>
              <p><span className="text-charge-400">{"{"}</span></p>
              <p><span className="text-gray-300">  </span><span className="text-brand-300">"data"</span><span className="text-gray-300">: {"{"}</span><span className="text-brand-300">"sessionId"</span><span className="text-gray-300">: </span><span className="text-amber-300">"ses_01J..."</span><span className="text-gray-300">, </span><span className="text-brand-300">"status"</span><span className="text-gray-300">: </span><span className="text-amber-300">"active"</span><span className="text-gray-300">, </span><span className="text-brand-300">"cdrStream"</span><span className="text-gray-300">: </span><span className="text-amber-300">"wss://..."</span><span className="text-gray-300">{"}"}</span></p>
              <p><span className="text-charge-400">{"}"}</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Choose Your Portal ──────────────────────────────── */}
      <section id="choose-portal" className="py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-charge-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl relative">
          <div className="text-center mb-9">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-slate-700/60 bg-gray-100 dark:bg-slate-900/70 px-4 py-1.5 text-xs font-medium text-gray-500 dark:text-slate-400 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-charge-400 animate-pulse-slow" />
              Find your access point
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Choose your <span className="gradient-text">portal</span>
            </h2>
            <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
              RFConnector powers three distinct experiences — pick the role built for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 items-stretch">

            {/* ── Client ── */}
            <div className="group relative rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:border-charge-500/40 shadow-sm dark:shadow-none">
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: '0 8px 48px -12px rgba(16,185,129,0.25)' }} />
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-charge-500/15 border border-charge-500/25 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <User size={18} className="text-charge-500" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-charge-600 dark:text-charge-400 border border-charge-500/25 bg-charge-500/10 rounded-full px-2.5 py-1">
                  EV Users
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Client</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mb-4">
                Track your live charging sessions, monitor wallet balance, download CDRs, and review invoices — all from one dashboard.
              </p>
              <ul className="space-y-2 mb-5 flex-1">
                {['Live session monitoring','Wallet & balance overview','CDR & invoice history','Energy usage analytics'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-slate-300">
                    <CheckCircle size={13} className="text-charge-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/client-login" className="group/btn flex items-center justify-center gap-2 rounded-xl border border-charge-500/30 bg-charge-500/10 py-2 text-sm font-semibold text-charge-600 dark:text-charge-300 hover:bg-charge-500/20 hover:border-charge-500/60 transition-all">
                Enter Client Portal <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* ── Vendor — featured ── */}
            <div className="group relative rounded-2xl gradient-border bg-gray-50 dark:bg-slate-900 p-5 flex flex-col transition-all duration-300 hover:-translate-y-1.5">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-600 via-cyan-500 to-charge-500 px-3.5 py-1 text-[10px] font-bold text-white whitespace-nowrap shadow-xl">
                <Zap size={9} /> Most Popular
              </div>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none glow-brand" />
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Building2 size={18} className="text-cyan-500" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 bg-cyan-500/10 rounded-full px-2.5 py-1">
                  CPOs & Vendors
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Vendor</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mb-4">
                Operate your charge point network end-to-end — manage tariffs, monitor OCPP connections, join the roaming marketplace, and reconcile billing.
              </p>
              <ul className="space-y-2 mb-5 flex-1">
                {['OCPP 1.6J & 2.0.1 management','Tariff & pricing engine','Roaming marketplace access','CDR exchange & Eichrecht','Supervision dashboard'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-slate-300">
                    <CheckCircle size={13} className="text-cyan-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="group/btn flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/25">
                Enter Vendor Portal <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* ── Developer ── */}
            <div className="group relative rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-7 flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-500/40 shadow-sm dark:shadow-none">
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: '0 8px 48px -12px rgba(99,102,241,0.3)' }} />
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Terminal size={18} className="text-brand-500" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 border border-brand-500/25 bg-brand-500/10 rounded-full px-2.5 py-1">
                  Builders
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Developer</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mb-4">
                Integrate the RFConnector SDK into your app. Get API keys, explore 32+ endpoints, test with our sandbox, and go live in days — not months.
              </p>
              <ul className="space-y-2 mb-5 flex-1">
                {['REST API + WebSocket SDK','Sandbox & testing tools','Webhook management','API key dashboard'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-slate-300">
                    <CheckCircle size={13} className="text-brand-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="group/btn flex items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/10 py-2 text-sm font-semibold text-brand-600 dark:text-brand-300 hover:bg-brand-500/20 hover:border-brand-500/60 transition-all">
                Enter Developer Portal <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-slate-600 mt-5">
            Not sure which portal is right for you?{' '}
            <a href="mailto:hello@rfconnector.io" className="text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 transition-colors">
              Contact us →
            </a>
          </p>
        </div>
      </section>

      {/* ── Value Propositions ───────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-transparent">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-charge-500 dark:text-charge-400 mb-3">Why RFConnector</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Built for the serious EV ecosystem</h2>
            <p className="mt-4 text-gray-500 dark:text-slate-400 max-w-xl mx-auto text-sm">
              One platform. Every protocol. Every roaming flow. From a single charger to 700 000+ charge points across 32 countries.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Rocket,           color: 'text-charge-500 dark:text-charge-400', bg: 'bg-charge-50 border-charge-200 dark:bg-charge-400/10 dark:border-charge-400/20', title: 'Boost your business',        desc: 'Access 1 000+ operator networks and 320+ eMSPs through a single marketplace. Accelerate ROI on charging infrastructure.' },
              { icon: MousePointerClick,color: 'text-sky-500 dark:text-sky-400',       bg: 'bg-sky-50 border-sky-200 dark:bg-sky-400/10 dark:border-sky-400/20',             title: 'Connect in a single click',  desc: 'One IT connection replaces dozens of bilateral integrations. OCPI and eMIP supported — no custom protocol work.' },
              { icon: HandshakeIcon,    color: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-50 border-violet-200 dark:bg-violet-400/10 dark:border-violet-400/20', title: 'Simplify the user experience',desc: 'Transparent tariffs, live CDRi updates, and seamless cross-network auth mean EV drivers never hit a dead end.' },
              { icon: Shield,           color: 'text-brand-500 dark:text-brand-400',   bg: 'bg-brand-50 border-brand-200 dark:bg-brand-400/10 dark:border-brand-400/20',     title: 'Secure every transaction',   desc: 'AES-256-GCM encryption, Eichrecht-compliant CDR signing, TLS 1.3 enforced, and immutable audit logs throughout.' },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className={`rounded-2xl border p-6 ${bg} hover:scale-[1.02] transition-transform`}>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-slate-900/60 mb-4">
                  <Icon size={18} className={color} />
                </div>
                <h3 className={`font-semibold text-sm mb-2 text-gray-900 dark:text-white`}>{title}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solutions Strip ───────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-100 dark:bg-slate-900/30 border-y border-gray-200 dark:border-slate-800/50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 dark:text-brand-400 mb-3">Platform solutions</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Every EV mobility vertical, covered</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Globe,           color: 'text-cyan-500 dark:text-cyan-400',   bg: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-400/10 dark:border-cyan-400/20',     title: 'EV Roaming',       desc: 'B2B marketplace, agreements & CDR exchange across 32 countries' },
              { icon: BatteryCharging, color: 'text-charge-500 dark:text-charge-400',bg: 'bg-emerald-50 border-emerald-200 dark:bg-charge-400/10 dark:border-charge-400/20',title: 'Plug & Charge', desc: 'ISO-15118 vehicle plug-in auto-auth — no RFID, no app needed' },
              { icon: Wifi,            color: 'text-violet-500 dark:text-violet-400',bg: 'bg-violet-50 border-violet-200 dark:bg-violet-400/10 dark:border-violet-400/20',title: 'Smart Charging', desc: 'TSO/DSO flexibility integration, load balancing & demand response' },
              { icon: LineChart,       color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 border-amber-200 dark:bg-amber-400/10 dark:border-amber-400/20',   title: 'Data & Analytics',desc: 'Data-as-a-Service: CDR quality, market insights & compliance' },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className={`rounded-xl border p-5 ${bg} flex flex-col gap-3`}>
                <Icon size={20} className={color} />
                <div>
                  <p className={`font-semibold text-sm ${color} mb-1`}>{title}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partner Logos ─────────────────────────────────────── */}
      <section className="py-14 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-600 mb-8">Trusted by leading EV operators & service providers</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {['Ionity', 'Shell Recharge', 'EnBW', 'EVBox', 'Allego', 'ChargeMap', 'Porsche', 'TotalEnergies'].map(name => (
              <span key={name} className="text-sm font-semibold text-gray-400 dark:text-slate-600 hover:text-gray-600 dark:hover:text-slate-400 transition-colors tracking-wide uppercase">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="border-y border-gray-200 dark:border-slate-800/50 bg-gray-50 dark:bg-slate-900/30 py-10">
        <div className="mx-auto max-w-4xl px-4">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-3xl font-bold gradient-text">{value}</dt>
                <dd className="mt-1 text-sm text-gray-500 dark:text-slate-500">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Roaming Pipeline ─────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-500 dark:text-sky-400 mb-3">End-to-end EV roaming</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Full roaming pipeline, one platform</h2>
            <p className="mt-4 text-gray-500 dark:text-slate-400 max-w-xl mx-auto text-sm">
              From marketplace discovery to automated invoicing — every step of the roaming lifecycle built in.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {pipelineSteps.map(({ label, color }, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`rounded-full px-3 py-1.5 text-xs font-semibold text-white ${color} shadow-lg`}>{label}</div>
                {i < pipelineSteps.length - 1 && <ArrowRight size={12} className="text-gray-300 dark:text-slate-600 shrink-0" />}
              </div>
            ))}
          </div>
          <div className="rounded-2xl gradient-border bg-gray-50 dark:bg-slate-900/80 p-8">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-6">Network reach via ChargeBridge Roaming</p>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {roamingStats.map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-2xl font-bold gradient-text">{value}</dt>
                  <dd className="mt-1 text-xs text-gray-500 dark:text-slate-500">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 bg-gray-50 dark:bg-slate-900/20 border-y border-gray-200 dark:border-slate-800/50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 dark:text-brand-400 mb-3">Platform capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Everything you need to ship EV charging</h2>
            <p className="mt-4 text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
              One SDK. Every charging protocol. Full roaming lifecycle. Production-grade security and compliance out of the box.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc, color, bg, border }) => (
              <div key={title} className={`rounded-2xl border ${border} ${bg} p-5 hover:shadow-md dark:hover:border-slate-700 transition-all group`}>
                <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white dark:bg-slate-900 mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                  <Icon size={16} className={color} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-charge-500 dark:text-charge-400 mb-3">Integration in 4 steps</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">From zero to roaming in minutes</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="flex gap-5 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm dark:shadow-none">
                <div className="shrink-0 text-2xl font-black gradient-text font-mono leading-none mt-0.5">{n}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Protocol Support ─────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-slate-900/30 border-y border-gray-200 dark:border-slate-800/50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-400 mb-3">Protocol support</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Every protocol in the EV ecosystem</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'OCPP 1.6J',  note: 'WebSocket, JSON',       color: 'text-cyan-500 dark:text-cyan-400',     bg: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-400/10 dark:border-cyan-400/20' },
              { name: 'OCPP 2.0.1', note: 'WebSocket, JSON',       color: 'text-cyan-500 dark:text-cyan-400',     bg: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-400/10 dark:border-cyan-400/20' },
              { name: 'OCPI 2.2',   note: 'REST, CDR, tokens',     color: 'text-brand-500 dark:text-brand-400',   bg: 'bg-brand-50 border-brand-200 dark:bg-brand-400/10 dark:border-brand-400/20' },
              { name: 'eMIP 3.x',   note: 'SOAP/REST, EU roaming', color: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-50 border-violet-200 dark:bg-violet-400/10 dark:border-violet-400/20' },
              { name: 'RFID Auth',  note: 'Sync + async, whitelist',color: 'text-amber-500 dark:text-amber-400',  bg: 'bg-amber-50 border-amber-200 dark:bg-amber-400/10 dark:border-amber-400/20' },
              { name: 'Eichrecht',  note: 'German metering law',    color: 'text-rose-500 dark:text-rose-400',    bg: 'bg-rose-50 border-rose-200 dark:bg-rose-400/10 dark:border-rose-400/20' },
            ].map(({ name, note, color, bg }) => (
              <div key={name} className={`rounded-xl border p-4 ${bg}`}>
                <p className={`font-bold text-sm ${color} mb-1`}>{name}</p>
                <p className="text-xs text-gray-500 dark:text-slate-500">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security strip ───────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl gradient-border bg-gray-50 dark:bg-slate-900/80 p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Lock size={16} className="text-brand-500 dark:text-brand-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-500 dark:text-brand-400">Enterprise Security</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Security-first by design</h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-6 mt-4">
                {['Argon2id API key hashing','AES-256-GCM PII encryption','RS256 JWT (4096-bit)','TLS 1.3 enforced','PostgreSQL RLS','Immutable audit logs','GDPR right-to-erasure','Ghana DPA 2012','LGPD (Brazil)','Per-region data pools','Eichrecht CDR signing','SOC 2 roadmap'].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle size={13} className="text-charge-500 shrink-0" />
                    <span className="text-xs text-gray-600 dark:text-slate-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/register" className="shrink-0 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/20 whitespace-nowrap">
              Start building →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing teaser ───────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-slate-900/30 border-y border-gray-200 dark:border-slate-800/50">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-charge-500 dark:text-charge-400 mb-3">Licensed access</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Transparent pricing, licensed access</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-10 text-sm">API keys are issued after license confirmation — your data and operations are always protected.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {[
              { name: 'Starter',    price: '$99/mo',  note: '50 chargers · Marketplace access',              highlight: false },
              { name: 'Growth',     price: '$299/mo', note: '500 chargers · CDR exchange · Tariffs',         highlight: true },
              { name: 'Enterprise', price: 'Custom',  note: 'Unlimited · Full roaming suite · SLA',          highlight: false },
            ].map(({ name, price, note, highlight }) => (
              <div key={name} className={`rounded-2xl border p-5 ${highlight ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50'}`}>
                {highlight && <p className="text-[10px] font-bold text-brand-500 dark:text-brand-400 uppercase tracking-wider mb-2">Most popular</p>}
                <p className="font-bold text-gray-900 dark:text-white text-base mb-1">{name}</p>
                <p className="text-2xl font-extrabold gradient-text mb-2">{price}</p>
                <p className="text-xs text-gray-500 dark:text-slate-500">{note}</p>
              </div>
            ))}
          </div>
          <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl border border-gray-300 dark:border-slate-700 px-6 py-2.5 text-sm text-gray-600 dark:text-slate-300 hover:border-brand-500 hover:text-gray-900 dark:hover:text-white transition-all">
            Compare all plans <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 px-4 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Ready to connect<br />your first charger?
          </h2>
          <p className="text-gray-500 dark:text-slate-400 mb-10">
            Join operators in Ghana, Europe and LatAm building the next generation of EV roaming infrastructure. API key issued after license activation.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-10 py-4 text-base font-semibold text-white hover:bg-brand-500 transition-all shadow-2xl shadow-brand-600/30 glow-brand">
            Request Access <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
