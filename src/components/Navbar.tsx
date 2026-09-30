import React from 'react';
import {
  ShieldAlert,
  Calculator,
  Gauge,
  Bot,
  FileSpreadsheet,
  BookOpen,
  FileText,
  DollarSign,
  Coins,
  Sparkles,
} from 'lucide-react';
import { Currency } from '../types/bfsi';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  onOpenReport: () => void;
  onOpenDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  onOpenReport,
  onOpenDocs,
}) => {
  const tabs = [
    { id: 'loan', label: 'Loan Eligibility', icon: ShieldAlert, badge: 'Core' },
    { id: 'credit', label: 'Credit Analyzer', icon: Gauge, badge: 'Bureau' },
    { id: 'emi', label: 'EMI Calculator', icon: Calculator, badge: 'Realtime' },
    { id: 'ai', label: 'AI Financial Tips', icon: Bot, badge: 'Claude / Gemini' },
    { id: 'sheets', label: 'Google Sheets & Records', icon: FileSpreadsheet, badge: 'Cloud' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#070b14]/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/30">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#070b14]"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  BFSI SmartDecide<span className="text-cyan-400">.AI</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">
                  Institutional v2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                AI Financial Underwriting & Decision System • <span className="text-cyan-400 font-semibold">Yogesh Dike</span>
              </p>
            </div>
          </div>

          {/* Right actions: Currency switcher, Report button, Docs button */}
          <div className="flex items-center gap-2 sm:gap-3 mr-28 sm:mr-36">
            {/* Currency toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-900/90 border border-white/10 text-xs">
              <button
                onClick={() => setCurrency('INR')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all ${
                  currency === 'INR'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Indian Rupee (₹ Lakhs & Crores)"
              >
                <Coins className="w-3 h-3" />
                <span>₹ INR</span>
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all ${
                  currency === 'USD'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="US Dollar ($)"
              >
                <DollarSign className="w-3 h-3" />
                <span>$ USD</span>
              </button>
            </div>

            {/* Print / PDF Report Button */}
            <button
              onClick={onOpenReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs font-medium text-slate-200 hover:text-white transition-all shadow-sm cursor-pointer"
              title="Generate comprehensive financial dossier / PDF report"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Dossier PDF</span>
            </button>

            {/* Docs & Architecture button */}
            <button
              onClick={onOpenDocs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
              title="View Architecture Diagrams and BFSI Underwriting Documentation"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Architecture</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 no-scrollbar border-t border-white/5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`hidden md:inline-block text-[10px] px-1.5 py-0.2 rounded font-normal ${
                    isActive
                      ? 'bg-cyan-500/30 text-cyan-200'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
