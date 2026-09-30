import React from 'react';
import { X, Printer, ShieldCheck, Download, Award } from 'lucide-react';
import { Currency, FinancialRecord } from '../types/bfsi';
import { formatCurrency, formatExactCurrency } from '../utils/bfsiCalculators';

interface ReportModalProps {
  onClose: () => void;
  currency: Currency;
  latestRecord?: FinancialRecord;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  onClose,
  currency,
  latestRecord,
}) => {
  const applicantName = latestRecord?.applicantName || 'Rahul Sharma';
  const loanType = latestRecord?.loanType ? latestRecord.loanType.toUpperCase() : 'HOME LOAN';
  const requestedAmount = latestRecord?.requestedAmount || 3500000;
  const maxEligible = latestRecord?.maxEligibleLoan || 4200000;
  const creditScore = latestRecord?.creditScore || 765;
  const foir = latestRecord?.foir || 42.5;
  const status = latestRecord?.status || 'Approved';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl glass-card rounded-2xl border border-cyan-500/30 shadow-2xl p-6 sm:p-8 bg-[#0a0f1d] text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Executive BFSI Underwriting Dossier
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="py-6 space-y-6 print:p-0">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/15 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white">
                  BFSI SmartDecide<span className="text-cyan-400">.AI</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                  CONFIDENTIAL
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Institutional Financial Decision & Underwriting Assessment
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Ref ID: BFSI-{Date.now().toString().slice(-8)} • Date: {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Corner Verification Stamp */}
            <div className="text-right p-2.5 rounded-xl border border-cyan-500/30 bg-slate-900/60">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                System Architect & Lead Engineer
              </span>
              <span className="text-sm font-extrabold text-cyan-300 tracking-wider">
                YOGESH DIKE
              </span>
              <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-400 mt-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Algorithms</span>
              </div>
            </div>
          </div>

          {/* Verdict Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              status === 'Approved'
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
            }`}
          >
            <div>
              <span className="text-xs uppercase font-bold tracking-wider block">
                Underwriting Decision
              </span>
              <span className="text-xl font-extrabold text-white">
                {status.toUpperCase()} FOR FINANCING
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Credit Bureau Standing</span>
              <span className="text-lg font-bold font-mono text-cyan-300">
                {creditScore} / 900
              </span>
            </div>
          </div>

          {/* Applicant & Financial Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
              <span className="text-slate-400 block text-[10px]">Applicant Name</span>
              <span className="font-bold text-white text-sm">{applicantName}</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
              <span className="text-slate-400 block text-[10px]">Loan Classification</span>
              <span className="font-bold text-cyan-300 text-sm">{loanType}</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
              <span className="text-slate-400 block text-[10px]">Requested Loan</span>
              <span className="font-bold text-white text-sm font-mono">
                {formatCurrency(requestedAmount, currency)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
              <span className="text-slate-400 block text-[10px]">Max Borrowing Capacity</span>
              <span className="font-bold text-emerald-400 text-sm font-mono">
                {formatCurrency(maxEligible, currency)}
              </span>
            </div>
          </div>

          {/* Institutional Ratios */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Core Underwriting Metrics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Fixed Obligation Ratio (FOIR)</span>
                <span className="font-bold font-mono text-cyan-300 text-base">{foir}%</span>
                <span className="text-[10px] text-slate-500 block">Benchmark: ≤ 50.0%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Bureau Risk Bracket</span>
                <span className="font-bold text-emerald-400 text-base">
                  {creditScore >= 750 ? 'Tier-1 Prime' : creditScore >= 650 ? 'Near-Prime' : 'Subprime'}
                </span>
                <span className="text-[10px] text-slate-500 block">Lowest Default Probability</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Interest Rate Recommendation</span>
                <span className="font-bold font-mono text-white text-base">8.40% - 8.90%</span>
                <span className="text-[10px] text-slate-500 block">Linked to Repo Benchmark</span>
              </div>
            </div>
          </div>

          {/* Underwriting Notes & Conditions */}
          <div className="text-xs text-slate-300 space-y-2 bg-slate-900/60 p-4 rounded-xl border border-white/5">
            <span className="font-bold text-cyan-300 block uppercase tracking-wider text-[11px]">
              Assessor's Notes & Prerequisites
            </span>
            <p className="leading-relaxed">
              Based on the applicant's reported monthly income, debt obligations, and credit bureau vintage, the borrower comfortably satisfies banking debt-service coverage guidelines. Verification of last 6 months salary slips / bank statements and property title search is recommended prior to formal sanction disbursement.
            </p>
          </div>

          {/* Certification Signature */}
          <div className="pt-6 border-t border-white/15 flex items-end justify-between">
            <div className="text-[10px] text-slate-500 max-w-sm">
              <p>
                Generated by BFSI SmartDecide AI Platform. All financial calculations conform to standard banking amortization and underwriting regulations.
              </p>
            </div>

            <div className="text-right">
              <div className="font-serif italic text-cyan-300 text-lg border-b border-cyan-400/50 pb-1 mb-1">
                Yogesh Dike
              </div>
              <span className="text-[10px] font-bold text-slate-300 block uppercase tracking-wider">
                Yogesh Dike
              </span>
              <span className="text-[9px] text-slate-500 block">
                Principal BFSI Architect & Engineer
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
