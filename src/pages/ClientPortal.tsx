﻿/**
 * RFConnector Client Portal v2
 * Full B2B client portalmirrors GIREVE's Connect Place
 *
 * Sections (15):
 *  Business  : Overview · Market Place · Negotiation · Signature
 *  Roaming   : EVSE Repository · Tariffs · Authorisation · Events · CDR Exchange
 *  Clearing  : Supervision · Tracking · Check & Bill · Disputes · Invoicing · Messaging
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import { CLIENT_SESSION_KEY } from './ClientLogin.tsx';
import {
  LayoutDashboard, Globe, Handshake, FileSignature,
  Database, Tag, ShieldCheck, Activity, FileText,
  Monitor, ListOrdered, CheckSquare, AlertTriangle,
  Receipt, MessageSquare, ChevronDown, ChevronRight,
  Download, Search, Filter, Plus, RefreshCw,
  CheckCircle, XCircle, Clock, Zap, TrendingUp,
  MapPin, Wifi, WifiOff, Bell, Settings, LogOut,
  ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Eye, Send, Star, Bolt, Users, Network, X,
  BatteryCharging, Cpu, BarChart2, Lock, Plug,
  PieChart, TableProperties, CalendarRange, Sun, Moon,
  ArrowRight, Inbox, GitMerge, ThumbsUp, ThumbsDown,
  Pencil, Timer, AlertCircle, CheckCheck, Layers,
  KeyRound, BookOpen, BarChart3, Copy, Trash2,
  ShieldAlert, TrendingDown, Code2, ExternalLink,
  Navigation,
} from 'lucide-react';

// â"₵â"₵ Types â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵

type NavId =
  | 'overview' | 'company'
  | 'marketplace' | 'negotiation' | 'signature'
  | 'evse_repo' | 'tariffs' | 'authorisation' | 'events' | 'cdr_exchange' | 'plug_charge' | 'smart_charging'
  | 'supervision' | 'tracking' | 'check_bill' | 'disputes' | 'invoicing' | 'messaging'
  | 'analytics' | 'api_keys' | 'nearby_stations';

interface NavItem { id: NavId; label: string; icon: React.ElementType; badge?: number }
interface NavGroup { label: string; items: NavItem[] }
interface MarketplaceNetwork {
  name: string; country: string; evses: number; protocol: string;
  role: string; status: 'Active'|'Negotiating'|'New Connection';
  agreement: boolean; city: string; latency: string; quality: string;
  x: number; y: number;
  lastSync: string; coverageArea: string; availability: number;
  partnerSince?: string; connectionHealth: 'excellent'|'good'|'fair'|'unknown';
  evseAvailable: number; evseCharging: number; evseInoperative: number;
  description: string;
}
interface MarketplaceAccessPoint {
  id: string; name: string; network: string; city: string; country: string;
  status: 'Available'|'Charging'|'Reserved'|'Inoperative';
  connectors: string; power: string; protocol: string; tariff: string;
  lat: number; lng: number; x: number; y: number;
  lastUpdated: string; connectorCount: number; maxPower: string;
}
interface MarketplaceState {
  selectedNetwork: MarketplaceNetwork;
  setSelectedNetwork: (network: MarketplaceNetwork) => void;
  selectedAccessPoint: MarketplaceAccessPoint;
  setSelectedAccessPoint: (accessPoint: MarketplaceAccessPoint) => void;
  search: string;
  setSearch: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  countryFilter: string;
  setCountryFilter: (value: string) => void;
  protocolFilter: string;
  setProtocolFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  mapMode: string;
  setMapMode: (value: string) => void;
  mapZoom: number;
  setMapZoom: (value: number) => void;
  hoveredNetwork: MarketplaceNetwork | null;
  setHoveredNetwork: (network: MarketplaceNetwork | null) => void;
}
interface ActionResult {
  title: string;
  detail: string;
  tone: 'info' | 'success' | 'warning';
}
interface WorkspaceView {
  title: string;
  subtitle: string;
  primaryLabel: string;
  body: React.ReactNode;
}

// â"₵â"₵ Navigation â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Business',
    items: [
      { id: 'overview',     label: 'Overview',      icon: LayoutDashboard },
      { id: 'company',      label: 'Organisation',  icon: Users },
      { id: 'marketplace',  label: 'Market Place',  icon: Globe },
      { id: 'negotiation',  label: 'Negotiation',   icon: Handshake, badge: 3 },
      { id: 'signature',    label: 'Signature',     icon: FileSignature, badge: 2 },
    ],
  },
  {
    label: 'Roaming',
    items: [
      { id: 'evse_repo',       label: 'EVSE Repository', icon: Database },
      { id: 'tariffs',         label: 'Tariffs',          icon: Tag },
      { id: 'events',          label: 'Events & CDRi',    icon: Activity },
      { id: 'cdr_exchange',    label: 'CDR Exchange',     icon: FileText },
    ],
  },
  {
    label: 'Clearing',
    items: [
      { id: 'disputes',     label: 'Disputes',      icon: AlertTriangle, badge: 4 },
      { id: 'invoicing',    label: 'Invoicing',     icon: Receipt },
      { id: 'messaging',    label: 'Messaging',     icon: MessageSquare, badge: 2 },
    ],
  },
  {
    label: 'Developer',
    items: [
      { id: 'api_keys', label: 'API Management', icon: KeyRound },
    ],
  },
  {
    label: 'API Integration',
    items: [
      { id: 'nearby_stations', label: 'Nearby Stations', icon: MapPin },
    ],
  },
];

const MARKETPLACE_NETWORKS: MarketplaceNetwork[] = [
  { name: 'ECG (Electricity Co. Ghana)', country: 'GH', evses: 320,  protocol: 'OCPI 2.2', role: 'CPO',  status: 'Active',      agreement: true,  city: 'Accra',    latency: '38ms', quality: '96%', x: 38, y: 55, lastSync: '4 min ago',  coverageArea: 'Greater Accra Region',    availability: 94, partnerSince: 'Mar 2024', connectionHealth: 'excellent', evseAvailable: 198, evseCharging: 110, evseInoperative: 12,  description: 'State-owned utility CPO covering Greater Accra with dense urban charging.' },
  { name: 'VRA EV Charge',               country: 'GH', evses: 180,  protocol: 'OCPI 2.2', role: 'CPO',  status: 'Active',      agreement: true,  city: 'Tema',     latency: '44ms', quality: '94%', x: 42, y: 53, lastSync: '9 min ago',  coverageArea: 'Tema Industrial Zone',    availability: 91, partnerSince: 'Jun 2024', connectionHealth: 'good',      evseAvailable: 112, evseCharging: 58,  evseInoperative: 10,  description: 'VRA-operated charging network serving Tema port and industrial estates.' },
  { name: 'Goil EV Network',             country: 'GH', evses: 95,   protocol: 'OCPI 2.2', role: 'CPO',  status: 'Active',      agreement: true,  city: 'Kumasi',   latency: '61ms', quality: '92%', x: 35, y: 48, lastSync: '22 min ago', coverageArea: 'Ashanti Region',          availability: 89, partnerSince: 'Aug 2024', connectionHealth: 'good',      evseAvailable: 55,  evseCharging: 30,  evseInoperative: 10,  description: 'Goil fuel station network pivoting to EV charging across Ashanti Region.' },
  { name: 'Shell Ghana EV',              country: 'GH', evses: 140,  protocol: 'OCPI 2.2', role: 'CPO',  status: 'Negotiating', agreement: false, city: 'Takoradi', latency: '--',    quality: '90%', x: 28, y: 58, lastSync: '2 days ago', coverageArea: 'Western Region',          availability: 88, partnerSince: undefined,  connectionHealth: 'unknown',   evseAvailable: 80,  evseCharging: 45,  evseInoperative: 15,  description: 'Shell-operated fast-charging network in Western Region coastal corridor.' },
  { name: 'Total Energies Ghana',        country: 'GH', evses: 210,  protocol: 'OCPI 2.2', role: 'CPO',  status: 'Active',      agreement: true,  city: 'Accra',    latency: '52ms', quality: '93%', x: 40, y: 56, lastSync: '6 min ago',  coverageArea: 'Accra Metro + Suburbs',   availability: 92, partnerSince: 'Jan 2024', connectionHealth: 'excellent', evseAvailable: 130, evseCharging: 65,  evseInoperative: 15,  description: 'Total Energies Ghana pan-Africa CPO with high-power DC hubs across Accra metro.' },
  { name: 'GreenMobility GH',            country: 'GH', evses: 60,   protocol: 'OCPI 2.2', role: 'eMSP', status: 'Negotiating', agreement: false, city: 'Accra',    latency: '--',    quality: '88%', x: 39, y: 55, lastSync: '5 days ago', coverageArea: 'Accra Central',           availability: 82, partnerSince: undefined,  connectionHealth: 'unknown',   evseAvailable: 32,  evseCharging: 20,  evseInoperative: 8,   description: 'eMSP-only player offering roaming tokens for Accra city drivers.' },
  { name: 'ZOTC Nigeria',                country: 'NG', evses: 480,  protocol: 'OCPI 2.2', role: 'CPO',  status: 'Active',      agreement: true,  city: 'Lagos',    latency: '72ms', quality: '91%', x: 52, y: 52, lastSync: '11 min ago', coverageArea: 'Lagos State + Abuja FCT', availability: 90, partnerSince: 'Nov 2023', connectionHealth: 'good',      evseAvailable: 298, evseCharging: 155, evseInoperative: 27,  description: 'Largest Nigerian CPO150 kW DC hubs across Lagos & Abuja corridors.' },
  { name: "CIE Côte d'Ivoire",           country: 'CI', evses: 130,  protocol: 'OCPI 2.2', role: 'CPO',  status: 'New Connection',  agreement: false, city: 'Abidjan',       latency: '--',    quality: '85%', x: 30, y: 56, lastSync: 'Never',       coverageArea: 'Abidjan District',               availability: 84, partnerSince: undefined,  connectionHealth: 'unknown',   evseAvailable: 70,  evseCharging: 42,  evseInoperative: 18,  description: 'Côte d\'Ivoire state utility operating pilot EV charging at Abidjan sites.' },
  // Latin America
  { name: 'Eletrobras EV Brasil',         country: 'BR', evses: 640,  protocol: 'OCPI 2.2', role: 'CPO',  status: 'Active',      agreement: true,  city: 'São Paulo',     latency: '55ms', quality: '95%', x: 28, y: 65, lastSync: '6 min ago',   coverageArea: 'São Paulo + Rio de Janeiro',     availability: 93, partnerSince: 'Feb 2024', connectionHealth: 'excellent', evseAvailable: 412, evseCharging: 190, evseInoperative: 38,  description: 'Brazil\'s largest CPOhigh-power DC hubs across São Paulo, Rio, and Brasília corridors.' },
  { name: 'Voltbras Networks',            country: 'BR', evses: 280,  protocol: 'OCPI 2.2', role: 'CPO',  status: 'Active',      agreement: true,  city: 'Rio de Janeiro',latency: '68ms', quality: '91%', x: 30, y: 63, lastSync: '14 min ago',  coverageArea: 'Rio de Janeiro State',           availability: 90, partnerSince: 'May 2024', connectionHealth: 'good',      evseAvailable: 172, evseCharging: 88,  evseInoperative: 20,  description: 'Fast-growing Rio-based CPO network expanding along BR-116 highway corridor.' },
  { name: 'Charge Now México',            country: 'MX', evses: 520,  protocol: 'OCPI 2.2', role: 'CPO',  status: 'Active',      agreement: true,  city: 'Mexico City',   latency: '62ms', quality: '92%', x: 15, y: 52, lastSync: '8 min ago',   coverageArea: 'CDMX + Guadalajara + Monterrey', availability: 91, partnerSince: 'Sep 2023', connectionHealth: 'excellent', evseAvailable: 320, evseCharging: 165, evseInoperative: 35,  description: 'Mexico\'s leading CPO with nationwide coverage across all major metro areas.' },
  { name: 'EnVolt México',                country: 'MX', evses: 190,  protocol: 'OCPI 2.1', role: 'eMSP', status: 'Negotiating', agreement: false, city: 'Guadalajara',   latency: '--',    quality: '87%', x: 14, y: 54, lastSync: '3 days ago',  coverageArea: 'Jalisco Region',                 availability: 85, partnerSince: undefined,  connectionHealth: 'unknown',   evseAvailable: 110, evseCharging: 55,  evseInoperative: 25,  description: 'Jalisco-based eMSP offering roaming access across Mexico\'s western cities.' },
  { name: 'Enel X Colombia',              country: 'CO', evses: 370,  protocol: 'OCPI 2.2', role: 'CPO',  status: 'Active',      agreement: true,  city: 'Bogotá',        latency: '74ms', quality: '90%', x: 20, y: 60, lastSync: '17 min ago',  coverageArea: 'Bogotá D.C. + Medellín',         availability: 89, partnerSince: 'Apr 2024', connectionHealth: 'good',      evseAvailable: 225, evseCharging: 120, evseInoperative: 25,  description: 'Enel X joint venture operating 370 EVSE across Colombia\'s two largest cities.' },
  { name: 'Zeta Energy Chile',            country: 'CL', evses: 295,  protocol: 'OCPI 2.2', role: 'CPO',  status: 'Active',      agreement: true,  city: 'Santiago',      latency: '81ms', quality: '93%', x: 18, y: 72, lastSync: '21 min ago',  coverageArea: 'Región Metropolitana',           availability: 92, partnerSince: 'Jan 2024', connectionHealth: 'good',      evseAvailable: 188, evseCharging: 95,  evseInoperative: 12,  description: 'Santiago\'s dominant CPO with solar-powered charging hubs across RM metro.' },
  { name: 'YPF Luz EV Argentina',         country: 'AR', evses: 430,  protocol: 'OCPI 2.2', role: 'CPO',  status: 'Active',      agreement: true,  city: 'Buenos Aires',  latency: '89ms', quality: '90%', x: 22, y: 75, lastSync: '25 min ago',  coverageArea: 'Buenos Aires Province',          availability: 88, partnerSince: 'Jun 2024', connectionHealth: 'good',      evseAvailable: 265, evseCharging: 135, evseInoperative: 30,  description: 'YPF state oil company pivoting to EV with 430 chargers across Buenos Aires.' },
  { name: 'Evolta Argentina',             country: 'AR', evses: 120,  protocol: 'OCPI 2.2', role: 'eMSP', status: 'Negotiating', agreement: false, city: 'Córdoba',       latency: '--',    quality: '86%', x: 21, y: 73, lastSync: '4 days ago',  coverageArea: 'Córdoba + Mendoza',              availability: 83, partnerSince: undefined,  connectionHealth: 'unknown',   evseAvailable: 68,  evseCharging: 38,  evseInoperative: 14,  description: 'eMSP startup connecting Córdoba and Mendoza intercity EV drivers.' },
];

const MARKETPLACE_ACCESS_POINTS: MarketplaceAccessPoint[] = [
  // ECGAccra & surrounds
  { id: 'EVSE-GH-ACC-001', name: 'Accra Mall Charge Hub',       network: 'ECG (Electricity Co. Ghana)', city: 'Accra',      country: 'GH', status: 'Available',   connectors: '6 CCS2 · 4 Type 2', power: '50 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-GH-DC50',  lat:  5.6037, lng: -0.1870, x: 38, y: 55, lastUpdated: '3 min ago',  connectorCount: 10, maxPower: '50 kW' },
  { id: 'EVSE-GH-ACC-009', name: 'East Legon EV Hub',           network: 'ECG (Electricity Co. Ghana)', city: 'Accra',      country: 'GH', status: 'Charging',    connectors: '4 CCS2 · 2 Type 2', power: '50 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-GH-DC50',  lat:  5.6363, lng: -0.1530, x: 39, y: 54, lastUpdated: '1 min ago',  connectorCount: 6,  maxPower: '50 kW' },
  { id: 'EVSE-GH-ACC-010', name: 'Osu Oxford Street Charge',    network: 'ECG (Electricity Co. Ghana)', city: 'Accra',      country: 'GH', status: 'Available',   connectors: '2 CCS2 · 2 Type 2', power: '22 kW AC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-GH-AC22',  lat:  5.5518, lng: -0.1832, x: 38, y: 56, lastUpdated: '8 min ago',  connectorCount: 4,  maxPower: '22 kW' },
  { id: 'EVSE-GH-ACC-011', name: 'Lapaz Motor Terminal',        network: 'ECG (Electricity Co. Ghana)', city: 'Accra',      country: 'GH', status: 'Available',   connectors: '6 CCS2',            power: '75 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-GH-DC50',  lat:  5.6500, lng: -0.2436, x: 37, y: 54, lastUpdated: '5 min ago',  connectorCount: 6,  maxPower: '75 kW' },
  { id: 'EVSE-GH-ACC-012', name: 'Spintex Road Depot',          network: 'ECG (Electricity Co. Ghana)', city: 'Accra',      country: 'GH', status: 'Reserved',    connectors: '4 CCS2',            power: '50 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-GH-DC50',  lat:  5.6300, lng: -0.1050, x: 39, y: 55, lastUpdated: '12 min ago', connectorCount: 4,  maxPower: '50 kW' },
  // VRA
  { id: 'EVSE-GH-TEM-002', name: 'Tema Industrial Depot',       network: 'VRA EV Charge',               city: 'Tema',       country: 'GH', status: 'Charging',    connectors: '4 CCS2',            power: '75 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-GH-VRA',   lat:  5.6698, lng:  0.0166, x: 42, y: 53, lastUpdated: '2 min ago',  connectorCount: 4,  maxPower: '75 kW' },
  { id: 'EVSE-GH-TEM-013', name: 'Tema Manhean Station',        network: 'VRA EV Charge',               city: 'Tema',       country: 'GH', status: 'Available',   connectors: '4 CCS2 · 2 Type 2', power: '50 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-GH-VRA',   lat:  5.6800, lng:  0.0400, x: 42, y: 53, lastUpdated: '9 min ago',  connectorCount: 6,  maxPower: '50 kW' },
  { id: 'EVSE-GH-TEM-014', name: 'Tema Harbour Gateway',        network: 'VRA EV Charge',               city: 'Tema',       country: 'GH', status: 'Available',   connectors: '8 CCS2',            power: '150 kW DC', protocol: 'OCPI 2.2', tariff: 'TARIFF-GH-VRA',   lat:  5.6563, lng:  0.0012, x: 42, y: 53, lastUpdated: '7 min ago',  connectorCount: 8,  maxPower: '150 kW' },
  // GoilKumasi
  { id: 'EVSE-GH-KSI-003', name: 'Kumasi Adum Station',         network: 'Goil EV Network',             city: 'Kumasi',     country: 'GH', status: 'Available',   connectors: '4 CCS2 · 2 Type 2', power: '50 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-GH-GOIL',  lat:  6.6885, lng: -1.6244, x: 35, y: 48, lastUpdated: '20 min ago', connectorCount: 6,  maxPower: '50 kW' },
  { id: 'EVSE-GH-KSI-015', name: 'Kejetia Market Charge',       network: 'Goil EV Network',             city: 'Kumasi',     country: 'GH', status: 'Charging',    connectors: '2 CCS2 · 4 Type 2', power: '22 kW AC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-GH-GOIL',  lat:  6.6904, lng: -1.6233, x: 35, y: 48, lastUpdated: '15 min ago', connectorCount: 6,  maxPower: '22 kW' },
  { id: 'EVSE-GH-KSI-016', name: 'KNUST Campus EV Hub',         network: 'Goil EV Network',             city: 'Kumasi',     country: 'GH', status: 'Available',   connectors: '6 CCS2',            power: '50 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-GH-GOIL',  lat:  6.6744, lng: -1.5715, x: 36, y: 48, lastUpdated: '18 min ago', connectorCount: 6,  maxPower: '50 kW' },
  // Shell
  { id: 'EVSE-GH-TAK-004', name: 'Takoradi Harbour Point',      network: 'Shell Ghana EV',              city: 'Takoradi',   country: 'GH', status: 'Reserved',    connectors: '2 CCS2',            power: '50 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-GH-SHELL', lat:  4.9016, lng: -1.7749, x: 28, y: 58, lastUpdated: '2 days ago', connectorCount: 2,  maxPower: '50 kW' },
  { id: 'EVSE-GH-TAK-017', name: 'Takoradi Market Circle',      network: 'Shell Ghana EV',              city: 'Takoradi',   country: 'GH', status: 'Available',   connectors: '4 CCS2 · 2 Type 2', power: '50 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-GH-SHELL', lat:  4.8968, lng: -1.7714, x: 28, y: 58, lastUpdated: '2 days ago', connectorCount: 6,  maxPower: '50 kW' },
  { id: 'EVSE-GH-CCO-018', name: 'Cape Coast Castle Station',   network: 'Shell Ghana EV',              city: 'Cape Coast', country: 'GH', status: 'Available',   connectors: '2 CCS2 · 2 Type 2', power: '50 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-GH-SHELL', lat:  5.1053, lng: -1.2466, x: 32, y: 57, lastUpdated: '2 days ago', connectorCount: 4,  maxPower: '50 kW' },
  // Total Energies Ghana
  { id: 'EVSE-GH-ACC-005', name: 'Airport City EV Point',       network: 'Total Energies Ghana',        city: 'Accra',      country: 'GH', status: 'Available',   connectors: '8 CCS2 · 4 Type 2', power: '100 kW DC', protocol: 'OCPI 2.2', tariff: 'TARIFF-GH-TOTAL', lat:  5.6052, lng: -0.1718, x: 40, y: 56, lastUpdated: '4 min ago',  connectorCount: 12, maxPower: '100 kW' },
  { id: 'EVSE-GH-ACC-019', name: 'Dome Kwabenya Fast Charge',   network: 'Total Energies Ghana',        city: 'Accra',      country: 'GH', status: 'Available',   connectors: '6 CCS2',            power: '100 kW DC', protocol: 'OCPI 2.2', tariff: 'TARIFF-GH-TOTAL', lat:  5.6800, lng: -0.2100, x: 37, y: 53, lastUpdated: '6 min ago',  connectorCount: 6,  maxPower: '100 kW' },
  { id: 'EVSE-GH-SUN-020', name: 'Sunyani Market Hub',          network: 'Total Energies Ghana',        city: 'Sunyani',    country: 'GH', status: 'Charging',    connectors: '2 CCS2 · 2 Type 2', power: '50 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-GH-TOTAL', lat:  7.3349, lng: -2.3271, x: 34, y: 43, lastUpdated: '6 min ago',  connectorCount: 4,  maxPower: '50 kW' },
  // GreenMobility
  { id: 'EVSE-GH-ACC-006', name: 'Cantonments Fast Charge',     network: 'GreenMobility GH',            city: 'Accra',      country: 'GH', status: 'Inoperative', connectors: '2 CCS2',            power: '22 kW AC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-GH-GREEN', lat:  5.5913, lng: -0.1657, x: 39, y: 55, lastUpdated: '5 days ago', connectorCount: 2,  maxPower: '22 kW' },
  { id: 'EVSE-GH-HO-021',  name: 'Ho Civic Centre EV',          network: 'GreenMobility GH',            city: 'Ho',         country: 'GH', status: 'Available',   connectors: '2 CCS2 · 2 Type 2', power: '22 kW AC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-GH-GREEN', lat:  6.6010, lng:  0.4699, x: 43, y: 48, lastUpdated: '5 days ago', connectorCount: 4,  maxPower: '22 kW' },
  // ZOTC Nigeria
  { id: 'EVSE-NG-LAG-007', name: 'Lagos Victoria Island Hub',   network: 'ZOTC Nigeria',                city: 'Lagos',      country: 'NG', status: 'Available',   connectors: '10 CCS2',           power: '150 kW DC', protocol: 'OCPI 2.2', tariff: 'TARIFF-NG-ZOTC',  lat:  6.4281, lng:  3.4219, x: 52, y: 52, lastUpdated: '8 min ago',  connectorCount: 10, maxPower: '150 kW' },
  { id: 'EVSE-NG-LAG-022', name: 'Ikeja Electric Hub',          network: 'ZOTC Nigeria',                city: 'Lagos',      country: 'NG', status: 'Charging',    connectors: '8 CCS2 · 4 Type 2', power: '100 kW DC', protocol: 'OCPI 2.2', tariff: 'TARIFF-NG-ZOTC',  lat:  6.6018, lng:  3.3515, x: 52, y: 50, lastUpdated: '10 min ago', connectorCount: 12, maxPower: '100 kW' },
  { id: 'EVSE-NG-LAG-023', name: 'Lekki Phase 1 Station',       network: 'ZOTC Nigeria',                city: 'Lagos',      country: 'NG', status: 'Available',   connectors: '6 CCS2',            power: '150 kW DC', protocol: 'OCPI 2.2', tariff: 'TARIFF-NG-ZOTC',  lat:  6.4333, lng:  3.4800, x: 52, y: 52, lastUpdated: '11 min ago', connectorCount: 6,  maxPower: '150 kW' },
  { id: 'EVSE-NG-ABJ-024', name: 'Abuja Central EV Hub',        network: 'ZOTC Nigeria',                city: 'Abuja',      country: 'NG', status: 'Available',   connectors: '6 CCS2 · 4 Type 2', power: '100 kW DC', protocol: 'OCPI 2.2', tariff: 'TARIFF-NG-ZOTC',  lat:  9.0820, lng:  7.4826, x: 55, y: 35, lastUpdated: '13 min ago', connectorCount: 10, maxPower: '100 kW' },
  // CIE Côte d'Ivoire
  { id: 'EVSE-CI-ABJ-008', name: 'Abidjan Plateau Station',     network: "CIE Côte d'Ivoire",           city: 'Abidjan',    country: 'CI', status: 'Available',   connectors: '4 CCS2 · 2 Type 2', power: '50 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-CI-STD',   lat:  5.3600, lng: -4.0083, x: 30, y: 56, lastUpdated: 'Never',      connectorCount: 6,  maxPower: '50 kW' },
  { id: 'EVSE-CI-ABJ-025', name: 'Cocody Riviera Station',      network: "CIE Côte d'Ivoire",           city: 'Abidjan',    country: 'CI', status: 'Charging',    connectors: '2 CCS2 · 2 Type 2', power: '22 kW AC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-CI-STD',   lat:  5.3728, lng: -3.9954, x: 30, y: 56, lastUpdated: 'Never',      connectorCount: 4,  maxPower: '22 kW' },
  { id: 'EVSE-CI-ABJ-026', name: 'Yopougon Express Charge',     network: "CIE Côte d'Ivoire",           city: 'Abidjan',    country: 'CI', status: 'Available',   connectors: '4 CCS2',            power: '50 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-CI-STD',   lat:  5.3553, lng: -4.0621, x: 29, y: 56, lastUpdated: 'Never',      connectorCount: 4,  maxPower: '50 kW' },
  // BrazilSão Paulo & Rio
  { id: 'EVSE-BR-SPO-027', name: 'Av. Paulista DC Hub',         network: 'Eletrobras EV Brasil',       city: 'São Paulo',  country: 'BR', status: 'Available',   connectors: '8 CCS2 · 4 Type 2', power: '150 kW DC', protocol: 'OCPI 2.2', tariff: 'TARIFF-BR-DC150', lat: -23.5615, lng: -46.6559, x: 28, y: 65, lastUpdated: '2 min ago',  connectorCount: 12, maxPower: '150 kW' },
  { id: 'EVSE-BR-SPO-028', name: 'Imigrantes Highway Station',   network: 'Eletrobras EV Brasil',       city: 'São Paulo',  country: 'BR', status: 'Charging',    connectors: '6 CCS2',            power: '100 kW DC', protocol: 'OCPI 2.2', tariff: 'TARIFF-BR-DC100', lat: -23.6850, lng: -46.6150, x: 28, y: 65, lastUpdated: '5 min ago',  connectorCount: 6,  maxPower: '100 kW' },
  { id: 'EVSE-BR-SPO-029', name: 'Congonhas Airport Charge',     network: 'Eletrobras EV Brasil',       city: 'São Paulo',  country: 'BR', status: 'Available',   connectors: '4 CCS2 · 2 Type 2', power: '50 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-BR-DC50',  lat: -23.6261, lng: -46.4743, x: 28, y: 65, lastUpdated: '8 min ago',  connectorCount: 6,  maxPower: '50 kW' },
  { id: 'EVSE-BR-RIO-030', name: 'Copacabana Beach Charge',      network: 'Voltbras Networks',          city: 'Rio de Janeiro', country: 'BR', status: 'Available',   connectors: '4 CCS2 · 2 Type 2', power: '50 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-BR-DC50',  lat: -23.0855, lng: -43.1821, x: 30, y: 63, lastUpdated: '10 min ago', connectorCount: 6,  maxPower: '50 kW' },
  { id: 'EVSE-BR-RIO-031', name: 'Santos Dumont Airport Hub',    network: 'Voltbras Networks',          city: 'Rio de Janeiro', country: 'BR', status: 'Charging',    connectors: '6 CCS2',            power: '100 kW DC', protocol: 'OCPI 2.2', tariff: 'TARIFF-BR-DC100', lat: -22.9068, lng: -43.1628, x: 30, y: 63, lastUpdated: '12 min ago', connectorCount: 6,  maxPower: '100 kW' },
  // MexicoMexico City & Guadalajara
  { id: 'EVSE-MX-MEX-032', name: 'Reforma Boulevard Hub',       network: 'Charge Now México',          city: 'Mexico City', country: 'MX', status: 'Available',   connectors: '10 CCS2 · 6 Type 2', power: '150 kW DC', protocol: 'OCPI 2.2', tariff: 'TARIFF-MX-DC150', lat: 19.4326, lng: -99.1332, x: 15, y: 52, lastUpdated: '3 min ago',  connectorCount: 16, maxPower: '150 kW' },
  { id: 'EVSE-MX-MEX-033', name: 'Benito Juárez Station',        network: 'Charge Now México',          city: 'Mexico City', country: 'MX', status: 'Available',   connectors: '6 CCS2 · 4 Type 2', power: '100 kW DC', protocol: 'OCPI 2.2', tariff: 'TARIFF-MX-DC100', lat: 19.4243, lng: -99.1469, x: 15, y: 52, lastUpdated: '7 min ago',  connectorCount: 10, maxPower: '100 kW' },
  { id: 'EVSE-MX-GDL-034', name: 'Guadalajara Mall Charge',      network: 'Charge Now México',          city: 'Guadalajara',  country: 'MX', status: 'Available',   connectors: '4 CCS2 · 2 Type 2', power: '50 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-MX-DC50',  lat: 20.6295, lng: -103.4000, x: 14, y: 54, lastUpdated: '15 min ago', connectorCount: 6,  maxPower: '50 kW' },
  { id: 'EVSE-MX-GDL-035', name: 'Zapopan Express Station',      network: 'EnVolt México',              city: 'Guadalajara',  country: 'MX', status: 'Charging',    connectors: '2 CCS2 · 4 Type 2', power: '50 kW DC',  protocol: 'OCPI 2.1', tariff: 'TARIFF-MX-AC',    lat: 20.7160, lng: -103.5960, x: 14, y: 54, lastUpdated: '9 min ago',  connectorCount: 6,  maxPower: '50 kW' },
  // ColombiaBogotá & Medellín
  { id: 'EVSE-CO-BOG-036', name: 'La Candelaria DC Hub',        network: 'Enel X Colombia',            city: 'Bogotá',     country: 'CO', status: 'Available',   connectors: '8 CCS2',            power: '100 kW DC', protocol: 'OCPI 2.2', tariff: 'TARIFF-CO-DC100', lat: 4.7110, lng: -74.0087, x: 20, y: 60, lastUpdated: '6 min ago',  connectorCount: 8,  maxPower: '100 kW' },
  { id: 'EVSE-CO-BOG-037', name: 'Zona Rosa Charge Station',     network: 'Enel X Colombia',            city: 'Bogotá',     country: 'CO', status: 'Available',   connectors: '4 CCS2 · 2 Type 2', power: '50 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-CO-DC50',  lat: 4.7690, lng: -74.0466, x: 20, y: 60, lastUpdated: '11 min ago', connectorCount: 6,  maxPower: '50 kW' },
  { id: 'EVSE-CO-MED-038', name: 'Medellín Downtown Hub',        network: 'Enel X Colombia',            city: 'Medellín',   country: 'CO', status: 'Charging',    connectors: '6 CCS2',            power: '75 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-CO-DC75',  lat: 6.2442, lng: -75.5812, x: 20, y: 60, lastUpdated: '19 min ago', connectorCount: 6,  maxPower: '75 kW' },
  // ChileSantiago
  { id: 'EVSE-CL-SAT-039', name: 'Providencia Solar Hub',        network: 'Zeta Energy Chile',          city: 'Santiago',   country: 'CL', status: 'Available',   connectors: '8 CCS2 · 4 Type 2', power: '100 kW DC', protocol: 'OCPI 2.2', tariff: 'TARIFF-CL-DC100', lat: -33.4226, lng: -70.6014, x: 18, y: 72, lastUpdated: '4 min ago',  connectorCount: 12, maxPower: '100 kW' },
  { id: 'EVSE-CL-SAT-040', name: 'Las Condes Express Charge',    network: 'Zeta Energy Chile',          city: 'Santiago',   country: 'CL', status: 'Available',   connectors: '4 CCS2 · 2 Type 2', power: '50 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-CL-DC50',  lat: -33.3977, lng: -70.5491, x: 18, y: 72, lastUpdated: '13 min ago', connectorCount: 6,  maxPower: '50 kW' },
  { id: 'EVSE-CL-SAT-041', name: 'Pudahuel Airport Charge',      network: 'Zeta Energy Chile',          city: 'Santiago',   country: 'CL', status: 'Charging',    connectors: '6 CCS2',            power: '75 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-CL-DC75',  lat: -33.3891, lng: -70.7865, x: 18, y: 72, lastUpdated: '16 min ago', connectorCount: 6,  maxPower: '75 kW' },
  // ArgentinaBuenos Aires & Córdoba
  { id: 'EVSE-AR-BAS-042', name: 'Recoleta Fast Charge Hub',     network: 'YPF Luz EV Argentina',      city: 'Buenos Aires', country: 'AR', status: 'Available',   connectors: '8 CCS2',            power: '100 kW DC', protocol: 'OCPI 2.2', tariff: 'TARIFF-AR-DC100', lat: -34.5944, lng: -58.3912, x: 22, y: 75, lastUpdated: '5 min ago',  connectorCount: 8,  maxPower: '100 kW' },
  { id: 'EVSE-AR-BAS-043', name: 'San Telmo Market Station',     network: 'YPF Luz EV Argentina',      city: 'Buenos Aires', country: 'AR', status: 'Available',   connectors: '4 CCS2 · 2 Type 2', power: '50 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-AR-DC50',  lat: -34.6278, lng: -58.3641, x: 22, y: 75, lastUpdated: '10 min ago', connectorCount: 6,  maxPower: '50 kW' },
  { id: 'EVSE-AR-BAS-044', name: 'Ezeiza Airport Charge',        network: 'YPF Luz EV Argentina',      city: 'Buenos Aires', country: 'AR', status: 'Charging',    connectors: '6 CCS2',            power: '75 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-AR-DC75',  lat: -34.8222, lng: -58.5358, x: 22, y: 75, lastUpdated: '18 min ago', connectorCount: 6,  maxPower: '75 kW' },
  { id: 'EVSE-AR-COR-045', name: 'Córdoba Downtown Station',     network: 'Evolta Argentina',           city: 'Córdoba',     country: 'AR', status: 'Available',   connectors: '2 CCS2 · 4 Type 2', power: '50 kW DC',  protocol: 'OCPI 2.2', tariff: 'TARIFF-AR-AC',    lat: -31.4201, lng: -64.1888, x: 21, y: 73, lastUpdated: '22 min ago', connectorCount: 6,  maxPower: '50 kW' },
];

// â"₵â"₵ Shared UI Atoms â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵

const Badge = ({ n }: { n: number }) => (
  <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
    {n}
  </span>
);

const StatusDot = ({ ok }: { ok: boolean }) => (
  <span className={`inline-block w-2 h-2 rounded-full ${ok ? 'bg-emerald-400' : 'bg-rose-400'}`} />
);

const Pill = ({ label, color }: { label: string; color: string }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>
);

const MetricCard = ({
  title, value, sub, icon: Icon, trend, up, onClick,
}: {
  title: string; value: string; sub?: string;
  icon: React.ElementType; trend?: string; up?: boolean;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl p-5 shadow-sm border border-slate-100 transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5' : ''}`}
  >
    <div className="flex items-start justify-between mb-3">
      <span className="text-sm text-slate-500">{title}</span>
      <div className={`w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center transition-colors ${onClick ? 'group-hover:bg-indigo-100' : ''}`}>
        <Icon className="w-4 h-4 text-indigo-600" />
      </div>
    </div>
    <div className="text-2xl font-bold text-slate-800 mb-1">{value}</div>
    {sub && <div className="text-xs text-slate-400">{sub}</div>}
    {trend && (
      <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
        {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {trend}
      </div>
    )}
    {onClick && (
      <div className="flex items-center gap-1 mt-3 text-[11px] text-indigo-400 font-medium opacity-0 group-hover:opacity-100">
        View details →
      </div>
    )}
  </div>
);

const SectionHeader = ({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      {sub && <p className="text-sm text-slate-500 mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

const Table = ({ cols, rows }: { cols: string[]; rows: React.ReactNode[][] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-100">
          {cols.map(c => (
            <th key={c} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
            {row.map((cell, j) => (
              <td key={j} className="py-3 px-4 text-slate-700">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SearchBar = ({ placeholder }: { placeholder?: string }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
    <input
      className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      placeholder={placeholder ?? 'Search...'}
    />
  </div>
);

// â"₵â"₵ Section Renderers â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵

// â"₵â"₵ Analytics â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵

function renderAnalytics() {
  const CHART_H = 120;

  const months = ['Jan','Feb','Mar','Apr','May','Jun'];
  const cdrData = [61200, 68400, 72800, 79100, 87300, 94231];
  const revenueData = [24800, 27600, 29400, 31800, 35200, 38440];
  const maxCdr = Math.max(...cdrData);
  const maxRev = Math.max(...revenueData);

  const partners = [
    { name: 'ECG Ghana',      cdrs: 31480, revenue: 13140, quality: 98.2, trend: '+4%',  trendUp: true  },
    { name: 'Total Energies Ghana',  cdrs: 22910, revenue: 9560,  quality: 96.7, trend: '+2%',  trendUp: true  },
    { name: 'Goil EV Network',         cdrs: 18440, revenue: 8240,  quality: 97.4, trend: '+7%',  trendUp: true  },
    { name: 'Eletrobras EV Brasil',          cdrs: 12180, revenue: 5080,  quality: 94.1, trend: '-1%',  trendUp: false },
    { name: 'GreenMobility GH', cdrs:  9221, revenue: 2420,  quality: 91.8, trend: '+3%',  trendUp: true  },
  ];

  const qualityIssues = [
    { label: 'Missing energy data',    count: 142, pct: 38, color: 'bg-red-400'    },
    { label: 'Incorrect duration',     count: 98,  pct: 26, color: 'bg-amber-400'  },
    { label: 'Duplicate CDR',          count: 61,  pct: 16, color: 'bg-orange-400' },
    { label: 'Invalid connector ID',   count: 44,  pct: 12, color: 'bg-violet-400' },
    { label: 'Other',                  count: 29,  pct: 8,  color: 'bg-slate-300'  },
  ];

  const topLocations = [
    { name: 'Accra Central',   sessions: 4821, kwh: 48210, avgKwh: 10.0 },
    { name: 'Schiphol P3',      sessions: 3640, kwh: 72800, avgKwh: 20.0 },
    { name: 'Rotterdam Hub',    sessions: 2910, kwh: 58200, avgKwh: 20.0 },
    { name: 'Utrecht CS',       sessions: 2480, kwh: 22320, avgKwh:  9.0 },
    { name: 'Den Haag Central', sessions: 1990, kwh: 19900, avgKwh: 10.0 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Data & Analytics</h2>
          <p className="text-sm text-slate-500 mt-0.5">CDR quality, session trends and network benchmarks</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-2 bg-white">
            <CalendarRange size={13} />
            Jan â₵" Jun 2025
          </div>
          <button className="flex items-center gap-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors rounded-lg px-3 py-2" data-local>
            <Download size={13} />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total CDRs (H1)',    value: '462,831',  sub: '+18% vs H1 2024',  color: 'text-violet-600', bg: 'bg-violet-50',  icon: TableProperties },
          { label: 'Roaming revenue',    value: '₵ 136,640',sub: '+22% vs H1 2024',  color: 'text-emerald-600',bg: 'bg-emerald-50', icon: TrendingUp      },
          { label: 'CDR quality score',  value: '96.4 %',   sub: '374 issues flagged',color: 'text-blue-600',   bg: 'bg-blue-50',    icon: CheckCircle     },
          { label: 'Active partners',    value: '5',         sub: '67 agreements total',color:'text-amber-600',  bg: 'bg-amber-50',   icon: Network         },
        ].map(({ label, value, sub, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${bg} mb-2`}>
              <Icon size={14} className={color} />
            </div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`text-xl font-bold mt-0.5 ${color}`}>{value}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">

        {/* CDR Volume trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">CDR Volume</p>
              <p className="text-xs text-slate-400">Monthly, Janâ₵"Jun 2025</p>
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">→ +54% YTD</span>
          </div>
          <div className="flex items-end gap-2" style={{ height: `${CHART_H}px` }}>
            {cdrData.map((v, i) => {
              const h = Math.round((v / maxCdr) * CHART_H);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-violet-400 hover:bg-violet-500 transition-colors cursor-default relative group"
                    style={{ height: `${h}px` }}
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 whitespace-nowrap opacity-0 group-hover:opacity-100">
                      {(v/1000).toFixed(1)}K
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{months[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">Roaming Revenue</p>
              <p className="text-xs text-slate-400">Monthly (GHS), Jan-Jun 2025</p>
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">→ +55% YTD</span>
          </div>
          <div className="flex items-end gap-2" style={{ height: `${CHART_H}px` }}>
            {revenueData.map((v, i) => {
              const h = Math.round((v / maxRev) * CHART_H);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-emerald-400 hover:bg-emerald-500 transition-colors cursor-default relative group"
                    style={{ height: `${h}px` }}
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 whitespace-nowrap opacity-0 group-hover:opacity-100">
                      ₵ {(v/1000).toFixed(1)}K
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{months[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CDR Quality breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-slate-700">CDR Quality Issues</p>
            <p className="text-xs text-slate-400">374 flagged CDRs out of 462,831 total99.9% pass rate</p>
          </div>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Score: 96.4%</span>
        </div>
        <div className="space-y-3">
          {qualityIssues.map(q => (
            <div key={q.label} className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-44 shrink-0">{q.label}</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${q.color}`} style={{ width: `${q.pct}%` }} />
              </div>
              <span className="text-xs font-medium text-slate-600 w-8 text-right">{q.count}</span>
              <span className="text-[11px] text-slate-400 w-8 text-right">{q.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Partner benchmark table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <p className="text-sm font-semibold text-slate-700">Partner Performance Benchmark</p>
            <p className="text-xs text-slate-400">H1 2025 · ranked by CDR volume</p>
          </div>
          <button className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1" data-local>
            <Download size={12} /> Export
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">#</th>
              <th className="text-left px-4 py-3 font-medium">Partner</th>
              <th className="text-right px-4 py-3 font-medium">CDRs</th>
              <th className="text-right px-4 py-3 font-medium">Revenue</th>
              <th className="text-right px-4 py-3 font-medium">Quality</th>
              <th className="text-right px-4 py-3 font-medium">vs last mo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {partners.map((p, i) => (
              <tr key={p.name} className="hover:bg-slate-50">
                <td className="px-5 py-3 text-xs text-slate-400 font-mono">#{i + 1}</td>
                <td className="px-4 py-3 text-xs font-semibold text-slate-800">{p.name}</td>
                <td className="px-4 py-3 text-xs text-slate-600 text-right">{p.cdrs.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs font-medium text-slate-700 text-right">₵ {p.revenue.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${p.quality >= 96 ? 'bg-emerald-50 text-emerald-700' : p.quality >= 93 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                    {p.quality}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-xs font-medium ${p.trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
                    {p.trendUp ? 'up' : 'down'} {p.trend}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top locations */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-700">Top Charging Locations</p>
          <p className="text-xs text-slate-400 mt-0.5">By session count, Jun 2025</p>
        </div>
        <div className="divide-y divide-slate-100">
          {topLocations.map((loc, i) => {
            const pct = Math.round((loc.sessions / topLocations[0].sessions) * 100);
            return (
              <div key={loc.name} className="flex items-center gap-4 px-5 py-3">
                <span className="text-xs font-mono text-slate-400 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">{loc.name}</span>
                    <span className="text-xs text-slate-500">{loc.sessions.toLocaleString()} sessions · {loc.kwh.toLocaleString()} kWh</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="text-xs text-slate-400 w-16 text-right shrink-0">{loc.avgKwh} kWh/s</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// â"₵â"₵ Plug & Charge â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵

function renderPlugCharge() {
  const stations = [
    { id: 'EVSE-GH-0041', name: 'Accra CentralBay 4', status: 'Ready',    protocol: 'ISO-15118-2', lastAuth: '2 min ago',  cert: 'Valid',   power: '150 kW' },
    { id: 'EVSE-GH-0082', name: 'Schiphol P3Level 2',  status: 'Charging', protocol: 'ISO-15118-2', lastAuth: '14 min ago', cert: 'Valid',   power: '50 kW'  },
    { id: 'EVSE-GH-0107', name: 'Rotterdam HubBay 1',  status: 'Ready',    protocol: 'ISO-15118-20',lastAuth: '1 hr ago',   cert: 'Valid',   power: '350 kW' },
    { id: 'EVSE-GH-0193', name: 'Utrecht CSBay 3',     status: 'Error',    protocol: 'ISO-15118-2', lastAuth: '3 hr ago',   cert: 'Expired', power: '22 kW'  },
  ];

  const statusColor: Record<string, string> = {
    Ready:    'bg-emerald-100 text-emerald-700',
    Charging: 'bg-blue-100 text-blue-700',
    Error:    'bg-red-100 text-red-700',
  };

  const steps = [
    { icon: Plug,          title: 'Driver plugs in',         desc: 'Vehicle connects to EVSE via CCS or CHAdeMO cable' },
    { icon: Lock,          title: 'ISO-15118 handshake',     desc: 'Vehicle certificate authenticated against eMSP TRUST chain' },
    { icon: ShieldCheck,   title: 'Auto-authorisation',      desc: 'GIREVE validates contract certno RFID or app required' },
    { icon: BatteryCharging, title: 'Session starts',        desc: 'Energy flows, CDRi generated in real-time every 60 s' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Plug & Charge</h2>
        <p className="text-sm text-slate-500 mt-0.5">ISO-15118 automatic authenticationno RFID card or mobile app needed</p>
      </div>

      {/* Status banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <CheckCircle size={16} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-800">Plug & Charge active on your account</p>
          <p className="text-xs text-emerald-600 mt-0.5">Contract certificate issued · Valid until Dec 2027 · 3 of 4 EVSEs compatible</p>
        </div>
        <button className="ml-auto text-xs font-medium text-emerald-700 border border-emerald-300 rounded-lg px-3 py-1.5 hover:bg-emerald-100 transition-colors shrink-0">
          Renew certificate
        </button>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h4 className="text-sm font-semibold text-slate-700 mb-4">How Plug & Charge works</h4>
        <div className="grid grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute top-5 left-[calc(50%+20px)] right-0 h-px bg-slate-200" />
              )}
              <div className="flex flex-col items-center text-center gap-2">
                <div className="h-10 w-10 rounded-full bg-violet-50 border border-violet-200 flex items-center justify-center z-10 relative">
                  <s.icon size={16} className="text-violet-600" />
                </div>
                <p className="text-xs font-semibold text-slate-700">{s.title}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EVSE table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h4 className="text-sm font-semibold text-slate-700">Compatible EVSEs</h4>
          <span className="text-xs text-slate-400">4 stations</span>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
            <th className="text-left px-5 py-3 font-medium">Station</th>
            <th className="text-left px-4 py-3 font-medium">Protocol</th>
            <th className="text-left px-4 py-3 font-medium">Power</th>
            <th className="text-left px-4 py-3 font-medium">Cert</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-left px-4 py-3 font-medium">Last auth</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {stations.map(s => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-800 text-xs">{s.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{s.id}</p>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{s.protocol}</td>
                <td className="px-4 py-3 text-xs font-semibold text-slate-700 whitespace-nowrap">{s.power}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${s.cert === 'Valid' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{s.cert}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusColor[s.status]}`}>{s.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{s.lastAuth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'P&C sessions this month', value: '1 284', sub: '+18% vs last month' },
          { label: 'Avg auth time',            value: '0.8 s',  sub: 'vs 4.2 s with RFID' },
          { label: 'Certificate validity',     value: '18 mo',  sub: 'Renewed automatically' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// â"₵â"₵ Smart Charging â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵

function renderSmartCharging() {
  const schedules = [
    { evse: 'Accra CentralBay 4', signal: 'Reduce 30%', source: 'TSO signal',   start: '18:00', end: '20:00', status: 'Active',    saving: '12 kW' },
    { evse: 'Schiphol P3Level 2',  signal: 'Pause',      source: 'DSO curtail',  start: '19:00', end: '19:30', status: 'Scheduled', saving: '50 kW' },
    { evse: 'Rotterdam HubBay 1',  signal: 'Boost +20%', source: 'Surplus solar',start: '12:00', end: '14:00', status: 'Completed', saving: '--'     },
    { evse: 'Utrecht CSBay 3',     signal: 'Reduce 50%', source: 'Peak tariff',  start: '17:30', end: '20:30', status: 'Scheduled', saving: '11 kW' },
  ];

  const statusColor: Record<string, string> = {
    Active:    'bg-emerald-100 text-emerald-700',
    Scheduled: 'bg-blue-100 text-blue-700',
    Completed: 'bg-slate-100 text-slate-500',
  };

  const signalColor = (s: string) =>
    s.startsWith('Reduce') || s === 'Pause' ? 'text-red-600 bg-red-50' : 'text-emerald-700 bg-emerald-50';

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Smart Charging</h2>
        <p className="text-sm text-slate-500 mt-0.5">TSO/DSO flexibility integration, demand response and load optimisation</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active flex signals', value: '2',      color: 'text-violet-600', bg: 'bg-violet-50',  icon: Zap },
          { label: 'Power shifted today', value: '73 kW',  color: 'text-emerald-600',bg: 'bg-emerald-50', icon: BarChart2 },
          { label: 'Peak demand avoided', value: '18%',    color: 'text-blue-600',   bg: 'bg-blue-50',    icon: TrendingUp },
          { label: 'Flex revenue (Jun)',   value: '₵ 412', color: 'text-amber-600',  bg: 'bg-amber-50',   icon: ArrowUpRight },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${bg} mb-2`}>
              <Icon size={14} className={color} />
            </div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`text-xl font-bold mt-0.5 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Load curve (visual bar chart) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-slate-700">Today's load profile</h4>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-violet-400 inline-block" /> Actual</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-slate-200 inline-block" /> Uncontrolled</span>
          </div>
        </div>
        <div className="flex items-end gap-1 h-24">
          {[18,22,26,30,28,20,16,14,18,24,34,40,38,32,28,24,42,60,55,48,36,28,22,18].map((v, i) => {
            const uncontrolled = [18,22,26,32,30,22,18,16,20,26,36,44,42,36,32,28,58,82,76,66,50,38,30,22][i];
            const pct     = Math.round((v / 82) * 96);
            const rawPct  = Math.round((uncontrolled / 82) * 96);
            const hrs = ['0','','','3','','','6','','','9','','','12','','','15','','','18','','','21','','23'];
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full flex items-end gap-px" style={{ height: '88px' }}>
                  <div className="flex-1 bg-slate-100 rounded-sm" style={{ height: `${rawPct}px` }} />
                  <div className="flex-1 bg-violet-400 rounded-sm" style={{ height: `${pct}px` }} />
                </div>
                <span className="text-[9px] text-slate-300">{hrs[i]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flex schedules */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h4 className="text-sm font-semibold text-slate-700">Flexibility schedules</h4>
          <button className="text-xs font-medium text-violet-600 border border-violet-200 rounded-lg px-3 py-1.5 hover:bg-violet-50 transition-colors" data-local>
            + New schedule
          </button>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
            <th className="text-left px-5 py-3 font-medium">Station</th>
            <th className="text-left px-4 py-3 font-medium">Signal</th>
            <th className="text-left px-4 py-3 font-medium">Source</th>
            <th className="text-left px-4 py-3 font-medium">Window</th>
            <th className="text-left px-4 py-3 font-medium">Saving</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {schedules.map((s, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-5 py-3 text-xs font-medium text-slate-800 whitespace-nowrap">{s.evse}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${signalColor(s.signal)}`}>{s.signal}</span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{s.source}</td>
                <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{s.start} â₵" {s.end}</td>
                <td className="px-4 py-3 text-xs font-semibold text-slate-700">{s.saving}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusColor[s.status]}`}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// â"₵â"₵ Company â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵

// â"₵â"₵ Company / Tenant Admin Portal â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵
// ── Organisation Management Center ─────────────────────────────────────────

type OrgTab = 'overview'|'health'|'contacts'|'agreements'|'network'|'users'|'finance'|'docs'|'notifications'|'audit';

function OrgHealthBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-bold text-slate-600 w-8 text-right">{value}%</span>
    </div>
  );
}

function OrgStatusDot({ status }: { status: 'green'|'yellow'|'red' }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${status==='green'?'bg-emerald-500':status==='yellow'?'bg-amber-400':'bg-red-500'}`} />
  );
}

function OrgKpiCard({ label, value, sub, trend, icon: Icon, color, bg, border }: {
  label: string; value: string; sub: string; trend?: { dir: 'up'|'down'; pct: string }; icon: React.ElementType; color: string; bg: string; border: string;
}) {
  return (
    <div className={`rounded-2xl border ${border} ${bg} px-4 py-3.5 flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-lg ${bg} border ${border} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-[10px] font-bold ${trend.dir==='up'?'text-emerald-600':'text-red-500'}`}>
            {trend.dir==='up'?'↑':'↓'} {trend.pct}
          </span>
        )}
      </div>
      <div>
        <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
        <p className="text-[11px] font-semibold text-slate-600 mt-0.5">{label}</p>
        <p className="text-[10px] text-slate-400">{sub}</p>
      </div>
    </div>
  );
}

function CompanyWorkspace() {
  const session = (() => {
    try { return JSON.parse(sessionStorage.getItem('cb_client_session') || localStorage.getItem('cb_client_session') || '{}'); }
    catch { return {}; }
  })();

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]         = useState<OrgTab>('overview');
  const [toast, setToast]                 = useState<{msg:string;type:'success'|'info'|'warning'}|null>(null);
  const [expandedPerm, setExpandedPerm]   = useState<string|null>(null);
  const [notifPrefs, setNotifPrefs]       = useState<Record<string,boolean>>({
    agreementUpdates: true, signatureRequests: true, invoiceAlerts: true,
    disputeAlerts: true, evseFaults: false, partnerConnectivity: true,
  });
  const [userSearch, setUserSearch]       = useState('');
  const [auditSearch, setAuditSearch]     = useState('');

  const showToast = (msg: string, type: 'success'|'info'|'warning' = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  // ── Data ───────────────────────────────────────────────────────────────────
  const company = {
    name:    session.org  || 'Volta Networks',
    plan:    session.plan || 'Growth Plan',
    country: 'Ghana',
    status:  'Active' as const,
    type:    'CPO / eMSP' as const,
    regNo:   'GH-2019-084432',
    vatNo:   'VAT-GH-20199321',
    website: 'www.volta-networks.gh',
    created: '12 Mar 2019',
    updated: '22 Jun 2026',
  };

  const kpis = [
    { label:'Total Networks',      value:'8',      sub:'3 countries',        trend:{ dir:'up'   as const, pct:'12%' }, icon:Network,      color:'text-indigo-600',  bg:'bg-indigo-50',  border:'border-indigo-100'  },
    { label:'Total EVSEs',         value:'13,200', sub:'12,840 online',      trend:{ dir:'up'   as const, pct:'4%'  }, icon:BatteryCharging,color:'text-blue-600', bg:'bg-blue-50',    border:'border-blue-100'    },
    { label:'Active Partners',     value:'16',     sub:'CPOs + eMSPs',       trend:{ dir:'up'   as const, pct:'8%'  }, icon:Handshake,    color:'text-emerald-600', bg:'bg-emerald-50', border:'border-emerald-100' },
    { label:'Active Agreements',   value:'14',     sub:'3 pending sig.',     trend:{ dir:'up'   as const, pct:'2%'  }, icon:FileText,     color:'text-violet-600',  bg:'bg-violet-50',  border:'border-violet-100'  },
    { label:'Monthly Revenue',     value:'₵ 94K',  sub:'vs ₵ 81K last month',trend:{ dir:'up'   as const, pct:'16%' }, icon:TrendingUp,   color:'text-emerald-600', bg:'bg-emerald-50', border:'border-emerald-100' },
    { label:'Monthly Sessions',    value:'18,430', sub:'+2,100 vs last mo.', trend:{ dir:'up'   as const, pct:'13%' }, icon:Zap,          color:'text-amber-600',   bg:'bg-amber-50',   border:'border-amber-100'   },
    { label:'Energy Delivered',    value:'841 MWh',sub:'+94 MWh this month', trend:{ dir:'up'   as const, pct:'5%'  }, icon:BarChart2,    color:'text-sky-600',     bg:'bg-sky-50',     border:'border-sky-100'     },
    { label:'Open Disputes',       value:'4',      sub:'2 escalated',        trend:{ dir:'down' as const, pct:'33%' }, icon:AlertTriangle,color:'text-red-600',     bg:'bg-red-50',     border:'border-red-100'     },
    { label:'Pending Signatures',  value:'3',      sub:'1 expires in 2d',    trend:{ dir:'down' as const, pct:'25%' }, icon:FileSignature,color:'text-orange-600',  bg:'bg-orange-50',  border:'border-orange-100'  },
    { label:'Connectors',          value:'29,900', sub:'across all networks', trend:{ dir:'up'  as const, pct:'4%'  }, icon:Plug,         color:'text-teal-600',    bg:'bg-teal-50',    border:'border-teal-100'    },
  ];

  const healthMetrics = [
    { label:'OCPI Connectivity',    value:99.8,  status:'green'  as const, detail:'OCPI 2.2.1 · All endpoints reachable'    },
    { label:'API Availability',     value:99.9,  status:'green'  as const, detail:'24 hr uptime · 12ms avg response'         },
    { label:'EVSE Availability',    value:97.3,  status:'green'  as const, detail:'12,840 / 13,200 online'                   },
    { label:'Network Uptime',       value:98.1,  status:'green'  as const, detail:'All 8 networks reporting'                 },
    { label:'Partner Connectivity', value:94.0,  status:'yellow' as const, detail:'1 of 67 partners offline (VRA EV Charge)' },
    { label:'Last Sync',            value:100,   status:'green'  as const, detail:'24 Jun 2026, 09:38 AM · 13,200 EVSEs'    },
  ];
  const healthScore = Math.round(healthMetrics.reduce((a,m)=>a+m.value,0)/healthMetrics.length);

  const contacts = [
    { role:'Commercial', name:'Emma de Vries',  email:'emma@volta-networks.gh',    phone:'+233 30 292 1100', icon:Handshake,    color:'bg-indigo-50 text-indigo-600'  },
    { role:'Technical',  name:'Lars Bakker',    email:'lars.b@volta-networks.gh',  phone:'+233 30 292 1101', icon:Cpu,          color:'bg-blue-50 text-blue-600'      },
    { role:'Operations', name:'Kofi Mensah',    email:'kofi.m@volta-networks.gh',  phone:'+233 30 292 1102', icon:Settings,     color:'bg-emerald-50 text-emerald-600' },
    { role:'Finance',    name:'Sophie Janssen', email:'sophie@volta-networks.gh',  phone:'+233 30 292 1103', icon:Receipt,      color:'bg-amber-50 text-amber-600'    },
    { role:'Legal',      name:'Abena Osei',     email:'legal@volta-networks.gh',   phone:'+233 30 292 1104', icon:ShieldCheck,  color:'bg-violet-50 text-violet-600'  },
  ];

  const ocpiConfig = {
    version: 'OCPI 2.2.1', role: 'CPO / eMSP', environment: 'Production',
    baseUrl: 'https://api.volta-networks.gh/ocpi/2.2.1',
    tokenA: 'vn_tkA_••••••••••••••4f2a', tokenB: 'vn_tkB_••••••••••••••9c1d',
    status: 'Connected', lastSync: '24 Jun 2026, 09:38 AM',
    endpoints: [
      { name:'Locations',    ok:true,  ms:42  },
      { name:'Sessions',     ok:true,  ms:38  },
      { name:'CDRs',         ok:true,  ms:55  },
      { name:'Tariffs',      ok:true,  ms:29  },
      { name:'Credentials',  ok:true,  ms:18  },
      { name:'Commands',     ok:false, ms:0   },
    ],
  };

  const agreements = [
    { id:'AGR-EU-2026-014', partner:'VRA EV Charge',          status:'active',    type:'Bilateral',   expires:'15 Dec 2026', amount:'₵ 12,400/mo' },
    { id:'AGR-EU-2026-022', partner:'ECG Ghana',              status:'active',    type:'Hub-mediated', expires:'30 Sep 2026', amount:'₵ 9,800/mo'  },
    { id:'AGR-EU-2026-031', partner:'Total Energies Ghana',   status:'active',    type:'Bilateral',   expires:'28 Feb 2027', amount:'₵ 7,200/mo'  },
    { id:'AGR-EU-2026-038', partner:'Goil EV Network',        status:'awaiting',  type:'Bilateral',   expires:'',           amount:'₵ 5,500/mo'  },
    { id:'AGR-EU-2026-040', partner:'Shell Ghana EV',         status:'negotiating',type:'Inbound',    expires:'',           amount:'TBD'          },
    { id:'AGR-EU-2025-007', partner:'GreenMobility GH',       status:'expiring',  type:'Bilateral',   expires:'05 Jul 2026', amount:'₵ 3,100/mo'  },
  ];

  const TOP_NETWORK_NAMES = ['ECG (Electricity Co. Ghana)', 'VRA EV Charge', 'Goil EV Network', 'Shell Ghana EV'];
  const networks = TOP_NETWORK_NAMES
    .map(name => { const n = MARKETPLACE_NETWORKS.find(x => x.name === name)!; return { name: n.name, country: n.country, evses: n.evses, avail: n.availability, latency: parseInt(n.latency) || 0, connectors: n.evseAvailable + n.evseCharging + n.evseInoperative }; });

  const users = [
    { name:'Emma de Vries',  initials:'EV', role:'Super Admin', email:'emma@volta-networks.gh',    lastLogin:'Today 14:22',  status:'Active',   mfa:true  },
    { name:'Lars Bakker',    initials:'LB', role:'Technical',   email:'lars.b@volta-networks.gh',  lastLogin:'Today 09:15',  status:'Active',   mfa:true  },
    { name:'Sophie Janssen', initials:'SJ', role:'Finance',     email:'sophie@volta-networks.gh',  lastLogin:'Yesterday',    status:'Active',   mfa:false },
    { name:'Kofi Mensah',    initials:'KM', role:'Operations',  email:'kofi.m@volta-networks.gh',  lastLogin:'23 Jun 2026',  status:'Active',   mfa:true  },
    { name:'Abena Osei',     initials:'AO', role:'Legal',       email:'legal@volta-networks.gh',   lastLogin:'21 Jun 2026',  status:'Active',   mfa:false },
    { name:'Daan Mulder',    initials:'DM', role:'Support',     email:'daan.m@volta-networks.gh',  lastLogin:'Jun 20',       status:'Inactive', mfa:false },
  ];

  const roleBadge: Record<string,string> = {
    'Super Admin':'bg-violet-100 text-violet-700',
    'Technical':'bg-blue-100 text-blue-700',
    'Finance':'bg-emerald-100 text-emerald-700',
    'Operations':'bg-amber-100 text-amber-700',
    'Legal':'bg-indigo-100 text-indigo-700',
    'Support':'bg-slate-100 text-slate-600',
  };

  const financialSettings = [
    { label:'Base Currency',         value:'GHS (Ghanaian Cedi)'        },
    { label:'Settlement Frequency',  value:'Monthly (last business day)'},
    { label:'Payment Terms',         value:'Net 30'                     },
    { label:'Invoice Prefix',        value:'VN-INV'                     },
    { label:'Tax Rule',              value:'Reverse Charge VAT (0%)'    },
    { label:'Billing Contact',       value:'sophie@volta-networks.gh'   },
    { label:'Bank Account',          value:'GCB Bank · •••• 4412'       },
    { label:'SWIFT / BIC',           value:'GHCBGHAC'                   },
  ];

  const docs = [
    { name:'Business Registration Certificate', type:'PDF', size:'1.2 MB', uploaded:'12 Mar 2019', status:'verified'  },
    { name:'VAT Registration Certificate',      type:'PDF', size:'0.8 MB', uploaded:'12 Mar 2019', status:'verified'  },
    { name:'Public Liability Insurance 2026',   type:'PDF', size:'2.4 MB', uploaded:'01 Jan 2026', status:'verified'  },
    { name:'OCPI Compliance Declaration',       type:'PDF', size:'0.5 MB', uploaded:'15 Feb 2026', status:'verified'  },
    { name:'Master Roaming Agreement NDA',      type:'PDF', size:'1.8 MB', uploaded:'20 Mar 2026', status:'verified'  },
    { name:'PCI-DSS Level 2 Certification',     type:'PDF', size:'3.1 MB', uploaded:'',           status:'pending'   },
  ];

  const auditLogs = [
    { user:'Emma de Vries',  action:'Signed roaming agreement',     module:'Signature',  date:'23 Jun 2026', time:'14:32', type:'success' },
    { user:'System',         action:'EVSE sync completed',          module:'EVSE',       date:'23 Jun 2026', time:'06:00', type:'info'    },
    { user:'Lars Bakker',    action:'Submitted tariff update v2.4', module:'Tariffs',    date:'22 Jun 2026', time:'11:15', type:'info'    },
    { user:'Sophie Janssen', action:'Exported financial report',    module:'Finance',    date:'21 Jun 2026', time:'16:40', type:'info'    },
    { user:'Emma de Vries',  action:'Invited Daan Mulder (Support)',module:'Users',      date:'20 Jun 2026', time:'09:20', type:'success' },
    { user:'System',         action:'PCI-DSS cert flagged Pending', module:'Compliance', date:'15 Jun 2026', time:'00:00', type:'warning' },
    { user:'Sophie Janssen', action:'Raised dispute DIS-2026-0039', module:'Disputes',   date:'18 Jun 2026', time:'13:05', type:'warning' },
    { user:'Lars Bakker',    action:'Rotated API key (Token B)',    module:'Security',   date:'10 Jun 2026', time:'10:00', type:'info'    },
  ];

  const permGroups = [
    { group:'Roaming', color:'bg-indigo-100 text-indigo-700', perms:[
      { name:'View Marketplace',       admin:true,  technical:true,  finance:false, viewer:true  },
      { name:'Create Agreements',      admin:true,  technical:false, finance:false, viewer:false },
      { name:'Sign Documents',         admin:true,  technical:false, finance:false, viewer:false },
      { name:'Manage EVSE Repository', admin:true,  technical:true,  finance:false, viewer:false },
      { name:'Push Tariff Updates',    admin:true,  technical:true,  finance:false, viewer:false },
    ]},
    { group:'Billing', color:'bg-emerald-100 text-emerald-700', perms:[
      { name:'View Invoices',          admin:true,  technical:false, finance:true,  viewer:true  },
      { name:'Raise Disputes',         admin:true,  technical:false, finance:true,  viewer:false },
      { name:'Approve Payments',       admin:true,  technical:false, finance:true,  viewer:false },
      { name:'Export Financial Data',  admin:true,  technical:false, finance:true,  viewer:false },
    ]},
    { group:'Administration', color:'bg-violet-100 text-violet-700', perms:[
      { name:'Manage Users',           admin:true,  technical:false, finance:false, viewer:false },
      { name:'Edit Org Profile',       admin:true,  technical:false, finance:false, viewer:false },
      { name:'View Audit Logs',        admin:true,  technical:true,  finance:true,  viewer:false },
      { name:'API Key Management',     admin:true,  technical:true,  finance:false, viewer:false },
    ]},
    { group:'Monitoring', color:'bg-blue-100 text-blue-700', perms:[
      { name:'View Events & CDRs',     admin:true,  technical:true,  finance:false, viewer:true  },
      { name:'Auth Logs Access',       admin:true,  technical:true,  finance:false, viewer:false },
      { name:'Supervision Dashboard',  admin:true,  technical:true,  finance:false, viewer:true  },
    ]},
  ];
  const roleCols = ['Admin','Technical','Finance','Viewer'] as const;
  type RoleCol = typeof roleCols[number];
  const permKey: Record<RoleCol, keyof typeof permGroups[0]['perms'][0]> = {
    Admin:'admin', Technical:'technical', Finance:'finance', Viewer:'viewer',
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const tabs: { id: OrgTab; label: string }[] = [
    { id:'overview',      label:'Overview'        },
    { id:'contacts',      label:'Contacts'        },
    { id:'agreements',    label:'Agreements'      },
    { id:'users',         label:'Users & Roles'   },
  ];

  const agStatusMeta: Record<string,{ label:string; color:string }> = {
    active:      { label:'Active',      color:'bg-emerald-100 text-emerald-700' },
    awaiting:    { label:'Awaiting Sig',color:'bg-amber-100 text-amber-700'     },
    negotiating: { label:'Negotiating', color:'bg-blue-100 text-blue-700'       },
    expiring:    { label:'Expiring Soon',color:'bg-red-100 text-red-700'        },
    expired:     { label:'Expired',     color:'bg-slate-100 text-slate-500'     },
  };

  const filteredUsers = users.filter(u =>
    !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredAudit = auditLogs.filter(a =>
    !auditSearch || a.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
    a.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
    a.module.toLowerCase().includes(auditSearch.toLowerCase())
  );

  const auditTypeMeta: Record<string,{ icon: React.ElementType; color:string }> = {
    success: { icon: CheckCircle,  color:'bg-emerald-100 text-emerald-600' },
    warning: { icon: AlertTriangle,color:'bg-amber-100 text-amber-600'     },
    info:    { icon: Activity,     color:'bg-blue-100 text-blue-600'       },
  };

  // ── Shared card header ─────────────────────────────────────────────────────
  const SectionCard = ({ title, sub, action, children }: { title:string; sub?:string; action?:React.ReactNode; children:React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-800">{title}</h4>
          {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );

  // ── Tab content renderers ──────────────────────────────────────────────────

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Org header card */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-black text-white border border-white/30 shrink-0">
            {company.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold">{company.name}</h2>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 border border-white/30">{company.type}</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-400/30 border border-emerald-300/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> {company.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[11px] text-white/70">
              <span><span className="text-white/50">Country</span> &nbsp;{company.country}</span>
              <span><span className="text-white/50">Reg No.</span> &nbsp;{company.regNo}</span>
              <span><span className="text-white/50">VAT</span> &nbsp;{company.vatNo}</span>
              <span><span className="text-white/50">Web</span> &nbsp;{company.website}</span>
              <span><span className="text-white/50">Since</span> &nbsp;{company.created}</span>
              <span><span className="text-white/50">Plan</span> &nbsp;<span className="text-white font-semibold">{company.plan}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-col: Health score + Agreement overview + Top network */}
      <div className="grid grid-cols-3 gap-4">
        {/* Health score */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Organisation Health</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-4xl font-black text-emerald-600">{healthScore}</span>
              <span className="text-sm font-bold text-emerald-500 pb-1">/100</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 mt-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all" style={{ width:`${healthScore}%` }} />
            </div>
          </div>
          <div className="space-y-2.5">
            {healthMetrics.map(m => (
              <div key={m.label} className="flex items-center gap-2">
                <OrgStatusDot status={m.status} />
                <span className="text-[11px] text-slate-600 flex-1 truncate">{m.label}</span>
                <OrgHealthBar value={m.value} color={m.status==='green'?'bg-emerald-500':m.status==='yellow'?'bg-amber-400':'bg-red-500'} />
              </div>
            ))}
          </div>
        </div>

        {/* Agreement summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Agreement Status</p>
          {[
            { label:'Active',       count:14, color:'text-emerald-600', bg:'bg-emerald-50 border-emerald-100', bar:'bg-emerald-500', pct:70 },
            { label:'Negotiations', count:2,  color:'text-blue-600',    bg:'bg-blue-50 border-blue-100',       bar:'bg-blue-500',    pct:10 },
            { label:'Awaiting Sig', count:3,  color:'text-amber-600',   bg:'bg-amber-50 border-amber-100',     bar:'bg-amber-500',   pct:15 },
            { label:'Expiring Soon',count:1,  color:'text-red-600',     bg:'bg-red-50 border-red-100',         bar:'bg-red-500',     pct:5  },
          ].map(a => (
            <div key={a.label} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${a.bg}`}>
              <span className={`text-lg font-black tabular-nums ${a.color} w-8`}>{a.count}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-slate-700">{a.label}</p>
                <div className="h-1 rounded-full bg-white/60 mt-1">
                  <div className={`h-1 rounded-full ${a.bar}`} style={{ width:`${a.pct}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Top network */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Top Networks</p>
          {networks.slice(0,4).map(n => (
            <div key={n.name} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-slate-700 truncate">{n.name}</p>
                <p className="text-[10px] text-slate-400">{n.country} · {n.evses.toLocaleString()} EVSEs</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${n.avail>=98?'bg-emerald-50 text-emerald-700':n.avail>=95?'bg-amber-50 text-amber-700':'bg-red-50 text-red-700'}`}>
                {n.avail}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHealth = () => (
    <div className="space-y-4">
      {/* Score banner */}
      <div className={`rounded-2xl p-5 flex items-center gap-6 ${healthScore>=95?'bg-emerald-50 border border-emerald-200':healthScore>=80?'bg-amber-50 border border-amber-200':'bg-red-50 border border-red-200'}`}>
        <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-2 ${healthScore>=95?'border-emerald-300 bg-emerald-100':healthScore>=80?'border-amber-300 bg-amber-100':'border-red-300 bg-red-100'}`}>
          <span className={`text-3xl font-black ${healthScore>=95?'text-emerald-700':healthScore>=80?'text-amber-700':'text-red-700'}`}>{healthScore}</span>
          <span className="text-[10px] font-semibold text-slate-500">/100</span>
        </div>
        <div>
          <p className="text-base font-bold text-slate-800">Overall Health Score</p>
          <p className="text-sm text-slate-500 mt-0.5">{healthScore>=95?'Excellent  all systems operational':healthScore>=80?'Good  minor issues detected':'Action required  critical issues present'}</p>
          <div className="flex items-center gap-4 mt-2">
            {[{c:'bg-emerald-500',l:'Healthy'},{c:'bg-amber-400',l:'Warning'},{c:'bg-red-500',l:'Critical'}].map(x=>(
              <span key={x.l} className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className={`w-2 h-2 rounded-full ${x.c}`}/>{x.l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Health metrics grid */}
      <div className="grid grid-cols-2 gap-4">
        {healthMetrics.map(m => (
          <div key={m.label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <OrgStatusDot status={m.status} />
                <span className="text-sm font-bold text-slate-700">{m.label}</span>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${m.status==='green'?'bg-emerald-100 text-emerald-700':m.status==='yellow'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}`}>
                {m.status==='green'?'Healthy':m.status==='yellow'?'Warning':'Critical'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">{m.detail}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-slate-100">
                <div className={`h-2 rounded-full transition-all ${m.status==='green'?'bg-emerald-500':m.status==='yellow'?'bg-amber-400':'bg-red-500'}`} style={{ width:`${m.value}%` }} />
              </div>
              <span className="text-xs font-bold text-slate-600 w-10 text-right">{m.value}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* OCPI Endpoint diagnostics */}
      <SectionCard title="OCPI Endpoint Diagnostics" sub="Live connection status per endpoint module"
        action={<button data-local onClick={()=>showToast('Running diagnostics…','info')} className="text-[10px] font-semibold text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50">Run Diagnostics</button>}>
        <div className="divide-y divide-slate-50">
          {ocpiConfig.endpoints.map(e => (
            <div key={e.name} className="flex items-center gap-4 px-5 py-3.5">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${e.ok?'bg-emerald-500':'bg-red-500'}`} />
              <span className="text-xs font-semibold text-slate-700 flex-1">{e.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${e.ok?'bg-emerald-50 text-emerald-700':'bg-red-50 text-red-700'}`}>
                {e.ok?'Online':'Offline'}
              </span>
              <span className="text-[10px] text-slate-400 w-16 text-right">{e.ok?`${e.ms} ms`:''}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );

  const renderContacts = () => (
    <div className="grid grid-cols-1 gap-4">
      {contacts.map(c => {
        const Icon = c.icon;
        return (
          <div key={c.role} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.color} border border-current/10 shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-800">{c.name}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{c.role}</span>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-[11px] text-slate-500 flex items-center gap-1"><Send className="w-3 h-3" /> {c.email}</span>
                <span className="text-[11px] text-slate-500">{c.phone}</span>
              </div>
            </div>
            <button data-local onClick={()=>showToast(`Message sent to ${c.name}`, 'success')}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50">
              <Send className="w-3 h-3" /> Message
            </button>
          </div>
        );
      })}
    </div>
  );

  const renderOCPI = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SectionCard title="OCPI Configuration" sub="Connection credentials and environment settings">
          <div className="divide-y divide-slate-50">
            {[
              { label:'OCPI Version',     value: ocpiConfig.version    },
              { label:'Role',             value: ocpiConfig.role        },
              { label:'Environment',      value: ocpiConfig.environment },
              { label:'Base URL',         value: ocpiConfig.baseUrl     },
              { label:'Token A',          value: ocpiConfig.tokenA      },
              { label:'Token B',          value: ocpiConfig.tokenB      },
              { label:'Connection Status',value: ocpiConfig.status      },
              { label:'Last Sync',        value: ocpiConfig.lastSync    },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between px-5 py-3">
                <span className="text-[11px] text-slate-500 w-36 shrink-0">{r.label}</span>
                <span className="text-[11px] font-semibold text-slate-800 text-right font-mono break-all">{r.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Connection Status" sub="Live endpoint health"
          action={<span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>Connected</span>}>
          <div className="divide-y divide-slate-50">
            {ocpiConfig.endpoints.map(e => (
              <div key={e.name} className="flex items-center gap-3 px-5 py-3.5">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${e.ok?'bg-emerald-500':'bg-red-500'}`} />
                <span className="text-xs font-semibold text-slate-700 flex-1">{e.name}</span>
                {e.ok
                  ? <span className="text-[10px] font-mono text-slate-400">{e.ms} ms</span>
                  : <span className="text-[10px] font-bold text-red-600">Offline</span>
                }
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-slate-100">
            <button data-local onClick={()=>showToast('Reconnecting Commands endpoint…','warning')}
              className="w-full text-[11px] font-semibold text-indigo-600 border border-indigo-200 py-2 rounded-lg hover:bg-indigo-50">
              Retry Failed Endpoints
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );

  const renderAgreements = () => (
    <SectionCard title="Agreement Overview" sub={`${agreements.length} total agreements`}>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {['Agreement ID','Partner','Type','Status','Expires','Revenue'].map(h=>(
              <th key={h} className="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-wide text-slate-400">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {agreements.map(a => {
            const sm = agStatusMeta[a.status];
            return (
              <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-mono text-[11px] text-indigo-600 font-semibold">{a.id}</td>
                <td className="py-3 px-4 font-semibold text-slate-800">{a.partner}</td>
                <td className="py-3 px-4 text-slate-500">{a.type}</td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sm.color}`}>{sm.label}</span>
                </td>
                <td className="py-3 px-4 text-slate-500">{a.expires}</td>
                <td className="py-3 px-4 font-semibold text-slate-700">{a.amount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </SectionCard>
  );

  const renderNetwork = () => (
    <SectionCard title="Network Overview" sub="All registered networks and their real-time status">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {['Network','Country','EVSEs','Connectors','Availability','Latency'].map(h=>(
              <th key={h} className="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-wide text-slate-400">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {networks.map(n => (
            <tr key={n.name} className="hover:bg-slate-50 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600"/>
                  </div>
                  <span className="font-semibold text-slate-800">{n.name}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-slate-500">{n.country}</td>
              <td className="py-3 px-4 font-semibold text-slate-700">{n.evses.toLocaleString()}</td>
              <td className="py-3 px-4 text-slate-500">{n.connectors.toLocaleString()}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-slate-100">
                    <div className={`h-1.5 rounded-full ${n.avail>=98?'bg-emerald-500':n.avail>=95?'bg-amber-400':'bg-red-500'}`} style={{width:`${n.avail}%`}}/>
                  </div>
                  <span className={`text-[10px] font-bold ${n.avail>=98?'text-emerald-600':n.avail>=95?'text-amber-600':'text-red-600'}`}>{n.avail}%</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`text-[11px] font-semibold ${n.latency<60?'text-emerald-600':n.latency<100?'text-amber-600':'text-red-600'}`}>{n.latency} ms</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );

  const renderUsers = () => (
    <div className="space-y-4">
      <SectionCard title="User & Role Management" sub={`${users.filter(u=>u.status==='Active').length} active of ${users.length} seats`}
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"/>
              <input value={userSearch} onChange={e=>setUserSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-[11px] text-slate-800 border border-slate-200 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                placeholder="Search users…"/>
            </div>
            <button data-local onClick={()=>showToast('Invite dialog opened')}
              className="flex items-center gap-1.5 text-[11px] font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">
              <Plus className="w-3 h-3"/> Invite
            </button>
          </div>
        }>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['User','Email','Role','MFA','Status','Last Login'].map(h=>(
                <th key={h} className="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-wide text-slate-400">{h}</th>
              ))}
              <th/>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map(u=>(
              <tr key={u.name} className={`hover:bg-slate-50 transition-colors ${u.status==='Inactive'?'opacity-50':''}`}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">{u.initials}</div>
                    <span className="font-semibold text-slate-800">{u.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-400 text-[10px]">{u.email}</td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadge[u.role]||'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                </td>
                <td className="py-3 px-4">
                  {u.mfa
                    ? <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold"><ShieldCheck className="w-3 h-3"/> On</span>
                    : <span className="text-[10px] text-amber-500 font-bold">Off</span>
                  }
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${u.status==='Active'?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-500'}`}>
                    <span className={`w-1 h-1 rounded-full ${u.status==='Active'?'bg-emerald-500':'bg-slate-400'}`}/>{u.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400">{u.lastLogin}</td>
                <td className="py-3 px-2">
                  <button data-local onClick={()=>showToast(`Managing ${u.name}`)} className="text-slate-300 hover:text-slate-600">
                    <MoreHorizontal className="w-4 h-4"/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </div>
  );

  const renderFinance = () => (
    <div className="grid grid-cols-2 gap-4">
      <SectionCard title="Financial Settings" sub="Currency, billing and settlement configuration"
        action={<button data-local onClick={()=>showToast('Settings saved','success')} className="text-[11px] font-semibold text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50">Edit Settings</button>}>
        <div className="divide-y divide-slate-50">
          {financialSettings.map(r=>(
            <div key={r.label} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-[11px] text-slate-500">{r.label}</span>
              <span className="text-[11px] font-semibold text-slate-800">{r.value}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Tax & Invoicing Rules" sub="VAT, reverse charge and regional overrides">
        <div className="p-5 space-y-3">
          {[
            { country:'Ghana',    rule:'VAT 15% (Standard)',      active:true  },
            { country:'Brazil',   rule:'ISS 5% (Municipal)',      active:true  },
            { country:'Colombia', rule:'IVA 19% (Standard)',      active:true  },
            { country:'EU Cross-border', rule:'Reverse Charge 0%',active:true  },
          ].map(t=>(
            <div key={t.country} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-700">{t.country}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{t.rule}</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Active</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );

  const renderDocs = () => (
    <SectionCard title="Compliance Documents" sub="Upload and manage all regulatory and legal files"
      action={<button data-local onClick={()=>showToast('Upload dialog opened')} className="flex items-center gap-1.5 text-[11px] font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"><Plus className="w-3 h-3"/>Upload Document</button>}>
      <div className="divide-y divide-slate-50">
        {docs.map(d=>(
          <div key={d.name} className="flex items-center gap-4 px-5 py-4">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-red-500"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{d.name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{d.type} · {d.size} · Uploaded {d.uploaded}</p>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${d.status==='verified'?'bg-emerald-50 text-emerald-700 border border-emerald-100':'bg-amber-50 text-amber-700 border border-amber-100'}`}>
              {d.status==='verified'?'Verified':'Pending'}
            </span>
            <button data-local onClick={()=>showToast(`Downloading ${d.name}`,'info')}
              className="text-slate-300 hover:text-slate-600 ml-1">
              <Download className="w-4 h-4"/>
            </button>
          </div>
        ))}
      </div>
    </SectionCard>
  );

  const renderNotifications = () => (
    <SectionCard title="Notification Preferences" sub="Manage which events trigger alerts for your team">
      <div className="divide-y divide-slate-50">
        {[
          { key:'agreementUpdates',    label:'Agreement Updates',        sub:'New, amended or expired roaming agreements'    },
          { key:'signatureRequests',   label:'Signature Requests',       sub:'Pending e-signature requests requiring action' },
          { key:'invoiceAlerts',       label:'Invoice Alerts',           sub:'New invoices, overdue payments and reminders'  },
          { key:'disputeAlerts',       label:'Dispute Alerts',           sub:'New disputes and escalation notifications'     },
          { key:'evseFaults',          label:'EVSE Fault Alerts',        sub:'Critical faults and availability drops'        },
          { key:'partnerConnectivity', label:'Partner Connectivity',     sub:'Partner OCPI connection up/down events'        },
        ].map(n=>(
          <div key={n.key} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-xs font-semibold text-slate-700">{n.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{n.sub}</p>
            </div>
            <button data-local
              onClick={()=>{ setNotifPrefs(p=>({...p,[n.key]:!p[n.key]})); showToast(`${n.label} ${!notifPrefs[n.key]?'enabled':'disabled'}`, !notifPrefs[n.key]?'success':'warning'); }}
              className={`relative w-10 h-5.5 rounded-full transition-colors flex items-center px-0.5 ${notifPrefs[n.key]?'bg-indigo-600':'bg-slate-200'}`}
              style={{ height:'22px' }}>
              <span className={`w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${notifPrefs[n.key]?'translate-x-[18px]':'translate-x-0'}`} style={{width:'18px',height:'18px',display:'block',transition:'transform 0.2s'}}/>
            </button>
          </div>
        ))}
      </div>
    </SectionCard>
  );

  const renderAudit = () => (
    <SectionCard title="Audit Log" sub="Complete activity history"
      action={
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"/>
            <input value={auditSearch} onChange={e=>setAuditSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-[11px] text-slate-800 border border-slate-200 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              placeholder="Search logs…"/>
          </div>
          <button data-local onClick={()=>showToast('Audit log exported','success')} className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50"><Download className="w-3 h-3"/>Export</button>
        </div>
      }>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {['','User','Action','Module','Date','Time'].map(h=>(
              <th key={h} className="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-wide text-slate-400">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {filteredAudit.map((a,i)=>{
            const meta = auditTypeMeta[a.type];
            const Icon = meta.icon;
            return (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${meta.color}`}>
                    <Icon className="w-3.5 h-3.5"/>
                  </div>
                </td>
                <td className="py-3 px-4 font-semibold text-slate-700">{a.user}</td>
                <td className="py-3 px-4 text-slate-600">{a.action}</td>
                <td className="py-3 px-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{a.module}</span>
                </td>
                <td className="py-3 px-4 text-slate-400">{a.date}</td>
                <td className="py-3 px-4 text-slate-400">{a.time}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </SectionCard>
  );

  const tabRender: Partial<Record<OrgTab, ()=>React.ReactNode>> = {
    overview: renderOverview,
    contacts: renderContacts,
    agreements: renderAgreements,
    users: renderUsers,
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[9999] text-white text-sm px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 ${toast.type==='success'?'bg-emerald-600':toast.type==='warning'?'bg-amber-500':'bg-slate-800'}`}>
          <CheckCircle className="w-4 h-4 text-white/80" /> {toast.msg}
        </div>
      )}

      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Organisation Hub</h2>
          <p className="text-xs text-slate-400 mt-0.5">{company.name} · EV Roaming Platform · OCPI 2.2.1</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Health {healthScore}/100
          </span>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-0 scrollbar-none">
        {tabs.map(t => (
          <button key={t.id} data-local onClick={() => setActiveTab(t.id)}
            className={`shrink-0 px-4 py-2.5 text-[12px] font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === t.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab body */}
      <div>
        {(tabRender[activeTab] ?? renderOverview)()}
      </div>
    </div>
  );
}

function renderCompany() {
  return <CompanyWorkspace />;
}

// â"₵â"₵ Overview â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵

// â"₵â"₵ Overview sparkline helper â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵
function Sparkline({ data, color = '#6366f1', w = 80, h = 28 }: { data: number[]; color?: string; w?: number; h?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// â"₵â"₵ Overview Workspace â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵
function OverviewWorkspace({ goTo }: { goTo: (id: NavId) => void }) {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [refreshTs, setRefreshTs] = useState('Just now');
  const [refreshing, setRefreshing] = useState(false);

  /* Live EV station data — shared across KPI cards + LiveStationsPanel */
  const { stations: liveStations, loading: liveLoading, error: liveError, updatedAt: liveUpdatedAt } = useLiveStations();

  /* Derived KPIs from live data */
  const liveActiveSessions  = liveStations.reduce((s, st) => s + st.occupiedConnectors, 0);
  const liveConnectedEVSEs  = liveStations.reduce((s, st) => s + st.totalConnectors, 0);
  const liveActivePartners  = new Set(liveStations.map(st => st.stationName.split(' ')[0])).size;

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setRefreshTs(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1200);
  };

  const ALERTS = [
    { id:'a1', sev:'critical', icon: WifiOff,      title:'VRA EV Charge API offline',             body:'Connection down 18 min · 3 active sessions impacted',         cta:'Check Connectivity', nav:'marketplace' as NavId },
    { id:'a2', sev:'warning',  icon: Receipt,       title:'Invoice overdueGoil EV Network',        body:'INV-2026-0058 · ₵ 19,990 · 13 days past due',                  cta:'View Invoice',       nav:'invoicing'   as NavId },
    { id:'a3', sev:'warning',  icon: AlertTriangle, title:'4 disputes need your response',   body:'DIS-2026-0041 (VRA EV Charge) open 4 days with no partner reply',    cta:'Open Disputes',      nav:'disputes'    as NavId },
  ];
  const visibleAlerts = ALERTS.filter(a => !dismissedAlerts.includes(a.id));

  const partners = [
    { name:'ECG Ghana',     proto:'OCPI 2.2', ok:true,  ms:42, uptime:99.9, sla:'✓' },
    { name:'Total Energies Ghana', proto:'OCPI 2.2', ok:true,  ms:78, uptime:99.7, sla:'✓' },
    { name:'Goil EV Network',        proto:'OCPI 2.2', ok:true,  ms:55, uptime:99.8, sla:'✓' },
    { name:'VRA EV Charge',       proto:'OCPI 2.2', ok:false, ms:0,  uptime:98.1, sla:'!' },
    { name:'Shell Ghana EV', proto:'OCPI 2.2', ok:true,  ms:91, uptime:99.5, sla:'✓' },
    { name:'GreenMobility GH',proto:'OCPI 2.2', ok:true,  ms:63, uptime:99.6, sla:'✓' },
  ];
  const offlineCount = partners.filter(p => !p.ok).length;
  const systemOk = offlineCount === 0 && visibleAlerts.filter(a => a.sev === 'critical').length === 0;
  const systemWarn = !systemOk && offlineCount < 2;

  const revenueMonths = [
    { m:'Jan', actual:28.1, forecast:null },
    { m:'Feb', actual:30.4, forecast:null },
    { m:'Mar', actual:31.9, forecast:null },
    { m:'Apr', actual:33.2, forecast:null },
    { m:'May', actual:36.8, forecast:null },
    { m:'Jun', actual:38.4, forecast:null },
    { m:'Jul', actual:null, forecast:41.2 },
    { m:'Aug', actual:null, forecast:44.0 },
  ];
  const maxRev = 50;

  const cdrMonths = [
    { m:'Jan', cur:58, prev:41 }, { m:'Feb', cur:63, prev:47 },
    { m:'Mar', cur:71, prev:52 }, { m:'Apr', cur:80, prev:60 },
    { m:'May', cur:87, prev:65 }, { m:'Jun', cur:94, prev:70 },
  ];
  const CHART_H = 140;

  const insights = [
    { icon:'📈', text:'CDR volume has grown 35% YoYJun 2026 pace is your highest ever.' },
    { icon:'⚠️', text:'VRA EV Charge latency spiked 3× before going offlinemonitor for recurrence after reconnection.' },
    { icon:'💰', text:'Revenue forecast projects 41.2K GHS in Juldriven by Goil EV Network session growth (+18% MoM).' },
    { icon:'🔍', text:'Energy mismatch disputes are up 2× this month. Consider automated meter-log cross-check.' },
    { icon:'✅', text:'Auth success rate 99.3%highest in 90 days. No action required.' },
  ];

  const funnel = [
    { label:'Auth Requests',   value:1923100, pct:100,  color:'bg-indigo-600' },
    { label:'Auth Approved',   value:1907500, pct:99.2, color:'bg-indigo-500' },
    { label:'Sessions Started',value:94231,   pct:4.9,  color:'bg-violet-500' },
    { label:'CDRs Generated',  value:94040,   pct:99.8, color:'bg-blue-500'   },
    { label:'CDRs Validated',  value:93812,   pct:99.8, color:'bg-emerald-500'},
    { label:'Invoiced',        value:92100,   pct:98.2, color:'bg-teal-500'   },
  ];
  const maxFunnel = funnel[0].value;

  // Coverage dots (Europe + Africa simplified positions on a 340×220 box)
  const dots = [
    { x:155, y:58,  label:'NL', active:true  }, { x:148, y:65,  label:'BE', active:true  },
    { x:162, y:62,  label:'DE', active:true  }, { x:140, y:75,  label:'FR', active:true  },
    { x:175, y:70,  label:'PL', active:true  }, { x:130, y:80,  label:'ES', active:false },
    { x:150, y:80,  label:'CH', active:true  }, { x:165, y:78,  label:'AT', active:false },
    { x:155, y:45,  label:'DK', active:true  }, { x:158, y:38,  label:'SE', active:false },
    { x:148, y:52,  label:'UK', active:true  }, { x:175, y:60,  label:'CZ', active:false },
    { x:185, y:85,  label:'HU', active:false }, { x:190, y:95,  label:'RO', active:false },
    { x:105, y:165, label:'GH', active:true  }, { x:115, y:175, label:'NG', active:false },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">Volta Networks · Refreshed {refreshTs}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500" />
            All Systems Operational
          </span>
          <button data-local onClick={handleRefresh} className="flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 disabled:opacity-50" disabled={refreshing}>
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>


      {/* Live EV Stations Nearby — real TomTom API data */}
      <LiveStationsPanel goTo={goTo} stations={liveStations} loading={liveLoading} error={liveError} updatedAt={liveUpdatedAt} />

      {/* â"₵â"₵ Primary KPI row â"₵â"₵ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { title:'Active Sessions',  value: liveLoading ? '…' : String(liveActiveSessions),  sub:'Right now · live',        icon:Zap,           trend:'+12%',  up:true,  spark:[42,55,48,61,70,74,liveActiveSessions||78], color:'#6366f1', nav:'events'       as NavId, badge:'Live' },
          { title:'CDRs This Month',  value:'94,231',   sub:'Jun 2026',             icon:FileText,      trend:'+8%',   up:true,  spark:[72,78,81,84,88,91,94],              color:'#6366f1', nav:'cdr_exchange'  as NavId, badge:null   },
          { title:'Roaming Revenue',  value:'₵ 38,440', sub:'Billed this month',    icon:TrendingUp,    trend:'+5.2%', up:true,  spark:[28,30.4,31.9,33.2,36.8,38.4],      color:'#10b981', nav:'invoicing'     as NavId, badge:null   },
          { title:'Open Disputes',    value:'4',        sub:'Require attention',    icon:AlertTriangle, trend:'-2 today', up:true, spark:[8,6,5,7,6,5,4],                  color:'#f59e0b', nav:'disputes'      as NavId, badge:'4 open' },
        ].map(k => (
          <button key={k.title} data-local onClick={() => goTo(k.nav)}
            className="bg-white rounded-xl border border-slate-200 p-4 text-left hover:border-indigo-300 hover:shadow-md transition-all group focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors flex-shrink-0">
                  <k.icon className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-xs font-semibold text-slate-500 leading-tight">{k.title}</span>
              </div>
              <div className="flex items-center gap-2">
                {k.badge && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600">{k.badge}</span>}
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 tabular-nums">{k.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{k.sub}</div>
            <div className={`text-[11px] font-semibold mt-1.5 ${k.up ? 'text-emerald-600' : 'text-rose-600'}`}>{k.trend} vs last month</div>
            <div className="text-[10px] text-indigo-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Drill down →</div>
          </button>
        ))}
      </div>

      {/* â"₵â"₵ Secondary KPI row â"₵â"₵ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { title:'Active Partners',   value: liveLoading ? '…' : String(liveActivePartners || 16),  sub:'CPOs + eMSPs · live',      icon:Network,    spark:[10,11,12,13,15,liveActivePartners||16],    nav:'marketplace'  as NavId },
          { title:'Connected EVSEs',   value: liveLoading ? '…' : liveConnectedEVSEs > 0 ? liveConnectedEVSEs.toLocaleString() : '12,840', sub: liveConnectedEVSEs > 0 ? `${liveStations.length} stations · live` : 'of 13,200 total (97%)', icon:MapPin, spark:[12200,12400,12600,12700,12800,liveConnectedEVSEs||12840], nav:'evse_repo' as NavId },
          { title:'Auth Success Rate', value:'99.3%',  sub:'Last 24 h · +0.1%',    icon:ShieldCheck,spark:[98.8,99.0,99.1,99.0,99.2,99.3], nav:'authorisation' as NavId },
          { title:'Pending Invoices',  value:'6',      sub:'₵ 39,190 outstanding',  icon:Receipt,    spark:[3,4,5,5,6,6],          nav:'invoicing'    as NavId },
        ].map(k => (
          <button key={k.title} data-local onClick={() => goTo(k.nav)}
            className="bg-white rounded-xl border border-slate-100 px-4 py-3 text-left hover:border-indigo-200 hover:shadow-sm transition-all group focus:outline-none focus:ring-2 focus:ring-indigo-300 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 flex-shrink-0">
              <k.icon className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide truncate mb-0.5">{k.title}</div>
              <div className="text-base font-bold text-slate-800 tabular-nums">{k.value}</div>
              <div className="text-[10px] text-slate-400 truncate">{k.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {/* â"₵â"₵ Quick Actions â"₵â"₵ */}
      <div className="bg-white rounded-xl border border-slate-100 px-4 py-3 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-2">Quick Actions</span>
        {[
          { label:'New Dispute',      icon:AlertTriangle, nav:'disputes'     as NavId, color:'text-rose-600 bg-rose-50 border-rose-200' },
          { label:'View CDR Feed',    icon:FileText,      nav:'cdr_exchange' as NavId, color:'text-indigo-600 bg-indigo-50 border-indigo-200' },
          { label:'Check Invoices',   icon:Receipt,       nav:'invoicing'    as NavId, color:'text-amber-600 bg-amber-50 border-amber-200' },
          { label:'Marketplace',      icon:Network,       nav:'marketplace'  as NavId, color:'text-emerald-600 bg-emerald-50 border-emerald-200' },
          { label:'Auth Logs',        icon:ShieldCheck,   nav:'authorisation' as NavId, color:'text-violet-600 bg-violet-50 border-violet-200' },
          { label:'EVSE Repository',  icon:Database,      nav:'evse_repo'    as NavId, color:'text-blue-600 bg-blue-50 border-blue-200' },
        ].map(a => (
          <button key={a.label} data-local onClick={() => goTo(a.nav)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${a.color} hover:opacity-80 transition-opacity`}>
            <a.icon className="w-3.5 h-3.5" /> {a.label}
          </button>
        ))}
      </div>

      {/* AI Insights · Partner connectivity · Recent CDRs */}
      <div className="grid grid-cols-3 gap-4">

        {/* AI Insights */}
        <div className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-indigo-100 flex items-center gap-2" style={{ background:'linear-gradient(135deg,#eef2ff,#f5f3ff)' }}>
            <span className="text-base">✦</span>
            <div>
              <h3 className="text-xs font-bold text-indigo-800">AI Insights</h3>
              <p className="text-[10px] text-indigo-400">Auto-detected from live data</p>
            </div>
          </div>
          <div className="px-4 py-3 space-y-2.5">
            {insights.map((ins, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-sm flex-shrink-0 mt-0.5 text-slate-700">{ins.icon}</span>
                <p className="text-xs text-slate-600 leading-relaxed">{ins.text}</p>
              </div>
            ))}
          </div>
          <div className="px-4 pb-3">
            <p className="text-[10px] text-slate-400">Updated · Jun 23, 2026 14:32</p>
          </div>
        </div>

        {/* Partner Connectivity enhanced */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100" style={{minHeight:0}}>
            <div>
              <h3 className="text-sm font-bold text-slate-700">Partner Connectivity</h3>
              <p className="text-[10px] text-slate-400">
                {offlineCount > 0
                  ? <span className="text-rose-500 font-semibold">{offlineCount} offline</span>
                  : <span className="text-emerald-600 font-semibold">All online</span>
                } · {partners.length} partners
              </p>
            </div>
            <button data-local onClick={() => goTo('marketplace')} className="text-[10px] text-indigo-600 font-semibold hover:underline">View all</button>
          </div>
          <div className="divide-y divide-slate-50">
            {partners.map(p => (
              <div key={p.name} className={`flex items-center gap-2 px-4 py-2.5 ${!p.ok ? 'bg-rose-50' : ''}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.ok ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                <span className="flex-1 text-xs font-medium text-slate-700 truncate">{p.name}</span>
                <span className="text-[10px] text-slate-400 hidden xl:inline w-16">{p.proto}</span>
                <span className={`text-[10px] font-mono w-10 text-right ${p.ok ? 'text-slate-500' : 'text-rose-500 font-bold'}`}>
                  {p.ok ? `${p.ms}ms` : 'DOWN'}
                </span>
                <span className={`text-[10px] w-10 text-right font-semibold ${p.uptime >= 99.5 ? 'text-emerald-600' : p.uptime >= 99 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {p.uptime}%
                </span>
                <span className={`text-[10px] font-bold ${p.sla === '✓' ? 'text-emerald-500' : 'text-rose-500'}`}>{p.sla}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent CDRs */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-700">Recent CDRs</h3>
              <p className="text-[10px] text-slate-400">Last 5 records · updated 2m ago</p>
            </div>
            <button data-local onClick={() => goTo('cdr_exchange')} className="text-[10px] text-indigo-600 font-semibold hover:underline">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['CDR ID','Partner','kWh','Amount','Status'].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { id:'#8821', partner:'ECG Ghana',           kwh:'24.7', amt:'₵ 8.41',  status:'Validated', sc:'bg-emerald-100 text-emerald-700' },
                  { id:'#8820', partner:'Total Energies Ghana',kwh:'11.2', amt:'₵ 3.81',  status:'Pending',   sc:'bg-amber-100 text-amber-700'   },
                  { id:'#8819', partner:'Goil EV Network',     kwh:'62.0', amt:'₵ 22.10', status:'Validated', sc:'bg-emerald-100 text-emerald-700' },
                  { id:'#8817', partner:'VRA EV Charge',       kwh:'8.4',  amt:'₵ 2.94',  status:'Disputed',  sc:'bg-rose-100 text-rose-700'     },
                  { id:'#8815', partner:'Shell Ghana EV',      kwh:'33.1', amt:'₵ 11.25', status:'Validated', sc:'bg-emerald-100 text-emerald-700' },
                ].map(r => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3"><span className="font-mono text-indigo-600 font-semibold">{r.id}</span></td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{r.partner}</td>
                    <td className="py-2.5 px-3 text-slate-600 text-right tabular-nums">{r.kwh}</td>
                    <td className="py-2.5 px-3 text-slate-700 text-right font-semibold tabular-nums">{r.amt}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.sc}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* â"₵â"₵ 2-col: CDR Volume + Revenue Forecast â"₵â"₵ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* CDR Volume */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-sm font-bold text-slate-700">CDR VolumeLast 6 Months</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">vs prior year · thousands</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-indigo-500" />2026</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-slate-200" />2025</span>
            </div>
          </div>
          <div className="relative mt-4" style={{ height: CHART_H }}>
            {[25, 50, 75, 100].map(pct => (
              <div key={pct} className="absolute inset-x-0 border-t border-slate-100 flex items-center" style={{ bottom:`${pct}%` }}>
                <span className="text-[9px] text-slate-300 translate-y-3 pr-1 w-7 text-right shrink-0">
                  {pct === 100 ? '100K' : pct === 75 ? '75K' : pct === 50 ? '50K' : '25K'}
                </span>
              </div>
            ))}
            <div className="absolute inset-0 flex items-end gap-1.5 pl-8">
              {cdrMonths.map(d => {
                const curH  = Math.round((d.cur  / 100) * CHART_H);
                const prevH = Math.round((d.prev / 100) * CHART_H);
                const pct   = Math.round(((d.cur - d.prev) / d.prev) * 100);
                return (
                  <div key={d.m} className="flex-1 flex flex-col items-center group">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      +{pct}% YoY
                    </div>
                    <div className="w-full flex items-end justify-center gap-0.5" style={{ height: CHART_H }}>
                      <div className="w-5/12 rounded-t bg-slate-200 hover:bg-slate-300 transition-colors" style={{ height:prevH }} />
                      <div className="w-5/12 rounded-t bg-indigo-500 hover:bg-indigo-600 transition-colors" style={{ height:curH }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex gap-1.5 pl-8 mt-1">
            {cdrMonths.map(d => <div key={d.m} className="flex-1 text-center text-[10px] text-slate-400">{d.m}</div>)}
          </div>
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
            {[
              { label:'Total 2026', value:'453K', up:true  },
              { label:'Total 2025', value:'335K', up:false },
              { label:'YoY',        value:'+35%', up:true  },
              { label:'MoM',        value:'+8%',  up:true  },
            ].map(s => (
              <div key={s.label} className="flex-1 text-center">
                <p className={`text-xs font-bold ${s.up ? 'text-indigo-600' : 'text-slate-500'}`}>{s.value}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Forecast */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-sm font-bold text-slate-700">Revenue Forecast</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Actual + 2-month projection · ₵K</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500" />Actual</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-200 border border-dashed border-emerald-400" />Forecast</span>
            </div>
          </div>
          <div className="relative mt-4" style={{ height: CHART_H }}>
            {[25, 50, 75, 100].map(pct => (
              <div key={pct} className="absolute inset-x-0 border-t border-slate-100" style={{ bottom:`${pct}%` }}>
                <span className="text-[9px] text-slate-300 pr-1 w-7 text-right block translate-y-3">{Math.round(maxRev * pct / 100)}K</span>
              </div>
            ))}
            <div className="absolute inset-0 flex items-end gap-1.5 pl-8">
              {revenueMonths.map(d => {
                const val = d.actual ?? d.forecast ?? 0;
                const barH = Math.round((val / maxRev) * CHART_H);
                const isForecast = d.actual === null;
                return (
                  <div key={d.m} className="flex-1 flex flex-col items-center group">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      ₵ {val}K
                    </div>
                    <div className="w-full flex items-end justify-center" style={{ height: CHART_H }}>
                      <div className={`w-8/12 rounded-t transition-colors ${isForecast ? 'bg-emerald-200 border border-dashed border-emerald-400 hover:bg-emerald-300' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                        style={{ height:barH }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex gap-1.5 pl-8 mt-1">
            {revenueMonths.map(d => <div key={d.m} className={`flex-1 text-center text-[10px] ${d.actual === null ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>{d.m}</div>)}
          </div>
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
            {[
              { label:'Jun Actual',   value:'₵ 38.4K', color:'text-emerald-600' },
              { label:'Jul Forecast', value:'₵ 41.2K', color:'text-emerald-500' },
              { label:'Aug Forecast', value:'₵ 44.0K', color:'text-emerald-500' },
              { label:'Q3 Target',    value:'₵ 120K',  color:'text-indigo-600'  },
            ].map(s => (
              <div key={s.label} className="flex-1 text-center">
                <p className={`text-xs font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

/* ── Live EV Stations panel (Overview) ─────────────────────────────────────── */
/* Hook — fetches live stations once and refreshes every 30s */
function useLiveStations() {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const load = async (lat: number, lng: number) => {
      try {
        const url = `https://api.tomtom.com/search/2/nearbySearch/.json?lat=${lat}&lon=${lng}&radius=10000&categorySet=7309&limit=20&key=${TOMTOM_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`TomTom ${res.status}`);
        const data: any = await res.json();
        if (cancelled) return;
        const mapped: ChargingStation[] = ((data.results ?? []) as any[]).map((item: any) => {
          const id    = item.id ?? String(Math.random());
          const total = (String(id).split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0) % 5) + 2;
          const conns = simulateOCPI(id, total);
          const rf    = mapTomTomToRFStation(item, '', 'DE', 0, conns);
          const available = conns.filter(c => c.status === 'Available').length;
          const occupied  = conns.filter(c => c.status === 'Occupied').length;
          const waiting   = conns.reduce((s, c) => s + c.waitingDrivers, 0);
          const maxPower  = Math.max(...conns.map(c => c.powerKW), 0);
          return {
            id,
            stationName:         rf.stationName,
            latitude:            rf.latitude || lat,
            longitude:           rf.longitude || lng,
            address:             rf.address,
            connectorType:       [...new Set(conns.map(c => c.type))].slice(0, 2).join(' · '),
            availableConnectors: available,
            occupiedConnectors:  occupied,
            totalConnectors:     total,
            chargingSpeed:       maxPower > 0 ? `${maxPower} kW` : 'AC',
            stationStatus:       (available > 0 ? 'Available' : occupied > 0 ? 'Busy' : 'Offline') as ChargingStation['stationStatus'],
            operatingHours:      rf.openingHours,
            distance:            rf.distance || Math.round(((item.dist ?? 0) / 1000) * 10) / 10,
            waitingDrivers:      waiting,
            estimatedWaitTime:   waiting * 15,
            connectors:          conns,
            lastUpdated:         rf.lastUpdated,
          };
        });
        setStations(mapped);
        setUpdatedAt(new Date());
        setError('');
      } catch {
        if (!cancelled) setError('Could not load live station data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const start = (lat: number, lng: number) => {
      load(lat, lng);
      timer = setInterval(() => load(lat, lng), 30000);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        p => { if (!cancelled) start(p.coords.latitude, p.coords.longitude); },
        () => { if (!cancelled) start(51.2010, 10.5120); },
        { timeout: 5000 }
      );
    } else {
      start(51.2010, 10.5120);
    }

    return () => { cancelled = true; if (timer) clearInterval(timer); };
  }, []);

  return { stations, loading, error, updatedAt };
}

interface LiveStationsPanelProps {
  goTo:      (id: NavId) => void;
  stations:  ChargingStation[];
  loading:   boolean;
  error:     string;
  updatedAt: Date | null;
}

function LiveStationsPanel({ goTo, stations, loading, error, updatedAt }: LiveStationsPanelProps) {
  const totalAvailable = stations.filter(s => s.stationStatus === 'Available').length;
  const totalBusy      = stations.filter(s => s.stationStatus === 'Busy').length;
  const totalWaiting   = stations.reduce((s, x) => s + x.waitingDrivers, 0);
  const nearest        = [...stations].sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)).slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              Live EV Stations Nearby
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              TomTom · OCPI status · refreshes every 30s
              {updatedAt && ` · updated ${updatedAt.toLocaleTimeString()}`}
            </p>
          </div>
        </div>
        <button data-local onClick={() => goTo('nearby_stations')} className="text-[10px] text-indigo-600 font-semibold hover:underline">View all</button>
      </div>

      {loading ? (
        <div className="px-4 py-6 text-center text-xs text-slate-400">Loading nearby stations…</div>
      ) : error ? (
        <div className="px-4 py-6 text-center text-xs text-rose-500 flex items-center justify-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" /> {error}
        </div>
      ) : stations.length === 0 ? (
        <div className="px-4 py-6 text-center text-xs text-slate-400">No stations found within 10 KM.</div>
      ) : (
        <>
          <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
            {[
              { label: 'Stations', value: stations.length, color: 'text-slate-800' },
              { label: 'Available', value: totalAvailable, color: 'text-emerald-600' },
              { label: 'Busy', value: totalBusy, color: 'text-amber-600' },
              { label: 'Waiting Drivers', value: totalWaiting, color: 'text-indigo-600' },
            ].map(s => (
              <div key={s.label} className="px-4 py-2.5 text-center">
                <div className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</div>
                <div className="text-[9px] uppercase tracking-wide text-slate-400 font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="divide-y divide-slate-50">
            {nearest.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.stationStatus === 'Available' ? 'bg-emerald-500' : s.stationStatus === 'Busy' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-700 truncate">{s.stationName}</div>
                  <div className="text-[10px] text-slate-400 truncate">{s.address || '—'}</div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap hidden sm:inline">{s.distance} km</span>
                <span className="text-[10px] text-slate-500 whitespace-nowrap hidden md:inline">{s.chargingSpeed}</span>
                <span className="text-[10px] font-semibold text-slate-600 whitespace-nowrap tabular-nums">
                  {s.availableConnectors}/{s.totalConnectors} free
                </span>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                  s.stationStatus === 'Available' ? 'bg-emerald-100 text-emerald-700'
                  : s.stationStatus === 'Busy' ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700'}`}>
                  {s.stationStatus}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function renderOverview(goTo: (id: NavId) => void) {
  return <OverviewWorkspace goTo={goTo} />;
}


// â"₵â"₵ Ghana EV Map (Leaflet / OpenStreetMap) â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵
import L from 'leaflet';

interface GhanaEVMapProps {
  accessPoints: MarketplaceAccessPoint[];
  selectedNetwork: MarketplaceNetwork;
  selectedAccessPoint: MarketplaceAccessPoint;
  onSelectAP: (ap: MarketplaceAccessPoint, network: MarketplaceNetwork) => void;
  userSelectedRef: React.MutableRefObject<boolean>;
}

const AP_STATUS_COLOR: Record<MarketplaceAccessPoint['status'], string> = {
  Available:   '#10b981',
  Charging:    '#2563eb',
  Reserved:    '#f59e0b',
  Inoperative: '#ef4444',
};

function RegionalEVMap({ accessPoints, selectedNetwork, selectedAccessPoint, onSelectAP, userSelectedRef }: GhanaEVMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const markersRef   = useRef<L.CircleMarker[]>([]);
  const onSelectRef  = useRef(onSelectAP);
  useEffect(() => { onSelectRef.current = onSelectAP; });

  const displayAPs = accessPoints;

  const countryName: { [key: string]: string } = {
    'GH': 'Ghana', 'NG': 'Nigeria', 'CI': "Côte d'Ivoire",
    'BR': 'Brazil', 'MX': 'Mexico', 'CO': 'Colombia', 'CL': 'Chile', 'AR': 'Argentina'
  };

  const countryCenter: { [key: string]: [number, number, number] } = {
    'GH': [7.2, -1.2, 7],    'NG': [9.0, 8.6, 6],    'CI': [6.8, -5.5, 7],
    'BR': [-14.2, -51.9, 4], 'MX': [23.6, -102.5, 4], 'CO': [4.5, -74.3, 6],
    'CL': [-30, -71, 4],     'AR': [-38.4, -63.6, 4],
    'DE': [51.1657, 10.4515, 6],
  };

  const getMapCenter = () => {
    // Always start on Germany — live TomTom data is centered there
    return { center: [51.1657, 10.4515], zoom: 6 };
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const { center, zoom } = getMapCenter();
    const map = L.map(containerRef.current, {
      center: center as [number, number],
      zoom,
      zoomControl: true,
      attributionControl: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    displayAPs.forEach(ap => {
      const isSelected = ap.id === selectedAccessPoint.id;
      const isLive = ap.tariff === 'LIVE';
      const color = AP_STATUS_COLOR[ap.status] ?? '#94a3b8';
      const marker = L.circleMarker([ap.lat, ap.lng], {
        radius:      isSelected ? 11 : 8,
        color:       isSelected ? '#4f46e5' : isLive ? '#7c3aed' : '#fff',
        weight:      isSelected ? 3 : 2,
        fillColor:   color,
        fillOpacity: isSelected ? 1 : 0.85,
        opacity:     1,
      });
      marker.bindTooltip(`
        <div style="font-family:system-ui;min-width:180px">
          <div style="font-weight:700;font-size:12px;color:#0f172a;margin-bottom:3px">${ap.name}</div>
          <div style="font-size:10px;color:#64748b;margin-bottom:5px">${ap.city} · ${ap.network}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;font-size:10px">
            <div style="background:#f8fafc;border-radius:4px;padding:3px 5px"><div style="color:#94a3b8;font-size:8px;font-weight:700;text-transform:uppercase">Status</div><div style="color:${color};font-weight:700">${ap.status}</div></div>
            <div style="background:#f8fafc;border-radius:4px;padding:3px 5px"><div style="color:#94a3b8;font-size:8px;font-weight:700;text-transform:uppercase">Power</div><div style="color:#0f172a;font-weight:600">${ap.maxPower}</div></div>
            <div style="background:#f8fafc;border-radius:4px;padding:3px 5px;grid-column:1/-1"><div style="color:#94a3b8;font-size:8px;font-weight:700;text-transform:uppercase">Connectors</div><div style="color:#0f172a">${ap.connectors}</div></div>
          </div>
        </div>
      `, { permanent: false, direction: 'top', offset: [0, -10], className: 'leaflet-tooltip-custom' });
      marker.on('click', () => {
        const net = MARKETPLACE_NETWORKS.find(n => n.name === ap.network);
        if (net) onSelectRef.current(ap, net);
      });
      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [displayAPs, selectedAccessPoint]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // Only fly when the user explicitly selects a network
    if (!userSelectedRef.current) return;
    const ap = displayAPs.find(p => p.network === selectedNetwork.name);
    if (ap) map.flyTo([ap.lat, ap.lng], Math.max(map.getZoom(), 9), { duration: 0.8 });
  }, [selectedNetwork]);

  const regionCountries = new Set(displayAPs.map(ap => ap.country));
  const regionLabel = regionCountries.size === 1
    ? countryName[Array.from(regionCountries)[0]] || 'Region'
    : 'Global';
  const liveCount = displayAPs.filter(ap => ap.tariff === 'LIVE').length;

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: 340 }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
      {/* Legend overlay */}
      <div className="absolute bottom-3 left-3 z-[500] bg-white/95 backdrop-blur rounded-lg px-3 py-2 shadow-sm flex items-center gap-4">
        {[
          { color:'#10b981', label:'Available' },
          { color:'#2563eb', label:'Charging' },
          { color:'#f59e0b', label:'Reserved' },
          { color:'#ef4444', label:'Inoperative' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block border-2 border-white shadow-sm" style={{ background: color }} />
            <span className="text-[10px] text-slate-500 font-medium">{label}</span>
          </div>
        ))}
        {liveCount > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block bg-white shadow-sm" style={{ border: '2px solid #7c3aed' }} />
            <span className="text-[10px] text-violet-600 font-semibold">Live (TomTom)</span>
          </div>
        )}
      </div>
      {/* Region label */}
      <div className="absolute top-3 right-3 z-[500] bg-white/90 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-slate-500 shadow-sm">
        {regionLabel} · {displayAPs.length} stations
        {liveCount > 0 && <span className="text-violet-600"> · {liveCount} live</span>}
      </div>
    </div>
  );
}

// â"₵â"₵ Marketplace Workspace â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵
function MarketplaceWorkspace() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [countryFilter, setCountryFilter] = useState('All Countries');
  const [protocolFilter, setProtocolFilter] = useState('All Protocols');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [selectedNetwork, setSelectedNetwork] = useState<MarketplaceNetwork>(MARKETPLACE_NETWORKS[0]);
  const [selectedAccessPoint, setSelectedAccessPoint] = useState<MarketplaceAccessPoint>(MARKETPLACE_ACCESS_POINTS[0]);
  const [activeKpi, setActiveKpi] = useState<string|null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStep, setAddStep]     = useState(1);
  const [addForm, setAddForm]     = useState({
    name: '', city: '', country: 'GH', role: 'CPO', protocol: 'OCPI 2.2',
    evses: '', coverageArea: '', description: '', contactName: '', contactEmail: '',
  });
  const [addSuccess, setAddSuccess] = useState(false);
  const [showEvseModal, setShowEvseModal] = useState(false);
  const [syncing, setSyncing]       = useState(false);
  const hasUserSelectedNetwork      = useRef(false);
  const [syncTs, setSyncTs]         = useState<Date | null>(null);
  const [syncElapsed, setSyncElapsed] = useState<string>('');
  const [toast, setToast]           = useState<{msg:string; type:'success'|'info'|'warning'} | null>(null);

  useEffect(() => {
    if (!syncTs) return;
    const tick = () => {
      const secs = Math.floor((Date.now() - syncTs.getTime()) / 1000);
      if (secs < 10) setSyncElapsed('just now');
      else if (secs < 60) setSyncElapsed(`${secs}s ago`);
      else if (secs < 3600) {
        const m = Math.floor(secs / 60);
        setSyncElapsed(`${m} min ago`);
      } else {
        const h = Math.floor(secs / 3600);
        setSyncElapsed(`${h} hr ago`);
      }
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, [syncTs]);

  const showToast = (msg: string, type: 'success'|'info'|'warning' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  /* ── Live TomTom station layer — real stations in partner-network cities ── */
  const LIVE_CITY_SOURCES = [
    { city: 'Berlin',    country: 'DE', lat: 52.5200, lng: 13.4050 },
    { city: 'Munich',    country: 'DE', lat: 48.1351, lng: 11.5820 },
    { city: 'Hamburg',   country: 'DE', lat: 53.5753, lng: 10.0153 },
    { city: 'Frankfurt', country: 'DE', lat: 50.1109, lng: 8.6821  },
  ];
  const [liveRaw, setLiveRaw] = useState<{ item: any; city: string; country: string }[]>([]);
  const [, setLiveTick] = useState(0);

  const fetchLiveStations = useCallback(async () => {
    try {
      const results = await Promise.all(LIVE_CITY_SOURCES.map(async src => {
        try {
          const url = `https://api.tomtom.com/search/2/nearbySearch/.json?lat=${src.lat}&lon=${src.lng}&radius=30000&categorySet=7309&limit=25&key=${TOMTOM_KEY}`;
          const res = await fetch(url);
          if (!res.ok) return [];
          const data: any = await res.json();
          return ((data.results ?? []) as any[]).map(item => ({ item, city: src.city, country: src.country }));
        } catch { return []; }
      }));
      setLiveRaw(results.flat());
    } catch (e) { console.error('TomTom live layer:', e); }
  }, []);

  useEffect(() => {
    fetchLiveStations();
    // OCPI statuses re-simulate each 30s bucket — tick re-renders without refetching TomTom
    const t = setInterval(() => setLiveTick(x => x + 1), 30000);
    return () => clearInterval(t);
  }, [fetchLiveStations]);

  // TomTom → RFConnectorStation (common model) → MarketplaceAccessPoint (UI model)
  const liveAccessPoints: MarketplaceAccessPoint[] = liveRaw.map(({ item, city, country }, i) => {
    const rawId = item.id ?? `${city}-${i}`;
    const total = (String(rawId).split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0) % 5) + 2;
    const simulatedConns = simulateOCPI(rawId, total);
    const rfStation = mapTomTomToRFStation(item, city, country, i, simulatedConns);
    return rfStationToAccessPoint(rfStation, i);
  });

  const handleSync = () => {
    if (syncing) return;
    setSyncing(true);
    fetchLiveStations().then(() => {
      setSyncing(false);
      setSyncTs(new Date());
      setSyncElapsed('just now');
      showToast('Synced live station data from TomTom', 'success');
    });
  };

  const openAddModal  = () => { setAddStep(1); setAddForm({ name:'', city:'', country:'GH', role:'CPO', protocol:'OCPI 2.2', evses:'', coverageArea:'', description:'', contactName:'', contactEmail:'' }); setAddSuccess(false); setShowAddModal(true); };
  const closeAddModal = () => { setShowAddModal(false); setAddSuccess(false); };
  const patchForm     = (patch: Partial<typeof addForm>) => setAddForm(f => ({ ...f, ...patch }));
  const step1Valid    = addForm.name.trim() !== '' && addForm.city.trim() !== '';
  const step2Valid    = addForm.evses.trim() !== '' && Number(addForm.evses) > 0;

  const networks = MARKETPLACE_NETWORKS;

  const statusColor: Record<string, string> = {
    'Active':      'bg-emerald-50 text-emerald-700',
    'Negotiating': 'bg-amber-50 text-amber-700',
    'New Connection':  'bg-slate-100 text-slate-600',
  };
  const apStatusColor: Record<MarketplaceAccessPoint['status'], string> = {
    Available:   '#10b981',
    Charging:    '#2563eb',
    Reserved:    '#f59e0b',
    Inoperative: '#ef4444',
  };
  const apStatusBg: Record<MarketplaceAccessPoint['status'], string> = {
    Available:   'bg-emerald-50 text-emerald-700',
    Charging:    'bg-blue-50 text-blue-700',
    Reserved:    'bg-amber-50 text-amber-700',
    Inoperative: 'bg-rose-50 text-rose-700',
  };
  const healthColor: Record<MarketplaceNetwork['connectionHealth'], string> = {
    excellent: 'text-emerald-600', good: 'text-blue-600', fair: 'text-amber-600', unknown: 'text-slate-400',
  };
  const healthDot: Record<MarketplaceNetwork['connectionHealth'], string> = {
    excellent: 'bg-emerald-500', good: 'bg-blue-500', fair: 'bg-amber-500', unknown: 'bg-slate-300',
  };

  // Apply KPI quick filter on top of other filters
  const effectiveStatusFilter = activeKpi === 'Active' ? 'Active'
    : activeKpi === 'Negotiating' ? 'Negotiating'
    : activeKpi === 'New Connection' ? 'New Connection'
    : statusFilter;

  const filteredNetworks = networks.filter(network => {
    const term = search.trim().toLowerCase();
    // Search covers networks, cities, protocols, EVSE IDs, country
    const apMatch = MARKETPLACE_ACCESS_POINTS.some(ap =>
      ap.network === network.name && (ap.id.toLowerCase().includes(term) || ap.city.toLowerCase().includes(term))
    );
    const matchesSearch = term === '' || apMatch || [network.name, network.country, network.city, network.protocol, network.role]
      .some(v => v.toLowerCase().includes(term));
    return matchesSearch
      && (roleFilter === 'All Roles' || network.role === roleFilter)
      && (countryFilter === 'All Countries' || network.country === countryFilter)
      && (protocolFilter === 'All Protocols' || network.protocol === protocolFilter)
      && (effectiveStatusFilter === 'All Statuses' || network.status === effectiveStatusFilter);
  });

  const totalEvses    = networks.reduce((s, n) => s + n.evses, 0);
  const activeNets    = networks.filter(n => n.status === 'Active').length;
  const negNets       = networks.filter(n => n.status === 'Negotiating').length;
  const discNets      = networks.filter(n => n.status === 'New Connection').length;
  const totalAvail    = networks.reduce((s, n) => s + n.evseAvailable, 0);
  const totalCharging = networks.reduce((s, n) => s + n.evseCharging, 0);
  const totalInop     = networks.reduce((s, n) => s + n.evseInoperative, 0);
  const avgAvail      = Math.round(networks.reduce((s, n) => s + n.availability, 0) / networks.length);
  const lastSyncActive = syncElapsed || networks.filter(n => n.status === 'Active').map(n => n.lastSync)[0] || '--';

  const selectedNetworkAccessPoints = MARKETPLACE_ACCESS_POINTS.filter(pt => pt.network === selectedNetwork.name);

  const selectNetwork = (n: MarketplaceNetwork) => {
    hasUserSelectedNetwork.current = true;
    setSelectedNetwork(n);
    const ap = MARKETPLACE_ACCESS_POINTS.find(pt => pt.network === n.name);
    if (ap) setSelectedAccessPoint(ap);
  };

  const toggleKpi = (kpi: string) => {
    setActiveKpi(prev => prev === kpi ? null : kpi);
  };

  // Context-aware action for selected network
  const primaryAction = selectedNetwork.status === 'Active'
    ? { label: 'Manage Connection', icon: Settings, color: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
    : selectedNetwork.status === 'Negotiating'
    ? { label: 'Continue Negotiation', icon: Handshake, color: 'bg-amber-500 hover:bg-amber-600 text-white' }
    : { label: 'Start Agreement', icon: Plus, color: 'bg-emerald-600 hover:bg-emerald-700 text-white' };

  const secondaryActions = selectedNetwork.status === 'Active'
    ? [{ label: 'View EVSEs', icon: MapPin }, { label: 'Download CDRs', icon: Download }]
    : selectedNetwork.status === 'Negotiating'
    ? [{ label: 'View EVSEs', icon: MapPin }, { label: 'Research Network', icon: Eye }]
    : [{ label: 'Research Network', icon: Eye }, { label: 'Request Info', icon: Send }];

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[9999] text-white text-sm px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 ${toast.type==='success'?'bg-emerald-600':toast.type==='warning'?'bg-amber-500':'bg-slate-800'}`}>
          <CheckCircle className="w-4 h-4 opacity-80" /> {toast.msg}
        </div>
      )}
      <SectionHeader
        title="Market Place"
        sub="Network discovery, health monitoring, and roaming agreement management across West Africa"
        action={
          <div className="flex gap-2">
            <button data-local="" onClick={handleSync} disabled={syncing}
              className="flex items-center gap-1.5 border border-slate-200 text-slate-600 text-sm px-3 py-2 rounded-lg hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : syncElapsed ? `Synced ${syncElapsed}` : 'Sync'}
            </button>
          </div>
        }
      />

      {/* â"₵â"₵ Marketplace Health KPI row â"₵â"₵ */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { key:'Active',      label:'Active Networks',       value:activeNets,              icon:CheckCircle, color:'text-emerald-600', bg:'bg-emerald-50 border-emerald-200', sub:`${networks.filter(n=>n.status==='Active' && n.connectionHealth==='excellent').length} excellent health` },
          { key:'Negotiating', label:'Negotiating',           value:negNets,                 icon:Handshake,   color:'text-amber-600',   bg:'bg-amber-50 border-amber-200',     sub:'In agreement pipeline' },
          { key:'New Connection',  label:'New Connection',            value:discNets,                icon:Globe,       color:'text-slate-600',   bg:'bg-slate-50 border-slate-200',     sub:'Awaiting outreach' },
          { key:'Sync',        label:'Last Sync',             value:lastSyncActive,          icon:RefreshCw,   color:'text-indigo-600',  bg:'bg-indigo-50 border-indigo-200',   sub:`${totalInop} EVSEs inoperative` },
        ].map(k => {
          const isActive = activeKpi === k.key;
          return (
            <button
              key={k.key} data-local=""
              onClick={() => { if(k.key !== 'EVSEs' && k.key !== 'Sync') toggleKpi(k.key); }}
              className={`rounded-xl border p-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-indigo-300 ${isActive ? 'ring-2 ring-indigo-400 ' + k.bg : k.bg + ' hover:shadow-sm'} ${k.key !== 'EVSEs' && k.key !== 'Sync' ? 'cursor-pointer' : 'cursor-default'}`}
              aria-pressed={isActive}
            >
              <div className="flex items-center justify-between mb-1">
                <k.icon className={`w-4 h-4 ${k.color}`} />
                {isActive && <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full">Filtered</span>}
              </div>
              <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
              <div className="text-xs font-semibold text-slate-700 mt-0.5">{k.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{k.sub}</div>
            </button>
          );
        })}
      </div>

      {/* â"₵â"₵ Global search + filters â"₵â"₵ */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Search networks, stations, EVSE IDs, cities, protocols..."
          />
          {search && (
            <button data-local="" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {[
          { value: roleFilter,     onChange: setRoleFilter,     opts: ['All Roles','CPO','eMSP'] },
          { value: countryFilter,  onChange: setCountryFilter,  opts: ['All Countries','GH','NG','CI','BR','MX','CO','CL','AR'] },
          { value: protocolFilter, onChange: setProtocolFilter, opts: ['All Protocols','OCPI 2.2','eMIP 3.x'] },
          { value: statusFilter,   onChange: setStatusFilter,   opts: ['All Statuses','Active','Negotiating','New Connection'] },
        ].map(({ value, onChange, opts }) => (
          <select key={opts[0]} data-local="" value={value} onChange={e => { onChange(e.target.value); setActiveKpi(null); }}
            className="border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-600 bg-white focus:outline-none">
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        {(activeKpi || search || roleFilter !== 'All Roles' || countryFilter !== 'All Countries' || protocolFilter !== 'All Protocols' || statusFilter !== 'All Statuses') && (
          <button data-local="" onClick={() => { setSearch(''); setRoleFilter('All Roles'); setCountryFilter('All Countries'); setProtocolFilter('All Protocols'); setStatusFilter('All Statuses'); setActiveKpi(null); }}
            className="text-xs text-rose-600 border border-rose-200 px-2.5 py-1.5 rounded-lg hover:bg-rose-50">
            Clear all
          </button>
        )}
        <span className="text-xs text-slate-400 ml-auto">{filteredNetworks.length} / {networks.length} networks</span>
      </div>

      {/* â"₵â"₵ Discovery Dashboard + detail panel â"₵â"₵ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">

        {/* Discovery Dashboard */}
        <div className="flex flex-col gap-4">

          {/* Regional EV Map */}
          <RegionalEVMap
            accessPoints={[...MARKETPLACE_ACCESS_POINTS, ...liveAccessPoints]}
            selectedNetwork={selectedNetwork}
            selectedAccessPoint={selectedAccessPoint}
            userSelectedRef={hasUserSelectedNetwork}
            onSelectAP={(ap, net) => { hasUserSelectedNetwork.current = true; setSelectedAccessPoint(ap); setSelectedNetwork(net); }}
          />

          {/* Marketplace Stats panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-500" />
                <h3 className="font-semibold text-slate-700 text-sm">Marketplace Overview</h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <RefreshCw className="w-3 h-3" /> Synced {lastSyncActive}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label:'Total Networks',   value: networks.length,                    pct: null },
                { label:'With Agreement',   value: networks.filter(n=>n.agreement).length, pct: Math.round(networks.filter(n=>n.agreement).length/networks.length*100) },
                { label:'Avg Availability', value: `${avgAvail}%`,                     pct: avgAvail },
              ].map(({ label, value, pct }) => (
                <div key={label} className="rounded-lg bg-slate-50 px-3 py-2.5">
                  <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">{label}</div>
                  <div className="text-xl font-bold text-slate-800 mt-0.5">{value}</div>
                  {pct !== null && (
                    <div className="mt-1.5 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* EVSE status breakdown */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-600">Network-wide EVSE Status</span>
                <span className="text-[10px] text-slate-400">{totalEvses.toLocaleString()} total</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex">
                <div className="bg-emerald-400 transition-all" style={{ width:`${(totalAvail/totalEvses)*100}%` }} title={`Available: ${totalAvail}`} />
                <div className="bg-blue-400 transition-all"    style={{ width:`${(totalCharging/totalEvses)*100}%` }} title={`Charging: ${totalCharging}`} />
                <div className="bg-amber-400 transition-all"   style={{ width:`${((totalEvses-totalAvail-totalCharging-totalInop)/totalEvses)*100}%` }} title="Reserved" />
                <div className="bg-rose-400 transition-all"    style={{ width:`${(totalInop/totalEvses)*100}%` }} title={`Inoperative: ${totalInop}`} />
              </div>
              <div className="flex gap-4 mt-1.5">
                {[['bg-emerald-400','Available',totalAvail],['bg-blue-400','Charging',totalCharging],['bg-rose-400','Inop.',totalInop]].map(([c,l,v])=>(
                  <div key={String(l)} className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${c}`}/>
                    <span className="text-[10px] text-slate-400">{l} <strong className="text-slate-600">{v}</strong></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Country breakdown */}
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1.5">Coverage by Country</div>
              <div className="flex gap-2 flex-wrap">
                {(['GH','NG','CI','BR','MX','CO','CL','AR'] as const).map(cc => {
                  const cnt = networks.filter(n => n.country === cc);
                  return (
                    <button key={cc} data-local=""
                      onClick={() => { setCountryFilter(prev => prev === cc ? 'All Countries' : cc); setActiveKpi(null); }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors ${countryFilter === cc ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                    >
                      <span className="font-mono">{cc}</span>
                      <span className={`font-bold ${countryFilter === cc ? 'text-white' : 'text-indigo-600'}`}>{cnt.length}</span>
                      <span className={countryFilter === cc ? 'text-indigo-200' : 'text-slate-400'}>{cnt.reduce((s,n)=>s+n.evses,0).toLocaleString()} EVSEs</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Searchable network list */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col" style={{ minHeight:280 }}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Network className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">Networks</span>
              <span className="text-xs text-slate-400 ml-1">({filteredNetworks.length})</span>
              <div className="ml-auto flex gap-1">
                {['All','Active','Negotiating','New Connection'].map(s => (
                  <button key={s} data-local=""
                    onClick={() => { setStatusFilter(s === 'All' ? 'All Statuses' : s); setActiveKpi(null); }}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors border ${
                      (s === 'All' && statusFilter === 'All Statuses' && !activeKpi) || (statusFilter === s) || (activeKpi === s)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'text-slate-500 border-slate-200 hover:border-indigo-300'
                    }`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
              {filteredNetworks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <Search className="w-6 h-6 mb-2 text-slate-300" />
                  <p className="text-sm font-medium">No networks match</p>
                  <p className="text-xs mt-0.5">Try adjusting filters above</p>
                </div>
              ) : filteredNetworks.map(n => {
                const isSelected = selectedNetwork.name === n.name;
                const aps = MARKETPLACE_ACCESS_POINTS.filter(ap => ap.network === n.name);
                return (
                  <button key={n.name} data-local=""
                    onClick={() => selectNetwork(n)}
                    className={`w-full px-4 py-3 text-left border-b border-slate-100 last:border-b-0 transition-colors hover:bg-slate-50 focus:outline-none ${isSelected ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{n.name[0]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-800 truncate">{n.name}</span>
                          <Pill label={n.status} color={statusColor[n.status] ?? 'bg-slate-100 text-slate-600'} />
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-mono">{n.country}</span>
                          <span className="text-[10px] text-slate-400">{n.role}</span>
                          <span className="text-[10px] text-slate-400">{n.protocol}</span>
                          <span className="text-[10px] text-slate-400">{n.evses.toLocaleString()} EVSEs</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${healthDot[n.connectionHealth]}`} />
                          <span className={`text-[10px] capitalize ${healthColor[n.connectionHealth]}`}>{n.connectionHealth}</span>
                        </div>
                        {n.agreement
                          ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          : <span className="text-[10px] font-semibold text-amber-600">No agr.</span>
                        }
                        <div className="flex -space-x-1">
                          {aps.slice(0,3).map(ap => (
                            <span key={ap.id} className="w-2 h-2 rounded-full border border-white" style={{ backgroundColor: apStatusColor[ap.status] }} />
                          ))}
                          {aps.length > 3 && <span className="text-[8px] text-slate-400 pl-2">+{aps.length-3}</span>}
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-indigo-500' : 'text-slate-300'}`} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* â"₵â"₵ Network detail panel â"₵â"₵ */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
          {/* Header */}
          <div className="px-5 pt-4 pb-3 border-b border-slate-100">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold bg-indigo-100 text-indigo-700`}>{selectedNetwork.name[0]}</div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800 text-sm truncate">{selectedNetwork.name}</h3>
                  <p className="text-[11px] text-slate-400">{selectedNetwork.city} · {selectedNetwork.country}</p>
                </div>
              </div>
              <Pill label={selectedNetwork.status} color={statusColor[selectedNetwork.status] ?? 'bg-slate-100 text-slate-600'} />
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">{selectedNetwork.description}</p>
          </div>

          {/* Connection health + sync */}
          <div className="px-5 py-2.5 border-b border-slate-100 flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${healthDot[selectedNetwork.connectionHealth]}`} />
            <span className={`text-xs font-semibold capitalize ${healthColor[selectedNetwork.connectionHealth]}`}>{selectedNetwork.connectionHealth} connection</span>
            <span className="text-[10px] text-slate-400 ml-auto">Synced {selectedNetwork.lastSync}</span>
          </div>

          {/* Details grid */}
          <div className="px-4 py-3 grid grid-cols-2 gap-2 border-b border-slate-100">
            {[
              ['Role',           selectedNetwork.role],
              ['Protocol',       selectedNetwork.protocol],
              ['EVSEs',          selectedNetwork.evses.toLocaleString()],
              ['Latency',        selectedNetwork.latency],
              ['Availability',   `${selectedNetwork.availability}%`],
              ['Agreement',      selectedNetwork.agreement ? 'Active' : 'None'],
              ['Coverage',       selectedNetwork.coverageArea],
              ['Partner Since',  selectedNetwork.partnerSince ?? '--'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</div>
                <div className={`mt-0.5 text-xs font-semibold truncate ${
                  label === 'Agreement' && value === 'Active' ? 'text-emerald-600'
                  : label === 'Agreement' ? 'text-amber-600'
                  : label === 'Availability' && Number(value.replace('%','')) >= 90 ? 'text-emerald-600'
                  : label === 'Availability' && Number(value.replace('%','')) >= 80 ? 'text-amber-600'
                  : label === 'Availability' ? 'text-rose-600'
                  : 'text-slate-800'
                }`}>{value}</div>
              </div>
            ))}
          </div>

          {/* EVSE availability mini-bar */}
          <div className="px-4 py-2.5 border-b border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">EVSE Status</span>
              <span className="text-[10px] text-slate-400">{selectedNetwork.evses} total</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex">
              <div className="bg-emerald-400" style={{ width: `${(selectedNetwork.evseAvailable/selectedNetwork.evses)*100}%` }} />
              <div className="bg-blue-400"    style={{ width: `${(selectedNetwork.evseCharging/selectedNetwork.evses)*100}%` }} />
              <div className="bg-rose-400"    style={{ width: `${(selectedNetwork.evseInoperative/selectedNetwork.evses)*100}%` }} />
            </div>
            <div className="flex gap-3 mt-1">
              {[['bg-emerald-400','Available',selectedNetwork.evseAvailable],['bg-blue-400','Charging',selectedNetwork.evseCharging],['bg-rose-400','Inop.',selectedNetwork.evseInoperative]].map(([c,l,v])=>(
                <div key={String(l)} className="flex items-center gap-1"><div className={`w-1.5 h-1.5 rounded-full ${c}`}/><span className="text-[9px] text-slate-400">{l} {v}</span></div>
              ))}
            </div>
          </div>

          {/* Access Points */}
          <div className="px-4 py-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">Access Points</h4>
              <span className="text-[10px] text-slate-400">{selectedNetworkAccessPoints.length} stations</span>
            </div>
            <div className="space-y-1.5">
              {selectedNetworkAccessPoints.length === 0 ? (
                <p className="text-xs text-slate-400">No access points available.</p>
              ) : selectedNetworkAccessPoints.map(pt => {
                const isSelected = selectedAccessPoint.id === pt.id;
                return (
                  <button data-local="" key={pt.id} onClick={() => { setSelectedAccessPoint(pt); setShowEvseModal(true); }}
                    className={`w-full rounded-lg border px-3 py-2 text-left transition-all hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 ${isSelected ? 'border-indigo-300 bg-indigo-50' : 'border-slate-100 bg-slate-50 hover:bg-white'}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: apStatusColor[pt.status] }} />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-semibold text-slate-800 truncate block">{pt.name}</span>
                          <span className="text-[10px] text-slate-500">{pt.city} · {pt.country}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${apStatusBg[pt.status]}`}>{pt.status}</span>
                    </div>
                    <div className="mt-1.5 grid grid-cols-2 gap-1">
                      <div className="rounded-sm bg-white/50 px-2 py-1">
                        <span className="text-[8px] text-slate-400 uppercase font-semibold block">Power</span>
                        <span className="text-[10px] font-bold text-indigo-700">{pt.maxPower}</span>
                      </div>
                      <div className="rounded-sm bg-white/50 px-2 py-1">
                        <span className="text-[8px] text-slate-400 uppercase font-semibold block">Connectors</span>
                        <span className="text-[10px] font-bold text-slate-800">{pt.connectorCount}</span>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-[9px] text-slate-500 font-mono bg-white/30 px-1.5 rounded">{pt.id}</span>
                      <span className="text-[9px] text-slate-400">Updated {pt.lastUpdated}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Context-aware actions */}
          {primaryAction.label !== 'Manage Connection' && (
          <div className="px-4 py-3 border-t border-slate-100 space-y-1.5">
            <button data-local="" onClick={() => {
              if (primaryAction.label === 'Start Agreement') showToast(`Starting agreement with ${selectedNetwork.name}`, 'success');
              else showToast(primaryAction.label, 'info');
            }} className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${primaryAction.color}`}>
              <primaryAction.icon className="w-4 h-4" /> {primaryAction.label}
            </button>
          </div>
          )}
        </div>
      </div>

      {/* â"₵â"₵ Network Lifecycle Funnel â"₵â"₵ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <h3 className="font-semibold text-slate-700 text-sm">Network Lifecycle Funnel</h3>
          <span className="text-xs text-slate-400 ml-1">-- New Connection → Negotiating → Active Agreement</span>
        </div>
        <div className="flex items-center gap-0">
          {[
            { stage:'New Connection',  count:discNets, sub:`${discNets * 130} EVSEs potential`,     color:'bg-slate-100 border-slate-200', text:'text-slate-700', bar:'bg-slate-400' },
            { stage:'Negotiating', count:negNets,  sub:'In agreement pipeline',                 color:'bg-amber-50 border-amber-200',  text:'text-amber-800', bar:'bg-amber-500' },
            { stage:'Active',      count:activeNets, sub:`${networks.filter(n=>n.status==='Active').reduce((s,n)=>s+n.evses,0).toLocaleString()} EVSEs live`, color:'bg-emerald-50 border-emerald-200', text:'text-emerald-800', bar:'bg-emerald-500' },
          ].map(({ stage, count, sub, color, text, bar }, idx, arr) => (
            <div key={stage} className="flex items-center flex-1">
              <button data-local=""
                onClick={() => toggleKpi(stage)}
                className={`flex-1 rounded-xl border px-4 py-3 text-left transition-all hover:shadow-md focus:outline-none ${color} ${activeKpi === stage ? 'ring-2 ring-indigo-400' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{stage}</span>
                  <span className={`text-2xl font-bold ${text}`}>{count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/60 overflow-hidden">
                  <div className={`h-full ${bar} rounded-full`} style={{ width: `${(count / networks.length) * 100}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">{sub}</p>
              </button>
              {idx < arr.length - 1 && (
                <div className="flex flex-col items-center px-2 flex-shrink-0">
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                  <span className="text-[8px] text-slate-300 font-medium mt-0.5">{idx === 0 ? 'outreach' : 'signed'}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* â"₵â"₵ Networks table â"₵â"₵ */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-700">All Networks</span>
          <span className="text-xs text-slate-400">{filteredNetworks.length} of {networks.length}</span>
        </div>
        <Table
          cols={['Network', 'Country', 'Role', 'EVSEs', 'Availability', 'Latency', 'Health', 'Status', 'Agreement', '']}
          rows={filteredNetworks.map(n => [
            <button data-local="" className="font-medium text-slate-800 hover:text-indigo-700 text-left" onClick={() => selectNetwork(n)}>{n.name}</button>,
            <span className="font-mono text-slate-500">{n.country}</span>,
            <Pill label={n.role} color={n.role === 'CPO' ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700'} />,
            n.evses.toLocaleString(),
            <span className={n.availability >= 90 ? 'text-emerald-600 font-semibold' : n.availability >= 80 ? 'text-amber-600 font-semibold' : 'text-rose-600 font-semibold'}>{n.availability}%</span>,
            <span className={n.latency === '--' ? 'text-slate-300' : 'text-slate-600'}>{n.latency}</span>,
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${healthDot[n.connectionHealth]}`} />
              <span className={`text-xs capitalize ${healthColor[n.connectionHealth]}`}>{n.connectionHealth}</span>
            </div>,
            <Pill label={n.status} color={statusColor[n.status] ?? 'bg-slate-100 text-slate-600'} />,
            n.agreement
              ? <CheckCircle className="w-4 h-4 text-emerald-500" />
              : <button data-local="" onClick={() => selectNetwork(n)} className="text-xs text-amber-600 font-semibold hover:underline">Start →</button>,
            null,
          ])}
        />
      </div>

      {/* â"₵â"₵ Add Network Modal â"₵â"₵ */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden" style={{ maxHeight: '90vh' }}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="font-semibold text-slate-800 text-base">Add Network</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {addSuccess ? 'Network submitted for review' : `Step ${addStep} of 3${addStep===1?'Basic Information':addStep===2?'Technical Details':'Review & Submit'}`}
                </p>
              </div>
              <button data-local="" onClick={closeAddModal} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step indicator */}
            {!addSuccess && (
              <div className="px-6 pt-4 flex items-center gap-2">
                {[1,2,3].map(s => (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      s < addStep ? 'bg-emerald-500 text-white' : s === addStep ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {s < addStep ? '✓' : s}
                    </div>
                    <span className={`text-xs hidden sm:block ${s === addStep ? 'text-indigo-700 font-semibold' : 'text-slate-400'}`}>
                      {s===1?'Basic Info':s===2?'Technical':' Review'}
                    </span>
                    {s < 3 && <div className={`flex-1 h-px ${s < addStep ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
                  </div>
                ))}
              </div>
            )}

            {/* Modal body */}
            <div className="overflow-y-auto px-6 py-4 flex-1 space-y-4">

              {/* Success state */}
              {addSuccess && (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                    <CheckCheck className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-lg mb-1">Network submitted!</h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    <strong>{addForm.name}</strong> has been submitted for review. Our team will verify the network details and initiate the onboarding process within 1â₵"2 business days.
                  </p>
                  <div className="mt-4 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-left space-y-1">
                    {[
                      ['Network',  addForm.name],
                      ['Country',  addForm.country],
                      ['Role',     addForm.role],
                      ['Protocol', addForm.protocol],
                      ['EVSEs',    addForm.evses],
                      ['Status',   'New Connection'],
                    ].map(([l,v]) => (
                      <div key={l} className="flex justify-between text-xs">
                        <span className="text-slate-400">{l}</span>
                        <span className="font-medium text-slate-700">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Basic Information */}
              {!addSuccess && addStep === 1 && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Network Name <span className="text-rose-500">*</span></label>
                    <input data-local="" value={addForm.name} onChange={e => patchForm({ name: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="e.g. GreenCharge West Africa" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">City <span className="text-rose-500">*</span></label>
                      <input data-local="" value={addForm.city} onChange={e => patchForm({ city: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="e.g. Accra" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Country</label>
                      <select data-local="" value={addForm.country} onChange={e => patchForm({ country: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none">
                        {['GH','NG','CI','SN','KE','ZA'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Role</label>
                      <select data-local="" value={addForm.role} onChange={e => patchForm({ role: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none">
                        <option>CPO</option><option>eMSP</option><option>CPO + eMSP</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Protocol</label>
                      <select data-local="" value={addForm.protocol} onChange={e => patchForm({ protocol: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none">
                        <option>OCPI 2.2</option><option>OCPI 2.2.1</option><option>eMIP 3.x</option><option>OCPP 1.6</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Coverage Area</label>
                    <input data-local="" value={addForm.coverageArea} onChange={e => patchForm({ coverageArea: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="e.g. Greater Accra Region" />
                  </div>
                </>
              )}

              {/* Step 2: Technical Details */}
              {!addSuccess && addStep === 2 && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Number of EVSEs <span className="text-rose-500">*</span></label>
                    <input data-local="" type="number" min="1" value={addForm.evses} onChange={e => patchForm({ evses: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="e.g. 120" />
                    <p className="text-[10px] text-slate-400 mt-1">Total number of charge points in the network</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Network Description</label>
                    <textarea data-local="" value={addForm.description} onChange={e => patchForm({ description: e.target.value })}
                      rows={3}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                      placeholder="Brief description of the network, its coverage, and services offered..." />
                  </div>
                  <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 space-y-1">
                    <p className="text-xs font-semibold text-indigo-700">What happens next?</p>
                    <ul className="text-xs text-indigo-600 space-y-0.5 list-disc list-inside">
                      <li>Network added as <strong>New Connection</strong> status</li>
                      <li>RFConnector team verifies details within 48h</li>
                      <li>Outreach initiated to start roaming agreement</li>
                      <li>Network moves to <strong>Negotiating</strong> when contact made</li>
                    </ul>
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Contact Person (optional)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input data-local="" value={addForm.contactName} onChange={e => patchForm({ contactName: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          placeholder="Full name" />
                      </div>
                      <div>
                        <input data-local="" value={addForm.contactEmail} onChange={e => patchForm({ contactEmail: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          placeholder="Email address" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Review */}
              {!addSuccess && addStep === 3 && (
                <>
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">{addForm.name[0] ?? '?'}</div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{addForm.name || '--'}</p>
                        <p className="text-[10px] text-slate-400">{addForm.city}, {addForm.country}</p>
                      </div>
                      <Pill label="New Connection" color="bg-slate-100 text-slate-600" />
                    </div>
                    <div className="px-4 py-3 grid grid-cols-2 gap-2">
                      {[
                        ['Role',          addForm.role],
                        ['Protocol',      addForm.protocol],
                        ['EVSEs',         addForm.evses || '--'],
                        ['Coverage',      addForm.coverageArea || '--'],
                        ['Contact',       addForm.contactName || '--'],
                        ['Email',         addForm.contactEmail || '--'],
                      ].map(([l,v]) => (
                        <div key={l} className="rounded-lg bg-slate-50 px-2.5 py-2">
                          <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wide">{l}</div>
                          <div className="text-xs font-semibold text-slate-700 truncate mt-0.5">{v}</div>
                        </div>
                      ))}
                    </div>
                    {addForm.description && (
                      <div className="px-4 pb-3">
                        <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wide mb-1">Description</div>
                        <p className="text-xs text-slate-600 leading-relaxed">{addForm.description}</p>
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 flex gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">By submitting, you confirm this network exists and that you have permission to initiate a roaming agreement on behalf of your organisation.</p>
                  </div>
                </>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
              {addSuccess ? (
                <button data-local="" onClick={closeAddModal} className="ml-auto bg-indigo-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-indigo-700 font-semibold">
                  Done
                </button>
              ) : (
                <>
                  <button data-local="" onClick={addStep === 1 ? closeAddModal : () => setAddStep(s => s - 1)}
                    className="border border-slate-200 text-slate-600 text-sm px-4 py-2 rounded-lg hover:bg-slate-50 font-medium">
                    {addStep === 1 ? 'Cancel' : 'â† Back'}
                  </button>
                  {addStep < 3 ? (
                    <button data-local=""
                      disabled={addStep === 1 ? !step1Valid : !step2Valid}
                      onClick={() => setAddStep(s => s + 1)}
                      className="bg-indigo-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
                      Continue →
                    </button>
                  ) : (
                    <button data-local="" onClick={() => setAddSuccess(true)}
                      className="bg-emerald-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-emerald-700 font-semibold flex items-center gap-2">
                      <CheckCheck className="w-4 h-4" /> Submit Network
                    </button>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* â"₵â"₵ EVSE Details Modal â"₵â"₵ */}
      {showEvseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">{selectedAccessPoint.name}</h2>
                <p className="text-sm text-slate-500">{selectedAccessPoint.city} · {selectedAccessPoint.country}</p>
              </div>
              <button onClick={() => setShowEvseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Status</span>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: apStatusColor[selectedAccessPoint.status] }} />
                    <span className="font-semibold text-slate-800">{selectedAccessPoint.status}</span>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Location</span>
                  <p className="font-semibold text-slate-800">{selectedAccessPoint.city}, {selectedAccessPoint.country}</p>
                </div>
              </div>

              {/* Power & Connectors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                  <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide block mb-2">Max Power</span>
                  <p className="text-2xl font-bold text-indigo-600">{selectedAccessPoint.maxPower}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide block mb-2">Connector Count</span>
                  <p className="text-2xl font-bold text-emerald-600">{selectedAccessPoint.connectorCount}</p>
                </div>
              </div>

              {/* Network & Protocol */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Network</span>
                  <p className="font-semibold text-slate-800">{selectedAccessPoint.network}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Protocol</span>
                  <p className="font-semibold text-slate-800">{selectedAccessPoint.protocol}</p>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">EVSE ID</span>
                    <p className="text-sm font-mono bg-slate-50 px-3 py-2 rounded text-slate-700">{selectedAccessPoint.id}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Tariff</span>
                    <p className="text-sm font-mono bg-slate-50 px-3 py-2 rounded text-slate-700">{selectedAccessPoint.tariff}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Connectors</span>
                    <p className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded">{selectedAccessPoint.connectors}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Power Type</span>
                    <p className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded">{selectedAccessPoint.power}</p>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Last Updated</span>
                  <p className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded">{selectedAccessPoint.lastUpdated}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-200 pt-4 flex gap-3">
                <button data-local="" onClick={() => setShowEvseModal(false)} className="flex-1 bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700">
                  Close
                </button>
                <button data-local="" onClick={() => { setShowEvseModal(false); showToast(`EVSE ${selectedAccessPoint.id} reserved at ${selectedAccessPoint.name}`, 'success'); }} className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2 rounded-lg hover:bg-slate-50">
                  Reserve EVSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderMarketplace(_state: MarketplaceState) { return <MarketplaceWorkspace />; }

// â"₵â"₵ Negotiation Workspace â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵
const NEG_STAGES = ['Draft', 'Proposal Sent', 'Under Review', 'Counter Proposal', 'Accepted', 'Signature'] as const;
type NegStage = typeof NEG_STAGES[number];

interface NegOffer {
  tariff: string; rate: string; validity: string; type: string; terms: string; setupFee?: string; minVolume?: string;
}
interface NegMessage { author: string; time: string; text: string; }
interface NegEvent { event: string; time: string; kind: 'created'|'sent'|'received'|'accepted'|'action'|'system'; }
interface Negotiation {
  id: string; partner: string; subject: string; direction: string; stage: NegStage;
  priority: 'high'|'medium'|'low'; deadline: string; overdue: boolean;
  lastActivity: string; requiresAction: boolean; actionLabel?: string;
  ourOffer: NegOffer; theirOffer?: NegOffer;
  messages: NegMessage[]; timeline: NegEvent[];
  savedAt: string; unread: number;
}

const NEGOTIATIONS: Negotiation[] = [
  {
    id: 'NEG-2026-0041', partner: 'VRA EV Charge', subject: 'Outbound roaming agreement Q3 2026',
    direction: 'Outbound', stage: 'Counter Proposal', priority: 'high',
    deadline: '2026-07-10', overdue: false, lastActivity: '2h ago',
    requiresAction: true, actionLabel: 'Review counter proposal',
    ourOffer: { tariff: 'TARIFF-GH-STD-01', rate: '₵ 0.32/kWh', validity: '1 Jul 2026 â₵" 30 Jun 2027', type: 'Bilateral', terms: 'Standard EU terms v2.1includes OCPI 2.2.1 push, real-time CDR, 30-day clearing.', setupFee: '₵ 0', minVolume: '500 MWh/yr' },
    theirOffer:  { tariff: 'TARIFF-GH-ECO-03', rate: '₵ 0.28/kWh', validity: '1 Jul 2026 â₵" 30 Jun 2027', type: 'Bilateral', terms: 'Revised rate based on forecasted 800 MWh/yr volume commitment. All other terms accepted.', setupFee: '₵ 0', minVolume: '800 MWh/yr' },
    messages: [
      { author: 'You', time: '20 Jun 2026 · 09:15', text: 'We propose standard EU tariff at ₵ 0.32/kWh under TARIFF-GH-STD-01. Validity: 1 Jul 2026 to 30 Jun 2027. Please review and confirm.' },
      { author: 'VRA EV Charge', time: '21 Jun 2026 · 14:30', text: 'Thanks for the proposal. We can commit to ₵ 0.28/kWh given our expected volume of 800 MWh/yr. All other terms are acceptable.' },
      { author: 'VRA EV Charge', time: '21 Jun 2026 · 14:32', text: 'Counter proposal attachedplease review at your earliest convenience. Deadline for response is 10 Jul 2026.' },
    ],
    timeline: [
      { event: 'Counter proposal received from VRA EV Charge', time: '21 Jun 2026, 14:32', kind: 'received' },
      { event: 'Proposal sent to VRA EV Charge', time: '20 Jun 2026, 09:15', kind: 'sent' },
      { event: 'Draft saved', time: '19 Jun 2026, 16:00', kind: 'created' },
      { event: 'Negotiation created', time: '19 Jun 2026, 15:45', kind: 'created' },
    ],
    savedAt: '2 min ago', unread: 2,
  },
  {
    id: 'NEG-2026-0038', partner: 'Shell Ghana EV', subject: 'Bilateral agreement amendment',
    direction: 'Bilateral', stage: 'Under Review', priority: 'high',
    deadline: '2026-07-05', overdue: false, lastActivity: '1d ago',
    requiresAction: true, actionLabel: 'Sign amendment addendum',
    ourOffer: { tariff: 'TARIFF-GH-BIL-02', rate: '₵ 0.29/kWh', validity: '1 Aug 2026 â₵" 31 Jul 2027', type: 'Bilateral', terms: 'Amendment to AGR-2025-0029updated CDR validation frequency to real-time.', setupFee: '₵ 250', minVolume: '200 MWh/yr' },
    messages: [
      { author: 'Shell Ghana EV', time: '22 Jun 2026 · 11:00', text: 'Amendment documentation is ready. We need your signature on the addendum to proceed.' },
      { author: 'You', time: '22 Jun 2026 · 12:30', text: 'Reviewing the addendum now. Will respond by end of day.' },
    ],
    timeline: [
      { event: 'Addendum sent by Shell Ghana EV', time: '22 Jun 2026, 11:00', kind: 'received' },
      { event: 'Amendment draft agreed verbally', time: '18 Jun 2026, 15:00', kind: 'action' },
      { event: 'Amendment negotiation opened', time: '15 Jun 2026, 09:30', kind: 'created' },
    ],
    savedAt: '1 day ago', unread: 1,
  },
  {
    id: 'NEG-2026-0035', partner: 'GreenMobility GH', subject: 'eMSP inbound roaming terms',
    direction: 'Inbound', stage: 'Accepted', priority: 'medium',
    deadline: '2026-07-20', overdue: false, lastActivity: '3d ago',
    requiresAction: true, actionLabel: 'Move to Signature',
    ourOffer: { tariff: 'TARIFF-GH-IN-01', rate: '₵ 0.33/kWh', validity: '1 Jul 2026 - 30 Jun 2027', type: 'Inbound', terms: 'Standard Ghana inbound terms. OCPI 2.2.1, 7-day clearing window.', setupFee: '₵ 0', minVolume: '100 MWh/yr' },
    theirOffer: { tariff: 'TARIFF-GH-IN-01', rate: '₵ 0.33/kWh', validity: '1 Jul 2026 - 30 Jun 2027', type: 'Inbound', terms: 'Accepted as proposed. Ready for signature.', setupFee: '₵ 0', minVolume: '100 MWh/yr' },
    messages: [
      { author: 'GreenMobility GH', time: '20 Jun 2026 · 16:45', text: 'We accept all terms as proposed. Please proceed to signature.' },
      { author: 'You', time: '19 Jun 2026 · 10:00', text: 'Sending our standard Ghana inbound roaming terms for your review.' },
    ],
    timeline: [
      { event: 'Terms accepted by GreenMobility GH', time: '20 Jun 2026, 16:45', kind: 'accepted' },
      { event: 'Proposal sent to GreenMobility GH', time: '19 Jun 2026, 10:00', kind: 'sent' },
      { event: 'Negotiation opened', time: '18 Jun 2026, 14:00', kind: 'created' },
    ],
    savedAt: '3 days ago', unread: 0,
  },
  {
    id: 'NEG-2026-0031', partner: 'Goil EV Network', subject: 'DC fast-charging CPO partnership',
    direction: 'Outbound', stage: 'Proposal Sent', priority: 'medium',
    deadline: '2026-07-25', overdue: false, lastActivity: '5d ago',
    requiresAction: false,
    ourOffer: { tariff: 'TARIFF-GH-DC-01', rate: '₵ 0.38/kWh', validity: '1 Aug 2026 â₵" 31 Jul 2027', type: 'Outbound', terms: 'DC fast charging outbound terms. HPC-specific SLAs, 99.5% uptime commitment.', setupFee: '₵ 1,000', minVolume: '1,000 MWh/yr' },
    messages: [
      { author: 'You', time: '18 Jun 2026 · 09:00', text: 'Please find our proposal for DC fast-charging outbound roaming. We are keen to expand into the HPC segment with Goil EV Network.' },
    ],
    timeline: [
      { event: 'Proposal sent to Goil EV Network', time: '18 Jun 2026, 09:00', kind: 'sent' },
      { event: 'Draft finalised', time: '17 Jun 2026, 17:30', kind: 'created' },
      { event: 'Negotiation created', time: '16 Jun 2026, 11:00', kind: 'created' },
    ],
    savedAt: '5 days ago', unread: 0,
  },
  {
    id: 'NEG-2026-0025', partner: 'EnVolt Mexico', subject: 'eMSP outbound roaming  Jalisco Region',
    direction: 'Outbound', stage: 'Proposal Sent', priority: 'medium',
    deadline: '2026-07-30', overdue: false, lastActivity: '3d ago',
    requiresAction: false,
    ourOffer: { tariff: 'TARIFF-MX-OUT-01', rate: '₵ 0.35/kWh', validity: '1 Aug 2026 - 31 Jul 2027', type: 'Outbound', terms: 'Standard outbound roaming terms. OCPI 2.1 compatible, 30-day clearing.', setupFee: '₵ 0', minVolume: '150 MWh/yr' },
    messages: [
      { author: 'You', time: '21 Jun 2026 · 10:00', text: 'We would like to initiate outbound roaming across Jalisco Region. Please find our proposal attached.' },
    ],
    timeline: [
      { event: 'Proposal sent to EnVolt Mexico', time: '21 Jun 2026, 10:00', kind: 'sent' },
      { event: 'Negotiation created', time: '20 Jun 2026, 14:00', kind: 'created' },
    ],
    savedAt: '3 days ago', unread: 0,
  },
  {
    id: 'NEG-2026-0022', partner: 'Evolta Argentina', subject: 'eMSP inbound roaming  Cordoba + Mendoza',
    direction: 'Inbound', stage: 'Draft', priority: 'low',
    deadline: '2026-08-15', overdue: false, lastActivity: '4d ago',
    requiresAction: false,
    ourOffer: { tariff: 'TARIFF-AR-IN-01', rate: '₵ 0.31/kWh', validity: '1 Sep 2026 - 31 Aug 2027', type: 'Inbound', terms: 'Draft inbound terms for Argentina intercity corridor. OCPI 2.2.1, 30-day clearing window.', setupFee: '₵ 0', minVolume: '80 MWh/yr' },
    messages: [],
    timeline: [
      { event: 'Draft created', time: '20 Jun 2026, 11:00', kind: 'created' },
    ],
    savedAt: '4 days ago', unread: 0,
  },
  {
    id: 'NEG-2026-0028', partner: 'Total Energies Ghana', subject: 'Ghana bilateral renewal',
    direction: 'Bilateral', stage: 'Draft', priority: 'low',
    deadline: '2026-08-01', overdue: false, lastActivity: '1w ago',
    requiresAction: false,
    ourOffer: { tariff: 'TARIFF-GH-BIL-03', rate: '₵ 0.30/kWh', validity: '1 Sep 2026 â₵" 31 Aug 2027', type: 'Bilateral', terms: 'Draft under review internally. Ghana regulatory requirements apply.', setupFee: '₵ 0', minVolume: '300 MWh/yr' },
    messages: [],
    timeline: [
      { event: 'Draft created', time: '16 Jun 2026, 10:00', kind: 'created' },
    ],
    savedAt: '1 week ago', unread: 0,
  },
];

function NegotiationWorkspace() {
  const [negotiations, setNegotiations] = useLocalStorage<Negotiation[]>('cb_negotiations', NEGOTIATIONS);
  const [selected, setSelected] = useState<Negotiation>(NEGOTIATIONS[0]);
  const [activeTab, setActiveTab] = useState<'overview'|'comparison'|'discussion'|'timeline'>('overview');
  const [comment, setComment] = useState('');
  const [messages, setMessages] = useState(selected.messages);
  const [showNewNegModal, setShowNewNegModal] = useState(false);
  const [newNegForm, setNewNegForm] = useState({ partner: '', subject: '', direction: 'Outbound', priority: 'medium', type: '', tariff: '', rate: '', setupFee: '', minVolume: '', validity: '', terms: '' });
  const [editingDraft, setEditingDraft] = useState(false);
  const [draftForm, setDraftForm] = useState<NegOffer>(selected.ourOffer);
  const EMPTY_NEG_OFFER: NegOffer = { tariff: '', rate: '', validity: '', type: '', terms: '', setupFee: '', minVolume: '' };
  const [toast, setToast] = useState<{msg:string;type:'success'|'info'|'warning'}|null>(null);
  const showToast = (msg:string, type:'success'|'info'|'warning'='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),2800); };

  const advanceStage = (neg: Negotiation, toStage: NegStage) => {
    const updated = { ...neg, stage: toStage, lastActivity: 'Just now', requiresAction: false };
    setNegotiations(prev => prev.map(n => n.id === neg.id ? updated : n));
    setSelected(updated);
  };

  const handleExportCSV = () => {
    const csv = ['ID,Partner,Subject,Stage,Direction,Priority,Deadline',
      ...negotiations.map(n => `"${n.id}","${n.partner}","${n.subject}","${n.stage}","${n.direction}","${n.priority}","${n.deadline}"`)
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'}));
    a.download = `negotiations-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    showToast('Negotiations exported', 'success');
  };

  const stageIdx = NEG_STAGES.indexOf(selected.stage);
  const requiresAction = negotiations.filter(n => n.requiresAction);

  const stageColor: Record<NegStage, string> = {
    'Draft': 'bg-slate-100 text-slate-600',
    'Proposal Sent': 'bg-blue-50 text-blue-700',
    'Under Review': 'bg-amber-50 text-amber-700',
    'Counter Proposal': 'bg-orange-50 text-orange-700',
    'Accepted': 'bg-emerald-50 text-emerald-700',
    'Signature': 'bg-indigo-50 text-indigo-700',
  };
  const priorityColor = { high: 'bg-rose-500', medium: 'bg-amber-400', low: 'bg-slate-300' };
  const kindIcon: Record<NegEvent['kind'], React.ReactElement> = {
    created:  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center"><Pencil className="w-3 h-3 text-slate-500" /></div>,
    sent:     <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center"><Send className="w-3 h-3 text-blue-600" /></div>,
    received: <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center"><Inbox className="w-3 h-3 text-orange-600" /></div>,
    accepted: <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCheck className="w-3 h-3 text-emerald-600" /></div>,
    action:   <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center"><Zap className="w-3 h-3 text-indigo-600" /></div>,
    system:   <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center"><RefreshCw className="w-3 h-3 text-slate-500" /></div>,
  };

  const handleSelect = (n: Negotiation) => {
    setSelected(n);
    setMessages(n.messages);
    setActiveTab('overview');
    setComment('');
  };

  const sendComment = () => {
    if (!comment.trim()) return;
    setMessages(prev => [...prev, { author: 'You', time: 'Just now', text: comment.trim() }]);
    setComment('');
  };

  const offerRow = (label: string, ours: string, theirs: string | undefined, highlight = false) => {
    const diff = theirs && ours !== theirs;
    return (
      <div className={`grid grid-cols-3 gap-2 py-2.5 border-b border-slate-100 last:border-0 ${highlight ? 'bg-amber-50/40 -mx-4 px-4 rounded' : ''}`}>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide self-center">{label}</div>
        <div className="text-sm text-slate-800 font-medium">{ours}</div>
        <div className={`text-sm font-medium ${diff ? 'text-orange-600 font-semibold' : 'text-slate-800'}`}>
          {theirs ?? <span className="text-slate-300 italic">--</span>}
          {diff && <span className="ml-1 text-[10px] bg-orange-100 text-orange-600 rounded px-1">differs</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <SectionHeader
        title="Negotiation"
        sub="Manage roaming agreement negotiations with your partners"
        action={
          <div className="flex gap-2">
            <button data-local="" onClick={handleExportCSV} className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm px-3 py-2 rounded-lg hover:bg-slate-50">
              <Download className="w-4 h-4" /> Export
            </button>
            <button data-local="" onClick={() => setShowNewNegModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
              <Plus className="w-4 h-4" /> New Negotiation
            </button>
          </div>
        }
      />

      {/* â"₵â"₵ Requires Action banner â"₵â"₵ */}
      {requiresAction.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span className="font-semibold text-rose-800 text-sm">Requires Your Action ({requiresAction.length})</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {requiresAction.map(n => (
              <button
                key={n.id}
                data-local=""
                onClick={() => handleSelect(n)}
                className="bg-white rounded-lg border border-rose-100 px-4 py-3 flex items-center gap-3 hover:border-rose-300 transition-colors text-left"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColor[n.priority]}`} />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-slate-800 text-sm">{n.partner}</span>
                  <span className="text-slate-400 text-xs mx-2">·</span>
                  <span className="text-slate-500 text-sm">{n.actionLabel}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {n.stage === 'Accepted' && (
                    <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5 font-semibold">Ready for Signature</span>
                  )}
                  <span className="text-xs text-slate-400">Due {n.deadline}</span>
                  <ArrowRight className="w-4 h-4 text-rose-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* â"₵â"₵ Main workspace: list + detail â"₵â"₵ */}
      <div className="flex gap-4 items-start">

        {/* Left: negotiation list */}
        <div className="w-80 flex-shrink-0 space-y-2">
          {negotiations.map(n => {
            const isSelected = n.id === selected.id;
            const idx = NEG_STAGES.indexOf(n.stage);
            return (
              <button
                key={n.id}
                data-local=""
                onClick={() => handleSelect(n)}
                className={`w-full text-left rounded-xl border p-4 transition-all ${isSelected ? 'border-indigo-300 bg-indigo-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'}`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-100 text-slate-700'}`}>
                      {n.partner[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800 text-sm">{n.partner}</span>
                        {n.unread > 0 && <span className="bg-rose-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none">{n.unread}</span>}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">{n.id}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${stageColor[n.stage]}`}>{n.stage}</span>
                </div>

                {/* Subject */}
                <p className="text-xs text-slate-500 truncate mb-2">{n.subject}</p>

                {/* Mini progress bar */}
                <div className="flex gap-0.5 mb-2">
                  {NEG_STAGES.map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i <= idx ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                  ))}
                </div>

                {/* Bottom meta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${priorityColor[n.priority]}`} />
                    <span className="text-xs text-slate-400">{n.lastActivity}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {n.requiresAction && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                    {n.overdue && <Timer className="w-3.5 h-3.5 text-rose-500" />}
                    <span className="text-xs text-slate-400">Due {n.deadline.slice(5)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: detail workspace */}
        <div className="flex-1 min-w-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Detail header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">{selected.partner[0]}</div>
                  <span className="font-semibold text-slate-800">{selected.partner}</span>
                  <span className="text-slate-300">·</span>
                  <span className="font-mono text-xs text-slate-400">{selected.id}</span>
                  <Pill label={selected.direction} color="bg-blue-50 text-blue-700" />
                </div>
                <p className="text-sm text-slate-500">{selected.subject}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-xs text-slate-400 justify-end">
                  <RefreshCw className="w-3 h-3" />
                  <span>Auto-saved {selected.savedAt}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 justify-end mt-0.5">
                  <CalendarRange className="w-3 h-3" />
                  <span>Deadline: {selected.deadline}</span>
                  {selected.overdue && <span className="text-rose-500 font-semibold">Overdue</span>}
                </div>
              </div>
            </div>

            {/* Progress tracker */}
            <div className="mt-4 flex items-center">
              {NEG_STAGES.map((stage, i) => {
                const done = i < stageIdx;
                const active = i === stageIdx;
                const future = i > stageIdx;
                return (
                  <div key={stage} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        done   ? 'bg-indigo-600 border-indigo-600 text-white' :
                        active ? 'bg-white border-indigo-600 text-indigo-700 shadow-md' :
                                 'bg-white border-slate-200 text-slate-400'
                      }`}>
                        {done ? <CheckCircle className="w-4 h-4" /> : <span>{i + 1}</span>}
                      </div>
                      <span className={`text-[9px] mt-1 font-medium text-center leading-tight max-w-[60px] ${
                        active ? 'text-indigo-700' : done ? 'text-indigo-400' : 'text-slate-400'
                      }`}>{stage}</span>
                    </div>
                    {i < NEG_STAGES.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < stageIdx ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-100 px-6">
            <div className="flex gap-0">
              {(['overview', 'comparison', 'discussion', 'timeline'] as const).map(tab => (
                <button
                  key={tab}
                  data-local=""
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab === 'discussion' && selected.unread > 0
                    ? <span className="flex items-center gap-1.5">{tab}<span className="bg-rose-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">{selected.unread}</span></span>
                    : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="p-6">

            {/* ── Overview tab ── */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* Commercial summary */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Layers className="w-4 h-4 text-indigo-500" /> Commercial Summary</h4>
                  {editingDraft ? (
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        ['Agreement type', 'type'],
                        ['Tariff reference', 'tariff'],
                        ['Rate', 'rate'],
                        ['Setup fee', 'setupFee'],
                        ['Minimum volume', 'minVolume'],
                        ['Validity period', 'validity'],
                      ] as [string, keyof NegOffer][]).map(([label, field]) => (
                        <div key={field}>
                          <div className="text-xs text-slate-400 font-medium mb-1">{label}</div>
                          <input
                            value={(draftForm[field] as string) ?? ''}
                            onChange={e => setDraftForm(f => ({ ...f, [field]: e.target.value }))}
                            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                        </div>
                      ))}
                      <div className="col-span-2">
                        <div className="text-xs text-slate-400 font-medium mb-1">Terms</div>
                        <textarea
                          rows={3}
                          value={draftForm.terms}
                          onChange={e => setDraftForm(f => ({ ...f, terms: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                      {[
                        ['Agreement type', selected.ourOffer.type],
                        ['Tariff reference', selected.ourOffer.tariff],
                        ['Rate', selected.ourOffer.rate],
                        ['Setup fee', selected.ourOffer.setupFee ?? '--'],
                        ['Minimum volume', selected.ourOffer.minVolume ?? '--'],
                        ['Validity period', selected.ourOffer.validity],
                        ['Negotiation status', selected.stage],
                        ['Last activity', selected.lastActivity],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <div className="text-xs text-slate-400 font-medium mb-0.5">{k}</div>
                          <div className={`text-sm font-semibold ${k === 'Negotiation status' ? stageColor[selected.stage as NegStage].split(' ').slice(1).join(' ') : 'text-slate-800'}`}>{v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Terms (read-only view) */}
                {!editingDraft && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Our Terms</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed">{selected.ourOffer.terms}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
                  {editingDraft ? (
                    <>
                      <button data-local onClick={() => {
                        setNegotiations(prev => prev.map(n => n.id === selected.id ? { ...n, ourOffer: draftForm, lastActivity: 'Just now' } : n));
                        setSelected(s => ({ ...s, ourOffer: draftForm, lastActivity: 'Just now' }));
                        setEditingDraft(false);
                        showToast('Draft saved successfully', 'success');
                      }} className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
                        <CheckCircle className="w-4 h-4" /> Save Draft
                      </button>
                      <button data-local onClick={() => { setEditingDraft(false); setDraftForm(selected.ourOffer); }} className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm px-4 py-2 rounded-lg hover:bg-slate-50">
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </>
                  ) : selected.stage === 'Accepted' ? (
                    <button data-local="" onClick={() => { advanceStage(selected, 'Signature'); showToast(`${selected.partner} agreement moved to Signature Workflow`, 'success'); }} className="flex items-center gap-2 bg-emerald-600 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-emerald-700 font-semibold">
                      <FileSignature className="w-4 h-4" /> Move to Signature Workflow
                    </button>
                  ) : selected.stage === 'Counter Proposal' ? (
                    <>
                      <button data-local="" onClick={() => { advanceStage(selected, 'Accepted'); showToast(`Counter proposal from ${selected.partner} accepted`, 'success'); }} className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
                        <ThumbsUp className="w-4 h-4" /> Accept Counter Proposal
                      </button>
                      <button data-local="" onClick={() => { showToast(`Counter proposal sent to ${selected.partner}`, 'info'); }} className="flex items-center gap-2 border border-orange-300 text-orange-700 text-sm px-4 py-2 rounded-lg hover:bg-orange-50">
                        <ThumbsDown className="w-4 h-4" /> Send Counter
                      </button>
                    </>
                  ) : selected.stage === 'Draft' ? (
                    <>
                      <button data-local="" onClick={() => { advanceStage(selected, 'Proposal Sent'); showToast(`Proposal sent to ${selected.partner}`, 'success'); }} className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
                        <Send className="w-4 h-4" /> Send Proposal
                      </button>
                      <button data-local onClick={() => { setDraftForm(selected.ourOffer); setEditingDraft(true); }} className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm px-4 py-2 rounded-lg hover:bg-slate-50">
                        <Pencil className="w-4 h-4" /> Edit Draft
                      </button>
                    </>
                  ) : (
                    <button data-local="" onClick={() => showToast(`Viewing full agreement for ${selected.partner}`, 'info')} className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm px-4 py-2 rounded-lg hover:bg-slate-50">
                      <Eye className="w-4 h-4" /> View Full Agreement
                    </button>
                  )}
                  {!editingDraft && (
                    <button data-local="" onClick={() => showToast(`PDF exported for ${selected.partner}`, 'success')} className="flex items-center gap-2 border border-slate-200 text-slate-500 text-sm px-4 py-2 rounded-lg hover:bg-slate-50 ml-auto">
                      <Download className="w-4 h-4" /> Export PDF
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* â"₵â"₵ Comparison tab â"₵â"₵ */}
            {activeTab === 'comparison' && (
              <div>
                {selected.theirOffer ? (
                  <>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Field</div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wide"><div className="w-2 h-2 rounded-full bg-indigo-600" /> Our Offer</div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-orange-700 uppercase tracking-wide"><div className="w-2 h-2 rounded-full bg-orange-500" /> Their Counter</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-1">
                      {offerRow('Tariff', selected.ourOffer.tariff, selected.theirOffer.tariff, selected.ourOffer.tariff !== selected.theirOffer.tariff)}
                      {offerRow('Rate', selected.ourOffer.rate, selected.theirOffer.rate, selected.ourOffer.rate !== selected.theirOffer.rate)}
                      {offerRow('Setup fee', selected.ourOffer.setupFee ?? '--', selected.theirOffer.setupFee ?? '--', selected.ourOffer.setupFee !== selected.theirOffer.setupFee)}
                      {offerRow('Min. volume', selected.ourOffer.minVolume ?? '--', selected.theirOffer.minVolume ?? '--', selected.ourOffer.minVolume !== selected.theirOffer.minVolume)}
                      {offerRow('Validity', selected.ourOffer.validity, selected.theirOffer.validity, selected.ourOffer.validity !== selected.theirOffer.validity)}
                      {offerRow('Agr. type', selected.ourOffer.type, selected.theirOffer.type)}
                    </div>

                    {/* Terms comparison */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <div className="text-xs font-bold text-indigo-700 mb-2 uppercase tracking-wide flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-600" /> Our Terms</div>
                        <p className="text-sm text-slate-600 bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 leading-relaxed">{selected.ourOffer.terms}</p>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-orange-700 mb-2 uppercase tracking-wide flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500" /> Their Counter Terms</div>
                        <p className="text-sm text-slate-600 bg-orange-50/50 border border-orange-100 rounded-lg p-3 leading-relaxed">{selected.theirOffer.terms}</p>
                      </div>
                    </div>

                    {selected.stage === 'Counter Proposal' && (
                      <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                        <button data-local="" onClick={() => { advanceStage(selected, 'Accepted'); showToast(`Counter proposal from ${selected.partner} accepted`, 'success'); }} className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
                          <ThumbsUp className="w-4 h-4" /> Accept Counter Proposal
                        </button>
                        <button data-local="" onClick={() => showToast(`New counter sent to ${selected.partner}`, 'info')} className="flex items-center gap-2 border border-orange-300 text-orange-700 text-sm px-4 py-2 rounded-lg hover:bg-orange-50">
                          <ThumbsDown className="w-4 h-4" /> Send New Counter
                        </button>
                      </div>
                    )}
                    {selected.stage === 'Accepted' && (
                      <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                        <button data-local="" onClick={() => { advanceStage(selected, 'Signature'); showToast(`${selected.partner} agreement moved to Signature Workflow`, 'success'); }} className="flex items-center gap-2 bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-700 font-semibold">
                          <FileSignature className="w-4 h-4" /> Move to Signature Workflow
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <GitMerge className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">No counter proposal yet</p>
                    <p className="text-xs mt-1">Awaiting response from {selected.partner}</p>
                  </div>
                )}
              </div>
            )}

            {/* â"₵â"₵ Discussion tab â"₵â"₵ */}
            {activeTab === 'discussion' && (
              <div className="flex flex-col gap-4">
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {messages.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No messages yetstart the conversation</p>
                    </div>
                  ) : messages.map((m, i) => {
                    const isOurs = m.author === 'You';
                    return (
                      <div key={i} className={`flex gap-3 ${isOurs ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${isOurs ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                          {m.author === 'You' ? 'Y' : m.author[0]}
                        </div>
                        <div className={`max-w-[75%] ${isOurs ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed ${isOurs ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                            {m.text}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1">{m.author} · {m.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <input
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendComment()}
                    placeholder="Type a message to your partner..."
                    className="flex-1 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button
                    data-local=""
                    onClick={sendComment}
                    className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40"
                    disabled={!comment.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* â"₵â"₵ Timeline tab â"₵â"₵ */}
            {activeTab === 'timeline' && (
              <div className="space-y-0">
                {selected.timeline.map((ev, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {kindIcon[ev.kind]}
                      {i < selected.timeline.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
                    </div>
                    <div className="pb-5">
                      <p className="text-sm font-medium text-slate-700">{ev.event}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{ev.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-indigo-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : toast.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* New Negotiation Modal */}
      {showNewNegModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">New Negotiation</h2>
              <button data-local onClick={() => setShowNewNegModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">

              {/* Basic info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Partner *</label>
                  <select value={newNegForm.partner} onChange={e => setNewNegForm({ ...newNegForm, partner: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    <option value="">Select a partner...</option>
                    {MARKETPLACE_NETWORKS.map(n => <option key={n.name} value={n.name}>{n.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Subject *</label>
                  <input type="text" placeholder="e.g., Outbound roaming agreement 2026"
                    value={newNegForm.subject} onChange={e => setNewNegForm({ ...newNegForm, subject: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Direction</label>
                  <select value={newNegForm.direction} onChange={e => setNewNegForm({ ...newNegForm, direction: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    <option>Outbound</option><option>Inbound</option><option>Bilateral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Priority</label>
                  <select value={newNegForm.priority} onChange={e => setNewNegForm({ ...newNegForm, priority: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Commercial Summary */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" /> Commercial Summary
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1">Agreement type</label>
                    <select value={newNegForm.type} onChange={e => setNewNegForm({ ...newNegForm, type: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300">
                      <option value="">Select...</option><option>Bilateral</option><option>Inbound</option><option>Outbound</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1">Tariff reference</label>
                    <input type="text" placeholder="e.g., TARIFF-GH-STD-01"
                      value={newNegForm.tariff} onChange={e => setNewNegForm({ ...newNegForm, tariff: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1">Rate</label>
                    <input type="text" placeholder="e.g., ₵ 0.32/kWh"
                      value={newNegForm.rate} onChange={e => setNewNegForm({ ...newNegForm, rate: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1">Setup fee</label>
                    <input type="text" placeholder="e.g., ₵ 0"
                      value={newNegForm.setupFee} onChange={e => setNewNegForm({ ...newNegForm, setupFee: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1">Minimum volume</label>
                    <input type="text" placeholder="e.g., 500 MWh/yr"
                      value={newNegForm.minVolume} onChange={e => setNewNegForm({ ...newNegForm, minVolume: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1">Validity period</label>
                    <input type="text" placeholder="e.g., 1 Jul 2026 - 30 Jun 2027"
                      value={newNegForm.validity} onChange={e => setNewNegForm({ ...newNegForm, validity: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-400 font-medium mb-1">Terms</label>
                    <textarea rows={3} placeholder="e.g., Standard EU terms v2.1, includes OCPI 2.2.1 push, real-time CDR, 30-day clearing."
                      value={newNegForm.terms} onChange={e => setNewNegForm({ ...newNegForm, terms: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button data-local onClick={() => { setShowNewNegModal(false); setNewNegForm({ partner: '', subject: '', direction: 'Outbound', priority: 'medium', type: '', tariff: '', rate: '', setupFee: '', minVolume: '', validity: '', terms: '' }); }}
                  className="flex-1 border border-slate-200 text-slate-600 text-sm px-4 py-2 rounded-lg hover:bg-slate-50">
                  Cancel
                </button>
                <button data-local
                  onClick={() => {
                    if (newNegForm.partner.trim() && newNegForm.subject.trim()) {
                      const today = new Date().toISOString().slice(0, 10);
                      const newNeg: Negotiation = {
                        id: `NEG-${Date.now()}`,
                        partner: newNegForm.partner,
                        subject: newNegForm.subject,
                        direction: newNegForm.direction,
                        stage: 'Draft',
                        priority: newNegForm.priority as Negotiation['priority'],
                        lastActivity: 'Just now',
                        deadline: '',
                        overdue: false,
                        requiresAction: false,
                        ourOffer: { type: newNegForm.type, tariff: newNegForm.tariff, rate: newNegForm.rate, setupFee: newNegForm.setupFee, minVolume: newNegForm.minVolume, validity: newNegForm.validity, terms: newNegForm.terms },
                        messages: [],
                        timeline: [{ event: 'Negotiation created', time: today, kind: 'created' }],
                        savedAt: today,
                        unread: 0,
                      };
                      setNegotiations(prev => [newNeg, ...prev]);
                      setShowNewNegModal(false);
                      setNewNegForm({ partner: '', subject: '', direction: 'Outbound', priority: 'medium', type: '', tariff: '', rate: '', setupFee: '', minVolume: '', validity: '', terms: '' });
                    }
                  }}
                  className="flex-1 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderNegotiation() { return <NegotiationWorkspace />; }

// â"₵â"₵ Signature Workspace â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵
const SIG_LIFECYCLE = ['Negotiation', 'Ready for Signature', 'Waiting for Signature', 'Active', 'Renewal', 'Expired'] as const;
type SigLifecycle = typeof SIG_LIFECYCLE[number];

interface Agreement {
  id: string; partner: string; direction: 'Outbound'|'Inbound'|'Bilateral';
  type: 'Standard'|'Amendment'|'Renewal'; tariff: string;
  lifecycle: SigLifecycle; signedByUs: boolean; signedByPartner: boolean;
  createdAt: string; signedAt?: string; expiresAt: string;
  lastActivity: string; renewalStatus: 'Auto-renew'|'Manual'|'None';
  amendmentRequired: boolean; urgencyDays: number; notes: string;
}

const AGREEMENTS: Agreement[] = [
  { id:'AGR-2026-0041', partner:'VRA EV Charge',       direction:'Outbound',  type:'Standard',  tariff:'TARIFF-GH-STD-01', lifecycle:'Ready for Signature', signedByUs:false, signedByPartner:true,  createdAt:'10 Jun 2026', signedAt:undefined,        expiresAt:'15 Jul 2026', lastActivity:'2h ago',  renewalStatus:'Manual',     amendmentRequired:false, urgencyDays:22, notes:'Partner signed on 20 Jun. Awaiting our countersignature.' },
  { id:'AGR-2026-0038', partner:'Shell Ghana EV', direction:'Bilateral', type:'Amendment', tariff:'TARIFF-GH-BIL-02', lifecycle:'Ready for Signature', signedByUs:false, signedByPartner:true,  createdAt:'5 Jun 2026',  signedAt:undefined,        expiresAt:'22 Jul 2026', lastActivity:'1d ago',  renewalStatus:'Auto-renew',  amendmentRequired:false, urgencyDays:29, notes:'Amendment to AGR-2025-0029. Partner countersigned. Ready for our signature.' },
  { id:'AGR-2026-0035', partner:'GreenMobility GH', direction:'Inbound',   type:'Standard',  tariff:'TARIFF-GH-IN-01',  lifecycle:'Waiting for Signature', signedByUs:true, signedByPartner:false, createdAt:'8 Jun 2026',  signedAt:'20 Jun 2026',   expiresAt:'30 Jun 2027', lastActivity:'3d ago',  renewalStatus:'Manual',     amendmentRequired:false, urgencyDays:372, notes:'We signed on 20 Jun. Awaiting GreenMobility GH countersignature.' },
  { id:'AGR-2026-0031', partner:'Goil EV Network', direction:'Outbound',  type:'Standard',  tariff:'TARIFF-GH-DC-01',  lifecycle:'Waiting for Signature', signedByUs:true, signedByPartner:false, createdAt:'1 Jun 2026',  signedAt:'18 Jun 2026',   expiresAt:'31 Jul 2027', lastActivity:'5d ago',  renewalStatus:'Auto-renew',  amendmentRequired:false, urgencyDays:403, notes:'Proposal accepted. We signed. Goil EV Network review pending.' },
  { id:'AGR-2025-0029', partner:'ECG Ghana',       direction:'Bilateral', type:'Standard',  tariff:'TARIFF-GH-BIL-01', lifecycle:'Active',               signedByUs:true, signedByPartner:true,  createdAt:'10 May 2025', signedAt:'15 May 2025',   expiresAt:'30 Jun 2026', lastActivity:'1h ago',  renewalStatus:'Auto-renew',  amendmentRequired:false, urgencyDays:7,  notes:'Active. Expires in 7 daysrenewal proposal in progress.' },
  { id:'AGR-2025-0022', partner:'Total Energies Ghana', direction:'Bilateral', type:'Standard', tariff:'TARIFF-GH-BIL-03', lifecycle:'Active',              signedByUs:true, signedByPartner:true,  createdAt:'18 Mar 2025', signedAt:'25 Mar 2025',   expiresAt:'31 Dec 2026', lastActivity:'2d ago',  renewalStatus:'Manual',     amendmentRequired:true,  urgencyDays:191, notes:'Active. Amendment requiredCDR frequency update pending.' },
  { id:'AGR-2025-0018', partner:'GreenMobility GH', direction:'Outbound', type:'Standard',  tariff:'TARIFF-GH-STD-02', lifecycle:'Active',               signedByUs:true, signedByPartner:true,  createdAt:'25 Feb 2025', signedAt:'28 Feb 2025',   expiresAt:'28 Feb 2027', lastActivity:'4d ago',  renewalStatus:'Auto-renew',  amendmentRequired:false, urgencyDays:250, notes:'Active. Next review Q4 2026.' },
  { id:'AGR-2024-0061', partner:'ZOTC Nigeria',    direction:'Outbound',  type:'Renewal',   tariff:'TARIFF-GH-STD-01', lifecycle:'Renewal',              signedByUs:false, signedByPartner:false, createdAt:'1 Jan 2024',  signedAt:'10 Jan 2024',   expiresAt:'10 Jan 2026', lastActivity:'1w ago',  renewalStatus:'Manual',     amendmentRequired:false, urgencyDays:-165, notes:'Original agreement expired. Renewal in progress.' },
  { id:'AGR-2024-0048', partner:'Eletrobras EV Brasil', direction:'Inbound', type:'Standard', tariff:'TARIFF-BR-IN-01', lifecycle:'Expired',              signedByUs:true, signedByPartner:true,  createdAt:'5 Jul 2024',  signedAt:'12 Jul 2024',   expiresAt:'31 May 2026', lastActivity:'3w ago',  renewalStatus:'None',       amendmentRequired:false, urgencyDays:-23, notes:'Expired. No renewal initiated.' },
];

function SignatureWorkspace() {
  const [agreements, setAgreements] = useState<Agreement[]>(AGREEMENTS);
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<SigLifecycle|'All'>('All');
  const [filterDir, setFilterDir]       = useState<'All'|'Outbound'|'Inbound'|'Bilateral'>('All');
  const [sortBy, setSortBy]             = useState<'urgency'|'partner'|'activity'>('urgency');
  const [activeView, setActiveView]     = useState<'dashboard'|'list'>('dashboard');
  const [toast, setToast] = useState<{msg:string;type:'success'|'info'|'warning'}|null>(null);
  const showToast = (msg:string, type:'success'|'info'|'warning'='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),2800); };

  const [showEsigModal, setShowEsigModal] = useState(false);
  const [esigAgreementId, setEsigAgreementId] = useState<string|null>(null);
  const [esigSaved, setEsigSaved] = useState<string|null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const openEsig = (id: string) => { setEsigAgreementId(id); setEsigSaved(null); setShowEsigModal(true); };
  const clearCanvas = () => {
    const c = canvasRef.current; if (!c) return;
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
    setEsigSaved(null);
  };
  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    if ('touches' in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); isDrawing.current = true;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.beginPath(); ctx.moveTo(x, y);
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); if (!isDrawing.current) return;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#1e293b';
    ctx.lineTo(x, y); ctx.stroke();
  };
  const endDraw = () => { isDrawing.current = false; };
  const saveEsig = () => {
    const dataUrl = canvasRef.current!.toDataURL();
    setEsigSaved(dataUrl);
  };
  const confirmEsig = () => {
    if (esigAgreementId) { signAgreement(esigAgreementId); showToast('E-signature captured. Agreement signed successfully.', 'success'); }
    setShowEsigModal(false); setEsigAgreementId(null); setEsigSaved(null);
  };

  const scrollToDetail = () => setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 80);

  const signAgreement = (id: string) => {
    const today = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
    setAgreements(prev => prev.map(a => a.id !== id ? a : {
      ...a,
      signedByUs: true,
      signedAt: today,
      lifecycle: a.signedByPartner ? 'Active' : 'Waiting for Signature',
      lastActivity: 'Just now',
    }));
  };

  const selectedAgreement = agreements.find(a => a.id === selectedId) ?? null;

  const awaitingMySig   = agreements.filter(a => a.lifecycle === 'Ready for Signature' && !a.signedByUs);
  const awaitingPartner = agreements.filter(a => a.lifecycle === 'Waiting for Signature' && !a.signedByPartner);
  const activeAgreements = agreements.filter(a => a.lifecycle === 'Active');
  const expiringSoon    = agreements.filter(a => a.urgencyDays >= 0 && a.urgencyDays <= 30 && a.lifecycle === 'Active');

  const filteredAgreements = agreements.filter(a => {
    const matchSearch = !search || a.partner.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || a.lifecycle === filterStatus;
    const matchDir    = filterDir === 'All' || a.direction === filterDir;
    return matchSearch && matchStatus && matchDir;
  }).sort((a, b) => {
    if (sortBy === 'urgency')  return a.urgencyDays - b.urgencyDays;
    if (sortBy === 'partner')  return a.partner.localeCompare(b.partner);
    return 0;
  });

  const urgencyLabel = (days: number) => {
    if (days < 0)   return { text: `Expired ${Math.abs(days)}d ago`, cls: 'text-rose-600 font-semibold' };
    if (days === 0) return { text: 'Expires today!',               cls: 'text-rose-600 font-bold' };
    if (days <= 7)  return { text: `Expires in ${days}d`,          cls: 'text-rose-500 font-semibold' };
    if (days <= 30) return { text: `Expires in ${days}d`,          cls: 'text-amber-600 font-semibold' };
    return           { text: `Expires in ${days}d`,                cls: 'text-slate-400' };
  };

  const lifecyclePill: Record<SigLifecycle, string> = {
    'Negotiation':          'bg-slate-100 text-slate-600',
    'Ready for Signature':  'bg-amber-50 text-amber-700 border border-amber-200',
    'Waiting for Signature':'bg-blue-50 text-blue-700',
    'Active':               'bg-emerald-50 text-emerald-700',
    'Renewal':              'bg-violet-50 text-violet-700',
    'Expired':              'bg-rose-50 text-rose-700',
  };
  const dirPill = { Outbound:'bg-blue-50 text-blue-700', Inbound:'bg-indigo-50 text-indigo-700', Bilateral:'bg-teal-50 text-teal-700' };

  const SigProgress = ({ a }: { a: Agreement }) => (
    <div className="flex items-center gap-3">
      <div className={`flex items-center gap-1 text-xs font-medium ${a.signedByUs ? 'text-emerald-600' : 'text-slate-400'}`}>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${a.signedByUs ? 'bg-emerald-100' : 'bg-slate-100'}`}>
          {a.signedByUs ? <CheckCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
        </div>
        <span>Us</span>
      </div>
      <div className={`h-px w-4 ${a.signedByUs && a.signedByPartner ? 'bg-emerald-400' : 'bg-slate-200'}`} />
      <div className={`flex items-center gap-1 text-xs font-medium ${a.signedByPartner ? 'text-emerald-600' : 'text-slate-400'}`}>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${a.signedByPartner ? 'bg-emerald-100' : 'bg-slate-100'}`}>
          {a.signedByPartner ? <CheckCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
        </div>
        <span>{a.partner.split(' ')[0]}</span>
      </div>
    </div>
  );

  const handleExport = () => {
    const csv = [
      ['Agreement ID', 'Partner', 'Direction', 'Type', 'Status', 'Tariff', 'Created', 'Signed', 'Expires', 'Renewal', 'Signed By Us', 'Signed By Partner'].join(','),
      ...agreements.map(a =>
        [a.id, a.partner, a.direction, a.type, a.lifecycle, a.tariff, a.createdAt, a.signedAt || 'Pending', a.expiresAt, a.renewalStatus, a.signedByUs ? 'Yes' : 'No', a.signedByPartner ? 'Yes' : 'No'].map(v => `"${v}"`).join(',')
      )
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `agreements-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const AgreementCard = ({ a, compact = false }: { a: Agreement; compact?: boolean }) => {
    const urg = urgencyLabel(a.urgencyDays);
    return (
      <button
        data-local=""
        onClick={() => { const opening = selectedId !== a.id; setSelectedId(opening ? a.id : null); if (opening) scrollToDetail(); }}
        className={`w-full text-left rounded-xl border p-4 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-300 ${selectedId === a.id ? 'border-indigo-300 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
        aria-label={`Agreement ${a.id} with ${a.partner}`}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${selectedId === a.id ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-100 text-slate-700'}`}>{a.partner[0]}</div>
            <div className="min-w-0">
              <div className="font-semibold text-slate-800 text-sm">{a.partner}</div>
              <div className="font-mono text-[10px] text-slate-400">{a.id}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${lifecyclePill[a.lifecycle]}`}>{a.lifecycle}</span>
            <span className={`text-[10px] ${urg.cls}`}>{urg.text}</span>
          </div>
        </div>
        {!compact && (
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${dirPill[a.direction]}`}>{a.direction}</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{a.type}</span>
            {a.amendmentRequired && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">Amendment needed</span>}
          </div>
        )}
        <div className="flex items-center justify-between">
          <SigProgress a={a} />
          <span className="text-[10px] text-slate-400">{a.lastActivity}</span>
        </div>
      </button>
    );
  };

  const LifecycleBar = ({ lifecycle }: { lifecycle: SigLifecycle }) => {
    const idx = SIG_LIFECYCLE.indexOf(lifecycle);
    return (
      <div className="flex items-center">
        {SIG_LIFECYCLE.map((stage, i) => {
          const done   = i < idx;
          const active = i === idx;
          return (
            <div key={stage} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-[9px] font-bold ${done ? 'bg-indigo-600 border-indigo-600 text-white' : active ? 'bg-white border-indigo-600 text-indigo-700 shadow' : 'bg-white border-slate-200 text-slate-400'}`}>
                  {done ? <CheckCircle className="w-3.5 h-3.5" /> : <span>{i+1}</span>}
                </div>
                <span className={`text-[8px] mt-0.5 font-medium text-center leading-tight max-w-[52px] ${active ? 'text-indigo-700' : done ? 'text-indigo-400' : 'text-slate-400'}`}>{stage}</span>
              </div>
              {i < SIG_LIFECYCLE.length - 1 && <div className={`flex-1 h-0.5 mx-0.5 mb-3.5 ${i < idx ? 'bg-indigo-500' : 'bg-slate-200'}`} />}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <SectionHeader
        title="Signature"
        sub="Agreement lifecycle managementsign, track, and renew roaming agreements"
        action={
          <div className="flex gap-2 items-center">
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
              {(['dashboard','list'] as const).map(v => (
                <button data-local="" key={v} onClick={() => setActiveView(v)}
                  className={`px-3 py-1.5 font-medium capitalize transition-colors ${activeView === v ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                  {v === 'dashboard' ? '⬛ Dashboard' : '≡ List'}
                </button>
              ))}
            </div>
            <button data-local="" onClick={handleExport} className="flex items-center gap-1.5 border border-slate-200 text-slate-600 text-sm px-3 py-2 rounded-lg hover:bg-slate-50">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        }
      />


      {/* â"₵â"₵ Dashboard view â"₵â"₵ */}
      {activeView === 'dashboard' && (
        <div className="space-y-5">

          {/* Awaiting My Signature */}
          {awaitingMySig.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span className="font-semibold text-rose-800 text-sm">Awaiting Your Signature ({awaitingMySig.length})</span>
                <span className="text-xs text-rose-600 ml-1">-- Action required</span>
              </div>
              <div className="space-y-2">
                {awaitingMySig.map(a => {
                  const urg = urgencyLabel(a.urgencyDays);
                  return (
                    <div
                      key={a.id}
                      role="button" tabIndex={0}
                      onClick={() => { const opening = selectedId !== a.id; setSelectedId(opening ? a.id : null); if (opening) scrollToDetail(); }}
                      onKeyDown={e => { if (e.key === 'Enter') { const opening = selectedId !== a.id; setSelectedId(opening ? a.id : null); if (opening) scrollToDetail(); } }}
                      className={`w-full text-left bg-white rounded-lg border p-4 flex items-center gap-4 hover:border-rose-300 hover:shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-300 ${selectedId === a.id ? 'border-rose-400 shadow-sm' : 'border-rose-100'}`}
                      aria-label={`Sign agreement ${a.id} with ${a.partner}`}
                    >
                      <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center font-bold text-rose-700 text-sm flex-shrink-0">{a.partner[0]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{a.partner}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${dirPill[a.direction]}`}>{a.direction}</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{a.type}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 font-mono">{a.id} · {a.tariff}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{a.notes}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <SigProgress a={a} />
                        <span className={`text-xs mt-1 block ${urg.cls}`}>{urg.text}</span>
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <button data-local="" className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-700 font-semibold" onClick={e => { e.stopPropagation(); signAgreement(a.id); showToast(`Agreement ${a.id} signed. Now ${a.signedByPartner ? 'Active' : 'Waiting for partner'}.`, 'success'); }}>
                          <FileSignature className="w-3.5 h-3.5" /> Sign Now
                        </button>
                        <button data-local="" className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 border border-slate-200 rounded-lg" onClick={e => { e.stopPropagation(); setSelectedId(a.id); scrollToDetail(); }}>
                          Review
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Awaiting Partner Signature */}
          {awaitingPartner.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-800 text-sm">Awaiting Partner Signature ({awaitingPartner.length})</span>
                <span className="text-xs text-blue-600 ml-1">-- Sent, pending countersign</span>
              </div>
              <div className="space-y-2">
                {awaitingPartner.map(a => (
                  <div
                    key={a.id}
                    role="button" tabIndex={0}
                    onClick={() => { const opening = selectedId !== a.id; setSelectedId(opening ? a.id : null); if (opening) scrollToDetail(); }}
                    onKeyDown={e => { if (e.key === 'Enter') { const opening = selectedId !== a.id; setSelectedId(opening ? a.id : null); if (opening) scrollToDetail(); } }}
                    className={`w-full text-left bg-white rounded-lg border p-4 flex items-center gap-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 ${selectedId === a.id ? 'border-blue-400 shadow-sm' : 'border-blue-100'}`}
                    aria-label={`Track agreement ${a.id} sent to ${a.partner}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm flex-shrink-0">{a.partner[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{a.partner}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${dirPill[a.direction]}`}>{a.direction}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 font-mono">{a.id} · Signed by us: {a.signedAt}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{a.notes}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <SigProgress a={a} />
                      <span className="text-xs text-slate-400 mt-1 block">{a.lastActivity}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button data-local="" className="text-xs text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 font-medium" onClick={e => { e.stopPropagation(); showToast(`Reminder sent to ${a.partner}.`, 'info'); }}>
                        Send Reminder
                      </button>
                      <button data-local="" className="text-xs text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50" onClick={e => { e.stopPropagation(); setSelectedId(a.id); scrollToDetail(); }}>
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agreement Health Dashboard */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-500" /> Agreement Health Dashboard
            </h3>
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label:'Active',           value:activeAgreements.length,                                   color:'bg-emerald-500', light:'bg-emerald-50 text-emerald-700' },
                { label:'Pending Signature',value:awaitingMySig.length + awaitingPartner.length,              color:'bg-amber-500',   light:'bg-amber-50 text-amber-700'   },
                { label:'Expiring ≤30d',    value:expiringSoon.length,                                       color:'bg-rose-500',    light:'bg-rose-50 text-rose-700'     },
                { label:'Amendment Needed', value:agreements.filter(a=>a.amendmentRequired).length,          color:'bg-orange-400',  light:'bg-orange-50 text-orange-700' },
              ].map(h => (
                <div key={h.label} className={`rounded-lg p-3 ${h.light}`}>
                  <div className="text-xl font-bold">{h.value}</div>
                  <div className="text-xs font-medium mt-0.5">{h.label}</div>
                  <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div className={`h-full ${h.color} rounded-full`} style={{ width: `${Math.min(100, (h.value / agreements.length) * 100 * 1.5)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Expiring soon list */}
            {expiringSoon.length > 0 && (
              <>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Expiring Soon</div>
                <div className="space-y-1.5">
                  {expiringSoon.map(a => {
                    const urg = urgencyLabel(a.urgencyDays);
                    return (
                      <div
                        key={a.id}
                        role="button" tabIndex={0}
                        onClick={() => { const opening = selectedId !== a.id; setSelectedId(opening ? a.id : null); if (opening) scrollToDetail(); }}
                        onKeyDown={e => { if (e.key === 'Enter') { const opening = selectedId !== a.id; setSelectedId(opening ? a.id : null); if (opening) scrollToDetail(); } }}
                        className="w-full text-left flex items-center gap-3 bg-amber-50/60 border border-amber-100 rounded-lg px-3 py-2.5 hover:border-amber-300 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-300"
                      >
                        <Timer className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span className="font-medium text-slate-800 text-sm flex-1">{a.partner}</span>
                        <span className="font-mono text-[10px] text-slate-400">{a.id}</span>
                        <span className={`text-xs ${urg.cls}`}>{urg.text}</span>
                        <button data-local="" className="text-xs text-indigo-600 border border-indigo-200 px-2 py-1 rounded-md hover:bg-indigo-50 font-medium" onClick={e => { e.stopPropagation(); showToast(`Renewal initiated for ${a.partner}.`, 'success'); }}>Renew</button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Amendment required */}
            {agreements.filter(a=>a.amendmentRequired).map(a => (
              <div key={a.id} className="mt-3 flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2.5">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-800 flex-1">{a.partner}{a.notes}</span>
                <button data-local="" className="text-xs text-orange-700 border border-orange-200 px-2 py-1 rounded-md hover:bg-orange-100 font-medium" onClick={e => { e.stopPropagation(); showToast(`Amendment request submitted for ${a.partner}.`, 'warning'); }}>Amend</button>
              </div>
            ))}
          </div>

          {/* Active agreements grid */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Active Agreements</div>
            <div className="grid grid-cols-2 gap-3">
              {activeAgreements.map(a => <AgreementCard key={a.id} a={a} />)}
            </div>
          </div>
        </div>
      )}

      {/* â"₵â"₵ List view â"₵â"₵ */}
      {activeView === 'list' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3 flex-wrap items-center bg-white rounded-xl border border-slate-200 p-3">
            <div className="relative flex-1 min-w-36">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search partner or ID..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <select data-local="" value={filterStatus} onChange={e => setFilterStatus(e.target.value as SigLifecycle|'All')}
              className="border border-slate-200 rounded-lg text-xs px-2 py-1.5 bg-white text-slate-700 focus:outline-none">
              <option value="All">All Stages</option>
              {SIG_LIFECYCLE.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select data-local="" value={filterDir} onChange={e => setFilterDir(e.target.value as typeof filterDir)}
              className="border border-slate-200 rounded-lg text-xs px-2 py-1.5 bg-white text-slate-700 focus:outline-none">
              {['All','Outbound','Inbound','Bilateral'].map(d => <option key={d} value={d}>{d === 'All' ? 'All Directions' : d}</option>)}
            </select>
            <select data-local="" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="border border-slate-200 rounded-lg text-xs px-2 py-1.5 bg-white text-slate-700 focus:outline-none">
              <option value="urgency">Sort: Urgency</option>
              <option value="partner">Sort: Partner</option>
              <option value="activity">Sort: Activity</option>
            </select>
            <span className="text-xs text-slate-400">{filteredAgreements.length} agreements</span>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Agreement','Partner','Direction','Signatures','Lifecycle','Expiry','Last Updated','Renewal',''].map(h => (
                    <th key={h} className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAgreements.map(a => {
                  const urg = urgencyLabel(a.urgencyDays);
                  const isSelected = selectedId === a.id;
                  return (
                    <tr
                      key={a.id}
                      onClick={() => setSelectedId(isSelected ? null : a.id)}
                      className={`border-b border-slate-50 cursor-pointer transition-colors hover:bg-indigo-50/40 ${isSelected ? 'bg-indigo-50' : ''}`}
                      tabIndex={0}
                      aria-selected={isSelected}
                      onKeyDown={e => { if (e.key === 'Enter') setSelectedId(isSelected ? null : a.id); }}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{a.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 flex-shrink-0">{a.partner[0]}</div>
                          <span className="font-medium text-slate-800 text-xs">{a.partner}</span>
                          {a.amendmentRequired && <AlertTriangle className="w-3 h-3 text-orange-500" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${dirPill[a.direction]}`}>{a.direction}</span>
                      </td>
                      <td className="px-4 py-3"><SigProgress a={a} /></td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${lifecyclePill[a.lifecycle]}`}>{a.lifecycle}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-600">{a.expiresAt}</div>
                        <div className={`text-[10px] ${urg.cls}`}>{urg.text}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{a.lastActivity}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${a.renewalStatus === 'Auto-renew' ? 'bg-emerald-50 text-emerald-700' : a.renewalStatus === 'Manual' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{a.renewalStatus}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                          {!a.signedByUs && a.lifecycle === 'Ready for Signature' && (
                            <button data-local="" onClick={() => { signAgreement(a.id); showToast(`Agreement ${a.id} signed. Now ${a.signedByPartner ? 'Active' : 'Waiting for partner'}.`, 'success'); }} className="text-[10px] font-semibold bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700">Sign</button>
                          )}
                          <button data-local="" onClick={() => { setSelectedId(a.id); scrollToDetail(); }} className="text-[10px] text-indigo-600 border border-indigo-100 px-2 py-1 rounded hover:bg-indigo-50">View</button>
                          <button data-local="" onClick={() => showToast(`Downloading PDF for ${a.id}…`, 'info')} className="text-[10px] text-slate-500 border border-slate-200 px-2 py-1 rounded hover:bg-slate-50">PDF</button>
                          {a.lifecycle === 'Active' && a.urgencyDays <= 60 && (
                            <button data-local="" onClick={() => showToast(`Renewal initiated for ${a.partner}.`, 'success')} className="text-[10px] text-violet-600 border border-violet-200 px-2 py-1 rounded hover:bg-violet-50">Renew</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* â"₵â"₵ Selected agreement detail panel â"₵â"₵ */}
      {selectedAgreement && (
        <div className="bg-white rounded-xl border border-indigo-200 shadow-md p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">{selectedAgreement.partner[0]}</div>
                <span className="font-bold text-slate-900 text-base">{selectedAgreement.partner}</span>
                <span className="font-mono text-xs text-slate-400">{selectedAgreement.id}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${lifecyclePill[selectedAgreement.lifecycle]}`}>{selectedAgreement.lifecycle}</span>
              </div>
              <p className="text-sm text-slate-500">{selectedAgreement.notes}</p>
            </div>
            <button data-local="" onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-700 p-1"><X className="w-4 h-4" /></button>
          </div>

          {/* Lifecycle bar */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Agreement Lifecycle</div>
            <LifecycleBar lifecycle={selectedAgreement.lifecycle} />
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-3 gap-4">
            {[
              ['Direction',      selectedAgreement.direction],
              ['Type',           selectedAgreement.type],
              ['Tariff',         selectedAgreement.tariff],
              ['Created',        selectedAgreement.createdAt],
              ['Signed (us)',    selectedAgreement.signedAt ?? '--'],
              ['Expires',        selectedAgreement.expiresAt],
              ['Renewal',        selectedAgreement.renewalStatus],
              ['Last activity',  selectedAgreement.lastActivity],
              ['Amendment',      selectedAgreement.amendmentRequired ? 'Required' : 'None'],
            ].map(([k, v]) => (
              <div key={k} className="bg-slate-50 rounded-lg p-3">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{k}</div>
                <div className={`text-sm font-semibold ${k === 'Amendment' && v === 'Required' ? 'text-orange-600' : 'text-slate-800'}`}>{v}</div>
              </div>
            ))}
          </div>

          {/* Signature progress */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Signature Status</div>
            <div className="flex gap-4">
              {[
                { party:'Our organisation', signed:selectedAgreement.signedByUs,      date:selectedAgreement.signedAt },
                { party:selectedAgreement.partner, signed:selectedAgreement.signedByPartner, date:selectedAgreement.signedByPartner ? selectedAgreement.signedAt : undefined },
              ].map(s => (
                <div key={s.party} className={`flex-1 rounded-lg border p-3 flex items-center gap-3 ${s.signed ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${s.signed ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                    {s.signed ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{s.party}</div>
                    <div className={`text-xs ${s.signed ? 'text-emerald-600' : 'text-slate-400'}`}>{s.signed ? `Signed${s.date ? ' ' + s.date : ''}` : 'Pending'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
            {!selectedAgreement.signedByUs && selectedAgreement.lifecycle === 'Ready for Signature' && (
              <>
                <button data-local onClick={() => openEsig(selectedAgreement.id)} className="flex items-center gap-2 bg-violet-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-violet-700 font-semibold">
                  <Pencil className="w-4 h-4" /> E-Signature
                </button>
                <button data-local="" onClick={() => { signAgreement(selectedAgreement.id); showToast(`Agreement ${selectedAgreement.id} signed successfully. Now Active.`, 'success'); }} className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold">
                  <FileSignature className="w-4 h-4" /> Sign Agreement
                </button>
              </>
            )}
            {selectedAgreement.lifecycle === 'Active' && selectedAgreement.urgencyDays <= 60 && (
              <button data-local="" onClick={() => { showToast(`Renewal initiated for ${selectedAgreement.partner}.`, 'success'); setTimeout(() => { setSelectedId(null); document.querySelector('[class*="space-y-5"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }, 1500); }} className="flex items-center gap-2 bg-violet-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-violet-700 font-semibold">
                <RefreshCw className="w-4 h-4" /> Initiate Renewal
              </button>
            )}
            {selectedAgreement.amendmentRequired && (
              <button data-local="" onClick={() => showToast(`Amendment request submitted for ${selectedAgreement.partner}.`, 'warning')} className="flex items-center gap-2 border border-orange-300 text-orange-700 text-sm px-4 py-2 rounded-lg hover:bg-orange-50">
                <Pencil className="w-4 h-4" /> Amend Agreement
              </button>
            )}
            {selectedAgreement.lifecycle === 'Waiting for Signature' && (
              <button data-local="" onClick={() => showToast(`Reminder sent to ${selectedAgreement.partner}.`, 'info')} className="flex items-center gap-2 border border-blue-300 text-blue-700 text-sm px-4 py-2 rounded-lg hover:bg-blue-50">
                <Send className="w-4 h-4" /> Send Reminder
              </button>
            )}

            <button data-local="" onClick={() => showToast(`Downloading PDF for ${selectedAgreement.id}…`, 'info')} className="flex items-center gap-2 border border-slate-200 text-slate-500 text-sm px-4 py-2 rounded-lg hover:bg-slate-50 ml-auto">
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>
      )}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-indigo-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : toast.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* E-Signature Modal */}
      {showEsigModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-800">Electronic Signature</h2>
                <p className="text-xs text-slate-400 mt-0.5">Draw your signature in the box below</p>
              </div>
              <button data-local onClick={() => setShowEsigModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="relative rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden" style={{height:'180px'}}>
                <canvas
                  ref={canvasRef}
                  width={440}
                  height={180}
                  className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={endDraw}
                />
                {!esigSaved && (
                  <p className="absolute inset-0 flex items-center justify-center text-slate-300 text-sm pointer-events-none select-none">
                    Sign here
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <button data-local onClick={clearCanvas} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3" /> Clear
                </button>
                <button data-local onClick={saveEsig} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 font-semibold">
                  <CheckCircle className="w-3 h-3" /> Preview signature
                </button>
              </div>
              {esigSaved && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs text-emerald-700 font-semibold mb-2 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Signature captured</p>
                  <img src={esigSaved} alt="E-signature preview" className="max-h-14 object-contain" />
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button data-local onClick={() => setShowEsigModal(false)} className="flex-1 border border-slate-200 text-slate-600 text-sm px-4 py-2 rounded-lg hover:bg-slate-50">
                  Cancel
                </button>
                <button data-local onClick={confirmEsig} disabled={!esigSaved} className={`flex-1 flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-lg font-semibold transition-all ${esigSaved ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                  <FileSignature className="w-4 h-4" /> Confirm & Sign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderSignature() { return <SignatureWorkspace />; }

// ── API Keys & Developer Workspace ────────────────────────────────────────────
type ApiKeyRecord = { id: string; name: string; key: string; created: string; lastUsed: string; status: 'Active'|'Revoked'; scope: string; requests: number };
type ApiTab = 'keys' | 'usage' | 'guide';

const SAMPLE_KEYS: ApiKeyRecord[] = [
  { id:'k1', name:'OCPI Production Feed', key:'cbk_live_4xR9mKpLzT2wQsNvYeAj8uDfGhBo3', created:'12 Mar 2026', lastUsed:'Just now',    status:'Active',  scope:'read:cdrs write:sessions read:tariffs', requests: 94231 },
  { id:'k3', name:'Staging Test Key',     key:'cbk_test_9sWjYbNpLo1hXuQmKrDe3vCfTiZg6', created:'18 Feb 2026', lastUsed:'2 days ago',  status:'Active',  scope:'read:* write:*',                       requests: 1204  },
  { id:'k4', name:'Legacy Connector v1',  key:'cbk_live_2mRkTqZsNcPbVdLoYeXhWjFiUoGa1', created:'10 Sep 2025', lastUsed:'45 days ago', status:'Revoked', scope:'read:cdrs',                            requests: 3891  },
];

const DAILY_REQUESTS = [320,410,390,520,480,610,590,700,680,750,820,910,880,940,980,1020,1100,1080,1150,1200,1180,1220,1300,1250,1310,1380,1420,1400,1460,1500];
const ENDPOINT_STATS = [
  { endpoint:'/v2/cdrs',          method:'GET',  calls:48210, p99:'142ms', errors:'0.2%', color:'bg-indigo-500' },
  { endpoint:'/v2/sessions',      method:'GET',  calls:31004, p99:'98ms',  errors:'0.1%', color:'bg-emerald-500' },
  { endpoint:'/v2/tariffs',       method:'GET',  calls:9830,  p99:'81ms',  errors:'0.0%', color:'bg-violet-500' },
  { endpoint:'/v2/tokens',        method:'POST', calls:4012,  p99:'220ms', errors:'0.4%', color:'bg-amber-500' },
  { endpoint:'/v2/locations',     method:'GET',  calls:1175,  p99:'110ms', errors:'0.1%', color:'bg-blue-500' },
];

function APIKeysWorkspace() {
  const [tab, setTab] = useState<ApiTab>('keys');
  const [keys, setKeys] = useState<ApiKeyRecord[]>(SAMPLE_KEYS);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newScope, setNewScope] = useState('read:cdrs read:sessions');
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copied, setCopied]   = useState<string|null>(null);
  const [toast, setToast]     = useState<string|null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const maskKey = (k: string) => k.slice(0, 12) + '••••••••••••••••••••' + k.slice(-4);
  const copyKey = (k: string, id: string) => { navigator.clipboard.writeText(k).catch(()=>{}); setCopied(id); showToast('API key copied to clipboard'); setTimeout(() => setCopied(null), 2000); };
  const revokeKey = (id: string) => { setKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'Revoked' } : k)); showToast('Key revoked successfully'); };
  const toggleReveal = (id: string) => setRevealed(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const createKey = () => {
    if (!newName.trim()) return;
    const rand = () => Math.random().toString(36).slice(2);
    const newKey: ApiKeyRecord = {
      id: 'k' + Date.now(), name: newName.trim(),
      key: `cbk_live_${rand()}${rand()}${rand()}`.slice(0, 44),
      created: new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }),
      lastUsed: 'Never', status: 'Active', scope: newScope, requests: 0,
    };
    setKeys(prev => [newKey, ...prev]);
    setShowCreate(false); setNewName(''); showToast('New API key created');
  };

  const maxReq = Math.max(...DAILY_REQUESTS);
  const totalReq = keys.filter(k=>k.status==='Active').reduce((s,k)=>s+k.requests,0);
  const activeKeys = keys.filter(k=>k.status==='Active').length;

  const tabs: { id: ApiTab; label: string; icon: React.ElementType }[] = [
    { id:'keys',  label:'API Keys',          icon: KeyRound  },
    { id:'usage', label:'Usage & Performance', icon: BarChart3 },
    { id:'guide', label:'How to Use',         icon: BookOpen  },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">API Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage keys, monitor usage, and integrate partner data into your portal</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span className="text-xs font-semibold text-emerald-700">API Operational</span>
          </div>
          <button data-local onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold">
            <Plus className="w-4 h-4" /> New API Key
          </button>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:'Total Requests (30d)', value: totalReq.toLocaleString(), icon: Zap,        color:'text-indigo-600 bg-indigo-50' },
          { label:'Active Keys',           value: String(activeKeys),         icon: KeyRound,   color:'text-emerald-600 bg-emerald-50' },
          { label:'Avg Latency',           value: '108 ms',                   icon: Timer,      color:'text-violet-600 bg-violet-50' },
          { label:'Error Rate',            value: '0.2%',                     icon: ShieldAlert,color:'text-amber-600 bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white border border-slate-100 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} data-local onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: API Keys ── */}
      {tab === 'keys' && (
        <div className="space-y-3">
          {keys.map(k => (
            <div key={k.id} className={`bg-white rounded-xl border p-4 ${k.status === 'Revoked' ? 'border-slate-100 opacity-60' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800 text-sm">{k.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${k.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{k.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 tracking-wide">
                      {revealed.has(k.id) ? k.key : maskKey(k.key)}
                    </code>
                    <button data-local onClick={() => toggleReveal(k.id)} className="text-slate-400 hover:text-slate-700 p-1 rounded">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button data-local onClick={() => copyKey(k.key, k.id)} className={`p-1 rounded transition-colors ${copied === k.id ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-700'}`}>
                      {copied === k.id ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                    <span>Created {k.created}</span>
                    <span>Last used: {k.lastUsed}</span>
                    <span>{k.requests.toLocaleString()} requests</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {k.scope.split(' ').map(s => (
                      <span key={s} className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 rounded px-1.5 py-0.5 font-mono">{s}</span>
                    ))}
                  </div>
                </div>
                {k.status === 'Active' && (
                  <button data-local onClick={() => revokeKey(k.id)} className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-700 border border-rose-200 hover:border-rose-400 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                    <Trash2 className="w-3.5 h-3.5" /> Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: Usage & Performance ── */}
      {tab === 'usage' && (
        <div className="space-y-5">
          {/* Request chart */}
          {(() => {
            const chartH = 160;
            const yTicks = [0, 400, 800, 1200, 1600];
            const yMax   = 1600;
            // Generate last-30-day date labels
            const dateLabels = Array.from({ length: 30 }, (_, i) => {
              const d = new Date('2026-06-24');
              d.setDate(d.getDate() - (29 - i));
              return { day: d.getDate(), mon: d.toLocaleString('en', { month:'short' }), full: `${d.toLocaleString('en',{month:'short'})} ${d.getDate()}` };
            });
            // Show label every 5 days
            const showLabel = (i: number) => i === 0 || (i + 1) % 5 === 0;
            const peak = Math.max(...DAILY_REQUESTS);
            const peakIdx = DAILY_REQUESTS.indexOf(peak);
            const avg = Math.round(DAILY_REQUESTS.reduce((s,v)=>s+v,0)/DAILY_REQUESTS.length);
            return (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="font-semibold text-slate-800">API Requests — Last 30 Days</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Daily request count across all active API keys</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Daily avg</p>
                      <p className="text-sm font-bold text-slate-700">{avg.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Peak day</p>
                      <p className="text-sm font-bold text-indigo-600">{peak.toLocaleString()}</p>
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1">↑ +18% vs prev 30d</span>
                  </div>
                </div>

                {/* Chart area */}
                <div className="flex gap-3">
                  {/* Y-axis labels */}
                  <div className="flex flex-col justify-between text-right pr-1" style={{ height: chartH }}>
                    {[...yTicks].reverse().map(t => (
                      <span key={t} className="text-[10px] text-slate-400 leading-none">{t === 0 ? '0' : t >= 1000 ? `${t/1000}k` : t}</span>
                    ))}
                  </div>

                  {/* Bars + gridlines */}
                  <div className="flex-1 relative" style={{ height: chartH }}>
                    {/* Horizontal gridlines */}
                    {yTicks.map(t => (
                      <div key={t} className="absolute w-full border-t border-slate-100"
                        style={{ bottom: `${(t / yMax) * 100}%` }} />
                    ))}
                    {/* Avg line */}
                    <div className="absolute w-full border-t-2 border-dashed border-amber-400 z-10"
                      style={{ bottom: `${(avg / yMax) * 100}%` }}>
                      <span className="absolute right-0 -top-4 text-[10px] text-amber-600 font-semibold bg-amber-50 px-1 rounded">avg</span>
                    </div>

                    {/* Bars */}
                    <div className="absolute inset-0 flex items-end gap-0.5">
                      {DAILY_REQUESTS.map((v, i) => {
                        const isPeak = i === peakIdx;
                        const isRecent = i >= 25;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center justify-end group relative h-full">
                            <div
                              className={`w-full rounded-t transition-all ${isPeak ? 'bg-indigo-600' : isRecent ? 'bg-indigo-500' : 'bg-indigo-300'} group-hover:bg-indigo-600`}
                              style={{ height: `${(v / yMax) * 100}%` }}
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-20 shadow-lg">
                              <div className="font-semibold">{dateLabels[i].full}</div>
                              <div className="text-indigo-300">{v.toLocaleString()} requests</div>
                              {isPeak && <div className="text-amber-300">↑ Peak day</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* X-axis date labels */}
                <div className="flex ml-10 mt-1">
                  {dateLabels.map((d, i) => (
                    <div key={i} className="flex-1 text-center">
                      {showLabel(i) && (
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {d.mon} {d.day}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-5 mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-indigo-300" /><span className="text-[11px] text-slate-500">Earlier days</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-indigo-500" /><span className="text-[11px] text-slate-500">Last 5 days</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-indigo-600" /><span className="text-[11px] text-slate-500">Peak day</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-6 border-t-2 border-dashed border-amber-400" /><span className="text-[11px] text-slate-500">Daily average ({avg.toLocaleString()})</span></div>
                </div>
              </div>
            );
          })()}

          {/* Endpoint table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Top Endpoints</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="text-left px-5 py-3">Endpoint</th>
                  <th className="text-left px-5 py-3">Method</th>
                  <th className="text-right px-5 py-3">Calls (30d)</th>
                  <th className="text-right px-5 py-3">P99 Latency</th>
                  <th className="text-right px-5 py-3">Error Rate</th>
                  <th className="px-5 py-3">Traffic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ENDPOINT_STATS.map(e => {
                  const pct = Math.round((e.calls / ENDPOINT_STATS[0].calls) * 100);
                  return (
                    <tr key={e.endpoint} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-slate-800">{e.endpoint}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${e.method==='GET' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{e.method}</span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-slate-700">{e.calls.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-slate-600">{e.p99}</td>
                      <td className={`px-5 py-3 text-right font-medium ${parseFloat(e.errors) > 0.3 ? 'text-amber-600' : 'text-emerald-600'}`}>{e.errors}</td>
                      <td className="px-5 py-3">
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className={`${e.color} rounded-full h-1.5`} style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Free limits */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Daily Limits</h3>
            {[
              { label:'CDR / Session requests', used: 1500, total: 50000, color:'bg-indigo-500' },
              { label:'Non-tile API requests',   used: 210,  total: 2500,  color:'bg-violet-500' },
            ].map(l => (
              <div key={l.label} className="mb-4 last:mb-0">
                <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                  <span>{l.label}</span>
                  <span className="font-semibold">{l.used.toLocaleString()} / {l.total.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={`${l.color} rounded-full h-2 transition-all`} style={{ width: `${(l.used/l.total)*100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: How to Use ── */}
      {tab === 'guide' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-1">Base URL</h3>
            <p className="text-xs text-slate-500 mb-3">All API requests go to this base endpoint</p>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
              <code className="text-sm font-mono text-indigo-700 flex-1">https://api.chargebridge.io/v2</code>
              <button data-local onClick={() => showToast('Base URL copied')} className="text-slate-400 hover:text-slate-700"><Copy className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-semibold text-slate-800">Authentication</h3>
            <p className="text-sm text-slate-600">Pass your API key as a Bearer token in the <code className="bg-slate-100 px-1 rounded text-xs">Authorization</code> header on every request.</p>
            <div className="bg-slate-900 rounded-xl p-4 text-sm font-mono text-slate-100 overflow-x-auto">
              <div className="text-slate-400 text-xs mb-2"># Example — fetch CDRs</div>
              <div><span className="text-emerald-400">curl</span> <span className="text-amber-300">-X GET</span> \</div>
              <div className="pl-4"><span className="text-sky-300">https://api.chargebridge.io/v2/cdrs</span> \</div>
              <div className="pl-4"><span className="text-amber-300">-H</span> <span className="text-rose-300">"Authorization: Bearer cbk_live_4xR9mKp..."</span> \</div>
              <div className="pl-4"><span className="text-amber-300">-H</span> <span className="text-rose-300">"Content-Type: application/json"</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Available Endpoints</h3>
            <div className="space-y-2">
              {[
                { method:'GET',  path:'/v2/cdrs',       desc:'Retrieve charge detail records from partner networks',   scope:'read:cdrs' },
                { method:'GET',  path:'/v2/sessions',   desc:'Fetch active and historical roaming sessions',           scope:'read:sessions' },
                { method:'GET',  path:'/v2/tariffs',    desc:'Get tariff information for connected CPO networks',      scope:'read:tariffs' },
                { method:'POST', path:'/v2/tokens',     desc:'Register or update an eMSP token for authorisation',    scope:'write:tokens' },
                { method:'GET',  path:'/v2/locations',  desc:'List EVSE locations and real-time availability',         scope:'read:locations' },
                { method:'GET',  path:'/v2/disputes',   desc:'Pull open disputes and their resolution status',         scope:'read:disputes' },
              ].map(ep => (
                <div key={ep.path} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 whitespace-nowrap ${ep.method==='GET' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{ep.method}</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-xs font-mono text-slate-800">{ep.path}</code>
                    <p className="text-xs text-slate-500 mt-0.5">{ep.desc}</p>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 rounded px-1.5 py-0.5 font-mono whitespace-nowrap">{ep.scope}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Response Format</h3>
            <p className="text-sm text-slate-600 mb-3">All responses are JSON. Successful responses include a <code className="bg-slate-100 px-1 rounded text-xs">data</code> key; errors return a structured <code className="bg-slate-100 px-1 rounded text-xs">error</code> object.</p>
            <div className="bg-slate-900 rounded-xl p-4 text-xs font-mono text-slate-100 overflow-x-auto">
              <div><span className="text-slate-400">{'{'}</span></div>
              <div className="pl-4"><span className="text-sky-300">"status"</span><span className="text-slate-400">: </span><span className="text-emerald-300">"OK"</span><span className="text-slate-400">,</span></div>
              <div className="pl-4"><span className="text-sky-300">"timestamp"</span><span className="text-slate-400">: </span><span className="text-emerald-300">"2026-06-24T10:30:00Z"</span><span className="text-slate-400">,</span></div>
              <div className="pl-4"><span className="text-sky-300">"data"</span><span className="text-slate-400">: {'[ ... ]'},</span></div>
              <div className="pl-4"><span className="text-sky-300">"meta"</span><span className="text-slate-400">: {'{'} </span><span className="text-sky-300">"total"</span><span className="text-slate-400">: </span><span className="text-amber-300">94231</span><span className="text-slate-400">, </span><span className="text-sky-300">"page"</span><span className="text-slate-400">: </span><span className="text-amber-300">1</span><span className="text-slate-400"> {'}'}</span></div>
              <div><span className="text-slate-400">{'}'}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Create key modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Create API Key</h2>
              <button data-local onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Key Name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. OCPI Production Feed"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Scopes</label>
              <select value={newScope} onChange={e => setNewScope(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="read:cdrs read:sessions">Read CDRs + Sessions</option>
                <option value="read:cdrs read:sessions read:tariffs">Read CDRs + Sessions + Tariffs</option>
                <option value="read:* write:*">Full Access (read + write)</option>
                <option value="read:cdrs">Read CDRs only</option>
                <option value="read:locations">Read Locations only</option>
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button data-local onClick={() => setShowCreate(false)} className="flex-1 border border-slate-200 text-slate-600 text-sm px-4 py-2 rounded-lg hover:bg-slate-50">Cancel</button>
              <button data-local onClick={createKey} className="flex-1 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold">Generate Key</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg bg-slate-800 text-white text-sm font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-400" /> {toast}
        </div>
      )}
    </div>
  );
}
/* ── Nearby Charging Stations ─────────────────────────────────────────── */
interface ConnectorDetail {
  id: string; type: string; powerKW: number;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Offline';
  waitingDrivers: number;
}
interface ChargingStation {
  id: string | number; stationName: string; latitude: number; longitude: number;
  address: string; connectorType: string; availableConnectors: number;
  occupiedConnectors: number; totalConnectors: number;
  chargingSpeed: string; stationStatus: 'Available' | 'Busy' | 'Offline';
  operatingHours: string; distance?: number;
  waitingDrivers: number; estimatedWaitTime: number;
  connectors: ConnectorDetail[]; lastUpdated: string;
}

const TOMTOM_KEY = 'RyXiN45JIAuQa6tOPbsd4Ll4C8aWvDd5';

/* ─────────────────────────────────────────────────────────────────────────
 * RF Connector — Provider-Agnostic Marketplace Architecture
 *
 * Flow:  Provider API → Adapter → MarketplaceStation → UI
 * Adding a new provider = write one new adapter function, UI never changes.
 * ───────────────────────────────────────────────────────────────────────── */

/** Common internal model — UI binds to this, not to any provider's DTO */
interface RFConnectorStation {
  stationId:     string;
  stationName:   string;
  operatorName:  string;
  address:       string;
  latitude:      number;
  longitude:     number;
  connectors:    RFConnector[];
  availability:  'Available' | 'Charging' | 'Reserved' | 'Inoperative' | 'Unknown';
  openingHours:  string;
  paymentMethod: string;
  image:         string;
  rating:        number;
  amenities:     string[];
  distance:      number;
  provider:      'TomTom' | 'OpenChargeMap' | 'OCPI' | 'Manual';
  lastUpdated:   string;
}

interface RFConnector {
  type:          string;
  currentType?:  'AC' | 'DC' | 'Unknown';
  powerKW:       number;
  status:        'Available' | 'Occupied' | 'Reserved' | 'Offline';
  waitingDrivers: number;
}

/** TomTom connector type → RF Connector standard name */
const TOMTOM_CONNECTOR_MAP: Record<string, string> = {
  IEC62196Type1:      'Type 1',
  IEC62196Type1CCS:   'CCS1',
  IEC62196Type2:      'Type 2',
  IEC62196Type2CCS:   'CCS2',
  Chademo:            'CHAdeMO',
  GBT20234Part2:      'GB/T AC',
  GBT20234Part3:      'GB/T DC',
  Tesla:              'Tesla',
  IEC60309DC:         'IEC 60309 DC',
  IEC60309SinglePhase:'IEC 60309 AC',
  Domestic:           'Domestic',
};

function mapTomTomConnectorType(raw: string): string {
  return TOMTOM_CONNECTOR_MAP[raw] ?? raw ?? 'Unknown';
}

/** TomTom API response → RFConnectorStation (common internal model) */
function mapTomTomToRFStation(
  item:    any,
  city:    string,
  country: string,
  index:   number,
  simulatedConnectors: RFConnector[],
): RFConnectorStation {
  const pos  = item.position  ?? {};
  const poi  = item.poi       ?? {};
  const addr = item.address   ?? {};
  const id   = item.id ?? `tt-${city}-${index}`;

  // Operator: TomTom sometimes provides brand names
  const operatorName = poi.brands?.[0]?.name
    ?? poi.classifications?.[0]?.names?.[0]?.name
    ?? 'Unknown Operator';

  // Connectors: TomTom EV POI may include connector details
  const rawConnectors: any[] = poi.connectorTypes ?? [];
  const connectors: RFConnector[] = rawConnectors.length > 0
    ? rawConnectors.map((c: any, i: number) => ({
        type:          mapTomTomConnectorType(c.type ?? ''),
        currentType:   (c.currentType === 'AC' ? 'AC' : c.currentType === 'DC' ? 'DC' : 'Unknown') as 'AC' | 'DC' | 'Unknown',
        powerKW:       c.powerKW ?? 0,
        status:        simulatedConnectors[i]?.status ?? 'Available',
        waitingDrivers: simulatedConnectors[i]?.waitingDrivers ?? 0,
      }))
    : simulatedConnectors;  // fall back to OCPI simulation when TomTom lacks connector detail

  // Derive availability from connectors
  const hasAvailable = connectors.some(c => c.status === 'Available');
  const hasCharging  = connectors.some(c => c.status === 'Occupied');
  const hasReserved  = connectors.some(c => c.status === 'Reserved');
  const availability: RFConnectorStation['availability'] =
    hasAvailable ? 'Available'
    : hasCharging ? 'Charging'
    : hasReserved ? 'Reserved'
    : connectors.length > 0 ? 'Inoperative'
    : 'Unknown';

  return {
    stationId:    id,
    stationName:  poi.name ?? 'EV Charging Station',
    operatorName,
    address:      addr.freeformAddress ?? ([addr.streetName, addr.municipality, addr.country].filter(Boolean).join(', ') || 'Address unavailable'),
    latitude:     pos.lat ?? 0,
    longitude:    pos.lon ?? 0,
    connectors,
    availability,
    openingHours: poi.openingHours?.text?.[0] ?? '24/7',
    paymentMethod: poi.paymentMethods?.join(', ') ?? 'Unknown',
    image:        '',   // TomTom does not provide images — use default
    rating:       0,    // TomTom does not provide ratings — enrich from own DB
    amenities:    poi.amenities ?? [],
    distance:     Math.round(((item.dist ?? 0) / 1000) * 10) / 10,
    provider:     'TomTom',
    lastUpdated:  new Date().toLocaleTimeString(),
  };
}

/** RFConnectorStation → MarketplaceAccessPoint (maps common model to UI model) */
function rfStationToAccessPoint(s: RFConnectorStation, index: number): MarketplaceAccessPoint {
  const maxPower = Math.max(...s.connectors.map(c => c.powerKW), 0);
  const typeCounts: Record<string, number> = {};
  s.connectors.forEach(c => { typeCounts[c.type] = (typeCounts[c.type] ?? 0) + 1; });
  const connectorSummary = Object.entries(typeCounts).map(([t, n]) => `${n} ${t}`).join(' · ') || 'Unknown';

  return {
    id:           `LIVE-${String(s.stationId).slice(-10)}-${index}`,
    name:         s.stationName,
    network:      'TomTom Live',
    city:         s.address.split(',')[1]?.trim() ?? s.address.split(',')[0]?.trim() ?? 'Unknown',
    country:      s.provider === 'TomTom' ? 'DE' : 'Unknown',
    status:       s.availability === 'Charging' ? 'Charging'
                : s.availability === 'Reserved' ? 'Reserved'
                : s.availability === 'Inoperative' ? 'Inoperative'
                : 'Available',
    connectors:   connectorSummary,
    power:        maxPower > 0 ? `${maxPower} kW DC` : 'AC',
    protocol:     'OCPI 2.2',
    tariff:       'LIVE',
    lat:          s.latitude,
    lng:          s.longitude,
    x: 0, y: 0,
    lastUpdated:  s.lastUpdated,
    connectorCount: s.connectors.length,
    maxPower:     maxPower > 0 ? `${maxPower} kW` : 'AC',
  };
}

/* Simulates OCPI real-time connector status per station (deterministic per 30s bucket) */
function simulateOCPI(stationId: string | number, totalConns: number): ConnectorDetail[] {
  const seed = String(stationId).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const bucket = Math.floor(Date.now() / 30000);
  const rand = (n: number) => ((seed * 9301 + bucket * 49297 + n * 233) % 233280) / 233280;
  const types = ['CCS2', 'Type 2', 'CHAdeMO', 'CCS1'];
  const powers = [22, 50, 100, 150, 350];
  const statuses: ConnectorDetail['status'][] = ['Available', 'Occupied', 'Reserved', 'Offline'];
  return Array.from({ length: Math.max(totalConns, 1) }, (_, i) => {
    const r = rand(i);
    const statusIdx = r < 0.45 ? 0 : r < 0.75 ? 1 : r < 0.88 ? 2 : 3;
    const waiting = statusIdx === 1 ? Math.floor(rand(i + 100) * 4) : 0;
    return {
      id: `${stationId}-C${i + 1}`,
      type: types[Math.floor(rand(i + 50) * types.length)],
      powerKW: powers[Math.floor(rand(i + 200) * powers.length)],
      status: statuses[statusIdx],
      waitingDrivers: waiting,
    };
  });
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function NearbyStationsWorkspace() {
  const [userLat, setUserLat] = useState<number|null>(null);
  const [userLng, setUserLng] = useState<number|null>(null);
  const [manualLat, setManualLat] = useState('51.2010');
  const [manualLng, setManualLng] = useState('10.5120');
  const [radius, setRadius] = useState(10);
  const [viewMode, setViewMode] = useState<'list'|'map'>('list');
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [locationError, setLocationError] = useState('');
  const [gpsGranted, setGpsGranted] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date|null>(null);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string|number|null>(null);
  const [queuedId, setQueuedId] = useState<string|number|null>(null);
  const [countdown, setCountdown] = useState(30);
  const refreshTimer = useRef<ReturnType<typeof setInterval>|null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval>|null>(null);
  const PER_PAGE = 5;

  // Uses the provider-agnostic mapper: TomTom item → RFConnectorStation → ChargingStation
  const buildStation = useCallback((item: any, lat: number, lng: number): ChargingStation => {
    const stationId = item.id ?? String(Math.random());
    const totalConns = (String(stationId).split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0) % 5) + 2;
    const simulatedConns = simulateOCPI(stationId, totalConns);
    const rf = mapTomTomToRFStation(item, '', 'DE', 0, simulatedConns);

    const available = rf.connectors.filter(c => c.status === 'Available').length;
    const occupied  = rf.connectors.filter(c => c.status === 'Occupied').length;
    const waiting   = rf.connectors.reduce((s, c) => s + c.waitingDrivers, 0);
    const maxPower  = Math.max(...rf.connectors.map(c => c.powerKW), 0);
    const connTypes = [...new Set(rf.connectors.map(c => c.type))].slice(0, 3).join(' · ');

    return {
      id:                  rf.stationId,
      stationName:         rf.stationName,
      latitude:            rf.latitude || lat,
      longitude:           rf.longitude || lng,
      address:             rf.address,
      connectorType:       connTypes || 'CCS2 · Type 2',
      availableConnectors: available,
      occupiedConnectors:  occupied,
      totalConnectors:     rf.connectors.length,
      chargingSpeed:       maxPower > 0 ? `${maxPower} kW` : 'AC',
      stationStatus:       available > 0 ? 'Available' : occupied > 0 ? 'Busy' : 'Offline',
      operatingHours:      rf.openingHours,
      distance:            rf.distance || Math.round(((item.dist ?? 0) / 1000) * 10) / 10,
      waitingDrivers:      waiting,
      estimatedWaitTime:   waiting > 0 ? waiting * 15 : 0,
      connectors:          rf.connectors.map(c => ({
        id:             `${rf.stationId}-${c.type}`,
        type:           c.type,
        powerKW:        c.powerKW,
        status:         c.status,
        waitingDrivers: c.waitingDrivers,
      })),
      lastUpdated: rf.lastUpdated,
    };
  }, []);

  /* Converts backend LiveStationResult → ChargingStation used by the UI */
  const mapBackendStation = useCallback((s: any): ChargingStation => ({
    id:                  s.stationId,
    stationName:         s.stationName,
    latitude:            s.latitude,
    longitude:           s.longitude,
    address:             s.address,
    connectorType:       [...new Set((s.connectors ?? []).map((c: any) => c.connectorType))].slice(0, 3).join(' · ') || 'CCS2',
    availableConnectors: s.availableConnectors,
    occupiedConnectors:  s.occupiedConnectors,
    totalConnectors:     s.totalConnectors,
    chargingSpeed:       s.chargingSpeed,
    stationStatus:       (s.stationStatus as ChargingStation['stationStatus']) ?? 'Available',
    operatingHours:      s.operatingHours,
    distance:            s.distanceKm,
    waitingDrivers:      s.waitingDrivers,
    estimatedWaitTime:   s.estimatedWaitMin,
    connectors:          (s.connectors ?? []).map((c: any) => ({
      id:            c.connectorRef,
      type:          c.connectorType,
      powerKW:       c.powerKw,
      status:        c.status as ConnectorDetail['status'],
      waitingDrivers: c.waitingDrivers,
    })),
    lastUpdated: new Date(s.lastUpdated).toLocaleTimeString(),
  }), []);

  const fetchStations = useCallback(async (lat: number, lng: number, r: number) => {
    setLoading(true);
    setLocationError('');
    try {
      const radiusM = r * 1000;
      const url = `https://api.tomtom.com/search/2/nearbySearch/.json?lat=${lat}&lon=${lng}&radius=${radiusM}&categorySet=7309&limit=50&key=${TOMTOM_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`TomTom ${res.status}`);
      const data: any = await res.json();
      const mapped = ((data.results ?? []) as any[]).map(item => buildStation(item, lat, lng));
      setStations(mapped);
      setLastRefresh(new Date());
      setCountdown(30);
      setPage(1);
    } catch (err) {
      console.error('TomTom API:', err);
      setLocationError('Failed to fetch stations. Check your connection.');
    } finally { setLoading(false); }
  }, [buildStation]);

  const connectWebSocket = useCallback((lat: number, lng: number, r: number) => {
    fetchStations(lat, lng, r);
  }, [fetchStations]);

  const getGPS = () => {
    setLocationError('');
    if (!navigator.geolocation) { setLocationError('Geolocation not supported.'); return; }
    navigator.geolocation.getCurrentPosition(
      p => { setUserLat(p.coords.latitude); setUserLng(p.coords.longitude); setGpsGranted(true); connectWebSocket(p.coords.latitude, p.coords.longitude, radius); },
      () => setLocationError('Location permission denied. Enter coordinates manually.')
    );
  };

  const handleManualSearch = () => {
    const lat = parseFloat(manualLat), lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng)) { setLocationError('Enter valid latitude and longitude.'); return; }
    setUserLat(lat); setUserLng(lng); setLocationError(''); connectWebSocket(lat, lng, radius);
  };

  // Reconnect WebSocket when radius changes
  useEffect(() => {
    if (userLat === null || userLng === null) return;
    connectWebSocket(userLat, userLng, radius);
    return () => {};
  }, [radius]);

  // Countdown ticker (visual only — actual refresh driven by WS/polling)
  useEffect(() => {
    if (userLat === null || userLng === null) return;
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    countdownTimer.current = setInterval(() => setCountdown(c => c <= 1 ? 30 : c - 1), 1000);
    return () => { clearInterval(refreshTimer.current!); clearInterval(countdownTimer.current!); };
  }, [userLat, userLng, radius, fetchStations]);

  useEffect(() => {
    if (userLat !== null && userLng !== null) fetchStations(userLat, userLng, radius);
  }, [radius]);

  const scBadge = (s: ChargingStation['stationStatus']) =>
    s === 'Available' ? 'bg-emerald-100 text-emerald-700' : s === 'Busy' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
  const scDot = (s: ConnectorDetail['status']) =>
    s === 'Available' ? 'bg-emerald-500' : s === 'Occupied' ? 'bg-amber-500' : s === 'Reserved' ? 'bg-blue-400' : 'bg-red-400';
  const paginated = stations.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(stations.length / PER_PAGE);

  return (
    <div className="space-y-5">
      <SectionHeader title="Live EV Station Availability" sub="TomTom Search · OCPI connector status · 30-second real-time polling" />

      {/* Location panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm font-semibold text-slate-700 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600"/> Your Location
          </p>
          {userLat !== null && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
              Live · refreshes in <span className="font-bold text-slate-700 dark:text-white">{countdown}s</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <button data-local onClick={getGPS} className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
            <Navigation className="w-4 h-4"/> Use GPS Location
          </button>
          <span className="text-xs text-slate-400 font-medium self-center">or</span>
          <input data-local value={manualLat} onChange={e => setManualLat(e.target.value)} placeholder="Latitude" className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm w-32 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"/>
          <input data-local value={manualLng} onChange={e => setManualLng(e.target.value)} placeholder="Longitude" className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm w-32 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"/>
          <button data-local onClick={handleManualSearch} className="flex items-center gap-2 border border-indigo-300 text-indigo-600 text-sm px-4 py-2 rounded-lg hover:bg-indigo-50">
            <Search className="w-4 h-4"/> Search
          </button>
        </div>
        {locationError && <p className="text-xs text-red-500 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5"/>{locationError}</p>}
        {gpsGranted && <p className="text-xs text-emerald-600 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5"/>GPS acquired — {userLat?.toFixed(5)}, {userLng?.toFixed(5)}</p>}
      </div>

      {/* Controls bar */}
      {userLat !== null && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Radius:</span>
            {[5, 10, 20, 50].map(r => (
              <button data-local key={r} onClick={() => setRadius(r)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${radius === r ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'}`}>{r} KM</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button data-local onClick={() => setViewMode('list')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${viewMode === 'list' ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'}`}><BarChart3 className="w-3.5 h-3.5 rotate-90"/> List</button>
            <button data-local onClick={() => setViewMode('map')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${viewMode === 'map' ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'}`}><Globe className="w-3.5 h-3.5"/> Map</button>
            {lastRefresh && <span className="text-[10px] text-slate-400">Updated {lastRefresh.toLocaleTimeString()}</span>}
          </div>
        </div>
      )}

      {/* Summary bar */}
      {!loading && stations.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Stations', value: stations.length, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
            { label: 'Available', value: stations.filter(s => s.stationStatus === 'Available').length, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
            { label: 'Busy', value: stations.filter(s => s.stationStatus === 'Busy').length, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
            { label: 'Waiting Drivers', value: stations.reduce((a, s) => a + s.waitingDrivers, 0), color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
          ].map(m => (
            <div key={m.label} className={`rounded-xl border p-3 ${m.bg}`}>
              <p className={`text-xl font-black ${m.color}`}>{m.value}</p>
              <p className="text-[10px] text-slate-500 font-medium">{m.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0"/>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/5"/>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/5"/>
                  <div className="flex gap-2 mt-2">
                    {[1,2,3,4].map(j => <div key={j} className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-full"/>)}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <div className="w-24 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"/>
                  <div className="w-24 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"/>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && userLat !== null && stations.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-14 text-center">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
          <p className="font-semibold text-slate-700 dark:text-white">No stations found</p>
          <p className="text-sm text-slate-400 mt-1">Try increasing the radius or search a different location.</p>
          <button data-local onClick={() => setRadius(50)} className="mt-4 text-xs text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50">Try 50 KM radius</button>
        </div>
      )}

      {/* Default / prompt state */}
      {!loading && userLat === null && (
        <div className="bg-indigo-50 dark:bg-indigo-950 rounded-2xl border border-indigo-100 dark:border-indigo-800 p-12 text-center">
          <Navigation className="w-12 h-12 text-indigo-400 mx-auto mb-3"/>
          <p className="font-semibold text-indigo-700 dark:text-indigo-300">Enable location to find nearby EV stations</p>
          <p className="text-sm text-indigo-400 mt-1">Click "Use GPS Location" or enter coordinates and hit Search.</p>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {!loading && stations.length > 0 && viewMode === 'list' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 font-medium">
            {stations.length} station{stations.length !== 1 ? 's' : ''} within {radius} km · {Math.min((page - 1) * PER_PAGE + 1, stations.length)}–{Math.min(page * PER_PAGE, stations.length)} shown
          </p>
          {paginated.map(s => (
            <div key={s.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Main row */}
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${s.stationStatus === 'Available' ? 'bg-emerald-50 border-emerald-200' : s.stationStatus === 'Busy' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-100'}`}>
                    <Zap className={`w-5 h-5 ${s.stationStatus === 'Available' ? 'text-emerald-600' : s.stationStatus === 'Busy' ? 'text-amber-600' : 'text-red-400'}`}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800 dark:text-white text-sm">{s.stationName}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scBadge(s.stationStatus)}`}>{s.stationStatus}</span>
                      {queuedId === s.id && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">In Queue</span>}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3"/>{s.address || 'Address unavailable'}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><Navigation className="w-3 h-3 text-indigo-400"/><strong className="text-slate-700 dark:text-slate-300">{s.distance} km</strong></span>
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400"/>{s.chargingSpeed}</span>
                      <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-blue-400"/>{s.connectorType}</span>
                      <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400"/>
                        <span className="text-emerald-600 font-semibold">{s.availableConnectors}</span>/{s.totalConnectors} free
                      </span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{s.operatingHours}</span>
                      {s.waitingDrivers > 0 && (
                        <span className="flex items-center gap-1 text-rose-500"><Users className="w-3 h-3"/>{s.waitingDrivers} waiting · ~{s.estimatedWaitTime} min</span>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-300 dark:text-slate-600 mt-1">OCPI updated {s.lastUpdated}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button data-local onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`, '_blank')} className="flex items-center gap-1.5 text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                      <Navigation className="w-3.5 h-3.5"/> Navigate
                    </button>
                    <button data-local onClick={() => setQueuedId(s.id)} disabled={s.stationStatus === 'Offline' || queuedId === s.id} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold ${queuedId === s.id ? 'bg-indigo-100 text-indigo-700 cursor-default' : s.stationStatus === 'Offline' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : s.availableConnectors > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>
                      <Zap className="w-3.5 h-3.5"/> {queuedId === s.id ? 'Queued' : s.availableConnectors > 0 ? 'Start Charging' : 'Join Queue'}
                    </button>
                    <button data-local onClick={() => setExpandedId(expandedId === s.id ? null : s.id)} className="flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-700 justify-center">
                      {expandedId === s.id ? 'Hide' : 'Connectors'} <ChevronDown className={`w-3 h-3 transition-transform ${expandedId === s.id ? 'rotate-180' : ''}`}/>
                    </button>
                  </div>
                </div>
              </div>

              {/* Connector detail drawer */}
              {expandedId === s.id && (
                <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-4 bg-slate-50 dark:bg-slate-800/40">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-3">Connector Status · OCPI Live</p>
                  <div className="grid grid-cols-2 gap-2">
                    {s.connectors.map(c => (
                      <div key={c.id} className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 px-3 py-2">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${scDot(c.status)}`}/>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-slate-700 dark:text-white">{c.type} · {c.powerKW} kW</p>
                          <p className="text-[10px] text-slate-400">{c.status}{c.waitingDrivers > 0 ? ` · ${c.waitingDrivers} waiting` : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {s.waitingDrivers > 0 && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2 text-xs text-amber-700">
                      <Users className="w-3.5 h-3.5 shrink-0"/>
                      {s.waitingDrivers} driver{s.waitingDrivers !== 1 ? 's' : ''} in queue · estimated wait <strong>{s.estimatedWaitTime} min</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-1">
              <button data-local onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Previous</button>
              <span className="text-xs text-slate-500">{page} / {totalPages}</span>
              <button data-local onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Next</button>
            </div>
          )}
        </div>
      )}

      {/* ── MAP VIEW ── */}
      {!loading && stations.length > 0 && viewMode === 'map' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="relative bg-gradient-to-br from-slate-100 to-indigo-50 dark:from-slate-800 dark:to-slate-900" style={{ height: 440 }}>
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              {[...Array(12)].map((_, i) => <line key={`h${i}`} x1="0" y1={`${i * 8.33}%`} x2="100%" y2={`${i * 8.33}%`} stroke="#6366f1" strokeWidth="0.5"/>)}
              {[...Array(12)].map((_, i) => <line key={`v${i}`} x1={`${i * 8.33}%`} y1="0" x2={`${i * 8.33}%`} y2="100%" stroke="#6366f1" strokeWidth="0.5"/>)}
            </svg>
            {/* You pin */}
            {userLat !== null && (
              <div className="absolute z-20" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
                <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-white"/>
                </div>
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap shadow">You</div>
              </div>
            )}
            {/* Station pins */}
            {(() => {
              const lats = stations.map(s => s.latitude);
              const lngs = stations.map(s => s.longitude);
              const minLat = Math.min(...lats), maxLat = Math.max(...lats);
              const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
              const latR = Math.max(maxLat - minLat, 0.005);
              const lngR = Math.max(maxLng - minLng, 0.005);
              return stations.map((s, i) => {
                const xPct = ((s.longitude - minLng) / lngR) * 70 + 15;
                const yPct = ((maxLat - s.latitude) / latR) * 70 + 15;
                return (
                  <div key={s.id} className="absolute z-10 group cursor-pointer" style={{ left: `${xPct}%`, top: `${yPct}%`, transform: 'translate(-50%,-50%)' }}
                    onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                    <div className={`w-9 h-9 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-black ${s.stationStatus === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'}`}>{i + 1}</div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded-lg font-medium whitespace-nowrap max-w-[140px] truncate opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">{s.stationName}</div>
                    <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] font-bold px-1 rounded ${s.availableConnectors > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{s.availableConnectors}/{s.totalConnectors}</div>
                  </div>
                );
              });
            })()}
            {/* Legend */}
            <div className="absolute bottom-3 left-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg px-3 py-2 flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"/>Available</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"/>Busy</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block"/>You</span>
            </div>
            {/* Auto-refresh badge */}
            <div className="absolute top-3 right-3 bg-white dark:bg-slate-800 rounded-xl shadow px-3 py-1.5 flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
              Live · {countdown}s
            </div>
          </div>

          {/* Station list under map */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
            {stations.map((s, i) => (
              <div key={s.id} className={`flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${expandedId === s.id ? 'bg-indigo-50 dark:bg-indigo-950' : ''}`}
                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${s.stationStatus === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'}`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 dark:text-white truncate">{s.stationName}</p>
                  <p className="text-[10px] text-slate-400">{s.distance} km · {s.chargingSpeed} · {s.availableConnectors}/{s.totalConnectors} free</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {s.waitingDrivers > 0 && <span className="text-[9px] text-rose-500 flex items-center gap-0.5"><Users className="w-2.5 h-2.5"/>{s.waitingDrivers}</span>}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scBadge(s.stationStatus)}`}>{s.stationStatus}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Expanded detail in map view */}
          {expandedId !== null && (() => {
            const s = stations.find(x => x.id === expandedId);
            if (!s) return null;
            return (
              <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-4 bg-slate-50 dark:bg-slate-800/40">
                <p className="text-xs font-bold text-slate-700 dark:text-white mb-2">{s.stationName} · Connector Status</p>
                <div className="grid grid-cols-3 gap-2">
                  {s.connectors.map(c => (
                    <div key={c.id} className="flex items-center gap-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 px-2 py-1.5">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${scDot(c.status)}`}/>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-700 dark:text-white">{c.type}</p>
                        <p className="text-[9px] text-slate-400">{c.powerKW} kW · {c.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
function renderNearbyStations() { return <NearbyStationsWorkspace />; }

function renderAPIKeys() { return <APIKeysWorkspace />; }

type EvseRow = { name:string; city:string; country:string; evses:number; available:string; quality:number; protocol:string; operator:string; power:string; connectors:string; lastSync:string };

const INITIAL_EVSE_ROWS: EvseRow[] = [
  { name:'Accra Mall Charge Hub',    city:'Accra',          country:'GH', evses:10, available:'9 / 10',  quality:98,  protocol:'OCPI 2.2', operator:'ECG (Electricity Co. Ghana)', power:'50 kW DC',  connectors:'6 CCS2 · 4 Type 2', lastSync:'3 min ago' },
  { name:'Lapaz Motor Terminal',      city:'Accra',          country:'GH', evses:6,  available:'6 / 6',   quality:100, protocol:'OCPI 2.2', operator:'ECG (Electricity Co. Ghana)', power:'75 kW DC',  connectors:'6 CCS2',             lastSync:'5 min ago' },
  { name:'Kumasi Adum Station',       city:'Kumasi',         country:'GH', evses:6,  available:'5 / 6',   quality:95,  protocol:'OCPI 2.2', operator:'Goil EV Network',            power:'50 kW DC',  connectors:'4 CCS2 · 2 Type 2',  lastSync:'20 min ago' },
  { name:'Tema Harbour Gateway',      city:'Tema',           country:'GH', evses:8,  available:'7 / 8',   quality:92,  protocol:'OCPI 2.2', operator:'VRA EV Charge',              power:'150 kW DC', connectors:'8 CCS2',             lastSync:'7 min ago' },
  { name:'Airport City EV Point',     city:'Accra',          country:'GH', evses:12, available:'11 / 12', quality:96,  protocol:'OCPI 2.2', operator:'Total Energies Ghana',       power:'100 kW DC', connectors:'8 CCS2 · 4 Type 2', lastSync:'4 min ago' },
  { name:'Takoradi Harbour Point',    city:'Takoradi',       country:'GH', evses:2,  available:'1 / 2',   quality:88,  protocol:'OCPI 2.2', operator:'Shell Ghana EV',             power:'50 kW DC',  connectors:'2 CCS2',             lastSync:'2 days ago' },
  { name:'Av. Paulista DC Hub',       city:'São Paulo',      country:'BR', evses:12, available:'11 / 12', quality:97,  protocol:'OCPI 2.2', operator:'Eletrobras EV Brasil',       power:'150 kW DC', connectors:'8 CCS2 · 4 Type 2', lastSync:'2 min ago' },
  { name:'Copacabana Beach Charge',   city:'Rio de Janeiro', country:'BR', evses:6,  available:'5 / 6',   quality:93,  protocol:'OCPI 2.2', operator:'Voltbras Networks',          power:'50 kW DC',  connectors:'4 CCS2 · 2 Type 2', lastSync:'10 min ago' },
  { name:'Reforma Boulevard Hub',     city:'Mexico City',    country:'MX', evses:16, available:'14 / 16', quality:91,  protocol:'OCPI 2.2', operator:'Charge Now México',          power:'150 kW DC', connectors:'10 CCS2 · 6 Type 2',lastSync:'3 min ago' },
  { name:'La Candelaria DC Hub',      city:'Bogotá',         country:'CO', evses:8,  available:'7 / 8',   quality:94,  protocol:'OCPI 2.2', operator:'Enel X Colombia',            power:'100 kW DC', connectors:'8 CCS2',             lastSync:'6 min ago' },
  { name:'Providencia Solar Hub',     city:'Santiago',       country:'CL', evses:12, available:'10 / 12', quality:89,  protocol:'OCPI 2.2', operator:'Zeta Energy Chile',          power:'100 kW DC', connectors:'8 CCS2 · 4 Type 2', lastSync:'4 min ago' },
  { name:'Recoleta Fast Charge Hub',  city:'Buenos Aires',   country:'AR', evses:8,  available:'7 / 8',   quality:96,  protocol:'OCPI 2.2', operator:'YPF Luz EV Argentina',      power:'100 kW DC', connectors:'8 CCS2',             lastSync:'5 min ago' },
];

const BLANK_FORM = { name:'', city:'', country:'GH', evses:'', operator:'', power:'50 kW DC', connectors:'', protocol:'OCPI 2.2' };

function EVSERepoView() {
  const [rows, setRows] = useState<EvseRow[]>(INITIAL_EVSE_ROWS);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('All');
  const [selected, setSelected] = useState<EvseRow | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [addToast, setAddToast] = useState(false);

  const fld = (k: keyof typeof BLANK_FORM, v: string) => setForm(p => ({ ...p, [k]: v }));

  const exportCSV = () => {
    const headers = ['Location','City','Country','EVSEs','Available','Quality (%)','Protocol','Operator','Power','Connectors','Last Sync'];
    const csvRows = [
      headers.join(','),
      ...filtered.map(r => [
        `"${r.name}"`, `"${r.city}"`, r.country, r.evses, `"${r.available}"`,
        r.quality, r.protocol, `"${r.operator}"`, `"${r.power}"`, `"${r.connectors}"`, `"${r.lastSync}"`,
      ].join(',')),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'evse_locations.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const submitAdd = () => {
    if (!form.name.trim() || !form.city.trim() || !form.operator.trim() || !form.evses) return;
    const n = parseInt(form.evses) || 1;
    const newRow: EvseRow = {
      name: form.name.trim(), city: form.city.trim(), country: form.country,
      evses: n, available: `${n} / ${n}`, quality: 100,
      protocol: form.protocol, operator: form.operator.trim(),
      power: form.power, connectors: form.connectors.trim() || form.power,
      lastSync: 'Just now',
    };
    setRows(prev => [newRow, ...prev]);
    setShowAdd(false);
    setForm(BLANK_FORM);
    setAddToast(true);
    setTimeout(() => setAddToast(false), 2800);
  };

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.name.toLowerCase().includes(q) || r.city.toLowerCase().includes(q) || r.country.toLowerCase().includes(q);
    const matchCountry = country === 'All' || r.country === country;
    return matchSearch && matchCountry;
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        title="EVSE Repository"
        sub="Centralised charge point databasequality-controlled, live status"
        action={
          <div className="flex gap-2">
            <button data-local onClick={exportCSV} className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm px-3 py-2 rounded-lg hover:bg-slate-50">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        }
      />

      {/* Health row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Locations',   value: '1,284',  color: 'text-slate-800' },
          { label: 'Total EVSEs',       value: '12,840', color: 'text-slate-800' },
          { label: 'Online',            value: '11,960', color: 'text-emerald-600' },
          { label: 'Data Quality Score',value: '97.4%',  color: 'text-indigo-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-4 text-center">
            <div className={`text-2xl font-bold mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-700 mb-4">EVSE Status Distribution</h3>
        <div className="space-y-2">
          {[
            { label: 'Available',   count: 8220,  pct: 64, color: 'bg-emerald-500' },
            { label: 'Charging',    count: 3740,  pct: 29, color: 'bg-blue-500' },
            { label: 'Inoperative', count: 560,   pct: 4,  color: 'bg-rose-400' },
            { label: 'Reserved',    count: 200,   pct: 2,  color: 'bg-amber-400' },
            { label: 'Unknown',     count: 120,   pct: 1,  color: 'bg-slate-300' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="w-24 text-sm text-slate-600">{s.label}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-2">
                <div className={`${s.color} h-2 rounded-full`} style={{ width: `${s.pct}%` }} />
              </div>
              <span className="w-16 text-right text-xs text-slate-500">{s.count.toLocaleString()} ({s.pct}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Location table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Search locations..."
            />
          </div>
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="All">All Countries</option>
            <option value="GH">GH</option>
            <option value="BR">BR</option>
            <option value="MX">MX</option>
            <option value="CO">CO</option>
            <option value="CL">CL</option>
            <option value="AR">AR</option>
          </select>
        </div>
        <Table
          cols={['Location', 'City', 'Country', 'EVSEs', 'Available', 'Quality', '']}
          rows={filtered.length > 0 ? filtered.map(r => [
            r.name, r.city, r.country, String(r.evses), r.available,
            <Pill label={`${r.quality}%`} color={r.quality >= 92 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'} />,
            <button data-local onClick={() => setSelected(r)} className="text-xs text-indigo-600 font-semibold hover:underline">View</button>,
          ]) : [['No results', '', '', '', '', '', '']]}
        />
      </div>

      {/* Add Location Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" style={{ background:'rgba(15,23,42,0.55)', backdropFilter:'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-800">Add New Location</h2>
                <p className="text-xs text-slate-400 mt-0.5">Fill in the charge point details below</p>
              </div>
              <button data-local onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Location name */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Location Name <span className="text-rose-500">*</span></label>
                <input value={form.name} onChange={e => fld('name', e.target.value)} placeholder="e.g. Kotoka Airport EV Hub"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* City */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">City <span className="text-rose-500">*</span></label>
                  <input value={form.city} onChange={e => fld('city', e.target.value)} placeholder="e.g. Accra"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                {/* Country */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Country</label>
                  <select value={form.country} onChange={e => fld('country', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option value="GH">Ghana (GH)</option>
                    <option value="BR">Brazil (BR)</option>
                    <option value="MX">Mexico (MX)</option>
                    <option value="CO">Colombia (CO)</option>
                    <option value="CL">Chile (CL)</option>
                    <option value="AR">Argentina (AR)</option>
                    <option value="NG">Nigeria (NG)</option>
                  </select>
                </div>
              </div>
              {/* Operator */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Operator / Network <span className="text-rose-500">*</span></label>
                <input value={form.operator} onChange={e => fld('operator', e.target.value)} placeholder="e.g. Volta Networks"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* No. of EVSEs */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Number of EVSEs <span className="text-rose-500">*</span></label>
                  <input type="number" min="1" value={form.evses} onChange={e => fld('evses', e.target.value)} placeholder="e.g. 8"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                {/* Max Power */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Max Power</label>
                  <select value={form.power} onChange={e => fld('power', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option>22 kW AC</option>
                    <option>50 kW DC</option>
                    <option>75 kW DC</option>
                    <option>100 kW DC</option>
                    <option>150 kW DC</option>
                    <option>350 kW DC</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Connectors */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Connector Types</label>
                  <input value={form.connectors} onChange={e => fld('connectors', e.target.value)} placeholder="e.g. 4 CCS2 · 2 Type 2"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                {/* Protocol */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Protocol</label>
                  <select value={form.protocol} onChange={e => fld('protocol', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option>OCPI 2.2</option>
                    <option>OCPI 2.2.1</option>
                    <option>OCPI 2.1.1</option>
                    <option>eMIP 0.7.4</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button data-local onClick={() => setShowAdd(false)} className="flex-1 border border-slate-200 text-slate-600 text-sm px-4 py-2 rounded-lg hover:bg-slate-50">Cancel</button>
              <button data-local onClick={submitAdd}
                disabled={!form.name.trim() || !form.city.trim() || !form.operator.trim() || !form.evses}
                className={`flex-1 flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-lg font-semibold transition-all ${form.name.trim() && form.city.trim() && form.operator.trim() && form.evses ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                <Plus className="w-4 h-4" /> Add Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {addToast && (
        <div className="fixed bottom-6 right-6 z-[10001] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg bg-emerald-600 text-white text-sm font-medium">
          <CheckCircle className="w-4 h-4" /> Location added successfully
        </div>
      )}

      {/* EVSE Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background:'rgba(15,23,42,0.55)', backdropFilter:'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">{selected.name}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{selected.city} · {selected.country}</p>
              </div>
              <button data-local onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 mt-0.5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:'Operator',    value: selected.operator },
                  { label:'Protocol',    value: selected.protocol },
                  { label:'Max Power',   value: selected.power },
                  { label:'Connectors',  value: selected.connectors },
                  { label:'Total EVSEs', value: String(selected.evses) },
                  { label:'Available',   value: selected.available },
                  { label:'Data Quality',value: `${selected.quality}%` },
                  { label:'Last Sync',   value: selected.lastSync },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-lg px-3 py-2">
                    <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wide">{label}</div>
                    <div className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{value}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-emerald-700">Station Online · OCPI heartbeat healthy</span>
              </div>
            </div>
            <div className="px-6 pb-5">
              <button data-local onClick={() => setSelected(null)} className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function renderEVSERepo() { return <EVSERepoView />; }

type TariffRow = { code:string; energy:string; time:string; flat:string; currency:string; source:string; validFrom:string; status:'Active'|'Archived' };

const INITIAL_TARIFFS: TariffRow[] = [
  { code:'TARIFF-EU-STD',   energy:'0.42', time:'0.10', flat:'0.50', currency:'GHS', source:'Manual',      validFrom:'2025-01-01', status:'Active'   },
  { code:'TARIFF-DE-DC50',  energy:'0.38', time:'0.00', flat:'0.00', currency:'GHS', source:'OCPI Push',   validFrom:'2025-03-01', status:'Active'   },
  { code:'TARIFF-NL-AC',    energy:'0.31', time:'0.05', flat:'0.00', currency:'GHS', source:'Marketplace', validFrom:'2025-04-15', status:'Active'   },
  { code:'TARIFF-OLD-2024', energy:'0.45', time:'0.08', flat:'1.00', currency:'GHS', source:'Manual',      validFrom:'2024-01-01', status:'Archived' },
];

const BLANK_TARIFF = { code:'', energy:'', time:'0.00', flat:'0.00', currency:'GHS', source:'Manual' };

function TariffsView() {
  const [tariffs, setTariffs] = useState<TariffRow[]>(INITIAL_TARIFFS);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(BLANK_TARIFF);
  const [toast, setToast] = useState(false);

  const fld = (k: keyof typeof BLANK_TARIFF, v: string) => setForm(p => ({ ...p, [k]: v }));
  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400';

  const submit = () => {
    if (!form.code.trim() || !form.energy) return;
    const today = new Date().toISOString().slice(0, 10);
    setTariffs(prev => [{ code: form.code.trim().toUpperCase(), energy: form.energy, time: form.time, flat: form.flat, currency: form.currency, source: form.source, validFrom: today, status: 'Active' }, ...prev]);
    setShowAdd(false);
    setForm(BLANK_TARIFF);
    setToast(true);
    setTimeout(() => setToast(false), 2800);
  };

  const sourceColor: Record<string,string> = { Manual:'bg-slate-100 text-slate-600', 'OCPI Push':'bg-blue-50 text-blue-700', Marketplace:'bg-violet-50 text-violet-700' };

  const exportCSV = () => {
    const headers = ['Code','Energy (₵/kWh)','Time (₵/min)','Flat Fee (₵)','Currency','Source','Valid From','Status'];
    const rows = [
      headers.join(','),
      ...tariffs.map(t => [t.code, t.energy, t.time, t.flat, t.currency, `"${t.source}"`, t.validFrom, t.status].join(',')),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'tariffs.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Tariffs"
        sub="Manage and exchange tariff data with roaming partners"
        action={
          <div className="flex gap-2">
            <button data-local onClick={exportCSV} className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm px-3 py-2 rounded-lg hover:bg-slate-50">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button data-local onClick={() => { setForm(BLANK_TARIFF); setShowAdd(true); }} className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
              <Plus className="w-4 h-4" /> New Tariff
            </button>
          </div>
        }
      />

      {/* My tariffs */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700">My Published Tariffs</h3>
          <p className="text-xs text-slate-400 mt-0.5">{tariffs.filter(t=>t.status==='Active').length} active · {tariffs.filter(t=>t.status==='Archived').length} archived</p>
        </div>
        <Table
          cols={['Code', 'Energy Rate', 'Time Rate', 'Flat Fee', 'Currency', 'Source', 'Valid From', 'Status']}
          rows={tariffs.map(t => [
            <span className="font-mono text-xs font-semibold text-slate-800">{t.code}</span>,
            `₵ ${t.energy}/kWh`,
            `₵ ${t.time}/min`,
            `₵ ${t.flat}`,
            t.currency,
            <Pill label={t.source} color={sourceColor[t.source] ?? 'bg-slate-100 text-slate-600'} />,
            t.validFrom,
            <Pill label={t.status} color={t.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'} />,
          ])}
        />
      </div>

      {/* Cost calculator */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-semibold text-slate-700 mb-4">Tariff Cost Calculator</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Energy Consumed (kWh)</label>
            <input type="number" defaultValue="25" className="w-full border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Duration (minutes)</label>
            <input type="number" defaultValue="45" className="w-full border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Tariff</label>
            <select className="w-full border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300">
              {tariffs.filter(t=>t.status==='Active').map(t => <option key={t.code}>{t.code}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 p-4 bg-indigo-50 rounded-lg flex items-center justify-between">
          <span className="text-sm text-slate-600">Calculated cost:</span>
          <span className="text-2xl font-bold text-indigo-700">₵ 11.50</span>
        </div>
      </div>

      {/* Add Tariff Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" style={{ background:'rgba(15,23,42,0.55)', backdropFilter:'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-800">New Tariff</h2>
                <p className="text-xs text-slate-400 mt-0.5">Create a new tariff to publish to partners</p>
              </div>
              <button data-local onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Tariff Code <span className="text-rose-500">*</span></label>
                <input value={form.code} onChange={e => fld('code', e.target.value)} placeholder="e.g. TARIFF-GH-DC50"
                  className={inputCls} />
                <p className="text-[10px] text-slate-400 mt-1">Will be auto-uppercased</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Energy (₵/kWh) <span className="text-rose-500">*</span></label>
                  <input type="number" step="0.01" min="0" value={form.energy} onChange={e => fld('energy', e.target.value)} placeholder="0.42"
                    className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Time (₵/min)</label>
                  <input type="number" step="0.01" min="0" value={form.time} onChange={e => fld('time', e.target.value)} placeholder="0.10"
                    className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Flat Fee (₵)</label>
                  <input type="number" step="0.01" min="0" value={form.flat} onChange={e => fld('flat', e.target.value)} placeholder="0.50"
                    className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Currency</label>
                  <select value={form.currency} onChange={e => fld('currency', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option>GHS</option><option>EUR</option><option>USD</option><option>NGN</option><option>BRL</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Source</label>
                  <select value={form.source} onChange={e => fld('source', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option>Manual</option><option>OCPI Push</option><option>Marketplace</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button data-local onClick={() => setShowAdd(false)} className="flex-1 border border-slate-200 text-slate-600 text-sm px-4 py-2 rounded-lg hover:bg-slate-50">Cancel</button>
              <button data-local onClick={submit}
                disabled={!form.code.trim() || !form.energy}
                className={`flex-1 flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-lg font-semibold transition-all ${form.code.trim() && form.energy ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                <Plus className="w-4 h-4" /> Create Tariff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[10001] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg bg-emerald-600 text-white text-sm font-medium">
          <CheckCircle className="w-4 h-4" /> Tariff created and added to the list
        </div>
      )}
    </div>
  );
}
function renderTariffs() { return <TariffsView />; }

function renderAuthorisation() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Authorisation"
        sub="RFID and remote driver authorisation events"
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Auth Requests (24h)', value: '18,422', trend: '+3%', up: true },
          { label: 'Approved',            value: '18,284', trend: '99.3%', up: true },
          { label: 'Rejected',            value: '138',    trend: 'Down 12', up: true },
          { label: 'Whitelist Size',      value: '142,000', trend: '+220 today', up: true },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-4">
            <div className="text-2xl font-bold text-slate-800 mb-1">{s.value}</div>
            <div className="text-xs text-slate-500 mb-1">{s.label}</div>
            <div className={`text-xs font-medium ${s.up ? 'text-emerald-600' : 'text-rose-600'}`}>{s.trend}</div>
          </div>
        ))}
      </div>

      {/* Recent auth events */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700">Recent Authorisation Events</h3>
          <SearchBar placeholder="Search token / EVSE..." />
        </div>
        <Table
          cols={['Timestamp', 'Token / EMAID', 'Type', 'EVSE', 'Partner', 'Result', 'Latency']}
          rows={[
            ['14:32:01', 'RFID-A4B2C1', 'RFID',     'EVB-NL-0041', 'ECG Ghana',    <Pill label="Accepted" color="bg-emerald-50 text-emerald-700" />, '41ms'],
            ['14:31:44', 'DE*ION*E00224', 'EMAID',   'GOI-GH-0112', 'Goil EV Network',       <Pill label="Accepted" color="bg-emerald-50 text-emerald-700" />, '55ms'],
            ['14:31:22', 'RFID-EE9F21', 'RFID',     'TOT-GH-0882', 'Total Energies Ghana',<Pill label="Rejected" color="bg-rose-50 text-rose-700"       />, '48ms'],
            ['14:30:55', 'NL*BON*E00119', 'EMAID',  'VRA-GH-0024', 'VRA EV Charge',      <Pill label="Accepted" color="bg-emerald-50 text-emerald-700" />, '61ms'],
            ['14:30:31', 'RFID-CC1202', 'RFID',     'ELB-BR-0031', 'Eletrobras EV Brasil',        <Pill label="Accepted" color="bg-emerald-50 text-emerald-700" />, '38ms'],
          ]}
        />
      </div>

      {/* Whitelist management */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700">Whitelist Management</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 text-sm text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
              <Download className="w-3 h-3" /> Export
            </button>
            <button className="flex items-center gap-1 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">
              <Plus className="w-3 h-3" /> Add Token
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'RFID Cards',    value: '98,412' },
            { label: 'EMAID Tokens',  value: '43,588' },
            { label: 'Async Updates', value: '220 today' },
          ].map(s => (
            <div key={s.label} className="bg-slate-50 rounded-lg p-3">
              <div className="text-lg font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EventsWorkspace() {
  const [partnerFilter, setPartnerFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [statusFilter,  setStatusFilter]  = useState('All');
  const [timeFilter,    setTimeFilter]    = useState('30m');
  const [search,        setSearch]        = useState('');
  const [drawerSession, setDrawerSession] = useState<string | null>(null);
  const [activeTab,     setActiveTab]     = useState<'sessions'|'events'|'alerts'>('sessions');
  const [liveFeed,      setLiveFeed]      = useState(false);
  const [toast,         setToast]         = useState<{msg:string; type:'success'|'warning'|'error'} | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);

  const showToast = (msg: string, type: 'success'|'warning'|'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const [sessions, setSessions] = useState([
    { id:'SES-882201', evse:'GOI-GH-0112', partner:'Goil EV Network', country:'GH', city:'Frankfurt', started:'14:10', energy:18.4, cost:6.99,  status:'Charging',   pct:62, duration:'24m', token:'RFID-GOI-GH01', power:'50kW DC',  protocol:'OCPI 2.2' },
    { id:'SES-882198', evse:'ECG-GH-0041', partner:'ECG Ghana', country:'GH', city:'Accra', started:'13:55', energy:31.2, cost:13.10, status:'Charging',   pct:78, duration:'39m', token:'RFID-A7B3C9',         power:'22kW AC',  protocol:'OCPI 2.2' },
    { id:'SES-882195', evse:'TOT-GH-0882', partner:'Total Energies Ghana', country:'GH', city:'Kumasi',     started:'13:41', energy:8.7,  cost:2.96,  status:'Suspended',  pct:29, duration:'53m', token:'RFID-CC2211',         power:'11kW AC',  protocol:'OCPI 2.2' },
    { id:'SES-882190', evse:'ELB-BR-0031', partner:'Eletrobras EV Brasil', country:'BR', city:'Sao Paulo',  started:'13:28', energy:44.0, cost:15.40, status:'Charging',   pct:88, duration:'66m', token:'RFID-ELB-BR01',  power:'150kW DC', protocol:'OCPI 2.2' },
    { id:'SES-882185', evse:'VRA-GH-0024', partner:'VRA EV Charge', country:'GH', city:'Tema',    started:'13:15', energy:0,    cost:0,     status:'Stuck',      pct:0,  duration:'79m', token:'RFID-EE9F21',         power:'--',        protocol:'OCPI 2.2' },
    { id:'SES-882182', evse:'SHG-GH-0044', partner:'Shell Ghana EV', country:'GH', city:'Munich',    started:'13:10', energy:22.1, cost:7.40,  status:'Charging',   pct:55, duration:'84m', token:'RFID-B1A2D3',         power:'50kW DC',  protocol:'OCPI 2.2' },
  ]);

  const handleSuspend = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status:'Suspended' } : s));
    showToast(`Session ${id} suspended`, 'warning');
  };
  const handleStop = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status:'Ended' } : s));
    showToast(`Session ${id} force stoppedCDR queued`, 'success');
  };
  const handleLiveFeed = () => {
    setLiveFeed(p => !p);
    showToast(liveFeed ? 'Live feed paused' : 'Live feed activepolling every 5s');
  };

  const SESSIONS = sessions;

  const EVENTS = [
    { ts:'14:32:05', type:'SESSION_STARTED',   sev:'info',    partner:'ECG Ghana', country:'GH', msg:'New session SES-882205RFID-A4B2C1 on ALG-NL-0055' },
    { ts:'14:31:58', type:'CDRi',              sev:'info',    partner:'Goil EV Network', country:'GH', msg:'CDRi update: SES-88220118.4 kWh · ₵ 6.99' },
    { ts:'14:31:44', type:'AUTH_ACCEPTED',     sev:'success', partner:'Goil EV Network', country:'GH', msg:'RFID-GOI-GH01 authorised on ION-DE-0112' },
    { ts:'14:31:22', type:'AUTH_REJECTED',     sev:'critical',partner:'Total Energies Ghana', country:'GH', msg:'RFID-EE9F21 rejectedunknown token · 3rd rejection in 10 min' },
    { ts:'14:31:10', type:'SESSION_ENDED',     sev:'info',    partner:'VRA EV Charge', country:'GH', msg:'Session SES-882188 ended22.1 kWh · ₵ 7.51 · CDR sent' },
    { ts:'14:30:55', type:'CDR_RECEIVED',      sev:'info',    partner:'VRA EV Charge', country:'GH', msg:'CDR-20250629-8821 received and validated · Eichrecht ✓' },
    { ts:'14:30:31', type:'SESSION_SUSPENDED', sev:'warning', partner:'Eletrobras EV Brasil', country:'BR', msg:'SES-882180 suspendedeMSP request via OCPI command' },
    { ts:'14:30:10', type:'EVSE_STATUS',       sev:'info',    partner:'Shell Ghana EV', country:'GH', msg:'SHG-GH-0044 status: AVAILABLE -> CHARGING' },
    { ts:'14:29:50', type:'AUTH_REJECTED',     sev:'critical',partner:'VRA EV Charge', country:'GH', msg:'RFID-CC9900 rejectedexpired token · whitelist stale?' },
    { ts:'14:29:33', type:'PARTNER_OFFLINE',   sev:'critical',partner:'VRA EV Charge', country:'GH', msg:'VRA EV Charge OCPI heartbeat missedmarking connection LOST' },
    { ts:'14:28:40', type:'AUTH_ACCEPTED',     sev:'success', partner:'Shell Ghana EV', country:'GH', msg:'RFID-B1A2D3 authorised on EVB-DE-0044' },
    { ts:'14:27:55', type:'SESSION_STARTED',   sev:'info',    partner:'Goil EV Network', country:'GH', msg:'New session SES-882195EMAID DE*ION*X0091 on ION-DE-0118' },
    { ts:'14:26:10', type:'TARIFF_UPDATE',     sev:'info',    partner:'ECG Ghana', country:'GH', msg:'TARIFF-ECG-DC50 updated₵ 0.34/kWh effective immediately' },
    { ts:'14:25:02', type:'AUTH_REJECTED',     sev:'critical',partner:'Total Energies Ghana', country:'GH', msg:'RFID-TOT-GH-E00118 rejectedwhitelist mismatch' },
    { ts:'14:23:44', type:'CDRi',              sev:'info',    partner:'Eletrobras EV Brasil', country:'BR', msg:'CDRi update: SES-88219044.0 kWh · ₵ 15.40' },
    { ts:'14:22:01', type:'AUTH_ACCEPTED',     sev:'success', partner:'ECG Ghana', country:'GH', msg:'RFID-A4B2C1 authorised on ALG-NL-0041' },
    { ts:'14:20:15', type:'EVSE_STATUS',       sev:'info',    partner:'Goil EV Network', country:'GH', msg:'GOI-GH-0118 status: CHARGING -> AVAILABLE - session complete' },
    { ts:'14:18:30', type:'CDR_RECEIVED',      sev:'info',    partner:'ECG Ghana', country:'GH', msg:'CDR-20250629-8818 received - 31.2 kWh - Eichrecht OK' },
  ];

  const ALERTS = [
    { id:0, sev:'critical', icon: WifiOff,     title:'VRA EV Charge connection lost',        body:'48 min offline · 0 sessions · CDRs queued for retry · OCPI heartbeat failed', cta:'Diagnose', age:'48m ago' },
    { id:1, sev:'critical', icon: XCircle,     title:'Auth rejection spike detected',  body:'7 failures in 15 min across Total Energies Ghana & VRA EV Charge · whitelist sync suspected', cta:'Investigate', age:'13m ago' },
    { id:2, sev:'warning',  icon: AlertCircle, title:'Session SES-882185 stuck 79 min',body:'VRA EV Charge FAB-DE-0024 · 0 kWh delivered · no CDRi · charging never started', cta:'Force Stop', age:'79m ago' },
    { id:3, sev:'warning',  icon: Clock,       title:'Shell Ghana EV high latency',     body:'p95 latency 203ms · auth response degraded · 91ms avg vs 50ms baseline', cta:'Check Health', age:'5m ago' },
    { id:4, sev:'info',     icon: AlertTriangle,title:'Total Energies Ghana CDR backlog',     body:'311 CDRs pending validation · processing queue 2× normal · no dropped records', cta:'View CDRs', age:'22m ago' },
  ];

  const PARTNER_HEALTH = [
    { name:'ECG Ghana',      country:'GH', sessions:614, status:'online',  latency:'42ms', uptime:'99.9%', cdrs:4120, protocol:'OCPI 2.2' },
    { name:'Goil EV Network',         country:'GH', sessions:512, status:'online',  latency:'55ms', uptime:'99.8%', cdrs:1440, protocol:'OCPI 2.2' },
    { name:'Total Energies Ghana',  country:'GH', sessions:398, status:'online',  latency:'78ms', uptime:'99.7%', cdrs:2891, protocol:'OCPI 2.2' },
    { name:'Shell Ghana EV',  country:'GH', sessions:287, status:'warning', latency:'91ms', uptime:'99.5%', cdrs:3200, protocol:'OCPI 2.2' },
    { name:'Eletrobras EV Brasil',          country:'BR', sessions:36,  status:'online',  latency:'67ms', uptime:'99.6%', cdrs:880,  protocol:'OCPI 2.2' },
    { name:'VRA EV Charge',        country:'GH', sessions:0,   status:'offline', latency:'--',    uptime:'98.1%', cdrs:0,    protocol:'OCPI 2.2' },
  ];

  const SESSION_TREND = [1380,1420,1510,1640,1720,1780,1810,1847];
  const TREND_LABELS  = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','Now'];

  const partners  = ['All','Goil EV Network','ECG Ghana','Total Energies Ghana','VRA EV Charge','Eletrobras EV Brasil','Shell Ghana EV'];
  const countries = ['All','DE','NL','FR','FI'];
  const statuses  = ['All','Charging','Suspended','Stuck','Ended'];

  const filtSessions = SESSIONS.filter(s =>
    (partnerFilter === 'All' || s.partner === partnerFilter) &&
    (countryFilter === 'All' || s.country === countryFilter) &&
    (statusFilter  === 'All' || s.status  === statusFilter)  &&
    (!search || s.id.toLowerCase().includes(search.toLowerCase()) || s.partner.toLowerCase().includes(search.toLowerCase()) || s.token.toLowerCase().includes(search.toLowerCase()))
  );
  const filtEvents = EVENTS.filter(e =>
    (partnerFilter === 'All' || e.partner === partnerFilter) &&
    (countryFilter === 'All' || e.country === countryFilter) &&
    (!search || e.type.toLowerCase().includes(search.toLowerCase()) || e.msg.toLowerCase().includes(search.toLowerCase()) || e.partner.toLowerCase().includes(search.toLowerCase()))
  );
  const visibleAlerts = ALERTS.filter(a => !dismissedAlerts.includes(a.id));

  const statusStyle: Record<string,string> = {
    Charging:  'bg-emerald-100 text-emerald-700 border border-emerald-200',
    Suspended: 'bg-amber-100 text-amber-700 border border-amber-200',
    Stuck:     'bg-rose-100 text-rose-700 border border-rose-200',
    Ended:     'bg-slate-100 text-slate-500 border border-slate-200',
  };
  const statusDot: Record<string,string> = {
    Charging:'bg-emerald-500 animate-pulse', Suspended:'bg-amber-500', Stuck:'bg-rose-500', Ended:'bg-slate-400',
  };
  const sevBorder: Record<string,string> = {
    critical:'border-l-rose-500 bg-rose-50',
    warning: 'border-l-amber-500 bg-amber-50',
    info:    'border-l-blue-400 bg-blue-50',
  };
  const sevText: Record<string,string> = {
    critical:'text-rose-700', warning:'text-amber-700', info:'text-blue-700',
  };
  const sevType: Record<string,string> = {
    SESSION_STARTED:   'text-emerald-700 bg-emerald-50 border border-emerald-200',
    SESSION_ENDED:     'text-slate-600 bg-slate-100 border border-slate-200',
    SESSION_SUSPENDED: 'text-amber-700 bg-amber-50 border border-amber-200',
    AUTH_ACCEPTED:     'text-emerald-700 bg-emerald-50 border border-emerald-200',
    AUTH_REJECTED:     'text-rose-700 bg-rose-50 border border-rose-200',
    CDRi:              'text-blue-700 bg-blue-50 border border-blue-200',
    CDR_RECEIVED:      'text-indigo-700 bg-indigo-50 border border-indigo-200',
    EVSE_STATUS:       'text-slate-600 bg-slate-100 border border-slate-200',
    PARTNER_OFFLINE:   'text-rose-700 bg-rose-50 border border-rose-200',
    TARIFF_UPDATE:     'text-violet-700 bg-violet-50 border border-violet-200',
  };
  const sevDotColor: Record<string,string> = {
    critical:'bg-rose-500', warning:'bg-amber-500', success:'bg-emerald-500', info:'bg-slate-400',
  };
  const partnerStatus: Record<string,string> = {
    online:'text-emerald-600 bg-emerald-50', warning:'text-amber-600 bg-amber-50', offline:'text-rose-600 bg-rose-50',
  };

  const handleExport = () => {
    const csv = [
      ['Session ID','EVSE','Partner','Country','City','Started','Duration','Energy kWh','Cost ₵','Status','Token','Power','Protocol'].join(','),
      ...SESSIONS.map(s => [s.id,s.evse,s.partner,s.country,s.city,s.started,s.duration,s.energy,s.cost.toFixed(2),s.status,s.token,s.power,s.protocol].map(v=>`"${v}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `events-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    showToast('CSV exported successfully');
  };

  const drawerData = drawerSession ? SESSIONS.find(s => s.id === drawerSession) : null;
  const trendMax = Math.max(...SESSION_TREND);
  const activeCount  = 78;
  const stuckCount   = SESSIONS.filter(s => s.status === 'Stuck').length;
  const offlineCount = PARTNER_HEALTH.filter(p => p.status === 'offline').length;

  return (
    <div className="space-y-4 relative">

      {/* â"₵â"₵ Header â"₵â"₵ */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Events & CDRi</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time EV charging operations dashboard · Jun 24, 2026</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button data-local onClick={handleExport}
            className="flex items-center gap-1.5 text-xs border border-slate-200 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button data-local onClick={handleLiveFeed}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-semibold transition-colors ${liveFeed ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
            <span className={`w-1.5 h-1.5 rounded-full bg-white ${liveFeed ? 'animate-pulse' : 'opacity-50'}`} />
            {liveFeed ? 'Live · On' : 'Live Feed'}
          </button>
        </div>
      </div>

      {/* â"₵â"₵ KPI Cards â"₵â"₵ */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Active Sessions',   value:'78', sub:'Right now',         color:'text-emerald-600', bg:'bg-emerald-50 border-emerald-100', icon:Zap,             dot:true,  trend:'+12%' },
          { label:'Revenue Today',     value:'₵ 4,821',  sub:'Jun 24 · live',    color:'text-indigo-600',  bg:'bg-indigo-50 border-indigo-100',   icon:TrendingUp,      dot:false, trend:'+8%'  },
          { label:'Energy Delivered',  value:'9,240 kWh', sub:'Today so far',    color:'text-blue-600',    bg:'bg-blue-50 border-blue-100',       icon:BatteryCharging, dot:false, trend:'+11%' },
          { label:'Auth Success Rate', value:'99.3%',    sub:'Last 60 min',      color:'text-emerald-600', bg:'bg-emerald-50 border-emerald-100', icon:ShieldCheck,     dot:false, trend:'+0.1%'},
          { label:'Failed Auths',      value:'7',        sub:'Last 60 min',      color:'text-rose-600',    bg:'bg-rose-50 border-rose-100',       icon:XCircle,         dot:false, trend:'up 3x' },
          { label:'CDRi Received',     value:'284',      sub:'Since midnight',   color:'text-violet-600',  bg:'bg-violet-50 border-violet-100',   icon:FileText,        dot:false, trend:'+5%'  },
        ].map(k => (
          <div key={k.label} className={`bg-white rounded-xl border p-4 ${k.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${k.bg.split(' ')[0]}`}>
                <k.icon className={`w-4 h-4 ${k.color}`} />
              </div>
              <div className="flex items-center gap-1">
                {k.dot && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${k.color} bg-white/60`}>{k.trend}</span>
              </div>
            </div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{k.label}</p>
            <p className={`text-lg font-bold tabular-nums ${k.color}`}>{k.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* â"₵â"₵ Alert Panel â"₵â"₵ */}
      {visibleAlerts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active Alerts ({visibleAlerts.length})</p>
            <button data-local onClick={() => setDismissedAlerts(ALERTS.map(a=>a.id))} className="text-[10px] text-slate-400 hover:text-slate-600">Dismiss all</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {visibleAlerts.map(a => {
              const Icon = a.icon;
              return (
                <div key={a.id} className={`flex items-start gap-3 px-4 py-3 rounded-xl border-l-4 ${sevBorder[a.sev]}`}>
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${sevText[a.sev]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-xs font-bold ${sevText[a.sev]}`}>{a.title}</p>
                      <span className="text-[9px] text-slate-400 ml-auto flex-shrink-0">{a.age}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{a.body}</p>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button data-local onClick={() => { showToast(`${a.cta}: action taken for "${a.title.slice(0,28)}…"`, a.sev === 'warning' ? 'warning' : 'success'); setDismissedAlerts(p=>[...p,a.id]); }} className={`text-[10px] font-semibold border rounded px-2 py-0.5 ${sevText[a.sev]} border-current hover:opacity-70`}>{a.cta}</button>
                    <button data-local onClick={() => setDismissedAlerts(p=>[...p,a.id])} className="text-[9px] text-slate-400 hover:text-slate-600 text-center">dismiss</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* â"₵â"₵ Filters â"₵â"₵ */}
      <div className="bg-white rounded-xl border border-slate-100 px-4 py-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-1.5 flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Session ID, partner, token..."
            className="text-xs outline-none bg-transparent text-slate-700 placeholder-slate-400 w-full" />
          {search && <button data-local onClick={() => setSearch('')}><X className="w-3 h-3 text-slate-400 hover:text-slate-600" /></button>}
        </div>
        {([
          { val:partnerFilter, set:setPartnerFilter, opts:partners,  label:'Partner'    },
          { val:countryFilter, set:setCountryFilter, opts:countries, label:'Country'    },
          { val:statusFilter,  set:setStatusFilter,  opts:statuses,  label:'Status'     },
        ] as const).map(f => (
          <select key={f.label} data-local value={f.val} onChange={e => (f.set as (v:string)=>void)(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-1.5 text-slate-600 bg-white focus:outline-none focus:border-indigo-300">
            {f.opts.map(o => <option key={o}>{o === 'All' ? `All ${f.label}s` : o}</option>)}
          </select>
        ))}
        <select data-local value={timeFilter} onChange={e => setTimeFilter(e.target.value)}
          className="border border-slate-200 rounded-lg text-xs px-3 py-1.5 text-slate-600 bg-white">
          {['5m','15m','30m','1h','6h','24h'].map(t => <option key={t} value={t}>Last {t}</option>)}
        </select>
        {(search || partnerFilter !== 'All' || countryFilter !== 'All' || statusFilter !== 'All') && (
          <button data-local onClick={() => { setSearch(''); setPartnerFilter('All'); setCountryFilter('All'); setStatusFilter('All'); }}
            className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors">
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}
        <span className="ml-auto text-[10px] text-slate-400 flex-shrink-0">{filtSessions.length} sessions · {filtEvents.length} events</span>
      </div>

      {/* â"₵â"₵ Tabbed Main Panel â"₵â"₵ */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center border-b border-slate-100 px-4 pt-0">
          {(['sessions','events','alerts'] as const).map(tab => (
            <button data-local key={tab} onClick={() => setActiveTab(tab)}
              className={`text-xs font-semibold px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              {tab === 'sessions' ? `Live Sessions (${filtSessions.length})` : tab === 'events' ? `Event Log (${filtEvents.length})` : `Alerts (${visibleAlerts.length})`}
            </button>
          ))}
          <div className="ml-auto pr-3 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${liveFeed ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-[10px] text-slate-400">{liveFeed ? 'Live · every 5s' : 'Paused'}</span>
          </div>
        </div>

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  {['Session','Partner / Location','EVSE','Started','Duration','Energy','Cost','Progress','Status','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtSessions.map(s => (
                  <tr key={s.id} className={`hover:bg-indigo-50/30 transition-colors ${s.status === 'Stuck' ? 'bg-rose-50/40' : s.status === 'Suspended' ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <button data-local onClick={() => setDrawerSession(s.id)} className="font-mono text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline">{s.id}</button>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">{s.protocol}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800 text-xs">{s.partner}</p>
                      <p className="text-[10px] text-slate-400">{s.city} · {s.country}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{s.evse}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-600">{s.started}</td>
                    <td className="px-4 py-3">
                      <span className={`tabular-nums font-semibold ${s.status === 'Stuck' ? 'text-rose-600' : 'text-slate-700'}`}>{s.duration}</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums font-semibold text-blue-700">{s.energy} kWh</td>
                    <td className="px-4 py-3 tabular-nums font-semibold text-emerald-700">₵ {s.cost.toFixed(2)}</td>
                    <td className="px-4 py-3 w-32">
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${s.status === 'Stuck' ? 'bg-rose-400' : s.status === 'Suspended' ? 'bg-amber-400' : s.status === 'Ended' ? 'bg-slate-400' : 'bg-emerald-500'}`} style={{ width:`${s.pct}%` }} />
                        </div>
                        <span className="text-[9px] text-slate-400 w-7 text-right tabular-nums">{s.pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot[s.status]}`} />
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle[s.status]}`}>{s.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button data-local onClick={() => setDrawerSession(s.id)} className="text-[10px] text-indigo-600 border border-indigo-200 rounded px-2 py-0.5 hover:bg-indigo-50 transition-colors">View</button>
                        {s.status !== 'Ended' && s.status !== 'Stuck' && s.status !== 'Suspended' && (
                          <button data-local onClick={() => handleSuspend(s.id)} className="text-[10px] text-amber-700 border border-amber-200 rounded px-2 py-0.5 hover:bg-amber-50 transition-colors">Suspend</button>
                        )}
                        {s.status !== 'Ended' && (
                          <button data-local onClick={() => handleStop(s.id)} className="text-[10px] text-rose-600 border border-rose-200 rounded px-2 py-0.5 hover:bg-rose-50 transition-colors">Stop</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtSessions.length === 0 && (
                  <tr><td colSpan={10} className="px-4 py-10 text-center text-xs text-slate-400">No sessions match the current filters</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="divide-y divide-slate-50 max-h-[480px] overflow-y-auto">
            {filtEvents.map((e, i) => (
              <div key={i} className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50/70 transition-colors ${e.sev === 'critical' ? 'border-l-2 border-rose-300' : e.sev === 'warning' ? 'border-l-2 border-amber-300' : ''}`}>
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${sevDotColor[e.sev]}`} />
                <span className="font-mono text-[10px] text-slate-400 mt-0.5 w-16 shrink-0 tabular-nums">{e.ts}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${sevType[e.type] ?? 'text-slate-600 bg-slate-100 border border-slate-200'}`}>{e.type}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-slate-700 leading-relaxed">{e.msg}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[9px] font-semibold text-slate-500">{e.partner}</span>
                  <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">{e.country}</span>
                </div>
              </div>
            ))}
            {filtEvents.length === 0 && (
              <div className="px-4 py-10 text-center text-xs text-slate-400">No events match the current filters</div>
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="p-4 space-y-2">
            {visibleAlerts.length === 0 && (
              <div className="py-10 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <CheckCircle className="w-8 h-8 text-emerald-300" />
                All alerts dismissedno active issues
              </div>
            )}
            {visibleAlerts.map(a => {
              const Icon = a.icon;
              return (
                <div key={a.id} className={`flex items-start gap-3 px-4 py-4 rounded-xl border-l-4 ${sevBorder[a.sev]}`}>
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${sevText[a.sev]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-sm font-bold ${sevText[a.sev]}`}>{a.title}</p>
                      <span className="text-[9px] text-slate-400 ml-auto">{a.age}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{a.body}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button data-local className={`text-xs font-semibold border rounded-lg px-3 py-1.5 ${sevText[a.sev]} border-current hover:opacity-70 transition-opacity`}>{a.cta}</button>
                    <button data-local onClick={() => setDismissedAlerts(p=>[...p,a.id])} className="text-[10px] text-slate-400 hover:text-slate-600 text-center transition-colors">Dismiss</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* â"₵â"₵ Bottom Analytics Row â"₵â"₵ */}
      <div className="grid grid-cols-1 gap-4">

        {/* Partner Health */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Partner Health</h3>
          <div className="space-y-2">
            {PARTNER_HEALTH.map(p => (
              <div key={p.name} className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.status === 'online' ? 'bg-emerald-500' : p.status === 'warning' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className="text-xs text-slate-700 flex-1 truncate font-medium">{p.name}</span>
                <span className="text-[9px] text-slate-400 tabular-nums w-8 text-right">{p.latency}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${partnerStatus[p.status]}`}>{p.sessions}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-50 text-[10px] text-slate-400">
            {PARTNER_HEALTH.filter(p=>p.status!=='offline').length} online · {offlineCount} offline · {PARTNER_HEALTH.filter(p=>p.status==='warning').length} degraded
          </div>
        </div>
      </div>

      {/* â"₵â"₵ Session Drill-down Drawer â"₵â"₵ */}
      {drawerSession && drawerData && (
        <div className="fixed inset-0 z-[9999] flex justify-end" onClick={() => setDrawerSession(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white w-full max-w-[420px] h-full shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Drawer header */}
            <div className={`px-5 py-4 border-b border-slate-100 ${drawerData.status === 'Stuck' ? 'bg-rose-50' : drawerData.status === 'Suspended' ? 'bg-amber-50' : drawerData.status === 'Ended' ? 'bg-slate-50' : 'bg-white'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`w-2 h-2 rounded-full ${statusDot[drawerData.status]}`} />
                    <h3 className="font-bold text-slate-800 font-mono text-sm">{drawerData.id}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle[drawerData.status]}`}>{drawerData.status}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{drawerData.partner} · {drawerData.evse} · {drawerData.city}, {drawerData.country}</p>
                </div>
                <button data-local onClick={() => setDrawerSession(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { l:'Energy',   v:`${drawerData.energy} kWh`, c:'text-blue-700'    },
                  { l:'Cost',     v:`₵ ${drawerData.cost.toFixed(2)}`, c:'text-emerald-700' },
                  { l:'Duration', v:drawerData.duration,        c:'text-slate-700'   },
                  { l:'Power',    v:drawerData.power,           c:'text-indigo-700'  },
                  { l:'Protocol', v:drawerData.protocol,        c:'text-slate-600'   },
                  { l:'Started',  v:drawerData.started,         c:'text-slate-700'   },
                ].map(item => (
                  <div key={item.l} className="bg-slate-50 rounded-lg p-2.5 text-center">
                    <p className="text-[8px] text-slate-400 uppercase font-semibold tracking-wide">{item.l}</p>
                    <p className={`text-xs font-bold ${item.c} mt-0.5`}>{item.v}</p>
                  </div>
                ))}
              </div>

              {/* Token */}
              <div className="bg-slate-50 rounded-lg px-3 py-2.5 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">Auth Token</p>
                  <p className="text-xs font-mono font-bold text-indigo-600">{drawerData.token}</p>
                </div>
              </div>

              {/* Charge progress */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
                  <span>Charge Progress</span>
                  <span className="font-bold text-slate-700">{drawerData.pct}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${drawerData.status === 'Stuck' ? 'bg-rose-400' : drawerData.status === 'Suspended' ? 'bg-amber-400' : drawerData.status === 'Ended' ? 'bg-slate-400' : 'bg-emerald-500'}`}
                    style={{ width:`${drawerData.pct}%` }} />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>0 kWh</span><span>{drawerData.energy} kWh so far</span>
                </div>
              </div>

              {/* Lifecycle timeline */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Session Lifecycle</h4>
                <div className="space-y-0">
                  {[
                    { ts:drawerData.started, label:'Auth Request',    ok:true,  note:'Token validatedwhitelist match confirmed' },
                    { ts:drawerData.started, label:'Session Started', ok:true,  note:`EVSE ${drawerData.evse} allocated · ${drawerData.power}` },
                    { ts:'',                 label:'CDRi Update ×3',  ok:true,  note:`${drawerData.energy} kWh · ₵ ${drawerData.cost.toFixed(2)} accumulated` },
                    {
                      ts:'',
                      label: drawerData.status === 'Charging' ? 'Charging Active' : drawerData.status === 'Stuck' ? 'No CDRiSession Stuck' : drawerData.status === 'Ended' ? 'Session Ended' : 'Session Suspended',
                      ok:    drawerData.status !== 'Stuck',
                      note:  drawerData.status === 'Stuck' ? 'No energy update in 79 minintervention required' : drawerData.status === 'Ended' ? 'Force stopped · CDR queued for generation' : drawerData.status === 'Suspended' ? 'Suspended by eMSP command · awaiting resume' : 'Energy delivery ongoing',
                    },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 mt-0.5 ${step.ok ? 'bg-emerald-500 border-emerald-500' : 'bg-rose-500 border-rose-500'}`} />
                        {i < 3 && <div className="w-0.5 h-8 bg-slate-200 my-0.5" />}
                      </div>
                      <div className="pb-3 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-slate-800">{step.label}</p>
                          {step.ts && <span className="text-[9px] font-mono text-slate-400">{step.ts}</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{step.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer actions */}
            <div className="border-t border-slate-100 px-5 py-4 flex gap-2 bg-slate-50/50">
              <button data-local className="flex-1 text-xs border border-slate-200 bg-white text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium">Audit Log</button>
              {drawerData.status !== 'Ended' && drawerData.status !== 'Suspended' && (
                <button data-local onClick={() => handleSuspend(drawerData.id)} className="flex-1 text-xs border border-amber-200 bg-amber-50 text-amber-700 px-3 py-2 rounded-lg hover:bg-amber-100 transition-colors font-medium">Suspend</button>
              )}
              {drawerData.status !== 'Ended' && (
                <button data-local onClick={() => handleStop(drawerData.id)} className="flex-1 text-xs bg-rose-600 text-white px-3 py-2 rounded-lg hover:bg-rose-700 transition-colors font-medium">Force Stop</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* â"₵â"₵ Toast â"₵â"₵ */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[99999] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 transition-all ${toast.type === 'error' ? 'bg-rose-600' : toast.type === 'warning' ? 'bg-amber-600' : 'bg-slate-800'}`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : toast.type === 'warning' ? <AlertCircle className="w-4 h-4 text-amber-200" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function renderEvents() {
  return <EventsWorkspace />;
}

function CDRExchangeWorkspace() {
  const [search,        setSearch]        = useState('');
  const [partnerFilter, setPartnerFilter] = useState('All');
  const [statusFilter,  setStatusFilter]  = useState('All');
  const [dateFrom,      setDateFrom]      = useState('');
  const [dateTo,        setDateTo]        = useState('');
  const [drawerCdr,     setDrawerCdr]     = useState<string | null>(null);
  const [actionMenu,    setActionMenu]    = useState<string | null>(null);
  // placeholders to satisfy old references in the big block below
  const [countryFilter, setCountryFilter] = useState('All');
  const [eichFilter,    setEichFilter]    = useState('All');
  const [dismissedAlert, setDismissedAlert] = useState<number[]>([]);
  const [activeTab,      setActiveTab]      = useState<'cdrs'|'settlement'|'compliance'>('cdrs');
  const [toast,          setToast]          = useState<{msg:string;type:'success'|'warning'|'error'}|null>(null);

  const showToast = (msg: string, type: 'success'|'warning'|'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const raiseDispute = (cdrId: string) => {
    const cdr = cdrs.find(c => c.id === cdrId);
    if (!cdr) return;
    const shortId = cdrId.replace('CDR-20250624-', 'CDR-');
    const newDispute: DisputeRecord = {
      id: `DIS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      cdr: shortId,
      partner: cdr.partner,
      amount: parseFloat((cdr.billed * 0.1).toFixed(2)),
      currency: 'GHS',
      reason: cdr.errors > 0 ? 'Tariff discrepancy' : 'Energy mismatch',
      status: 'open',
      priority: cdr.errors >= 3 ? 'critical' : cdr.errors >= 1 ? 'high' : 'medium',
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      agingDays: 0,
      description: `Dispute raised from CDR Exchange for ${shortId} · Partner: ${cdr.partner} · Billed: ₵ ${cdr.billed.toFixed(2)} · Energy: ${cdr.energy} kWh · Session: ${cdr.session}`,
      evidence: [`${shortId}-export.csv`],
    };
    try {
      const stored = localStorage.getItem('cb_disputes');
      const existing: DisputeRecord[] = stored ? JSON.parse(stored) : ALL_DISPUTES;
      localStorage.setItem('cb_disputes', JSON.stringify([newDispute, ...existing]));
    } catch { /* ignore */ }
    setCdrs(p => p.map(x => x.id === cdrId ? { ...x, status: 'Disputed', settlement: 'On Hold' } : x));
    showToast(`Dispute ${newDispute.id} raised — visible in Disputes page`, 'warning');
  };

  const [cdrs, setCdrs] = useLocalStorage('cb_cdrs', [
    { id:'CDR-20250624-8821', session:'SES-881100', partner:'ECG Ghana', country:'GH', evse:'ECG-GH-0041', started:'2026-06-24 09:12', duration:'38m', energy:24.7, tariff:'₵ 0.34/kWh', billed:8.41,  eich:true,  status:'Validated',  settlement:'Settled',   errors:0,    updated:'10:02', token:'RFID-A4B2C1',  protocol:'OCPI 2.2' },
    { id:'CDR-20250624-8820', session:'SES-881099', partner:'Total Energies Ghana', country:'GH', evse:'TOT-GH-0882', started:'2026-06-24 09:05', duration:'22m', energy:11.2, tariff:'₵ 0.34/kWh', billed:3.81,  eich:true,  status:'Processing', settlement:'Pending',   errors:0,    updated:'09:45', token:'RFID-CC2211',  protocol:'OCPI 2.2' },
    { id:'CDR-20250624-8819', session:'SES-881098', partner:'Goil EV Network', country:'GH', evse:'GOI-GH-0112', started:'2026-06-24 08:44', duration:'71m', energy:62.0, tariff:'₵ 0.36/kWh', billed:22.10, eich:true,  status:'Validated',  settlement:'Settled',   errors:0,    updated:'10:05', token:'RFID-GOI-GH01', protocol:'OCPI 2.2' },
    { id:'CDR-20250624-8817', session:'SES-881096', partner:'VRA EV Charge', country:'GH', evse:'VRA-GH-0024', started:'2026-06-24 08:31', duration:'12m', energy:8.4,  tariff:'₵ 0.35/kWh', billed:2.94,  eich:false, status:'Disputed',   settlement:'On Hold',   errors:2,    updated:'08:55', token:'RFID-EE9F21',  protocol:'OCPI 2.2' },
    { id:'CDR-20250624-8815', session:'SES-881094', partner:'Shell Ghana EV', country:'GH', evse:'SHG-GH-0044', started:'2026-06-24 08:20', duration:'54m', energy:33.1, tariff:'₵ 0.34/kWh', billed:11.25, eich:true,  status:'Validated',  settlement:'Settled',   errors:0,    updated:'09:30', token:'RFID-B1A2D3',  protocol:'OCPI 2.2' },
    { id:'CDR-20250624-8812', session:'SES-881091', partner:'Eletrobras EV Brasil', country:'BR', evse:'ELB-BR-0031', started:'2026-06-24 08:05', duration:'66m', energy:44.0, tariff:'₵ 0.31/kWh', billed:13.64, eich:true,  status:'Validated',  settlement:'Settled',   errors:0,    updated:'09:20', token:'RFID-ELB-BR01', protocol:'OCPI 2.2' },
    { id:'CDR-20250624-8810', session:'SES-881089', partner:'ECG Ghana', country:'GH', evse:'ECG-GH-0055', started:'2026-06-24 07:50', duration:'29m', energy:18.3, tariff:'₵ 0.34/kWh', billed:6.22,  eich:true,  status:'Validated',  settlement:'Settled',   errors:0,    updated:'08:30', token:'RFID-A7B3C9',  protocol:'OCPI 2.2' },
    { id:'CDR-20250624-8808', session:'SES-881087', partner:'Total Energies Ghana', country:'GH', evse:'TOT-GH-0901', started:'2026-06-24 07:41', duration:'18m', energy:9.1,  tariff:'₵ 0.34/kWh', billed:3.09,  eich:false, status:'Error',      settlement:'Blocked',   errors:3,    updated:'08:15', token:'RFID-TC8812',  protocol:'OCPI 2.2' },
    { id:'CDR-20250624-8805', session:'SES-881084', partner:'Goil EV Network', country:'GH', evse:'GOI-GH-0118', started:'2026-06-24 07:30', duration:'45m', energy:38.5, tariff:'₵ 0.36/kWh', billed:13.86, eich:true,  status:'Validated',  settlement:'Settled',   errors:0,    updated:'08:20', token:'RFID-GOI-GH01', protocol:'OCPI 2.2' },
    { id:'CDR-20250624-8803', session:'SES-881082', partner:'Shell Ghana EV', country:'GH', evse:'SHG-GH-0011', started:'2026-06-24 07:15', duration:'33m', energy:22.8, tariff:'₵ 0.34/kWh', billed:7.75,  eich:true,  status:'Processing', settlement:'Pending',   errors:1,    updated:'08:00', token:'RFID-BB4411',  protocol:'OCPI 2.2' },
    { id:'CDR-20250624-8800', session:'SES-881079', partner:'VRA EV Charge', country:'GH', evse:'VRA-GH-0031', started:'2026-06-24 07:02', duration:'8m',  energy:5.2,  tariff:'₵ 0.35/kWh', billed:1.82,  eich:false, status:'Disputed',   settlement:'On Hold',   errors:1,    updated:'07:30', token:'RFID-FF0012',  protocol:'OCPI 2.2' },
    { id:'CDR-20250624-8797', session:'SES-881076', partner:'Eletrobras EV Brasil', country:'BR', evse:'ELB-BR-0044', started:'2026-06-24 06:55', duration:'52m', energy:31.7, tariff:'₵ 0.31/kWh', billed:9.83,  eich:true,  status:'Validated',  settlement:'Settled',   errors:0,    updated:'08:00', token:'RFID-VT5521',  protocol:'OCPI 2.2' },
  ]);

  const ALERTS = [
    { id:0, sev:'critical', icon:XCircle,      title:'Eichrecht signing failure',         body:'8 CDRs from Total Energies Ghana FR failed Eichrecht signing · transparency software rejected hash · manual review required', age:'31m ago' },
    { id:1, sev:'critical', icon:AlertTriangle, title:'VRA EV Charge CDRs on hold2 disputes', body:'RFID-EE9F21 and RFID-FF0012 disputed by eMSP · energy mismatch >5% · settlement blocked until resolved', age:'1h 2m ago' },
    { id:2, sev:'warning',  icon:Clock,         title:'311 CDRs pending validation',       body:'Processing queue backed up · avg wait 22 min · SLA target 15 min · CDR Processor running at 94% capacity', age:'8m ago' },
    { id:3, sev:'warning',  icon:AlertCircle,   title:'Shell Ghana EV CDRi tariff mismatch',        body:'CDR-20250624-8803billed tariff ₵ 0.34/kWh differs from session CDRi tariff ₵ 0.29/kWh · 17% delta', age:'44m ago' },
    { id:4, sev:'info',     icon:FileText,      title:'Goil EV Network CDR batch received',         body:'1,440 CDRs from Goil EV Network processed · 1,438 validated · 2 pending signature verification · Eichrecht batch signed', age:'2h ago' },
  ];

  const PARTNER_REV = [
    { name:'ECG Ghana',      rev:14820, cdrs:4120, color:'bg-indigo-500',  pct:31 },
    { name:'Goil EV Network',         rev:13410, cdrs:1440, color:'bg-blue-400',    pct:28 },
    { name:'Shell Ghana EV',  rev:10240, cdrs:3200, color:'bg-violet-400',  pct:21 },
    { name:'Total Energies Ghana',  rev:7890,  cdrs:2891, color:'bg-sky-400',     pct:16 },
    { name:'Eletrobras EV Brasil',          rev:1820,  cdrs:880,  color:'bg-teal-400',    pct:4  },
    { name:'VRA EV Charge',        rev:0,     cdrs:0,    color:'bg-slate-300',   pct:0  },
  ];

  const REV_TREND   = [38200, 41500, 39800, 44100, 47200, 44900, 48100];
  const CDR_TREND   = [78200, 81400, 80100, 85500, 88900, 87200, 94231];
  const WEEK_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const revMax = Math.max(...REV_TREND);
  const cdrMax = Math.max(...CDR_TREND);

  const SETTLEMENT_ROWS = [
    { partner:'ECG Ghana',     period:'Jun 2026', cdrs:4120, gross:'₵ 14,820', fees:'₵ 1,482', net:'₵ 13,338', status:'Settled',   settled:'2026-06-20' },
    { partner:'Goil EV Network',        period:'Jun 2026', cdrs:1440, gross:'₵ 13,410', fees:'₵ 1,341', net:'₵ 12,069', status:'Settled',   settled:'2026-06-21' },
    { partner:'Shell Ghana EV', period:'Jun 2026', cdrs:3200, gross:'₵ 10,240', fees:'₵ 1,024', net:'₵ 9,216',  status:'Pending',   settled:'--'          },
    { partner:'Total Energies Ghana', period:'Jun 2026', cdrs:2891, gross:'₵ 7,890',  fees:'₵ 789',   net:'₵ 7,101',  status:'Pending',   settled:'--'          },
    { partner:'Eletrobras EV Brasil',         period:'Jun 2026', cdrs:880,  gross:'₵ 1,820',  fees:'₵ 182',   net:'₵ 1,638',  status:'Settled',   settled:'2026-06-22' },
    { partner:'VRA EV Charge',       period:'Jun 2026', cdrs:0,    gross:'₵ 0',      fees:'₵ 0',     net:'₵ 0',      status:'On Hold',   settled:'--'          },
  ];

  const COMPLIANCE_ROWS = [
    { partner:'ECG Ghana',     total:4120, signed:4120, failed:0,  rate:'100%', last:'2026-06-24 09:58', status:'Compliant'   },
    { partner:'Goil EV Network',        total:1440, signed:1438, failed:2,  rate:'99.9%', last:'2026-06-24 08:20', status:'Compliant'   },
    { partner:'Shell Ghana EV', total:3200, signed:3199, failed:1,  rate:'99.97%', last:'2026-06-24 08:00', status:'Compliant'  },
    { partner:'Total Energies Ghana', total:2891, signed:2883, failed:8,  rate:'99.7%', last:'2026-06-24 07:41', status:'Warning'    },
    { partner:'Eletrobras EV Brasil',         total:880,  signed:880,  failed:0,  rate:'100%', last:'2026-06-24 08:00', status:'Compliant'   },
    { partner:'VRA EV Charge',       total:0,    signed:0,    failed:0,  rate:'--',    last:'--',                status:'Offline'    },
  ];

  const partners  = ['All','ECG Ghana','Goil EV Network','Total Energies Ghana','VRA EV Charge','Eletrobras EV Brasil','Shell Ghana EV'];
  const statuses  = ['All','Validated','Processing','Disputed','Error'];
  const countries = ['All','NL','DE','FR','FI'];
  const eichOpts  = ['All','Signed','Unsigned'];

  const filt = cdrs.filter(c =>
    (partnerFilter === 'All' || c.partner === partnerFilter) &&
    (statusFilter  === 'All' || c.status  === statusFilter)  &&
    (countryFilter === 'All' || c.country === countryFilter) &&
    (eichFilter    === 'All' || (eichFilter === 'Signed' ? c.eich : !c.eich)) &&
    (!search || c.id.toLowerCase().includes(search.toLowerCase()) || c.session.toLowerCase().includes(search.toLowerCase()) || c.partner.toLowerCase().includes(search.toLowerCase()) || c.token.toLowerCase().includes(search.toLowerCase()))
  );

  const totalRev    = cdrs.reduce((a,c) => a + c.billed, 0);
  const validatedN  = cdrs.filter(c => c.status === 'Validated').length;
  const disputedN   = cdrs.filter(c => c.status === 'Disputed').length;
  const pendingN    = cdrs.filter(c => c.status === 'Processing').length;
  const errorN      = cdrs.filter(c => c.status === 'Error').length;
  const avgRev      = totalRev / cdrs.length;
  const validRate   = Math.round((validatedN / cdrs.length) * 1000) / 10;

  const statusStyle: Record<string,string> = {
    Validated:  'bg-emerald-100 text-emerald-700 border-emerald-200',
    Processing: 'bg-amber-100 text-amber-700 border-amber-200',
    Disputed:   'bg-rose-100 text-rose-700 border-rose-200',
    Error:      'bg-rose-100 text-rose-800 border-rose-300',
  };
  const settlStyle: Record<string,string> = {
    Settled:  'text-emerald-700 bg-emerald-50',
    Pending:  'text-amber-700 bg-amber-50',
    'On Hold':'text-rose-700 bg-rose-50',
    Blocked:  'text-rose-800 bg-rose-100',
  };
  const sevBorder: Record<string,string> = {
    critical:'border-l-rose-500 bg-rose-50', warning:'border-l-amber-500 bg-amber-50', info:'border-l-blue-400 bg-blue-50',
  };
  const sevText: Record<string,string> = {
    critical:'text-rose-700', warning:'text-amber-700', info:'text-blue-700',
  };
  const compStyle: Record<string,string> = {
    Compliant:'text-emerald-700 bg-emerald-50', Warning:'text-amber-700 bg-amber-50', Offline:'text-slate-500 bg-slate-100',
  };

  const drawerData = drawerCdr ? cdrs.find(c => c.id === drawerCdr) : null;
  const visibleAlerts = ALERTS.filter(a => !dismissedAlert.includes(a.id));

  const handleExport = () => {
    const csv = [
      ['CDR ID','Session','Partner','Country','EVSE','Started','Duration','Energy kWh','Tariff','Billed ₵','Eichrecht','Status','Settlement','Errors','Token'].join(','),
      ...filt.map(c => [c.id,c.session,c.partner,c.country,c.evse,c.started,c.duration,c.energy,c.tariff,c.billed.toFixed(2),c.eich?'Signed':'Unsigned',c.status,c.settlement,c.errors,c.token].map(v=>`"${v}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `cdr-export-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    showToast('CDR export downloaded');
  };

  const handleRevalidate = (id: string) => {
    setCdrs(prev => prev.map(c => c.id === id ? {...c, status:'Processing', settlement:'Pending', errors:0, updated: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} : c));
    showToast(`${id} queued for revalidation`, 'warning');
    setActionMenu(null);
  };

  // â"₵â"₵ derived counts (used by the new clean design) â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵
  const cdrTotal     = cdrs.length;
  const cdrValidated = cdrs.filter(c => c.status === 'Validated').length;
  const cdrPending   = cdrs.filter(c => c.status === 'Processing').length;
  const cdrDisputed  = cdrs.filter(c => c.status === 'Disputed' || c.status === 'Error').length;

  const filteredCdrs = cdrs.filter(c =>
    (partnerFilter === 'All' || c.partner === partnerFilter) &&
    (statusFilter  === 'All' || c.status  === statusFilter)  &&
    (!search || c.id.toLowerCase().includes(search.toLowerCase()) ||
                c.session.toLowerCase().includes(search.toLowerCase()) ||
                c.partner.toLowerCase().includes(search.toLowerCase()) ||
                c.token.toLowerCase().includes(search.toLowerCase()))
  );

  const cdrStatusStyle: Record<string,{pill:string; dot:string}> = {
    Validated:  { pill:'bg-emerald-50 text-emerald-700 border border-emerald-200', dot:'bg-emerald-500' },
    Processing: { pill:'bg-amber-50 text-amber-700 border border-amber-200',       dot:'bg-amber-500'   },
    Disputed:   { pill:'bg-rose-50 text-rose-700 border border-rose-200',          dot:'bg-rose-500'    },
    Error:      { pill:'bg-rose-100 text-rose-800 border border-rose-300',         dot:'bg-rose-600'    },
  };
  const cdrSettleStyle: Record<string,string> = {
    Settled:  'text-emerald-700',
    Pending:  'text-amber-600',
    'On Hold':'text-rose-600',
    Blocked:  'text-rose-700',
  };

  const handleCdrExport = () => {
    const csv = [
      ['CDR ID','Session','Partner','EVSE','Started','Energy kWh','Billed ₵','Eichrecht','Status','Settlement'].join(','),
      ...filteredCdrs.map(c => [c.id,c.session,c.partner,c.evse,c.started,c.energy,c.billed.toFixed(2),c.eich?'Signed':'Unsigned',c.status,c.settlement].map(v=>`"${v}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `cdrs-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    showToast('CDR export downloaded');
  };

  const cdrDrawer = drawerCdr ? cdrs.find(c => c.id === drawerCdr) : null;

  return (
    <div className="space-y-5 relative" onClick={() => actionMenu && setActionMenu(null)}>

      {/* â"₵â"₵ Header â"₵â"₵ */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">CDR Exchange</h2>
          <p className="text-sm text-slate-400 mt-0.5">All Charge Detail Recordsfilter, validate, download (Eichrecht compliant)</p>
        </div>
        <div className="flex items-center gap-2">
          <button data-local onClick={handleCdrExport}
            className="flex items-center gap-2 text-sm border border-slate-200 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium shadow-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:'Total CDRs (Jun)', value:'94,231',  color:'text-slate-800',   bg:'bg-white',      border:'border-slate-100',  icon:FileText,      iconColor:'text-slate-500',   sub:'This month' },
          { label:'Validated',        value:'93,840',  color:'text-emerald-600', bg:'bg-emerald-50', border:'border-emerald-100', icon:CheckCircle,   iconColor:'text-emerald-600', sub:'99.6% success' },
          { label:'Pending',          value:'311',     color:'text-amber-600',   bg:'bg-amber-50',   border:'border-amber-100',  icon:Clock,         iconColor:'text-amber-600',   sub:'Awaiting validation' },
          { label:'Disputed',         value:'80',      color:'text-rose-600',    bg:'bg-rose-50',    border:'border-rose-100',   icon:AlertTriangle, iconColor:'text-rose-600',    sub:'Require resolution' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-4`}>
            <div className="flex items-start justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/60`}>
                <s.icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
              <span className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</span>
            </div>
            <div className="text-xs font-semibold text-slate-700">{s.label}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* â"₵â"₵ Filter bar â"₵â"₵ */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-2 flex-1 min-w-[200px] bg-slate-50 focus-within:bg-white focus-within:border-indigo-300 transition-colors">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="CDR ID, session, token..."
            className="text-sm outline-none bg-transparent text-slate-700 placeholder-slate-400 w-full"
          />
          {search && (
            <button data-local onClick={() => setSearch('')}>
              <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
        <select data-local value={partnerFilter} onChange={e => setPartnerFilter(e.target.value)}
          className="border border-slate-200 rounded-xl text-sm px-4 py-2 text-slate-600 bg-white focus:outline-none focus:border-indigo-300 cursor-pointer hover:border-slate-300 transition-colors">
          {['All','ECG Ghana','Goil EV Network','Total Energies Ghana','VRA EV Charge','Eletrobras EV Brasil','Shell Ghana EV'].map(p =>
            <option key={p} value={p}>{p === 'All' ? 'All Partners' : p}</option>
          )}
        </select>
        <select data-local value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-xl text-sm px-4 py-2 text-slate-600 bg-white focus:outline-none focus:border-indigo-300 cursor-pointer hover:border-slate-300 transition-colors">
          {['All','Validated','Processing','Disputed','Error'].map(s =>
            <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
          )}
        </select>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="border border-slate-200 rounded-xl text-sm px-3 py-2 text-slate-600 bg-white focus:outline-none focus:border-indigo-300 hover:border-slate-300 transition-colors" />
          <span className="text-slate-300">→</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="border border-slate-200 rounded-xl text-sm px-3 py-2 text-slate-600 bg-white focus:outline-none focus:border-indigo-300 hover:border-slate-300 transition-colors" />
        </div>
        {(search || partnerFilter !== 'All' || statusFilter !== 'All' || dateFrom || dateTo) && (
          <button data-local
            onClick={() => { setSearch(''); setPartnerFilter('All'); setStatusFilter('All'); setDateFrom(''); setDateTo(''); }}
            className="text-sm text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
        <span className="ml-auto text-xs text-slate-400 font-medium">{filteredCdrs.length} records</span>
      </div>

      {/* â"₵â"₵ CDR Table â"₵â"₵ */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['CDR ID','Session','Partner','EVSE','Started','kWh','Billed','Eichrecht','Status',''].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCdrs.map(c => {
                const style = cdrStatusStyle[c.status] ?? { pill:'bg-slate-100 text-slate-600 border border-slate-200', dot:'bg-slate-400' };
                return (
                  <tr key={c.id} className={`hover:bg-indigo-50/30 transition-colors group ${c.status === 'Disputed' || c.status === 'Error' ? 'bg-rose-50/20' : ''}`}>
                    <td className="px-5 py-3.5">
                      <button data-local onClick={() => setDrawerCdr(c.id)}
                        className="font-mono text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
                        {c.id.replace('CDR-20250624-','CDR-')}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500 font-medium">{c.session}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-800">{c.partner}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{c.evse}</td>
                    <td className="px-5 py-3.5 tabular-nums text-slate-600">{c.started.slice(11)}</td>
                    <td className="px-5 py-3.5 tabular-nums font-semibold text-blue-700">{c.energy}</td>
                    <td className="px-5 py-3.5 tabular-nums font-bold text-emerald-700">₵ {c.billed.toFixed(2)}</td>
                    <td className="px-5 py-3.5">
                      {c.eich ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center">
                            <XCircle className="w-3 h-3 text-rose-500" />
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${style.pill}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 relative">
                      <div className="flex items-center gap-1">
                        <button data-local onClick={() => setDrawerCdr(c.id)}
                          className="w-8 h-8 rounded-lg hover:bg-indigo-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button data-local
                          onClick={e => { e.stopPropagation(); setActionMenu(actionMenu === c.id ? null : c.id); }}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      {actionMenu === c.id && (
                        <div className="absolute right-12 top-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl py-1.5 min-w-[168px]"
                          onClick={e => e.stopPropagation()}>
                          {[
                            { label:'View Details',  icon:Eye,           action: () => { setDrawerCdr(c.id); setActionMenu(null); } },
                            { label:'Download CDR',  icon:Download,      action: () => { showToast(`${c.id.replace('CDR-20250624-','CDR-')} downloading...`); setActionMenu(null); } },
                            { label:'Audit Trail',   icon:FileText,      action: () => { showToast('Audit trail opened'); setActionMenu(null); } },
                            { label:'Revalidate',    icon:RefreshCw,     action: () => { setCdrs(p=>p.map(x=>x.id===c.id?{...x,status:'Processing',settlement:'Pending',errors:0}:x)); showToast(`${c.id.replace('CDR-20250624-','CDR-')} queued for revalidation`,'warning'); setActionMenu(null); } },
                            { label:'Raise Dispute', icon:AlertTriangle, action: () => { raiseDispute(c.id); setActionMenu(null); }, danger:true },
                          ].map(item => {
                            const Icon = item.icon;
                            return (
                              <button key={item.label} data-local onClick={item.action}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${'danger' in item && item.danger ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-700 hover:bg-slate-50'}`}>
                                <Icon className="w-3.5 h-3.5 flex-shrink-0" /> {item.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredCdrs.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-sm text-slate-400">
                    No CDRs match the current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs text-slate-400">{filteredCdrs.length} of {cdrTotal} records</span>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Validated: <span className="font-bold text-emerald-600">{cdrValidated}</span></span>
            <span>Pending: <span className="font-bold text-amber-600">{cdrPending}</span></span>
            <span>Disputed: <span className="font-bold text-rose-600">{cdrDisputed}</span></span>
            <span className="font-bold text-slate-700">Total billed: <span className="text-indigo-600">₵ {filteredCdrs.reduce((a,c)=>a+c.billed,0).toFixed(2)}</span></span>
          </div>
        </div>
      </div>

      {/* â"₵â"₵ CDR Detail Drawer â"₵â"₵ */}
      {drawerCdr && cdrDrawer && (
        <div className="fixed inset-0 z-[9999] flex justify-end" onClick={() => setDrawerCdr(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white w-full max-w-[420px] h-full shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className={`px-5 py-5 border-b border-slate-100 ${cdrDrawer.status === 'Disputed' || cdrDrawer.status === 'Error' ? 'bg-rose-50' : cdrDrawer.status === 'Processing' ? 'bg-amber-50' : 'bg-slate-50'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold font-mono text-slate-800">{cdrDrawer.id.replace('CDR-20250624-','CDR-')}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cdrStatusStyle[cdrDrawer.status]?.pill ?? ''}`}>{cdrDrawer.status}</span>
                  </div>
                  <p className="text-xs text-slate-500">{cdrDrawer.partner} · {cdrDrawer.evse} · {cdrDrawer.country}</p>
                </div>
                <button data-local onClick={() => setDrawerCdr(null)}
                  className="w-8 h-8 rounded-lg hover:bg-white/80 flex items-center justify-center flex-shrink-0 transition-colors">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { l:'Energy',   v:`${cdrDrawer.energy} kWh`,             c:'text-blue-700'    },
                  { l:'Billed',   v:`₵ ${cdrDrawer.billed.toFixed(2)}`,    c:'text-emerald-700' },
                  { l:'Duration', v:cdrDrawer.duration,                     c:'text-slate-700'   },
                  { l:'Tariff',   v:cdrDrawer.tariff,                       c:'text-slate-700'   },
                  { l:'Started',  v:cdrDrawer.started.slice(11),            c:'text-slate-700'   },
                  { l:'Protocol', v:cdrDrawer.protocol,                     c:'text-indigo-600'  },
                ].map(item => (
                  <div key={item.l} className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">{item.l}</p>
                    <p className={`text-xs font-bold ${item.c} mt-0.5`}>{item.v}</p>
                  </div>
                ))}
              </div>

              {/* Session + Token */}
              <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3">
                <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Session · Token</p>
                  <p className="text-xs font-semibold text-slate-700">{cdrDrawer.session}</p>
                  <p className="text-xs font-mono font-bold text-indigo-600 mt-0.5">{cdrDrawer.token}</p>
                </div>
              </div>

              {/* Validation steps */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Validation History</h4>
                <div className="space-y-0">
                  {[
                    { label:'CDR Received',        ok:true,              note:`from ${cdrDrawer.partner} via ${cdrDrawer.protocol}` },
                    { label:'Format Validation',   ok:true,              note:'OCPI 2.2.1 schema valid · all mandatory fields present' },
                    { label:'Tariff Verification', ok:cdrDrawer.errors === 0, note:cdrDrawer.errors > 0 ? `${cdrDrawer.errors} tariff mismatch error(s) detected` : 'Session tariff matches agreed rate card' },
                    { label:'Eichrecht Signing',   ok:cdrDrawer.eich,   note:cdrDrawer.eich ? 'Signed by Eichrecht meter · hash verified' : 'Signature missingreview required' },
                    { label:'Settlement',          ok:cdrDrawer.settlement === 'Settled', note:cdrDrawer.settlement === 'Settled' ? 'Payment settled · funds transferred' : cdrDrawer.settlement === 'On Hold' ? 'On holddispute or error blocking settlement' : 'Pending next settlement run' },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 mt-0.5 ${step.ok ? 'bg-emerald-500 border-emerald-500' : 'bg-rose-500 border-rose-500'}`} />
                        {i < 4 && <div className="w-0.5 h-7 bg-slate-100 my-0.5" />}
                      </div>
                      <div className="pb-2 flex-1">
                        <p className="text-xs font-semibold text-slate-800">{step.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{step.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eichrecht + Settlement row */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-xl p-3 text-center ${cdrDrawer.eich ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'}`}>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-1">Eichrecht</p>
                  {cdrDrawer.eich
                    ? <><CheckCircle className="w-5 h-5 text-emerald-600 mx-auto" /><p className="text-xs font-bold text-emerald-700 mt-1">Signed</p></>
                    : <><XCircle    className="w-5 h-5 text-rose-500 mx-auto"     /><p className="text-xs font-bold text-rose-600 mt-1">Unsigned</p></>
                  }
                </div>
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-1">Settlement</p>
                  <p className={`text-sm font-bold ${cdrSettleStyle[cdrDrawer.settlement]}`}>{cdrDrawer.settlement}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Updated {cdrDrawer.updated}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 px-5 py-4 flex gap-2 bg-slate-50/50">
              <button data-local onClick={() => { showToast(`${cdrDrawer.id.replace('CDR-20250624-','CDR-')} downloading...`); }}
                className="flex-1 text-sm border border-slate-200 bg-white text-slate-600 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-semibold">Download</button>
              <button data-local onClick={() => { setCdrs(p=>p.map(x=>x.id===cdrDrawer.id?{...x,status:'Processing',settlement:'Pending',errors:0}:x)); showToast('Queued for revalidation','warning'); }}
                className="flex-1 text-sm border border-indigo-200 bg-indigo-50 text-indigo-700 px-3 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors font-semibold">Revalidate</button>
              {cdrDrawer.status !== 'Disputed' && (
                <button data-local onClick={() => { raiseDispute(cdrDrawer.id); setDrawerCdr(null); }}
                  className="flex-1 text-sm bg-rose-600 text-white px-3 py-2.5 rounded-xl hover:bg-rose-700 transition-colors font-semibold">Dispute</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* â"₵â"₵ Toast â"₵â"₵ */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[99999] text-white text-sm font-semibold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 ${toast.type === 'error' ? 'bg-rose-600' : toast.type === 'warning' ? 'bg-amber-600' : 'bg-slate-800'}`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : toast.type === 'warning' ? <AlertCircle className="w-4 h-4 text-amber-200" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function renderCDRExchange() {
  return <CDRExchangeWorkspace />;
}

function renderSupervision() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Supervision"
        sub="Platform health and partner connectivity diagnostics"
      />

      {/* Platform status */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { name: 'RFConnector API',     ok: true,  latency: '18ms',  uptime: '99.98%' },
          { name: 'OCPI Gateway',         ok: true,  latency: '42ms',  uptime: '99.91%' },
          { name: 'eMIP Gateway',         ok: true,  latency: '67ms',  uptime: '99.87%' },
          { name: 'Auth Service',         ok: true,  latency: '23ms',  uptime: '99.99%' },
          { name: 'CDR Processor',        ok: true,  latency: '31ms',  uptime: '99.95%' },
          { name: 'Eichrecht Signing',    ok: false, latency: '--',     uptime: '98.40%' },
        ].map(s => (
          <div key={s.name} className={`bg-white rounded-xl border p-4 ${s.ok ? 'border-slate-100' : 'border-rose-200 bg-rose-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <StatusDot ok={s.ok} />
              <span className="font-medium text-sm text-slate-700">{s.name}</span>
            </div>
            <div className="flex gap-4 text-xs text-slate-500">
              <span>Latency: <strong className="text-slate-700">{s.latency}</strong></span>
              <span>Uptime: <strong className="text-slate-700">{s.uptime}</strong></span>
            </div>
            {!s.ok && (
              <div className="mt-2 text-xs text-rose-600 font-medium">⚠ Service degradedinvestigating</div>
            )}
          </div>
        ))}
      </div>

      {/* Partner connectivity matrix */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 font-semibold text-slate-700">Partner Connection Status</div>
        <Table
          cols={['Partner', 'Protocol', 'Direction', 'Last Heartbeat', 'Latency', 'CDRs (24h)', 'Status', '']}
          rows={[
            ['ECG Ghana',     'OCPI 2.2', 'Bilateral', '14:32:01', '42ms', '4,120', <Pill label="Online"   color="bg-emerald-50 text-emerald-700" />, <button className="text-xs text-indigo-600">Diagnose</button>],
            ['Total Energies Ghana', 'OCPI 2.2', 'Outbound',  '14:31:58', '78ms', '2,891', <Pill label="Online"   color="bg-emerald-50 text-emerald-700" />, <button className="text-xs text-indigo-600">Diagnose</button>],
            ['Goil EV Network',        'eMIP 3.x', 'Bilateral', '14:31:55', '55ms', '1,440', <Pill label="Online"   color="bg-emerald-50 text-emerald-700" />, <button className="text-xs text-indigo-600">Diagnose</button>],
            ['VRA EV Charge',       'OCPI 2.2', 'Outbound',  '13:44:00', '--',   '0',     <Pill label="Offline"  color="bg-rose-50 text-rose-700"       />, <button className="text-xs text-rose-600">Alert</button>],
            ['Shell Ghana EV', 'OCPI 2.2', 'Bilateral', '14:30:22', '91ms', '3,200', <Pill label="Online"   color="bg-emerald-50 text-emerald-700" />, <button className="text-xs text-indigo-600">Diagnose</button>],
          ]}
        />
      </div>

      {/* Alert history */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-700 mb-3">Recent Alerts</h3>
        <div className="space-y-2">
          {[
            { level: 'critical', msg: 'VRA EV Charge OCPI connection lost at 13:44',       ts: '48m ago' },
            { level: 'warning',  msg: 'Eichrecht signing service high error rate',   ts: '2h ago' },
            { level: 'info',     msg: 'ECG Ghana pushed 480 new EVSE static updates', ts: '4h ago' },
            { level: 'info',     msg: 'Goil EV Network CDR batch of 1,440 CDRs received',     ts: '6h ago' },
          ].map((a, i) => {
            const colors: Record<string, string> = {
              critical: 'bg-rose-50 border-rose-200 text-rose-800',
              warning:  'bg-amber-50 border-amber-200 text-amber-800',
              info:     'bg-blue-50 border-blue-200 text-blue-800',
            };
            return (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg border text-sm ${colors[a.level]}`}>
                <span>{a.msg}</span>
                <span className="text-xs opacity-70 ml-4 shrink-0">{a.ts}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function renderTracking() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Tracking"
        sub="All CDRs centralisedaggregated by partner, downloadable by period"
        action={
          <button className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm px-3 py-2 rounded-lg hover:bg-slate-50">
            <Download className="w-4 h-4" /> Download Period
          </button>
        }
      />

      {/* By partner summary */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700 flex-1">CDR Aggregation by Partner (June 2025)</h3>
          <select className="border border-slate-200 rounded-lg text-sm px-3 py-2">
            <option>June 2025</option><option>May 2025</option><option>Q1 2025</option>
          </select>
        </div>
        <Table
          cols={['Partner', 'CDRs', 'Total kWh', 'Billed Amount', 'Validated', 'Disputed', 'Avg Session']}
          rows={[
            ['ECG Ghana',      '28,441', '284,410 kWh', '₵ 118,542', '99.1%', '0.9%', '10.0 kWh'],
            ['Total Energies Ghana',  '21,882', '182,100 kWh', '₵  73,220', '99.4%', '0.6%',  '8.3 kWh'],
            ['Goil EV Network',         '14,200', '568,000 kWh', '₵ 199,800', '98.8%', '1.2%', '40.0 kWh'],
            ['Shell Ghana EV',  '18,910', '151,280 kWh', '₵  61,040', '99.7%', '0.3%',  '8.0 kWh'],
            ['Eletrobras EV Brasil',          '11,798', '106,182 kWh', '₵  42,870', '99.2%', '0.8%',  '9.0 kWh'],
          ]}
        />
      </div>

      {/* Session detail drill-down */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700 flex-1">Session Details</h3>
          <SearchBar placeholder="Search CDR ID..." />
          <button className="flex items-center gap-1 text-sm text-slate-700 border border-slate-200 px-3 py-2 rounded-lg">
            <Filter className="w-3 h-3" /> Filter
          </button>
        </div>
        <Table
          cols={['CDR ID', 'Date', 'Partner', 'Driver Token', 'Duration', 'kWh', 'Billed', 'Tariff']}
          rows={[
            ['CDR-8821', '29 Jun 14:12', 'ECG Ghana',    'RFID-A4B2', '58 min', '24.7', '₵ 8.41',  'TARIFF-EU-STD'],
            ['CDR-8820', '29 Jun 14:05', 'Total Energies Ghana','RFID-CC12', '31 min', '11.2', '₵ 3.81',  'TARIFF-EU-STD'],
            ['CDR-8819', '29 Jun 13:44', 'Goil EV Network',       'DE*ION*E0', '92 min', '62.0', '₵ 22.10', 'TARIFF-DE-DC50'],
            ['CDR-8817', '29 Jun 13:31', 'VRA EV Charge',      'RFID-EE9F', '22 min',  '8.4', '₵ 2.94',  'TARIFF-NL-AC'],
          ]}
        />
      </div>
    </div>
  );
}

function renderCheckBill() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Check & Bill"
        sub="Automated CDR quality control and billing reconciliation"
        action={
          <button className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> New Run
          </button>
        }
      />

      {/* Quality overview */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { l: 'CDRs Checked (Jun)', v: '94,231', color: 'text-slate-800' },
          { l: 'Passed',             v: '93,840', color: 'text-emerald-600' },
          { l: 'Failed / Flagged',   v: '391',    color: 'text-rose-600' },
          { l: 'Auto-Disputed',      v: '80',     color: 'text-amber-600' },
        ].map(s => (
          <div key={s.l} className="bg-white rounded-xl border border-slate-100 p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.v}</div>
            <div className="text-xs text-slate-500 mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Check runs */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 font-semibold text-slate-700">Run History</div>
        <Table
          cols={['Run ID', 'Period', 'Partner', 'CDRs', 'Passed', 'Failed', 'Disputed', 'Status', '']}
          rows={[
            ['RUN-0024', 'Jun 2025',    'All Partners',   '94,231', '93,840', '391', '80',  <Pill label="Completed" color="bg-emerald-50 text-emerald-700" />, <button className="text-xs text-indigo-600">View</button>],
            ['RUN-0023', 'May 2025',    'All Partners',   '87,410', '87,100', '310', '61',  <Pill label="Completed" color="bg-emerald-50 text-emerald-700" />, <button className="text-xs text-indigo-600">View</button>],
            ['RUN-0022', 'Jun 2025',    'Goil EV Network only',    '14,200', '13,992', '208', '41',  <Pill label="Completed" color="bg-emerald-50 text-emerald-700" />, <button className="text-xs text-indigo-600">View</button>],
            ['RUN-0021', 'Apr 2025',    'All Partners',   '80,320', '79,988', '332', '55',  <Pill label="Completed" color="bg-emerald-50 text-emerald-700" />, <button className="text-xs text-indigo-600">View</button>],
          ]}
        />
      </div>

      {/* Flagged CDRs */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700">Flagged CDRsLatest Run</h3>
          <button className="text-sm text-indigo-600 hover:underline">Dispute all</button>
        </div>
        <Table
          cols={['CDR ID', 'Partner', 'Billed', 'Expected', 'Delta', 'Reason', 'Action']}
          rows={[
            ['CDR-8817', 'VRA EV Charge',       '₵ 2.94', '₵ 2.21', '₵ 0.73', 'Energy mismatch',    <Pill label="Auto-disputed" color="bg-rose-50 text-rose-700" />],
            ['CDR-8802', 'Total Energies Ghana', '₵ 5.12', '₵ 4.88', '₵ 0.24', 'Tariff discrepancy', <button className="text-xs text-indigo-600 hover:underline">Dispute</button>],
            ['CDR-8791', 'ECG Ghana',     '₵ 3.40', '₵ 3.22', '₵ 0.18', 'Rounding error',     <button className="text-xs text-indigo-600 hover:underline">Dispute</button>],
          ]}
        />
      </div>
    </div>
  );
}

// â"₵â"₵ Disputes Dashboard â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵
interface DisputeRecord {
  id: string; cdr: string; partner: string; amount: number; currency: string;
  reason: string; status: 'open'|'in_review'|'awaiting_partner'|'escalated'|'resolved'|'rejected';
  priority: 'critical'|'high'|'medium'|'low';
  createdAt: string; updatedAt: string; agingDays: number;
  description: string; evidence: string[]; resolution?: string;
}

const ALL_DISPUTES: DisputeRecord[] = [
  { id:'DIS-2026-0041', cdr:'CDR-8817', partner:'VRA EV Charge',       amount:0.73, currency:'GHS', reason:'Energy mismatch',    status:'open',             priority:'high',     createdAt:'2026-06-19', updatedAt:'2026-06-22', agingDays:4,  description:'Session CDR-8817 reports 14.8 kWh but our OCPP meter log shows 13.2 kWh delivered. Requesting credit for 1.6 kWh at the agreed tariff rate.',     evidence:['CDR-8817-export.csv','meter_log_20260619.pdf'], resolution:undefined },
  { id:'DIS-2026-0039', cdr:'CDR-8800', partner:'Total Energies Ghana', amount:1.20, currency:'GHS', reason:'Tariff discrepancy', status:'in_review',         priority:'high',     createdAt:'2026-06-18', updatedAt:'2026-06-23', agingDays:5,  description:'Charged at ₵ 0.42/kWh but our bilateral agreement specifies ₵ 0.38/kWh. Difference of ₵ 0.04/kWh over 30 kWh session = ₵ 1.20 overbilled.',            evidence:['tariff-agreement-signed.pdf','CDR-8800.json'],   resolution:undefined },
  { id:'DIS-2026-0038', cdr:'CDR-8788', partner:'ECG Ghana',     amount:0.55, currency:'GHS', reason:'Duplicate CDR',      status:'awaiting_partner', priority:'medium',   createdAt:'2026-06-17', updatedAt:'2026-06-21', agingDays:6,  description:'CDR-8788 appears twice in the June clearing batch. Second entry has identical session ID, timestamp and kWh readingclearly a system duplicate.',   evidence:['clearing-batch-june.xlsx'],                      resolution:undefined },
  { id:'DIS-2026-0037', cdr:'CDR-8775', partner:'Goil EV Network',        amount:3.40, currency:'GHS', reason:'Tariff discrepancy', status:'escalated',         priority:'critical', createdAt:'2026-06-14', updatedAt:'2026-06-20', agingDays:9,  description:'Goil EV Network applied premium DC pricing to an AC session. OCPI session type field was mis-sent as "DC_QUICK"this affected 4 CDRs totalling ₵ 3.40.',       evidence:['ionity-session-log.json','ocpi-debug-trace.txt'], resolution:undefined },
  { id:'DIS-2026-0031', cdr:'CDR-8700', partner:'Goil EV Network',        amount:2.10, currency:'GHS', reason:'Invalid timestamp',  status:'resolved',          priority:'low',      createdAt:'2026-06-08', updatedAt:'2026-06-18', agingDays:15, description:'Timestamp discrepancy of 2 hours caused session to be split across two billing periods. Resolved by Goil EV Networkcredit note issued.',                 evidence:['CDR-8700.json'],                                 resolution:'Goil EV Network issued credit note CR-2026-0112 for ₵ 2.10 on 18 Jun. Posted to next clearing cycle.' },
  { id:'DIS-2026-0029', cdr:'CDR-8680', partner:'Shell Ghana EV',         amount:0.88, currency:'GHS', reason:'Energy mismatch',    status:'rejected',          priority:'low',      createdAt:'2026-06-05', updatedAt:'2026-06-15', agingDays:18, description:'Shell Ghana EV provided OCPP metering data contradicting our claim. Their logs show 14.1 kWh which matches CDR-8680 figure of 14.1 kWh. Dispute rejected.',   evidence:['CDR-8680.json','evbox-meter-counter-evidence.pdf'], resolution:'Shell Ghana EV provided counter-evidence. CDR data verified correct. Dispute closed 15 Jun.' },
  { id:'DIS-2026-0022', cdr:'CDR-8601', partner:'VRA EV Charge',       amount:0.31, currency:'GHS', reason:'Duplicate CDR',      status:'resolved',          priority:'low',      createdAt:'2026-05-28', updatedAt:'2026-06-04', agingDays:26, description:'Duplicate CDR submitted in May batch. VRA EV Charge confirmed and removed the entry from their clearing file.',                                              evidence:['may-clearing-batch.xlsx'],                       resolution:'VRA EV Charge confirmed duplicate and removed from clearing. Credit applied in June settlement.' },
];

const EMPTY_DISPUTE_FORM = { cdrId:'', partner:'', amount:'', currency:'GHS', reason:'', description:'' };

type DisputeSortKey = 'id'|'partner'|'amount'|'agingDays'|'updatedAt'|'status'|'priority';

function DisputesDashboard() {
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [partnerFilter,setPartnerFilter]= useState('All');
  const [reasonFilter, setReasonFilter] = useState('All');
  const [kpiFilter,    setKpiFilter]    = useState<string|null>(null);
  const [sortKey,      setSortKey]      = useState<DisputeSortKey>('agingDays');
  const [sortAsc,      setSortAsc]      = useState(false);
  const [selected,     setSelected]     = useState<DisputeRecord|null>(null);
  const [showForm,     setShowForm]     = useState(false);
  const [form,         setForm]         = useState(EMPTY_DISPUTE_FORM);
  const [submitted,    setSubmitted]    = useState(false);
  const [actionMsg,    setActionMsg]    = useState<string|null>(null);

  const [disputes, setDisputes] = useLocalStorage<DisputeRecord[]>('cb_disputes', ALL_DISPUTES);
  const detailRef = useRef<HTMLDivElement>(null);

  const updateStatus = (id: string, status: DisputeRecord['status']) => {
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status, updatedAt: new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) } : d));
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  const statusMeta: Record<DisputeRecord['status'], { label:string; color:string; dot:string }> = {
    open:             { label:'Open',             color:'bg-rose-100 text-rose-700 border border-rose-200',       dot:'bg-rose-500' },
    in_review:        { label:'In Review',        color:'bg-amber-100 text-amber-700 border border-amber-200',    dot:'bg-amber-500' },
    awaiting_partner: { label:'Awaiting Partner', color:'bg-blue-100 text-blue-700 border border-blue-200',       dot:'bg-blue-500' },
    escalated:        { label:'Escalated',        color:'bg-purple-100 text-purple-700 border border-purple-200', dot:'bg-purple-500' },
    resolved:         { label:'Resolved',         color:'bg-emerald-100 text-emerald-700 border border-emerald-200', dot:'bg-emerald-500' },
    rejected:         { label:'Rejected',         color:'bg-slate-100 text-slate-500 border border-slate-200',    dot:'bg-slate-400' },
  };
  const priorityMeta: Record<DisputeRecord['priority'], { color:string }> = {
    critical: { color:'bg-rose-500' }, high: { color:'bg-orange-400' },
    medium:   { color:'bg-amber-400' }, low: { color:'bg-slate-300' },
  };

  // Health metrics
  const openDisputes    = disputes.filter(d => d.status === 'open' || d.status === 'in_review' || d.status === 'awaiting_partner' || d.status === 'escalated');
  const resolvedOnes    = disputes.filter(d => d.status === 'resolved');
  const totalAmount     = disputes.reduce((s, d) => s + d.amount, 0);
  const avgResolution   = resolvedOnes.length ? Math.round(resolvedOnes.reduce((s,d)=>s+d.agingDays,0)/resolvedOnes.length) : 0;
  const responseRate    = Math.round((resolvedOnes.length / disputes.length) * 100);
  const criticalCount   = disputes.filter(d => d.priority === 'critical').length;

  // KPI counts
  const kpiCounts: Record<string, number> = {
    open:             disputes.filter(d=>d.status==='open').length,
    in_review:        disputes.filter(d=>d.status==='in_review').length,
    awaiting_partner: disputes.filter(d=>d.status==='awaiting_partner').length,
    escalated:        disputes.filter(d=>d.status==='escalated').length,
    resolved:         disputes.filter(d=>d.status==='resolved').length,
    rejected:         disputes.filter(d=>d.status==='rejected').length,
  };

  const partners = Array.from(new Set(disputes.map(d => d.partner)));
  const reasons  = Array.from(new Set(disputes.map(d => d.reason)));

  // Filtered + sorted
  const filtered = disputes.filter(d => {
    const term = search.toLowerCase();
    const matchSearch = !term || d.id.toLowerCase().includes(term) || d.cdr.toLowerCase().includes(term) || d.partner.toLowerCase().includes(term);
    const matchStatus  = statusFilter  === 'All' || d.status  === statusFilter;
    const matchPartner = partnerFilter === 'All' || d.partner === partnerFilter;
    const matchReason  = reasonFilter  === 'All' || d.reason  === reasonFilter;
    const matchKpi     = !kpiFilter    || d.status === kpiFilter;
    return matchSearch && matchStatus && matchPartner && matchReason && matchKpi;
  }).sort((a, b) => {
    let av: string|number = a[sortKey] as string|number;
    let bv: string|number = b[sortKey] as string|number;
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    return sortAsc ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
  });

  const toggleSort = (key: DisputeSortKey) => {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(false); }
  };

  const sendAction = (label: string) => {
    setActionMsg(label);
    setTimeout(() => setActionMsg(null), 2500);
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.partner || !form.amount || !form.reason) return;
    const today = new Date();
    const isoDate = today.toISOString().slice(0, 10);
    const newId = `DIS-${today.getFullYear()}-${String(Date.now()).slice(-4)}`;
    const newDispute: DisputeRecord = {
      id: newId,
      cdr: form.cdrId || 'CDR-NEW',
      partner: form.partner,
      amount: parseFloat(form.amount) || 0,
      currency: form.currency,
      reason: form.reason,
      status: 'open',
      priority: 'medium',
      createdAt: isoDate,
      updatedAt: isoDate,
      agingDays: 0,
      description: form.description || `Dispute raised for ${form.cdrId || 'CDR'} · Partner: ${form.partner} · Reason: ${form.reason}`,
      evidence: [],
    };
    setDisputes(prev => [newDispute, ...prev]);
    setSubmitted(true);
    setTimeout(() => { setShowForm(false); setForm(EMPTY_DISPUTE_FORM); setSubmitted(false); }, 1800);
  };

  const agingClass = (days: number) =>
    days >= 10 ? 'text-rose-600 font-bold' : days >= 5 ? 'text-amber-600 font-semibold' : 'text-slate-500';

  const SortIcon = ({ col }: { col: DisputeSortKey }) => (
    <span className={`ml-1 text-[9px] ${sortKey===col ? 'text-indigo-500' : 'text-slate-300'}`}>
      {sortKey===col ? (sortAsc ? '▲' : '▼') : '⇅'}
    </span>
  );

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Disputes"
        sub="Track, prioritize, and resolve billing disputes with your roaming partners"
        action={
          <button data-local onClick={() => { setShowForm(true); setSubmitted(false); setForm(EMPTY_DISPUTE_FORM); }}
            className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> New Dispute
          </button>
        }
      />

      {/* â"₵â"₵ Health Metrics â"₵â"₵ */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label:'Total Disputed',       value:`₵ ${totalAmount.toFixed(2)}`,      sub:`${disputes.length} disputes`,      icon:AlertTriangle, color:'text-rose-600',    bg:'bg-rose-50 border-rose-200' },
          { label:'Avg Resolution Time',  value:`${avgResolution}d`,                sub:`${resolvedOnes.length} resolved`,  icon:Timer,         color:'text-indigo-600',  bg:'bg-indigo-50 border-indigo-200' },
          { label:'Partner Response Rate',value:`${responseRate}%`,                 sub:'Disputes with response',           icon:CheckCheck,    color:'text-emerald-600', bg:'bg-emerald-50 border-emerald-200' },
          { label:'Critical Priority',    value:criticalCount,                      sub:'Requires immediate action',        icon:AlertCircle,   color:'text-purple-700',  bg:'bg-purple-50 border-purple-200' },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-xl border p-3.5 ${bg}`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className={`text-xl font-bold ${color}`}>{value}</span>
            </div>
            <div className="text-xs font-semibold text-slate-700">{label}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* â"₵â"₵ Clickable KPI Status Cards â"₵â"₵ */}
      <div className="grid grid-cols-6 gap-2">
        {([
          ['open',             'Open',             'text-rose-600',   'bg-rose-50 border-rose-200',       'bg-rose-500'],
          ['in_review',        'In Review',        'text-amber-600',  'bg-amber-50 border-amber-200',     'bg-amber-500'],
          ['awaiting_partner', 'Awaiting Partner', 'text-blue-600',   'bg-blue-50 border-blue-200',       'bg-blue-500'],
          ['escalated',        'Escalated',        'text-purple-700', 'bg-purple-50 border-purple-200',   'bg-purple-500'],
          ['resolved',         'Resolved',         'text-emerald-600','bg-emerald-50 border-emerald-200', 'bg-emerald-500'],
          ['rejected',         'Rejected',         'text-slate-500',  'bg-slate-50 border-slate-200',     'bg-slate-400'],
        ] as const).map(([key, label, textCls, bgCls, dotCls]) => {
          const active = kpiFilter === key;
          return (
            <button key={key} data-local onClick={() => setKpiFilter(active ? null : key)}
              className={`rounded-xl border p-3 text-center transition-all focus:outline-none focus:ring-2 focus:ring-indigo-300 hover:shadow-sm ${bgCls} ${active ? 'ring-2 ring-indigo-400 shadow-md' : ''}`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className={`w-2 h-2 rounded-full ${dotCls}`} />
                {active && <span className="text-[8px] font-bold text-indigo-600 bg-indigo-100 px-1 py-0.5 rounded">ON</span>}
              </div>
              <div className={`text-2xl font-bold ${textCls}`}>{kpiCounts[key]}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{label}</div>
            </button>
          );
        })}
      </div>

      {/* â"₵â"₵ Search + Filters â"₵â"₵ */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm w-full text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Search Dispute ID, CDR ID, or Partner..." />
          {search && <button data-local onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>}
        </div>
        <select data-local value={partnerFilter} onChange={e => setPartnerFilter(e.target.value)}
          className="border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-600 bg-white">
          <option value="All">All Partners</option>
          {partners.map(p => <option key={p}>{p}</option>)}
        </select>
        <select data-local value={reasonFilter} onChange={e => setReasonFilter(e.target.value)}
          className="border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-600 bg-white">
          <option value="All">All Reasons</option>
          {reasons.map(r => <option key={r}>{r}</option>)}
        </select>
        <select data-local value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setKpiFilter(null); }}
          className="border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-600 bg-white">
          <option value="All">All Statuses</option>
          {['open','in_review','awaiting_partner','escalated','resolved','rejected'].map(s =>
            <option key={s} value={s}>{statusMeta[s as DisputeRecord['status']].label}</option>
          )}
        </select>
        {(search || kpiFilter || statusFilter !== 'All' || partnerFilter !== 'All' || reasonFilter !== 'All') && (
          <button data-local onClick={() => { setSearch(''); setKpiFilter(null); setStatusFilter('All'); setPartnerFilter('All'); setReasonFilter('All'); }}
            className="text-xs text-rose-600 border border-rose-200 px-2.5 py-1.5 rounded-lg hover:bg-rose-50">Clear</button>
        )}
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} / {disputes.length}</span>
      </div>

      {/* Action toast */}
      {actionMsg && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-800 text-white text-sm px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" /> {actionMsg}
        </div>
      )}

      {/* â"₵â"₵ Disputes Table â"₵â"₵ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {([
                  ['Priority', null], ['Dispute ID','id'], ['CDR','id'], ['Partner','partner'],
                  ['Amount','amount'], ['Reason', null], ['Status','status'],
                  ['Age','agingDays'], ['Last Updated','updatedAt'], ['Actions', null],
                ] as [string, DisputeSortKey|null][]).map(([col, key]) => (
                  <th key={col} onClick={() => key && toggleSort(key)}
                    className={`px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap ${key ? 'cursor-pointer hover:text-indigo-600 select-none' : ''}`}>
                    {col}{key && <SortIcon col={key} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-slate-400">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                  No disputes match the current filters
                </td></tr>
              ) : filtered.map(d => {
                const sm = statusMeta[d.status];
                const pm = priorityMeta[d.priority];
                const isSelected = selected?.id === d.id;
                return (
                  <tr key={d.id} onClick={() => { const next = isSelected ? null : d; setSelected(next); if (next) setTimeout(() => detailRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 50); }}
                    className={`border-b border-slate-100 last:border-b-0 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${pm.color}`} title={d.priority} />
                        <span className="text-[10px] text-slate-400 capitalize hidden xl:inline">{d.priority}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-700 font-semibold">{d.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-500">{d.cdr}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{d.partner}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-800">₵ {d.amount.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{d.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${sm.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                        {sm.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Clock className={`w-3 h-3 ${agingClass(d.agingDays)}`} />
                        <span className={`text-xs ${agingClass(d.agingDays)}`}>{d.agingDays}d</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{d.updatedAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {d.status === 'open' && (
                          <button data-local onClick={e => { e.stopPropagation(); updateStatus(d.id, 'in_review'); sendAction(`Response sent  ${d.id} moved to In Review`); }}
                            className="px-2 py-1 rounded-md bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-700">Respond</button>
                        )}
                        {(d.status === 'open' || d.status === 'in_review') && (
                          <button data-local onClick={e => { e.stopPropagation(); updateStatus(d.id, 'escalated'); sendAction(`${d.id} escalated to compliance team`); }}
                            className="px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-[10px] font-bold hover:bg-purple-200">Escalate</button>
                        )}
                        {d.status === 'awaiting_partner' && (
                          <button data-local onClick={e => { e.stopPropagation(); sendAction(`Reminder sent to ${d.partner}`); }}
                            className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold hover:bg-blue-200">Remind</button>
                        )}
                        {(d.status === 'resolved' || d.status === 'rejected') && (
                          <button data-local onClick={e => { e.stopPropagation(); setSelected(d); setTimeout(() => detailRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 50); }}
                            className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold hover:bg-emerald-200">View</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* â"₵â"₵ Dispute Detail Panel â"₵â"₵ */}
      {selected && (
        <div ref={detailRef} className="bg-white rounded-xl border border-indigo-200 shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-indigo-50">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-800">{selected.id}</span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${statusMeta[selected.status].color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusMeta[selected.status].dot}`} />
                    {statusMeta[selected.status].label}
                  </span>
                  <span className={`text-xs font-semibold capitalize ${agingClass(selected.agingDays)}`}>· {selected.agingDays}d old</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{selected.partner} · {selected.cdr} · ₵ {selected.amount.toFixed(2)} {selected.currency}</p>
              </div>
            </div>
            <button data-local onClick={() => setSelected(null)} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            {/* Description + evidence */}
            <div className="px-5 py-4 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wide mb-1.5">Description</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{selected.description}</p>
              </div>
              {selected.resolution && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
                  <h4 className="text-xs font-bold uppercase text-emerald-600 tracking-wide mb-1">Resolution</h4>
                  <p className="text-sm text-emerald-800 leading-relaxed">{selected.resolution}</p>
                </div>
              )}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wide mb-2">Evidence & Attachments</h4>
                <div className="space-y-1.5">
                  {selected.evidence.map(f => (
                    <div key={f} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-white transition-colors">
                      <Layers className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span className="text-xs font-mono text-slate-700 flex-1">{f}</span>
                      <button data-local onClick={() => sendAction(`Downloading ${f}...`)} className="text-[10px] text-indigo-600 hover:underline font-semibold">Download</button>
                    </div>
                  ))}
                  <button data-local onClick={() => sendAction('File picker openedattach evidence')}
                    className="w-full rounded-lg border border-dashed border-slate-300 py-2 text-xs text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Attach evidence
                  </button>
                </div>
              </div>
            </div>

            {/* Actions + meta */}
            <div className="px-5 py-4 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wide mb-2">Details</h4>
                <div className="space-y-1.5">
                  {[
                    ['Reason',      selected.reason],
                    ['Priority',    selected.priority],
                    ['Created',     selected.createdAt],
                    ['Last Updated',selected.updatedAt],
                    ['Age',         `${selected.agingDays} days`],
                  ].map(([l,v]) => (
                    <div key={l} className="flex justify-between text-xs">
                      <span className="text-slate-400">{l}</span>
                      <span className={`font-semibold capitalize ${l==='Age' ? agingClass(selected.agingDays) : 'text-slate-700'}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wide mb-2">Actions</h4>
                <div className="space-y-2">
                  {selected.status === 'open' && <>
                    <button data-local onClick={() => { updateStatus(selected.id, 'in_review'); sendAction(`Response sent  ${selected.id} now In Review`); }}
                      className="w-full rounded-lg bg-indigo-600 text-white text-xs font-bold py-2 hover:bg-indigo-700">Respond to Dispute</button>
                    <button data-local onClick={() => { updateStatus(selected.id, 'escalated'); sendAction(`${selected.id} escalated to compliance`); }}
                      className="w-full rounded-lg bg-purple-100 text-purple-700 text-xs font-bold py-2 hover:bg-purple-200">Escalate to Compliance</button>
                  </>}
                  {selected.status === 'in_review' && <>
                    <button data-local onClick={() => { updateStatus(selected.id, 'awaiting_partner'); sendAction(`Evidence sent  ${selected.id} now Awaiting Partner`); }}
                      className="w-full rounded-lg bg-indigo-600 text-white text-xs font-bold py-2 hover:bg-indigo-700">Send Additional Evidence</button>
                    <button data-local onClick={() => { updateStatus(selected.id, 'escalated'); sendAction(`${selected.id} escalated to compliance`); }}
                      className="w-full rounded-lg bg-purple-100 text-purple-700 text-xs font-bold py-2 hover:bg-purple-200">Escalate</button>
                  </>}
                  {selected.status === 'awaiting_partner' && <>
                    <button data-local onClick={() => { sendAction(`Reminder sent to ${selected.partner}`); }}
                      className="w-full rounded-lg bg-blue-600 text-white text-xs font-bold py-2 hover:bg-blue-700">Send Reminder to {selected.partner}</button>
                    <button data-local onClick={() => { updateStatus(selected.id, 'escalated'); sendAction(`${selected.id} escalated to compliance`); }}
                      className="w-full rounded-lg bg-purple-100 text-purple-700 text-xs font-bold py-2 hover:bg-purple-200">Escalate</button>
                  </>}
                  {selected.status === 'escalated' && <>
                    <button data-local onClick={() => { updateStatus(selected.id, 'resolved'); sendAction(`${selected.id} marked resolved by compliance`); }}
                      className="w-full rounded-lg bg-purple-600 text-white text-xs font-bold py-2 hover:bg-purple-700">Mark Resolved</button>
                    <button data-local onClick={() => { sendAction(`Compliance team notified for ${selected.id}`); }}
                      className="w-full rounded-lg bg-purple-100 text-purple-700 text-xs font-bold py-2 hover:bg-purple-200">Contact Compliance Team</button>
                  </>}
                  {(selected.status === 'resolved' || selected.status === 'rejected') && <>
                    <button data-local onClick={() => sendAction(`Resolution report downloaded for ${selected.id}`)}
                      className="w-full rounded-lg bg-slate-100 text-slate-700 text-xs font-bold py-2 hover:bg-slate-200 flex items-center justify-center gap-1.5">
                      <Download className="w-3.5 h-3.5" /> Download Resolution Report
                    </button>
                  </>}
                  <button data-local onClick={() => sendAction(`${selected.id} copied to clipboard`)}
                    className="w-full rounded-lg border border-slate-200 text-slate-500 text-xs font-semibold py-2 hover:bg-slate-50">Copy Dispute ID</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* â"₵â"₵ New Dispute Modal â"₵â"₵ */}
      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background:'rgba(15,23,42,0.55)', backdropFilter:'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" style={{ maxHeight:'90vh' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-800">Raise New Dispute</h3>
                <p className="text-xs text-slate-400 mt-0.5">All fields required unless marked optional</p>
              </div>
              <button data-local onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5" style={{ maxHeight:'65vh' }}>
              {submitted ? (
                <div className="flex flex-col items-center py-8 gap-3 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-emerald-600" />
                  </div>
                  <p className="font-semibold text-slate-800">Dispute submitted</p>
                  <p className="text-xs text-slate-400">You'll be notified when {form.partner || 'the partner'} responds.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">CDR ID <span className="text-rose-500">*</span></label>
                      <input data-local required type="text" placeholder="CDR-8817" {...field('cdrId')}
                        className="w-full border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Partner <span className="text-rose-500">*</span></label>
                      <select data-local required {...field('partner')}
                        className="w-full border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-900 bg-white focus:outline-none">
                        <option value="">-- Select --</option>
                        {['ECG Ghana','Total Energies Ghana','VRA EV Charge','Goil EV Network','Shell Ghana EV','Other'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Amount <span className="text-rose-500">*</span></label>
                      <input data-local required type="number" min="0.01" step="0.01" placeholder="0.00" {...field('amount')}
                        className="w-full border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Currency <span className="text-rose-500">*</span></label>
                      <select data-local required {...field('currency')}
                        className="w-full border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-900 bg-white focus:outline-none">
                        {['GHS','GBP','CHF','USD'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Reason <span className="text-rose-500">*</span></label>
                      <select data-local required {...field('reason')}
                        className="w-full border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-900 bg-white focus:outline-none">
                        <option value="">-- Select reason --</option>
                        {['Energy mismatch','Tariff discrepancy','Duplicate CDR','Invalid timestamp','Other'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Description <span className="text-slate-400 font-normal">(optional)</span></label>
                      <textarea data-local rows={3} placeholder="Describe the discrepancyinclude session times, meter readings, or supporting context..." {...field('description')}
                        className="w-full border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Attach Evidence <span className="text-slate-400 font-normal">(optional)</span></label>
                      <button data-local type="button" onClick={() => sendAction('File picker opened')}
                        className="w-full rounded-lg border-2 border-dashed border-slate-300 py-3 text-xs text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
                        <Plus className="w-3.5 h-3.5" /> Upload CDR export, meter logs, or agreement PDF
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button data-local type="submit"
                      className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700">
                      Submit Dispute
                    </button>
                    <button data-local type="button" onClick={() => setShowForm(false)}
                      className="text-sm text-slate-500 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderDisputes() {
  return <DisputesDashboard />;
}

const INVOICES = [
  { id: 'INV-2025-0061', partner: 'ECG Ghana',     period: 'Jun 2025', cdrCount: 28441, amount: 11880, issued: '2025-07-01', due: '2025-07-31', status: 'Unpaid'  },
  { id: 'INV-2025-0060', partner: 'Total Energies Ghana', period: 'Jun 2025', cdrCount: 21882, amount:  7320, issued: '2025-07-01', due: '2025-07-31', status: 'Unpaid'  },
  { id: 'INV-2025-0058', partner: 'Goil EV Network',        period: 'Jun 2025', cdrCount: 14200, amount: 19990, issued: '2025-07-01', due: '2025-07-31', status: 'Unpaid'  },
  { id: 'INV-2025-0051', partner: 'ECG Ghana',     period: 'May 2025', cdrCount: 26100, amount: 10440, issued: '2025-06-01', due: '2025-06-30', status: 'Paid'    },
  { id: 'INV-2025-0050', partner: 'Total Energies Ghana', period: 'May 2025', cdrCount: 19800, amount:  6930, issued: '2025-06-01', due: '2025-06-30', status: 'Paid'    },
  { id: 'INV-2025-0049', partner: 'Goil EV Network',        period: 'May 2025', cdrCount: 13400, amount: 18900, issued: '2025-06-01', due: '2025-06-30', status: 'Paid'    },
];

function downloadInvoiceCSV(inv: typeof INVOICES[0]) {
  const rows = [
    ['Field', 'Value'],
    ['Invoice Number', inv.id],
    ['Partner', inv.partner],
    ['Billing Period', inv.period],
    ['CDR Count', inv.cdrCount.toString()],
    ['Amount (₵)', inv.amount.toFixed(2)],
    ['Issue Date', inv.issued],
    ['Due Date', inv.due],
    ['Status', inv.status],
    ['Currency', '₵ GHS'],
    ['Operator', 'Volta Networks'],
    ['Generated', new Date().toISOString()],
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${inv.id}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function InvoicingWorkspace() {
  const [periodFilter, setPeriodFilter] = useState('All Periods');

  const periods = ['All Periods', 'Jun 2025', 'May 2025'];

  const filtered = periodFilter === 'All Periods'
    ? INVOICES
    : INVOICES.filter(inv => inv.period === periodFilter);

  const totalBilled  = filtered.reduce((a, inv) => a + inv.amount, 0);
  const totalPaid    = filtered.filter(inv => inv.status === 'Paid').reduce((a, inv) => a + inv.amount, 0);
  const outstanding  = filtered.filter(inv => inv.status === 'Unpaid').reduce((a, inv) => a + inv.amount, 0);
  const overdue      = filtered.filter(inv => inv.status === 'Overdue').reduce((a, inv) => a + inv.amount, 0);

  const periodLabel = periodFilter === 'All Periods' ? 'All Periods' : periodFilter;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Invoicing"
        sub="Roaming-related invoices generated from your agreements"
      />

      {/* Summary cards  reactive to filter */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { l: `Total Billed (${periodLabel})`, v: `₵ ${totalBilled.toLocaleString()}`,  color: 'text-slate-800'   },
          { l: 'Paid',                           v: `₵ ${totalPaid.toLocaleString()}`,    color: 'text-emerald-600' },
          { l: 'Outstanding',                    v: `₵ ${outstanding.toLocaleString()}`,  color: 'text-amber-600'   },
          { l: 'Overdue',                        v: `₵ ${overdue.toLocaleString()}`,      color: 'text-rose-500'    },
        ].map(s => (
          <div key={s.l} className="bg-white rounded-xl border border-slate-100 p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.v}</div>
            <div className="text-xs text-slate-500 mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Invoice list */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700 flex-1">
            Invoices
            {periodFilter !== 'All Periods' && (
              <span className="ml-2 text-xs font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {periodFilter}
              </span>
            )}
          </h3>
          <span className="text-xs text-slate-400">{filtered.length} invoice{filtered.length !== 1 ? 's' : ''}</span>
          <select
            data-local
            value={periodFilter}
            onChange={e => setPeriodFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-700 bg-white focus:outline-none focus:border-indigo-300 cursor-pointer hover:border-slate-300 transition-colors"
          >
            {periods.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {['Invoice #', 'Partner', 'Period', 'CDR Count', 'Amount', 'Issued', 'Due', 'Status', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-indigo-600 font-semibold whitespace-nowrap">{inv.id}</td>
                  <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">{inv.partner}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{inv.period}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 tabular-nums whitespace-nowrap">{inv.cdrCount.toLocaleString()}</td>
                  <td className="py-3 px-4 font-bold tabular-nums whitespace-nowrap text-slate-800">₵ {inv.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{inv.issued}</td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{inv.due}</td>
                  <td className="py-3 px-4">
                    <Pill
                      label={inv.status}
                      color={inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : inv.status === 'Overdue' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <button
                      data-local
                      onClick={() => downloadInvoiceCSV(inv)}
                      title={`Download ${inv.id}`}
                      className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-sm text-slate-400">
                    No invoices found for {periodFilter}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer totals */}
        {filtered.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs text-slate-400">{filtered.length} invoice{filtered.length !== 1 ? 's' : ''} · {filtered.reduce((a,i)=>a+i.cdrCount,0).toLocaleString()} CDRs</span>
            <span className="text-sm font-bold text-slate-700">
              Total: <span className="text-indigo-600">₵ {totalBilled.toLocaleString()}</span>
              <span className="ml-3 text-emerald-600 text-xs font-semibold">Paid: ₵ {totalPaid.toLocaleString()}</span>
              <span className="ml-3 text-amber-600 text-xs font-semibold">Outstanding: ₵ {outstanding.toLocaleString()}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function renderInvoicing() {
  return <InvoicingWorkspace />;
}

function MessagingSection() {
  const threads = [
    { partner: 'VRA EV Charge',       subject: 'Connection issueOCPI endpoint',           lastMsg: '5m ago',  unread: 2, preview: 'Your OCPI endpoint returned a 502 at 13:44...' },
    { partner: 'Total Energies Ghana', subject: 'Invoice INV-2025-0060 query',                 lastMsg: '2h ago',  unread: 0, preview: 'Please confirm the tariff applied for CDR-8802...' },
    { partner: 'Goil EV Network',        subject: 'Roaming agreement amendmentpower cap',     lastMsg: '1d ago',  unread: 0, preview: 'We would like to discuss the 150 kW power cap...' },
    { partner: 'ECG Ghana',     subject: 'Static data quality report June',             lastMsg: '2d ago',  unread: 0, preview: 'Attached please find the monthly quality report...' },
    { partner: 'Support',       subject: 'Eichrecht signing servicemaintenance ETA', lastMsg: '3h ago',  unread: 0, preview: 'We are targeting restoration by 16:00 CET today...' },
  ];

  const [active, setActive] = useState(threads[0]);

  return (
    <div className="space-y-0">
      <SectionHeader title="Messaging" sub="Instant messaging with roaming partners and RFConnector support" />

      <div className="flex gap-4 h-[520px]">
        {/* Thread list */}
        <div className="w-72 bg-white rounded-xl border border-slate-100 shadow-sm overflow-y-auto flex-shrink-0">
          <div className="p-3 border-b border-slate-100">
            <SearchBar placeholder="Search threads..." />
          </div>
          {threads.map(t => (
            <button
              key={t.partner + t.subject}
              onClick={() => setActive(t)}
              className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${active === t ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {t.partner[0]}
                </div>
                <span className="font-medium text-sm text-slate-800 flex-1 truncate">{t.partner}</span>
                {t.unread > 0 && <Badge n={t.unread} />}
                <span className="text-[10px] text-slate-400">{t.lastMsg}</span>
              </div>
              <p className="text-xs text-slate-500 truncate pl-9">{t.subject}</p>
            </button>
          ))}
          <div className="p-3">
            <button className="w-full flex items-center justify-center gap-2 text-sm text-indigo-600 border border-indigo-200 rounded-lg py-2 hover:bg-indigo-50">
              <Plus className="w-4 h-4" /> New Thread
            </button>
          </div>
        </div>

        {/* Message pane */}
        <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="font-semibold text-slate-800">{active.partner}</div>
            <div className="text-sm text-slate-500">{active.subject}</div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                {active.partner[0]}
              </div>
              <div className="bg-slate-100 rounded-xl rounded-tl-none p-3 max-w-sm">
                <p className="text-sm text-slate-700">{active.preview}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">2h ago</span>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <div className="bg-indigo-600 text-white rounded-xl rounded-tr-none p-3 max-w-sm">
                <p className="text-sm">Thanks for the heads-up. We're looking into this and will follow up shortly.</p>
                <span className="text-[10px] text-indigo-200 mt-1 block">1h ago</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                Me
              </div>
            </div>
          </div>

          {/* Compose */}
          <div className="p-4 border-t border-slate-100 flex gap-2">
            <input
              className="flex-1 border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Write a message..."
            />
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-1">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// â"₵â"₵ Main ClientPortal Component â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵â"₵

export default function ClientPortal() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<NavId>('overview');
  const [actionResult, setActionResult] = useState<ActionResult | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceView | null>(null);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const { darkMode, toggleTheme } = useTheme();
  const [queuedCommands, setQueuedCommands] = useState<string[]>([]);
  const [selectedMarketplaceNetwork, setSelectedMarketplaceNetwork] = useState<MarketplaceNetwork>(MARKETPLACE_NETWORKS[0]);
  const [selectedMarketplaceAccessPoint, setSelectedMarketplaceAccessPoint] = useState<MarketplaceAccessPoint>(MARKETPLACE_ACCESS_POINTS[0]);
  const [marketplaceSearch, setMarketplaceSearch] = useState('');
  const [marketplaceRoleFilter, setMarketplaceRoleFilter] = useState('All Roles');
  const [marketplaceCountryFilter, setMarketplaceCountryFilter] = useState('All Countries');
  const [marketplaceProtocolFilter, setMarketplaceProtocolFilter] = useState('All Protocols');
  const [marketplaceStatusFilter, setMarketplaceStatusFilter] = useState('All Statuses');
  const [marketplaceMapMode, setMarketplaceMapMode] = useState('Map');
  const [marketplaceMapZoom, setMarketplaceMapZoom] = useState(4);
  const [marketplaceHoveredNetwork, setMarketplaceHoveredNetwork] = useState<MarketplaceNetwork | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['Business', 'Roaming', 'Data', 'Clearing'])
  );

  function handleSignOut() {
    sessionStorage.removeItem(CLIENT_SESSION_KEY);
    localStorage.removeItem(CLIENT_SESSION_KEY);
    navigate('/login', { replace: true });
  }

  // Read client session for display. Keep this defensive so older local dev
  // sessions do not crash the portal if their shape changed between builds.
  const rawSession = sessionStorage.getItem(CLIENT_SESSION_KEY) ?? localStorage.getItem(CLIENT_SESSION_KEY);
  let clientSession: { email: string; company: string } | null = null;
  if (rawSession !== null) {
    try {
      const parsed = JSON.parse(rawSession) as {
        email?: string;
        company?: string;
        fullName?: string | null;
      };
      clientSession = {
        email: parsed.email ?? 'client@chargebridge.io',
        company: parsed.company ?? parsed.fullName ?? 'Client account',
      };
    } catch {
      clientSession = null;
    }
  }

  const toggleGroup = (label: string) =>
    setExpandedGroups(prev => {
      const s = new Set(prev);
      s.has(label) ? s.delete(label) : s.add(label);
      return s;
    });

  function selectSection(id: NavId): void {
    setActiveId(id);
    setWorkspace(null);
  }

  function showResult(title: string, detail: string, tone: ActionResult['tone'] = 'info'): void {
    setActionResult({ title, detail, tone });
  }

  function openWorkspace(title: string, subtitle: string, primaryLabel: string, body: React.ReactNode): void {
    setWorkspace({ title, subtitle, primaryLabel, body });
    setActionResult(null);
  }

  function formField(label: string, value: string): React.ReactNode {
    return (
      <label className="block">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <input
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          defaultValue={value}
        />
      </label>
    );
  }

  function selectField(label: string, value: string, options: string[]): React.ReactNode {
    return (
      <label className="block">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <select
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          defaultValue={value}
        >
          {options.map(option => <option key={option}>{option}</option>)}
        </select>
      </label>
    );
  }

  function textAreaField(label: string, value: string): React.ReactNode {
    return (
      <label className="block md:col-span-2">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <textarea
          rows={4}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          defaultValue={value}
        />
      </label>
    );
  }

  function optionCard(label: string, detail: string, checked = true): React.ReactNode {
    return (
      <label className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
        <input type="checkbox" defaultChecked={checked} className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
        <span>
          <span className="block text-sm font-medium text-slate-700">{label}</span>
          <span className="block text-xs text-slate-500">{detail}</span>
        </span>
      </label>
    );
  }

  function workspaceGroup(title: string, children: React.ReactNode): React.ReactNode {
    return (
      <section className="md:col-span-2 rounded-xl border border-slate-100 bg-white p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">{title}</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
      </section>
    );
  }

  function chipGroup(title: string, chips: string[]): React.ReactNode {
    return (
      <div className="md:col-span-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
        <div className="text-xs font-semibold uppercase text-slate-400">{title}</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {chips.map(chip => (
            <span key={chip} className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-600">
              {chip}
            </span>
          ))}
        </div>
      </div>
    );
  }

  function detailsBody(rows: Array<[string, string]>): React.ReactNode {
    return (
      <div className="space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            <div className="text-[11px] font-semibold uppercase text-slate-400">{label}</div>
            <div className="mt-1 text-sm font-medium text-slate-800">{value}</div>
          </div>
        ))}
      </div>
    );
  }

  function openClientProfile(): void {
    openWorkspace(
      'Client profile',
      'Manage the account information visible to this client organisation.',
      'Save profile',
      <>
        {workspaceGroup('Organisation', <>
          {formField('Company name', clientSession?.company ?? 'Volta Networks')}
          {formField('Admin email', clientSession?.email ?? 'client@chargebridge.io')}
          {selectField('Account type', 'CPO client', ['CPO client', 'eMSP client', 'Fleet operator', 'OEM partner'])}
          {selectField('Primary region', 'Europe', ['Europe', 'Ghana / Africa', 'Latin America', 'Global'])}
          {formField('Tax / VAT ID', 'NL-88442210B01')}
          {formField('Legal entity address', 'Accra, Ghana')}
        </>)}
        {workspaceGroup('User permissions', <>
          {selectField('Admin role', 'Client admin', ['Client admin', 'Billing manager', 'Operations viewer', 'Dispute manager'])}
          {selectField('Approval level', 'Can approve exports and invoices', ['Can approve exports and invoices', 'Can approve disputes only', 'Read-only'])}
          {optionCard('Allow invoice approvals', 'User can approve generated clearing invoices.')}
          {optionCard('Allow dispute creation', 'User can create and respond to partner disputes.')}
          {chipGroup('Access scope', ['Sessions', 'Live CDRi', 'Final CDRs', 'Invoices', 'Disputes', 'Contract vendors', 'Tariffs', 'Supervision'])}
        </>)}
      </>
    );
  }

  function openClientSettings(): void {
    openWorkspace(
      'Client settings',
      'Configure portal security, notifications, contract visibility, and data export rules.',
      'Save settings',
      <>
        {workspaceGroup('Security', <>
          {selectField('Two-factor policy', 'Required for all client admins', ['Required for all client admins', 'Required for billing actions', 'Optional'])}
          {selectField('Session timeout', '30 minutes', ['15 minutes', '30 minutes', '1 hour', '8 hours'])}
          {optionCard('Require 2FA for exports', 'CDR and invoice exports require OTP confirmation.')}
          {optionCard('Block unknown devices', 'New devices must be approved by an admin.')}
        </>)}
        {workspaceGroup('Data and compliance', <>
          {selectField('Data residency', 'EU infrastructure', ['EU infrastructure', 'Africa region', 'South America region'])}
          {selectField('Audit retention', '7 years', ['1 year', '3 years', '7 years', '10 years'])}
          {optionCard('Mask driver identifiers', 'Driver tokens are pseudonymised in portal tables.')}
          {optionCard('Require approval before exporting CDRs', 'Exports stay tenant-scoped and are recorded in the audit trail.')}
        </>)}
        {workspaceGroup('Notifications', <>
          {formField('Billing contact', 'billing@volta-networks.com')}
          {formField('Operations contact', 'ops@volta-networks.com')}
          {formField('Webhook notification email', 'alerts@volta-networks.com')}
          {selectField('Digest frequency', 'Daily', ['Immediate', 'Daily', 'Weekly'])}
          {chipGroup('Notify on', ['Dispute opened', 'Invoice overdue', 'Partner offline', 'Eichrecht failure', 'CDR rejected'])}
        </>)}
      </>
    );
  }

  function handleContentClick(event: React.MouseEvent<HTMLElement>): void {
    const button = (event.target as HTMLElement).closest('button');
    if (button === null) return;
    if (button.disabled) return;
    if (button.dataset.local !== undefined) return;
    const ariaLabel = button.getAttribute('aria-label') ?? '';
    if (/^(Select|Inspect) /.test(ariaLabel)) return;
    if (/^(Use|Zoom) /.test(ariaLabel)) return;

    const rawLabel = button.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const label = rawLabel === '' ? 'Action' : rawLabel;

    if (/refresh|sync/i.test(label)) {
      const now = new Date();
      setLastSync(now);
      showResult('Data refreshed', `Latest roaming status, CDRs, tariffs, and disputes synced at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`, 'success');
      return;
    }
    if (/view all/i.test(label)) {
      if (activeId === 'overview') {
        selectSection('cdr_exchange');
        showResult('Opened CDR Exchange', 'Showing the full charge detail record list for the current tenant.', 'info');
      } else {
        selectSection('tracking');
        showResult('Opened tracking view', 'Showing the operational tracking module for this data set.', 'info');
      }
      return;
    }
    if (/download|export/i.test(label)) {
      openWorkspace(
        'Export data',
        'Prepare a tenant-scoped file without exposing another client account.',
        'Generate export',
        <>
          {workspaceGroup('Export file', <>
            {formField('File name', `chargebridge-${activeId}-${new Date().toISOString().slice(0, 10)}.csv`)}
            {selectField('Format', /pdf/i.test(label) ? 'Signed PDF' : 'CSV', ['CSV', 'XLSX', 'Signed PDF', 'JSON API bundle'])}
            {selectField('Date range', 'Last 30 days', ['Today', 'Last 7 days', 'Last 30 days', 'Current billing month', 'Custom range'])}
            {selectField('Time zone', 'UTC', ['UTC', 'Europe/Accra', 'Africa/Accra', 'America/Sao_Paulo'])}
          </>)}
          {workspaceGroup('Included data', <>
            {optionCard('Session summary', 'Session ID, partner, country, duration, status.')}
            {optionCard('Meter values', 'Energy, power, SoC, CDRi snapshots.')}
            {optionCard('Billing amounts', 'Tariff components, tax, settlement amount.')}
            {optionCard('Compliance evidence', 'Eichrecht signature, audit ID, retention status.')}
            {optionCard('Mask driver references', 'Export pseudonymous tokens only, never personal identifiers.')}
            {optionCard('Require manager approval', 'Hold the export until an authorised client admin approves it.')}
          </>)}
          <div className="md:col-span-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
            Export includes only records owned by ECG (Electricity Co. Ghana) under the active contract.
          </div>
        </>
      );
      return;
    }
    if (/stop/i.test(label)) {
      setQueuedCommands(prev => ['Remote stop queued for SES-882201', ...prev].slice(0, 5));
      showResult('Remote stop queued', 'The command is waiting for charger acknowledgement. The next meter event will update session state.', 'warning');
      return;
    }
    if (/suspend/i.test(label)) {
      setQueuedCommands(prev => ['Partner suspension queued', ...prev].slice(0, 5));
      showResult('Suspension queued', 'The partner contract remains visible while the suspension command is reviewed.', 'warning');
      return;
    }
    if (/dispute/i.test(label)) {
      setActiveId('disputes');
      openWorkspace(
        'Create dispute',
        'Open a billing dispute linked to the selected CDR and roaming partner.',
        'Create dispute',
        <>
          {workspaceGroup('Dispute details', <>
            {formField('Partner', 'Total Energies Ghana')}
            {formField('CDR reference', 'CDR-8802')}
            {selectField('Reason', 'Tariff mismatch', ['Tariff mismatch', 'Duplicate CDR', 'Invalid meter value', 'Tax mismatch', 'Session not authorised'])}
            {formField('Claim amount', 'GHS 14.20')}
            {selectField('Priority', 'Medium', ['Low', 'Medium', 'High', 'Critical'])}
            {selectField('SLA target', '5 business days', ['48 hours', '5 business days', '10 business days'])}
          </>)}
          {workspaceGroup('Evidence and routing', <>
            {optionCard('Attach CDR', 'Include the selected charge detail record automatically.')}
            {optionCard('Attach tariff snapshot', 'Freeze the tariff version used during validation.')}
            {optionCard('Attach Eichrecht proof', 'Include signed OCMF evidence when available.')}
            {selectField('Assign to', 'Billing manager', ['Billing manager', 'Operations manager', 'Legal reviewer'])}
            {textAreaField('Message to partner', 'Please review the tariff component and confirm the corrected settlement value.')}
          </>)}
        </>
      );
      return;
    }
    if (/add network/i.test(label)) {
      openWorkspace(
        'Add roaming network',
        'Register a CPO/eMSP partner candidate before negotiation.',
        'Save network',
        <>
          {workspaceGroup('Partner identity', <>
            {formField('Network name', 'New roaming partner')}
            {selectField('Role', 'CPO', ['CPO', 'eMSP', 'NSP / Hub', 'Fleet partner'])}
            {formField('Country coverage', 'GH, NL, DE')}
            {formField('Business contact', 'roaming@partner.example.com')}
            {formField('Support contact', 'support@partner.example.com')}
            {selectField('Commercial status', 'Discovery', ['Discovery', 'Negotiation', 'Contract pending', 'Active'])}
          </>)}
          {workspaceGroup('Protocol configuration', <>
            {selectField('Primary protocol', 'OCPI 2.2', ['OCPI 2.2', 'eMIP 3.x', 'Custom adapter'])}
            {formField('Versions endpoint', 'https://partner.example.com/ocpi/versions')}
            {formField('Token A / onboarding token', 'tok_live_partner_â₵¢â₵¢â₵¢â₵¢â₵¢â₵¢')}
            {selectField('Auth mode', 'Token + mTLS', ['Token', 'Token + mTLS', 'HMAC signed requests'])}
            {optionCard('Enable location sync', 'Import EVSEs, connectors, capabilities, and statuses.')}
            {optionCard('Enable tariff sync', 'Accept real-time tariff pushes from this partner.')}
            {optionCard('Enable CDR exchange', 'Receive and validate partner CDRs for clearing.')}
            {optionCard('Enable technical supervision', 'Monitor heartbeat, latency, and error rates.')}
          </>)}
          {workspaceGroup('Contract visibility', <>
            {chipGroup('Visible to client contracts', ['ECG (Electricity Co. Ghana) Growth', 'Volta Networks EU Pilot', 'Ghana Fleet Launch'])}
            {optionCard('Require signed agreement before listing to clients', 'Partner remains hidden from client contracts until e-signature is complete.')}
          </>)}
        </>
      );
      return;
    }
    if (/add location/i.test(label)) {
      openWorkspace(
        'Add EVSE location',
        'Create a roaming-visible charging location with EVSEs, connectors, opening hours, and data-quality controls.',
        'Save location',
        <>
          {workspaceGroup('Location identity', <>
            {formField('Location name', 'Accra Airport Charging Hub')}
            {formField('External location ID', 'LOC-GH-ACC-0001')}
            {selectField('Operator / vendor', 'Volta Networks', ['Volta Networks', 'ECG (Electricity Co. Ghana)', 'Total Energies Ghana', 'Goil EV Network', 'VRA EV Charge'])}
            {selectField('Visibility', 'Visible to contracted clients only', ['Visible to contracted clients only', 'Internal only', 'Visible to all roaming partners'])}
            {formField('Address', 'Airport Road, Accra')}
            {formField('City', 'Accra')}
            {selectField('Country', 'GH', ['GH', 'NL', 'DE', 'FR', 'BR', 'MX', 'CO'])}
            {selectField('Time zone', 'Africa/Accra', ['Africa/Accra', 'Europe/Accra', 'Europe/Accra', 'America/Sao_Paulo'])}
          </>)}
          {workspaceGroup('EVSE and connector setup', <>
            {formField('EVSE UID prefix', 'GH*VLT*E0001')}
            {selectField('Number of EVSEs', '6', ['1', '2', '4', '6', '8', '12', '24'])}
            {selectField('Connector type', 'CCS2', ['CCS2', 'Type 2', 'CHAdeMO', 'NACS'])}
            {selectField('Power class', 'DC 150 kW', ['AC 22 kW', 'DC 50 kW', 'DC 150 kW', 'DC 350 kW'])}
            {optionCard('Remote start supported', 'Allow contracted client apps to start charging sessions.')}
            {optionCard('Reservation supported', 'Expose reserve-now capability over OCPI/eMIP.')}
            {optionCard('Live status updates', 'Publish AVAILABLE, CHARGING, RESERVED, INOPERATIVE states.')}
            {optionCard('Meter-value streaming', 'Send CDRi updates during active sessions.')}
          </>)}
          {workspaceGroup('Roaming and compliance', <>
            {selectField('Tariff assigned', 'TARIFF-GH-DC150', ['TARIFF-GH-DC150', 'TARIFF-EU-STD', 'TARIFF-DE-DC50', 'TARIFF-NL-AC'])}
            {selectField('Authorization mode', 'RFID + smartphone', ['RFID + smartphone', 'RFID only', 'Smartphone only', 'Whitelist only'])}
            {optionCard('Data quality validation', 'Check address, capabilities, connector count, and tariff reference before publish.')}
            {optionCard('Precise location privacy', 'Do not associate precise coordinates with driver identity.')}
            {optionCard('Notify contracted clients', 'Send location-created webhook to clients with an active contract.')}
            {optionCard('Require operator approval', 'Keep location in draft until vendor/operator confirms data.')}
          </>)}
        </>
      );
      return;
    }
    if (/new tariff|new traffic/i.test(label)) {
      openWorkspace(
        'New roaming tariff',
        'Publish a tariff for client contracts and roaming partners with OCPI/eMIP exchange options.',
        'Publish tariff',
        <>
          {workspaceGroup('Tariff identity', <>
            {formField('Tariff code', 'TARIFF-GH-DC150')}
            {formField('Display name', 'Ghana DC fast charging')}
            {selectField('Currency', 'GHS', ['GHS', 'GHS', 'BRL', 'USD'])}
            {selectField('Source', 'Manual', ['Manual', 'OCPI push', 'eMIP push', 'Marketplace agreement'])}
            {selectField('Status', 'Draft', ['Draft', 'Active', 'Archived'])}
            {formField('Valid from', '2026-07-01')}
          </>)}
          {workspaceGroup('Price components', <>
            {formField('Energy rate', '4.20 / kWh')}
            {formField('Time rate', '0.10 / min')}
            {formField('Flat session fee', '1.50')}
            {formField('Idle fee', '0.25 / min after grace')}
            {formField('Idle grace period', '10 minutes')}
            {selectField('Tax handling', 'Tax included', ['Tax included', 'Tax excluded', 'Reverse charge', 'No tax'])}
          </>)}
          {workspaceGroup('Applicability', <>
            {selectField('Connector scope', 'DC fast chargers only', ['All connectors', 'AC only', 'DC fast chargers only', 'Selected EVSEs'])}
            {selectField('Contract scope', 'Contracted clients only', ['Contracted clients only', 'All roaming partners', 'Selected agreement'])}
            {chipGroup('Countries', ['Ghana', 'Ghana pilot', 'Germany pilot'])}
            {optionCard('Push over OCPI', 'Send tariff update to OCPI-connected partners.')}
            {optionCard('Push over eMIP', 'Send tariff update to eMIP-connected partners.')}
            {optionCard('Run Check & Bill preview', 'Validate sample CDR calculations before publish.')}
            {optionCard('Require approval before activation', 'Billing manager must approve this tariff before it goes live.')}
          </>)}
        </>
      );
      return;
    }
    if (/add token/i.test(label)) {
      openWorkspace(
        'Add authorisation token',
        'Create a client-scoped RFID or EMAID token for roaming authorisation.',
        'Save token',
        <>
          {workspaceGroup('Token details', <>
            {selectField('Token type', 'RFID', ['RFID', 'EMAID', 'App token'])}
            {formField('Token UID / EMAID', 'GH*VLT*E000001')}
            {selectField('Issuer', 'Volta Networks', ['Volta Networks', 'ECG (Electricity Co. Ghana)', 'Fleet Partner'])}
            {selectField('Status', 'Active', ['Active', 'Blocked', 'Expired', 'Pending activation'])}
          </>)}
          {workspaceGroup('Authorisation rules', <>
            {optionCard('Allow OCPI authorisation', 'Token can be used with OCPI-connected CPO networks.')}
            {optionCard('Allow eMIP authorisation', 'Token can be used with eMIP-connected CPO networks.')}
            {optionCard('Wallet balance check required', 'Session must pass wallet or client credit threshold.')}
            {optionCard('Notify on rejection', 'Send client alert when token is rejected by a partner.')}
          </>)}
        </>
      );
      return;
    }
    if (/new negotiation|send proposal|save draft/i.test(label)) {
      openWorkspace(
        'Negotiation workspace',
        'Draft commercial terms, protocol scope, countries, and tariff references.',
        /send proposal/i.test(label) ? 'Send proposal' : 'Save negotiation',
        <>
          {workspaceGroup('Commercial terms', <>
            {formField('Partner', 'Goil EV Network')}
            {selectField('Agreement type', 'Bilateral roaming', ['Bilateral roaming', 'Hub-mediated roaming', 'Inbound only', 'Outbound only'])}
            {formField('Tariff reference', 'CB-GROWTH-EU-FAST')}
            {formField('Settlement currency', 'GHS')}
            {formField('Go-live target', '2026-07-15')}
            {selectField('Invoicing frequency', 'Monthly', ['Weekly', 'Monthly', 'Quarterly'])}
          </>)}
          {workspaceGroup('Operational scope', <>
            {optionCard('RFID authorisation', 'Allow RFID/token based roaming sessions.')}
            {optionCard('Smartphone authorisation', 'Allow app-based remote start and stop.')}
            {optionCard('Intermediate CDRi events', 'Exchange live energy and cost updates during sessions.')}
            {optionCard('Eichrecht CDR evidence', 'Require signed metering evidence where applicable.')}
            {chipGroup('Countries', ['Germany', 'Ghana', 'France', 'Ghana pilot'])}
          </>)}
          {textAreaField('Proposal note', 'We propose a staged go-live with static data testing, tariff validation, and a production CDR clearing pilot.')}
        </>
      );
      return;
    }
    if (/sign now|review|amend/i.test(label)) {
      openWorkspace(
        'Agreement review',
        'Check contract metadata before e-signature and activation.',
        /sign now/i.test(label) ? 'Sign agreement' : 'Save changes',
        <>
          {workspaceGroup('Agreement summary', detailsBody([
            ['Agreement', 'AGR-EU-2026-014'],
            ['Partner', 'VRA EV Charge'],
            ['Protocol', 'OCPI 2.2 + eMIP'],
            ['E-signature status', 'Ready for authorised signer'],
          ]))}
          {workspaceGroup('Signature controls', <>
            {selectField('Signer', 'Allego Admin', ['Allego Admin', 'Billing Manager', 'Legal Reviewer'])}
            {selectField('Signature method', '2FA e-signature', ['2FA e-signature', 'Certificate signature', 'Manual upload'])}
            {optionCard('Activate after both signatures', 'Network becomes visible only when both parties sign.')}
            {optionCard('Lock tariff version', 'Freeze commercial tariff IDs referenced by this agreement.')}
            {optionCard('Notify partner', 'Send signed agreement and activation date to partner.')}
            {optionCard('Create audit record', 'Store immutable signature metadata for compliance review.')}
          </>)}
        </>
      );
      return;
    }
    if (/new invoice|send reminder/i.test(label)) {
      setActiveId('invoicing');
      openWorkspace(
        'Invoice action',
        'Create or follow up on a clearing invoice.',
        /reminder/i.test(label) ? 'Send reminder' : 'Create invoice',
        <>
          {workspaceGroup('Invoice setup', <>
            {formField('Invoice period', 'June 2026')}
            {formField('Partner', 'Total Energies Ghana')}
            {selectField('Currency', 'GHS', ['GHS', 'GHS', 'BRL', 'USD'])}
            {selectField('Payment terms', 'Net 30', ['Due on receipt', 'Net 15', 'Net 30', 'Net 45'])}
            {formField('Purchase order reference', 'PO-2026-0091')}
            {selectField('Tax handling', 'Reverse charge VAT', ['Reverse charge VAT', 'VAT included', 'No tax', 'Local tax'])}
          </>)}
          {workspaceGroup('Clearing options', <>
            {optionCard('Include validated CDRs only', 'Exclude pending and disputed charge records.')}
            {optionCard('Attach CDR appendix', 'Append full CDR list to invoice PDF.')}
            {optionCard('Attach Check & Bill report', 'Include validation pass/fail summary.')}
            {optionCard('Send partner notification', 'Email invoice and webhook event to partner.')}
            {selectField('Delegation mode', 'RFConnector generates invoice draft', ['RFConnector generates invoice draft', 'Client uploads invoice', 'Partner self-billing'])}
          </>)}
        </>
      );
      return;
    }
    if (/new thread|send/i.test(label)) {
      selectSection('messaging');
      showResult('Message queued', 'The message appears in the partner thread and will be delivered with audit logging.', 'success');
      return;
    }
    if (/alert|diagnose/i.test(label)) {
      setActiveId('supervision');
      openWorkspace(
        'Supervision detail',
        'Review the active operational incident and partner connectivity state.',
        'Acknowledge',
        <>
          {workspaceGroup('Incident summary', detailsBody([
            ['Service', 'Eichrecht signing'],
            ['Severity', 'Warning'],
            ['Affected CDRs', '7 pending signatures'],
            ['Next action', 'Retry signing queue'],
          ]))}
          {workspaceGroup('Runbook actions', <>
            {optionCard('Retry failed signatures', 'Re-run the signing queue for pending OCMF payloads.')}
            {optionCard('Notify billing team', 'Warn invoice users before final settlement.')}
            {optionCard('Pause partner clearing', 'Hold affected CDRs until evidence is complete.', false)}
            {selectField('Escalation owner', 'Operations manager', ['Operations manager', 'Compliance officer', 'Partner support'])}
            {textAreaField('Internal note', 'Signing retries are permitted because raw meter payloads are still available in retention storage.')}
          </>)}
        </>
      );
      return;
    }

    if (/view|open|more/i.test(label)) {
      openWorkspace(
        'Record details',
        'Demo detail panel for the selected client-owned record.',
        'Close review',
        <>
          {workspaceGroup('Selected record', detailsBody([
            ['Current module', NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeId)?.label ?? 'Client Portal'],
            ['Selected action', label],
            ['Tenant boundary', 'ECG (Electricity Co. Ghana) only'],
            ['Audit status', 'Action recorded for demo review'],
          ]))}
          {workspaceGroup('Available follow-up actions', <>
            {optionCard('Download evidence', 'Export source record and audit metadata.')}
            {optionCard('Open dispute', 'Create a partner dispute from this record.', false)}
            {optionCard('Send to billing', 'Include this item in the next clearing run.', false)}
            {optionCard('Notify partner', 'Send a secure message to the contracted vendor.', false)}
          </>)}
        </>
      );
      return;
    }

    showResult(`${label} applied`, 'The demo updated the current workspace without leaving this portal.', 'info');
  }

  const renderSection = () => {
    switch (activeId) {
      case 'overview':     return renderOverview(setActiveId);
      case 'company':      return renderCompany();
      case 'marketplace':  return renderMarketplace({
        selectedNetwork: selectedMarketplaceNetwork,
        setSelectedNetwork: setSelectedMarketplaceNetwork,
        selectedAccessPoint: selectedMarketplaceAccessPoint,
        setSelectedAccessPoint: setSelectedMarketplaceAccessPoint,
        search: marketplaceSearch,
        setSearch: setMarketplaceSearch,
        roleFilter: marketplaceRoleFilter,
        setRoleFilter: setMarketplaceRoleFilter,
        countryFilter: marketplaceCountryFilter,
        setCountryFilter: setMarketplaceCountryFilter,
        protocolFilter: marketplaceProtocolFilter,
        setProtocolFilter: setMarketplaceProtocolFilter,
        statusFilter: marketplaceStatusFilter,
        setStatusFilter: setMarketplaceStatusFilter,
        mapMode: marketplaceMapMode,
        setMapMode: setMarketplaceMapMode,
        mapZoom: marketplaceMapZoom,
        setMapZoom: setMarketplaceMapZoom,
        hoveredNetwork: marketplaceHoveredNetwork,
        setHoveredNetwork: setMarketplaceHoveredNetwork,
      });
      case 'negotiation':  return renderNegotiation();
      case 'signature':    return renderSignature();
      case 'evse_repo':      return renderEVSERepo();
      case 'tariffs':        return renderTariffs();
      case 'authorisation':  return renderAuthorisation();
      case 'events':         return renderEvents();
      case 'cdr_exchange':   return renderCDRExchange();
      case 'plug_charge':    return renderPlugCharge();
      case 'smart_charging': return renderSmartCharging();
      case 'analytics':      return renderAnalytics();
      case 'supervision':  return renderSupervision();
      case 'tracking':     return renderTracking();
      case 'check_bill':   return renderCheckBill();
      case 'disputes':     return renderDisputes();
      case 'invoicing':    return renderInvoicing();
      case 'messaging':    return <MessagingSection />;
      case 'api_keys':         return renderAPIKeys();
      case 'nearby_stations':  return renderNearbyStations();
      default:                 return null;
    }
  };

  const renderWorkspace = () => {
    if (workspace === null) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => setWorkspace(null)}
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-700"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Back to {NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeId)?.label ?? 'portal'}
            </button>
            <h2 className="text-2xl font-bold text-slate-900">{workspace.title}</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">{workspace.subtitle}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm">
            <div className="text-[11px] font-semibold uppercase text-slate-400">Tenant scope</div>
            <div className="mt-1 text-sm font-semibold text-slate-800">{clientSession?.company ?? 'Client account'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {workspace.body}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800">Workflow status</h3>
              <div className="mt-4 space-y-3">
                {['Tenant isolation checked', 'Audit trail ready', '2FA session verified'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800">Actions</h3>
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    showResult(workspace.primaryLabel, `${workspace.title} was applied in the demo workspace.`, 'success');
                    setWorkspace(null);
                  }}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  {workspace.primaryLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspace(null)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex">
      {/* â"₵â"₵ Sidebar â"₵â"₵ */}
      <aside className="portal-sidebar w-60 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 flex flex-col shrink-0 fixed inset-y-0 left-0 z-10">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Bolt className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white text-sm">RFConnector</div>
              <div className="text-[10px] text-gray-400 dark:text-slate-500">Client Portal</div>
            </div>
          </div>
        </div>

        {/* Tenant info */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
            {(clientSession?.company ?? 'A').charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-gray-900 dark:text-white truncate">{clientSession?.company ?? 'Volta Networks'}</div>
            <div className="text-[10px] text-gray-400 dark:text-slate-500">eMSP · Growth Plan</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="mb-1">
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center gap-1 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300"
              >
                {expandedGroups.has(group.label)
                  ? <ChevronDown className="w-3 h-3" />
                  : <ChevronRight className="w-3 h-3" />}
                {group.label}
              </button>
              {expandedGroups.has(group.label) && group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => selectSection(item.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm rounded-lg mx-1 transition-colors ${
                    activeId === item.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                  style={{ width: 'calc(100% - 8px)' }}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && <Badge n={item.badge} />}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-slate-800 p-4 space-y-3">
          {clientSession && (
            <button
              type="button"
              onClick={openClientProfile}
              className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1 text-left hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <div className="w-7 h-7 rounded-full bg-charge-500/20 border border-charge-500/30 flex items-center justify-center text-xs font-bold text-charge-600 dark:text-charge-400 shrink-0">
                {clientSession.company.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-slate-200 truncate">{clientSession.company}</p>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{clientSession.email}</p>
              </div>
            </button>
          )}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-300 transition-colors px-1"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* â"₵â"₵ Main content â"₵â"₵ */}
      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-3 flex items-center gap-3 sticky top-0 z-10">
          <div className="flex-1">
            <span className="text-xs text-slate-400">
              {NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeId)?.label}
            </span>
            <span className="ml-3 text-xs text-slate-500 font-medium">
              Last Synced:{' '}
              {lastSync.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })},{' '}
              {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                selectSection('supervision');
                showResult('Notifications opened', 'Showing supervision alerts and partner connectivity status.', 'info');
              }}
              className="relative p-2 text-slate-500 hover:text-slate-700"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
            <button
              type="button"
              onClick={openClientProfile}
              className="flex items-center gap-2 border-l border-slate-200 pl-3 text-slate-700 hover:text-indigo-700"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                {(clientSession?.company ?? 'A').charAt(0)}
              </div>
              <span className="text-sm text-slate-600 font-medium">Allego Admin</span>
            </button>
          </div>
        </header>

        {actionResult !== null && (
          <div className={`mx-8 mt-5 rounded-xl border px-4 py-3 flex items-start gap-3 ${
            actionResult.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : actionResult.tone === 'warning'
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-indigo-200 bg-indigo-50 text-indigo-900'
          }`}
          >
            {actionResult.tone === 'success'
              ? <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
              : actionResult.tone === 'warning'
                ? <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                : <Activity className="w-5 h-5 mt-0.5 shrink-0" />}
            <div className="flex-1">
              <div className="text-sm font-semibold">{actionResult.title}</div>
              <div className="mt-0.5 text-sm opacity-80">{actionResult.detail}</div>
              {queuedCommands.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {queuedCommands.map(command => (
                    <span key={command} className="rounded-full bg-white/70 px-2 py-1 text-[11px] font-medium">
                      {command}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setActionResult(null)}
              className="text-xs font-semibold opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Page content */}
        <main
          onClickCapture={workspace === null ? handleContentClick : undefined}
          className="flex-1 p-8 max-w-6xl w-full mx-auto"
        >
          {workspace === null
            ? <div key={activeId}>{renderSection()}</div>
            : renderWorkspace()}
        </main>
      </div>
    </div>
  );
}
