import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600">
                <Zap size={14} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-sm">RFConnector</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-500 leading-relaxed">
              Universal EV Charging Connector SDK. Ghana · EU · LatAm.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'Changelog', 'Status'].map(l => (
                <li key={l}><a href="#" className="text-sm text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-300 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-3">Developers</h4>
            <ul className="space-y-2">
              {['Documentation', 'API Reference', 'SDKs', 'Webhooks'].map(l => (
                <li key={l}><a href="#" className="text-sm text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-300 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-3">Legal</h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'GDPR', 'Ghana DPA'].map(l => (
                <li key={l}><a href="#" className="text-sm text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-300 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200 dark:border-slate-800">
          <p className="text-xs text-gray-400 dark:text-slate-600">© 2025 RFConnector. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-charge-500/10 px-2.5 py-1 text-xs text-charge-600 dark:text-charge-400 border border-charge-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-charge-400 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
