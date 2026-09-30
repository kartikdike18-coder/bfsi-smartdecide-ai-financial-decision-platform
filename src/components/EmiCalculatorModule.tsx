import React, { useState, useMemo } from 'react';
import {
  Calculator,
  PieChart,
  Calendar,
  Download,
  Sparkles,
  TrendingDown,
  ArrowRight,
  Search,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Currency, EmiCalculationResult } from '../types/bfsi';
import { calculateEmi, formatCurrency, formatExactCurrency } from '../utils/bfsiCalculators';

interface EmiCalculatorProps {
  currency: Currency;
  initialPrincipal?: number;
  initialRate?: number;
  initialTenureYears?: number;
  onAskAi: (prompt: string, context: any) => void;
}

export const EmiCalculatorModule: React.FC<EmiCalculatorProps> = ({
  currency,
  initialPrincipal = 3500000,
  initialRate = 8.5,
  initialTenureYears = 20,
  onAskAi,
}) => {
  const [principal, setPrincipal] = useState<number>(initialPrincipal);
  const [annualRate, setAnnualRate] = useState<number>(initialRate);
  const [tenureYears, setTenureYears] = useState<number>(initialTenureYears);

  // Prepayment simulation state
  const [enablePrepayment, setEnablePrepayment] = useState<boolean>(false);
  const [prepayAmount, setPrepayAmount] = useState<number>(200000);
  const [prepayMonth, setPrepayMonth] = useState<number>(12);

  // View state for schedule
  const [scheduleView, setScheduleView] = useState<'yearly' | 'monthly'>('yearly');
  const [searchYear, setSearchYear] = useState<string>('');

  const tenureMonths = tenureYears * 12;

  // Real-time calculation
  const emiResult: EmiCalculationResult = useMemo(() => {
    return calculateEmi(
      principal,
      annualRate,
      tenureMonths,
      enablePrepayment ? prepayAmount : 0,
      prepayMonth
    );
  }, [principal, annualRate, tenureMonths, enablePrepayment, prepayAmount, prepayMonth]);

  // Aggregate yearly amortization
  const yearlySchedule = useMemo(() => {
    const yearsMap = new Map<number, {
      year: number;
      principalPayment: number;
      interestPayment: number;
      totalPayment: number;
      closingBalance: number;
    }>();

    emiResult.amortizationSchedule.forEach((row) => {
      const existing = yearsMap.get(row.year) || {
        year: row.year,
        principalPayment: 0,
        interestPayment: 0,
        totalPayment: 0,
        closingBalance: row.balanceRemaining,
      };

      existing.principalPayment += row.principalPayment;
      existing.interestPayment += row.interestPayment;
      existing.totalPayment += row.totalPayment;
      existing.closingBalance = row.balanceRemaining;
      yearsMap.set(row.year, existing);
    });

    return Array.from(yearsMap.values());
  }, [emiResult.amortizationSchedule]);

  // Export Amortization Table to CSV
  const exportAmortizationCsv = () => {
    let csv = 'Month,Year,Principal Payment,Interest Payment,Total EMI Payment,Remaining Balance,Loan Paid %\n';
    emiResult.amortizationSchedule.forEach((r) => {
      csv += `${r.month},${r.year},${r.principalPayment},${r.interestPayment},${r.totalPayment},${r.balanceRemaining},${r.loanPaidPercent}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Amortization_Schedule_${principal}_${annualRate}pct.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Percentage calculations for visual bar
  const principalShare = emiResult.totalAmount > 0
    ? (principal / emiResult.totalAmount) * 100
    : 50;
  const interestShare = 100 - principalShare;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Module 3
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Real-Time EMI & Amortization Engine
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Exact compound interest amortization with prepayment reduction simulator and downloadable schedule.
          </p>
        </div>

        <button
          onClick={exportAmortizationCsv}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export Amortization (.CSV)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
            <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4" /> Loan Parameters
            </h2>

            {/* Principal Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Principal Loan Amount</label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400">{currency === 'INR' ? '₹' : '$'}</span>
                  <input
                    type="number"
                    step="50000"
                    value={principal}
                    onChange={(e) => setPrincipal(Math.max(1000, Number(e.target.value)))}
                    className="w-32 px-2 py-1 rounded-lg text-xs font-mono font-bold text-cyan-300 glass-input text-right"
                  />
                </div>
              </div>
              <input
                type="range"
                min="50000"
                max="20000000"
                step="50000"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{formatCurrency(50000, currency)}</span>
                <span>{formatCurrency(10000000, currency)}</span>
                <span>{formatCurrency(20000000, currency)}</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Annual Interest Rate (% p.a.)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="30"
                    value={annualRate}
                    onChange={(e) => setAnnualRate(Math.max(0.1, Number(e.target.value)))}
                    className="w-20 px-2 py-1 rounded-lg text-xs font-mono font-bold text-cyan-300 glass-input text-right"
                  />
                  <span className="text-xs text-slate-400">%</span>
                </div>
              </div>
              <input
                type="range"
                min="5"
                max="22"
                step="0.1"
                value={annualRate}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>5.0%</span>
                <span>12.0%</span>
                <span>22.0%</span>
              </div>
            </div>

            {/* Tenure */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Loan Tenure</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="35"
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Math.max(1, Number(e.target.value)))}
                    className="w-16 px-2 py-1 rounded-lg text-xs font-mono font-bold text-cyan-300 glass-input text-right"
                  />
                  <span className="text-xs text-slate-400">Yrs</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 Yr (12m)</span>
                <span>15 Yrs (180m)</span>
                <span>30 Yrs (360m)</span>
              </div>
            </div>

            {/* Prepayment Simulator Toggle */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  Prepayment Savings Simulator
                </span>
                <input
                  type="checkbox"
                  checked={enablePrepayment}
                  onChange={(e) => setEnablePrepayment(e.target.checked)}
                  className="accent-cyan-400 cursor-pointer"
                />
              </label>

              {enablePrepayment && (
                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Lump Sum Prepayment Amount ({currency === 'INR' ? '₹' : '$'})
                    </label>
                    <input
                      type="number"
                      step="10000"
                      value={prepayAmount}
                      onChange={(e) => setPrepayAmount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg glass-input font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Prepayment at Month #{prepayMonth} (Year {(prepayMonth / 12).toFixed(1)})
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={tenureMonths - 1}
                      value={prepayMonth}
                      onChange={(e) => setPrepayMonth(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg glass-input font-mono"
                    />
                  </div>

                  {emiResult.prepaymentAnalysis && (
                    <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Total Interest Saved:</span>
                        <span>{formatCurrency(emiResult.prepaymentAnalysis.interestSaved, currency)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-emerald-400/90">
                        <span>Tenure Reduced by:</span>
                        <span>
                          {emiResult.prepaymentAnalysis.tenureReducedMonths} Months (
                          {(emiResult.prepaymentAnalysis.tenureReducedMonths / 12).toFixed(1)} Yrs)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Results, Visual Distribution, and Amortization (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Key Figures */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-blue-950/40 border border-cyan-500/30">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                  Monthly Installment (EMI)
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono tracking-tight">
                  {formatExactCurrency(emiResult.monthlyEmi, currency)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Per calendar month</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                  Total Interest Charged
                </span>
                <span className="text-xl sm:text-2xl font-bold text-amber-400 font-mono tracking-tight">
                  {formatExactCurrency(emiResult.totalInterest, currency)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {emiResult.interestToPrincipalRatio}% of principal
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                  Total Repayment (P + I)
                </span>
                <span className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
                  {formatExactCurrency(emiResult.totalAmount, currency)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Over {tenureYears} years</span>
              </div>
            </div>

            {/* Principal vs Interest Visual Distribution Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block"></span>
                  Principal Loan: {principalShare.toFixed(1)}% ({formatCurrency(principal, currency)})
                </span>
                <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block"></span>
                  Interest Outlay: {interestShare.toFixed(1)}% ({formatCurrency(emiResult.totalInterest, currency)})
                </span>
              </div>

              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${principalShare}%` }}
                ></div>
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${interestShare}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Amortization Schedule Table */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Amortization Repayment Schedule
                </h3>
              </div>

              {/* View Switcher: Yearly vs Monthly */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-white/5 text-xs">
                <button
                  onClick={() => setScheduleView('yearly')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    scheduleView === 'yearly'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Yearly Summary
                </button>
                <button
                  onClick={() => setScheduleView('monthly')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    scheduleView === 'monthly'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Monthly Detail
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto max-h-80 border border-white/5 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-md text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-3">{scheduleView === 'yearly' ? 'Year' : 'Month'}</th>
                    <th className="py-2.5 px-3">Principal</th>
                    <th className="py-2.5 px-3">Interest</th>
                    <th className="py-2.5 px-3">Total Installment</th>
                    <th className="py-2.5 px-3">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-slate-300">
                  {scheduleView === 'yearly'
                    ? yearlySchedule.map((row) => (
                        <tr key={row.year} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2 px-3 font-bold text-cyan-400">Year {row.year}</td>
                          <td className="py-2 px-3 text-emerald-400">
                            {formatExactCurrency(row.principalPayment, currency)}
                          </td>
                          <td className="py-2 px-3 text-amber-400">
                            {formatExactCurrency(row.interestPayment, currency)}
                          </td>
                          <td className="py-2 px-3 text-white">
                            {formatExactCurrency(row.totalPayment, currency)}
                          </td>
                          <td className="py-2 px-3 text-slate-400">
                            {formatExactCurrency(row.closingBalance, currency)}
                          </td>
                        </tr>
                      ))
                    : emiResult.amortizationSchedule.slice(0, 72).map((row) => (
                        <tr key={row.month} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-1.5 px-3 font-semibold text-cyan-400">M {row.month}</td>
                          <td className="py-1.5 px-3 text-emerald-400">
                            {formatExactCurrency(row.principalPayment, currency)}
                          </td>
                          <td className="py-1.5 px-3 text-amber-400">
                            {formatExactCurrency(row.interestPayment, currency)}
                          </td>
                          <td className="py-1.5 px-3 text-white">
                            {formatExactCurrency(row.totalPayment, currency)}
                          </td>
                          <td className="py-1.5 px-3 text-slate-400">
                            {formatExactCurrency(row.balanceRemaining, currency)}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            {scheduleView === 'monthly' && emiResult.amortizationSchedule.length > 72 && (
              <p className="text-[11px] text-slate-500 text-center italic">
                Showing first 72 months. Download the complete .CSV export for full 360-month lifecycle.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
