import React, { useState } from 'react';
import {
  X,
  BookOpen,
  GitBranch,
  Cpu,
  ShieldCheck,
  Rocket,
  CheckCircle2,
  Code2,
  Lock,
  Workflow,
  Sparkles,
} from 'lucide-react';

interface ArchitectureDocsProps {
  onClose: () => void;
}

export const ArchitectureDocsModal: React.FC<ArchitectureDocsProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'workflow' | 'formulas' | 'security' | 'roadmap'>('workflow');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl glass-card rounded-2xl border border-cyan-500/30 shadow-2xl p-6 sm:p-8 bg-[#080d1a] text-slate-100 max-h-[92vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Technical Blueprint
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                BFSI SmartDecide AI • Architecture & System Documentation
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Lead Architect & Principal System Engineer: <span className="text-cyan-300 font-semibold">Yogesh Dike</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-white/10">
          {[
            { id: 'workflow', label: 'Workflow Diagrams', icon: Workflow },
            { id: 'architecture', label: 'Tech Stack & Modules', icon: Cpu },
            { id: 'formulas', label: 'Financial Mathematics', icon: Code2 },
            { id: 'security', label: 'Data Privacy & Security', icon: Lock },
            { id: 'roadmap', label: 'Future Roadmap', icon: Rocket },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6 text-xs sm:text-sm">
          {/* TAB 1: WORKFLOW DIAGRAM */}
          {activeTab === 'workflow' && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Workflow className="w-4 h-4" /> End-to-End Decision Flow Architecture
              </h3>

              {/* Visual Flow diagram blocks */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0">
                      01
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-xs sm:text-sm">
                        Client Ingestion & Real-Time Validation
                      </h4>
                      <p className="text-xs text-slate-400">
                        Collects applicant parameters (income, age, existing EMIs, loan type, bureau score) with client-side regex & boundary checks.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-[11px] font-mono text-cyan-300 border border-white/5">
                    Input Validation Layer
                  </span>
                </div>

                <div className="flex justify-center">
                  <div className="w-0.5 h-4 bg-cyan-500/40"></div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
                      02
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-xs sm:text-sm">
                        Underwriting Engine & Risk Scoring
                      </h4>
                      <p className="text-xs text-slate-400">
                        Evaluates Fixed Obligation to Income Ratio (FOIR), Debt-to-Income (DTI), borrowing capacity ceiling, and retirement age horizon.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-[11px] font-mono text-blue-300 border border-white/5">
                    Mathematical Rule Matrix
                  </span>
                </div>

                <div className="flex justify-center">
                  <div className="w-0.5 h-4 bg-cyan-500/40"></div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                      03
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-xs sm:text-sm">
                        Multi-Model AI Advisory Layer
                      </h4>
                      <p className="text-xs text-slate-400">
                        Sends structured financial context to Google Gemini 3.8 Flash or Anthropic Claude API for nuanced debt restructuring and tax-saving advice.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-[11px] font-mono text-indigo-300 border border-white/5">
                    Gemini 3.8 & Claude 3.5
                  </span>
                </div>

                <div className="flex justify-center">
                  <div className="w-0.5 h-4 bg-cyan-500/40"></div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                      04
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-xs sm:text-sm">
                        Persistence & Google Sheets Cloud Sync
                      </h4>
                      <p className="text-xs text-slate-400">
                        Saves record to local memory state, generates downloadable Google Sheets CSV, and pushes live record to user's Google Apps Script Webhook.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-[11px] font-mono text-emerald-300 border border-white/5">
                    Google Sheets API / Webhook
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TECH STACK */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4" /> Platform Engineering & Component Hierarchy
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
                  <span className="font-bold text-white text-xs block">Frontend Presentation Layer</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    React 19 + TypeScript + Vite 8. Styled using Tailwind CSS v4 dark glassmorphism design constitution with custom backdrop-filters, responsive typography, and glowing CSS variables.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
                  <span className="font-bold text-white text-xs block">BFSI Underwriting Algorithms</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Custom mathematical library implementing compound amortization, FOIR, DTI, CIBIL 5-pillar weight models, and prepayment savings amortization tables.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
                  <span className="font-bold text-white text-xs block">AI Orchestration Gateway</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Server-side proxy supporting Google Gemini 3.8 Flash via the @google/genai SDK, Anthropic Claude 3.5 via REST API with user keys, and offline institutional rules fallback.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
                  <span className="font-bold text-white text-xs block">Data Persistence & Google Cloud</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Local persistent state storage with dual-channel Google Sheets connectivity: RFC 4180 CSV export and direct Google Apps Script HTTP Webhook synchronization.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FORMULAS */}
          {activeTab === 'formulas' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4" /> Core Financial Mathematics
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10 space-y-2">
                  <span className="text-cyan-300 font-bold font-sans">1. Equated Monthly Installment (EMI) Formula</span>
                  <div className="p-3 rounded-lg bg-black/60 text-emerald-300 overflow-x-auto">
                    EMI = [P × r × (1 + r)^n] / [(1 + r)^n - 1]
                  </div>
                  <p className="text-slate-400 font-sans text-xs">
                    Where P = Principal Loan, r = Monthly Interest Rate (Annual Rate / 12 / 100), n = Tenure in Months.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10 space-y-2">
                  <span className="text-cyan-300 font-bold font-sans">2. Fixed Obligation to Income Ratio (FOIR)</span>
                  <div className="p-3 rounded-lg bg-black/60 text-emerald-300 overflow-x-auto">
                    FOIR = [(Total Existing EMIs + Proposed New EMI) / Gross Monthly Income] × 100
                  </div>
                  <p className="text-slate-400 font-sans text-xs">
                    Standard institutional lending ceiling: 45% - 50% (extended to 60% for High-Net-Worth applicants).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10 space-y-2">
                  <span className="text-cyan-300 font-bold font-sans">3. Maximum Permissible Borrowing Capacity</span>
                  <div className="p-3 rounded-lg bg-black/60 text-emerald-300 overflow-x-auto">
                    Max Permissible EMI = (Income × FOIR_Benchmark) - Existing_EMIs<br />
                    P_max = [EMI_max × ((1 + r)^n - 1)] / [r × (1 + r)^n]
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & PRIVACY */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Data Privacy & Secure API Practices
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-xs">Zero-Storage Architecture</h4>
                    <p className="text-xs text-slate-400">
                      User financial details are evaluated client-side. No sensitive personally identifiable information (PII) is permanently indexed on intermediate servers without consent.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-xs">Server-Side Proxy Security</h4>
                    <p className="text-xs text-slate-400">
                      AI calls are routed through server middleware (`/api/ai-advisor`), preventing exposure of master Gemini API keys to client browsers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-xs">Encrypted Webhook Ingestion</h4>
                    <p className="text-xs text-slate-400">
                      Google Sheets sync utilizes HTTPS TLS 1.3 encrypted payloads directly to user-authorized Google Apps Script endpoints.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ROADMAP */}
          {activeTab === 'roadmap' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Rocket className="w-4 h-4 text-cyan-400" /> Future Engineering Enhancements
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">ML Default Prediction Model (XGBoost / LightGBM)</h4>
                    <p className="text-xs text-slate-400">
                      Train on historical default datasets to predict default probabilities beyond static threshold scoring.
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Phase 2
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">Open Banking & Account Aggregator (AA) Integration</h4>
                    <p className="text-xs text-slate-400">
                      Automated bank statement parsing via Sahamati / RBI-regulated Account Aggregator APIs.
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Phase 3
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">Multi-Tenant Role-Based Access Control (RBAC)</h4>
                    <p className="text-xs text-slate-400">
                      Separate portals for Borrowers, Loan Officers, and Senior Credit Underwriters.
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Phase 4
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Engineered by <strong className="text-white">Yogesh Dike</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
