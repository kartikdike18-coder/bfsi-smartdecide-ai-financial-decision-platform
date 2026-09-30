import React, { useState, useMemo } from 'react';
import {
  Gauge,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Sliders,
  ShieldCheck,
  RefreshCcw,
  Zap,
} from 'lucide-react';
import { CreditReport, Currency } from '../types/bfsi';
import { analyzeCreditScore, formatCurrency } from '../utils/bfsiCalculators';

interface CreditScoreAnalyzerProps {
  currency: Currency;
  onAskAi: (prompt: string, context: any) => void;
}

export const CreditScoreAnalyzerModule: React.FC<CreditScoreAnalyzerProps> = ({
  currency,
  onAskAi,
}) => {
  // Input parameters for simulation
  const [baseScore, setBaseScore] = useState<number>(745);
  const [activeCards, setActiveCards] = useState<number>(3);
  const [utilizationPercent, setUtilizationPercent] = useState<number>(26);
  const [latePayments, setLatePayments] = useState<number>(0);
  const [historyAgeYears, setHistoryAgeYears] = useState<number>(6);

  // What-if simulator controls
  const [debtPaydownAmount, setDebtPaydownAmount] = useState<number>(0);
  const [simulateCardClosure, setSimulateCardClosure] = useState<boolean>(false);
  const [simulateNewInquiry, setSimulateNewInquiry] = useState<boolean>(false);

  // Dynamic projected score calculation based on what-if actions
  const simulatedScore = useMemo(() => {
    let scoreDelta = 0;

    // Debt paydown drops utilization
    if (debtPaydownAmount > 0) {
      const utilDrop = Math.min(25, Math.floor(debtPaydownAmount / 25000) * 3);
      scoreDelta += utilDrop * 1.5;
    }

    // Closing card hurts credit age & total limit
    if (simulateCardClosure) {
      scoreDelta -= 22;
    }

    // New hard inquiry
    if (simulateNewInquiry) {
      scoreDelta -= 12;
    }

    const calculated = Math.max(300, Math.min(900, Math.round(baseScore + scoreDelta)));
    return calculated;
  }, [baseScore, debtPaydownAmount, simulateCardClosure, simulateNewInquiry]);

  // Bureau report calculation
  const report: CreditReport = useMemo(() => {
    const effectiveUtil = Math.max(
      5,
      utilizationPercent - (debtPaydownAmount > 0 ? Math.floor(debtPaydownAmount / 20000) * 4 : 0)
    );
    return analyzeCreditScore(
      simulatedScore,
      activeCards,
      effectiveUtil,
      latePayments,
      simulateCardClosure ? Math.max(1, historyAgeYears - 2) : historyAgeYears
    );
  }, [simulatedScore, activeCards, utilizationPercent, latePayments, historyAgeYears, debtPaydownAmount, simulateCardClosure]);

  // Calculate needle rotation angle for SVG gauge: 300 score is -90deg, 900 score is +90deg
  const gaugeAngle = useMemo(() => {
    const clamped = Math.max(300, Math.min(900, simulatedScore));
    const percent = (clamped - 300) / 600; // 0 to 1
    return -90 + percent * 180;
  }, [simulatedScore]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Module 2
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Bureau Credit Score Analyzer & Risk Insights
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Algorithmic 5-pillar CIBIL / Experian credit model with What-If simulator and risk factor diagnostic.
          </p>
        </div>

        <button
          onClick={() =>
            onAskAi(
              `Analyze my credit score of ${simulatedScore} (${report.rating}). Current utilization is ${report.currentCreditUtilizationPercent}%, late payments: ${latePayments}, oldest trade line: ${historyAgeYears} years. Provide a step-by-step credit enhancement roadmap to hit 800+.`,
              { score: simulatedScore, rating: report.rating, utilization: report.currentCreditUtilizationPercent, latePayments, historyAgeYears }
            )
          }
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Credit Repair Strategy</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Speedometer Gauge & Rating (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-card rounded-2xl p-6 border border-white/10 text-center relative overflow-hidden">
            {/* Ambient background glow */}
            <div
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ backgroundColor: report.ratingColor }}
            ></div>

            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Composite Bureau Score (CIBIL / FICO)
            </span>

            {/* Speedometer SVG Gauge */}
            <div className="relative w-64 h-36 mx-auto mt-4 mb-2 flex items-center justify-center">
              <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
                {/* Arc gradient track */}
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="25%" stopColor="#f97316" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="75%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>

                {/* Base gauge track */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="16"
                  strokeLinecap="round"
                />

                {/* Colored gauge arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="16"
                  strokeLinecap="round"
                  opacity="0.85"
                />

                {/* Needle Indicator */}
                <g transform={`rotate(${gaugeAngle}, 100, 100)`}>
                  <line
                    x1="100"
                    y1="100"
                    x2="100"
                    y2="28"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  />
                  <circle cx="100" cy="100" r="7" fill="#ffffff" />
                  <circle cx="100" cy="100" r="4" fill="#0284c7" />
                </g>
              </svg>

              {/* Gauge labels */}
              <span className="absolute bottom-0 left-2 text-[10px] font-mono text-slate-500">300</span>
              <span className="absolute bottom-0 right-2 text-[10px] font-mono text-slate-500">900</span>
            </div>

            {/* Score Number and Classification */}
            <div className="mt-1">
              <div className="text-4xl sm:text-5xl font-extrabold font-mono text-white tracking-tight drop-shadow-md">
                {simulatedScore}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-2"
                style={{
                  backgroundColor: `${report.ratingColor}20`,
                  color: report.ratingColor,
                  border: `1px solid ${report.ratingColor}40`,
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{report.rating} Standing</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-4 leading-relaxed max-w-sm mx-auto bg-slate-900/60 p-3 rounded-xl border border-white/5">
              {report.summary}
            </p>

            {/* Base Score Adjustment Slider */}
            <div className="mt-5 pt-4 border-t border-white/10 text-left">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-slate-300">Adjust Base Bureau Score</span>
                <span className="text-xs font-mono font-bold text-cyan-400">{baseScore}</span>
              </div>
              <input
                type="range"
                min="300"
                max="900"
                step="5"
                value={baseScore}
                onChange={(e) => setBaseScore(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Interactive What-If Credit Simulator */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> What-If Score Simulator
              </h2>
              <span className="text-[10px] text-slate-400 font-medium bg-slate-800 px-2 py-0.5 rounded">
                Live Scenario
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Debt paydown */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-300">Pay Down Outstanding Debt</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {debtPaydownAmount > 0 ? `+${formatCurrency(debtPaydownAmount, currency)}` : 'None'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150000"
                  step="10000"
                  value={debtPaydownAmount}
                  onChange={(e) => setDebtPaydownAmount(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0</span>
                  <span>{formatCurrency(75000, currency)}</span>
                  <span>{formatCurrency(150000, currency)}</span>
                </div>
              </div>

              {/* Close Old Card Checkbox */}
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-white/5 cursor-pointer hover:bg-slate-900 transition-colors">
                <input
                  type="checkbox"
                  checked={simulateCardClosure}
                  onChange={(e) => setSimulateCardClosure(e.target.checked)}
                  className="mt-0.5 accent-rose-500"
                />
                <div>
                  <span className="font-medium text-slate-200 block">Close Oldest Credit Card</span>
                  <span className="text-[11px] text-slate-400">
                    Reduces overall average credit history age and shrinks total credit limits.
                  </span>
                </div>
              </label>

              {/* New Loan Inquiry */}
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-white/5 cursor-pointer hover:bg-slate-900 transition-colors">
                <input
                  type="checkbox"
                  checked={simulateNewInquiry}
                  onChange={(e) => setSimulateNewInquiry(e.target.checked)}
                  className="mt-0.5 accent-amber-500"
                />
                <div>
                  <span className="font-medium text-slate-200 block">Apply for 2 New Credit Lines</span>
                  <span className="text-[11px] text-slate-400">
                    Triggers hard credit bureau inquiries, causing a temporary dip.
                  </span>
                </div>
              </label>

              {/* Delta Result */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-500/20 flex items-center justify-between">
                <span className="text-slate-300">Simulated Net Score Impact:</span>
                <span
                  className={`font-mono text-base font-bold ${
                    simulatedScore >= baseScore ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {simulatedScore >= baseScore ? `+${simulatedScore - baseScore}` : simulatedScore - baseScore} pts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: 5 Pillars Breakdown & Improvement Plan (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 5 Scoring Pillars */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4" /> 5 Core Bureau Scoring Weightages
            </h2>

            <div className="space-y-3">
              {report.factors.map((factor, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{factor.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-cyan-300">
                        {factor.weight}% Weight
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold ${
                        factor.status === 'Excellent'
                          ? 'text-emerald-400'
                          : factor.status === 'Good'
                          ? 'text-cyan-400'
                          : factor.status === 'Average'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {factor.status} ({factor.score}/100)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        factor.score >= 85
                          ? 'bg-emerald-400'
                          : factor.score >= 70
                          ? 'bg-cyan-400'
                          : factor.score >= 50
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${factor.score}%` }}
                    ></div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-1 pt-1">
                    <span>{factor.detail}</span>
                    <span className="text-cyan-400/90 font-medium">Tip: {factor.tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bureau Findings & 6-Month Roadmap */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> 6-Month Credit Rehabilitation Roadmap
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {report.improvementRoadmap.map((step, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300">{step.month}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Goal: {step.targetScore}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{step.action}</p>
                </div>
              ))}
            </div>

            {/* Strengths & Red Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mb-2">
                  <CheckCircle className="w-3.5 h-3.5" /> Positive Indicators
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {report.positiveRemarks.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20">
                <span className="text-xs font-semibold text-rose-400 flex items-center gap-1 mb-2">
                  <AlertCircle className="w-3.5 h-3.5" /> Risk Signals
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {report.negativeRemarks.length > 0 ? (
                    report.negativeRemarks.map((n, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-400">✗</span>
                        <span>{n}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400 italic">No critical bureau alerts registered.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
