import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
  Save,
  ArrowRight,
  TrendingUp,
  Percent,
  DollarSign,
  User,
  Briefcase,
  Calendar,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  Currency,
  EmploymentType,
  FinancialRecord,
  LoanApplication,
  LoanEligibilityResult,
  LoanType,
} from '../types/bfsi';
import {
  evaluateLoanEligibility,
  formatCurrency,
  formatExactCurrency,
  getBenchmarkInterestRate,
} from '../utils/bfsiCalculators';

interface LoanEligibilityModuleProps {
  currency: Currency;
  onSaveRecord: (record: FinancialRecord) => void;
  onNavigateToEmi: (principal: number, rate: number, tenureYears: number) => void;
  onAskAi: (prompt: string, context: any) => void;
}

export const LoanEligibilityModule: React.FC<LoanEligibilityModuleProps> = ({
  currency,
  onSaveRecord,
  onNavigateToEmi,
  onAskAi,
}) => {
  // Form State
  const [formData, setFormData] = useState<LoanApplication>({
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    age: 32,
    employmentType: 'salaried',
    workExperienceYears: 6,
    monthlyIncome: 85000,
    existingEmi: 15000,
    otherMonthlyExpenses: 22000,
    creditScore: 765,
    loanType: 'home',
    requestedAmount: 3500000,
    tenureYears: 20,
    expectedInterestRate: 8.4,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Auto-update interest rate when loan type or credit score changes if user hasn't overridden
  const handleLoanTypeChange = (type: LoanType) => {
    const defaultRate = getBenchmarkInterestRate(type, formData.creditScore);
    setFormData((prev) => ({
      ...prev,
      loanType: type,
      expectedInterestRate: defaultRate,
    }));
  };

  // Comprehensive Form Validation
  const validateField = (name: keyof LoanApplication, value: any): string => {
    switch (name) {
      case 'fullName':
        if (!value || value.trim().length < 3) return 'Full legal name must be at least 3 characters.';
        return '';
      case 'email':
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please provide a valid corporate or personal email.';
        return '';
      case 'phone':
        if (!value || value.trim().length < 8) return 'Enter a valid telephone/mobile contact number.';
        return '';
      case 'age':
        if (value < 18 || value > 75) return 'Applicant age must be between 18 and 75 years.';
        return '';
      case 'monthlyIncome':
        if (value <= 0) return 'Monthly net income must be greater than zero.';
        return '';
      case 'requestedAmount':
        if (value <= 0) return 'Requested loan amount must be positive.';
        return '';
      case 'tenureYears':
        if (value < 1 || value > 35) return 'Tenure must be between 1 and 35 years.';
        return '';
      case 'creditScore':
        if (value < 300 || value > 900) return 'CIBIL / Credit bureau score must range between 300 and 900.';
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (field: keyof LoanApplication, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const errorMsg = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  // Live real-time calculation
  const result: LoanEligibilityResult = useMemo(() => {
    return evaluateLoanEligibility(formData);
  }, [formData]);

  const handleSaveToRecords = () => {
    // Validate all fields
    const newErrors: Record<string, string> = {};
    (Object.keys(formData) as (keyof LoanApplication)[]).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newRecord: FinancialRecord = {
      id: 'REC-' + Date.now().toString().slice(-6),
      timestamp: new Date().toISOString(),
      applicantName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      loanType: formData.loanType,
      requestedAmount: formData.requestedAmount,
      monthlyIncome: formData.monthlyIncome,
      creditScore: formData.creditScore,
      maxEligibleLoan: result.maxEligibleLoan,
      foir: result.foir,
      status: result.approvalProbability >= 75 ? 'Approved' : result.approvalProbability >= 55 ? 'Conditional' : 'Rejected',
      notes: `${result.riskCategory} Risk Underwriting • Projected EMI ${formatCurrency(result.actualEmi, currency)}`,
      syncedToGoogleSheets: false,
    };

    onSaveRecord(newRecord);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Quick preset loader
  const loadScenario = (type: 'prime' | 'highDebt' | 'subprime') => {
    if (type === 'prime') {
      setFormData({
        fullName: 'Dr. Ananya Iyer',
        email: 'ananya.iyer@healthcorp.in',
        phone: '+91 99201 11223',
        age: 34,
        employmentType: 'professional',
        workExperienceYears: 9,
        monthlyIncome: 180000,
        existingEmi: 20000,
        otherMonthlyExpenses: 35000,
        creditScore: 815,
        loanType: 'home',
        requestedAmount: 6000000,
        tenureYears: 20,
        expectedInterestRate: 8.25,
      });
    } else if (type === 'highDebt') {
      setFormData({
        fullName: 'Vikram Malhotra',
        email: 'vikram.m@techstart.io',
        phone: '+91 98112 33445',
        age: 29,
        employmentType: 'salaried',
        workExperienceYears: 3,
        monthlyIncome: 65000,
        existingEmi: 28000,
        otherMonthlyExpenses: 20000,
        creditScore: 685,
        loanType: 'personal',
        requestedAmount: 800000,
        tenureYears: 5,
        expectedInterestRate: 12.5,
      });
    } else {
      setFormData({
        fullName: 'Sanjay Deshmukh',
        email: 'sanjay.desh@traders.com',
        phone: '+91 97665 44332',
        age: 46,
        employmentType: 'business_owner',
        workExperienceYears: 12,
        monthlyIncome: 120000,
        existingEmi: 65000,
        otherMonthlyExpenses: 35000,
        creditScore: 590,
        loanType: 'business',
        requestedAmount: 3000000,
        tenureYears: 7,
        expectedInterestRate: 14.0,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Scenarios */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Module 1
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Institutional Loan Eligibility Prediction
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time multi-factor underwriting evaluating FOIR (Debt Burden), Bureau Score, Age Horizon, and Disposable Surplus.
          </p>
        </div>

        {/* Demo Scenarios */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium hidden sm:inline">Load Sample:</span>
          <button
            onClick={() => loadScenario('prime')}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium transition-colors"
          >
            Prime Home Loan
          </button>
          <button
            onClick={() => loadScenario('highDebt')}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium transition-colors"
          >
            High FOIR Scenario
          </button>
          <button
            onClick={() => loadScenario('subprime')}
            className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium transition-colors"
          >
            Subprime Case
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 7 Columns */}
        <div className="lg:col-span-7 space-y-5">
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-5">
            <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" /> 1. Applicant Profile & Demographics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm glass-input ${
                    errors.fullName ? 'border-rose-500 focus:border-rose-400' : ''
                  }`}
                />
                {errors.fullName && <span className="text-[11px] text-rose-400 mt-1 block">{errors.fullName}</span>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="applicant@domain.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm glass-input ${
                    errors.email ? 'border-rose-500 focus:border-rose-400' : ''
                  }`}
                />
                {errors.email && <span className="text-[11px] text-rose-400 mt-1 block">{errors.email}</span>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone / Mobile</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm glass-input ${
                    errors.phone ? 'border-rose-500 focus:border-rose-400' : ''
                  }`}
                />
                {errors.phone && <span className="text-[11px] text-rose-400 mt-1 block">{errors.phone}</span>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    min="18"
                    max="75"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm glass-input"
                  />
                  {errors.age && <span className="text-[10px] text-rose-400 block mt-0.5">{errors.age}</span>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Exp. (Yrs)</label>
                  <input
                    type="number"
                    min="0"
                    max="45"
                    value={formData.workExperienceYears}
                    onChange={(e) => handleInputChange('workExperienceYears', Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm glass-input"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Employment Classification</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'salaried', label: 'Salaried' },
                    { id: 'self_employed', label: 'Self Employed' },
                    { id: 'business_owner', label: 'Business' },
                    { id: 'professional', label: 'Professional' },
                  ] as { id: EmploymentType; label: string }[]
                ).map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => handleInputChange('employmentType', emp.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium border transition-all text-center ${
                      formData.employmentType === emp.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                        : 'bg-slate-800/40 text-slate-400 border-white/5 hover:bg-slate-800'
                    }`}
                  >
                    {emp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Income & Obligations */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> 2. Cash Flow & Monthly Obligations
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Monthly Net Income ({currency === 'INR' ? '₹' : '$'})
                </label>
                <input
                  type="number"
                  step="5000"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm glass-input font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {formatCurrency(formData.monthlyIncome, currency)} / mo
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Existing Monthly EMIs ({currency === 'INR' ? '₹' : '$'})
                </label>
                <input
                  type="number"
                  step="1000"
                  value={formData.existingEmi}
                  onChange={(e) => handleInputChange('existingEmi', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm glass-input font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {formatCurrency(formData.existingEmi, currency)} / mo
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Living Expenses ({currency === 'INR' ? '₹' : '$'})
                </label>
                <input
                  type="number"
                  step="1000"
                  value={formData.otherMonthlyExpenses}
                  onChange={(e) => handleInputChange('otherMonthlyExpenses', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm glass-input font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {formatCurrency(formData.otherMonthlyExpenses, currency)} / mo
                </span>
              </div>
            </div>

            {/* Credit Score Slider */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  CIBIL / Experian Credit Score
                </label>
                <span
                  className={`text-sm font-bold font-mono px-2.5 py-0.5 rounded-md ${
                    formData.creditScore >= 750
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : formData.creditScore >= 650
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {formData.creditScore}
                </span>
              </div>
              <input
                type="range"
                min="300"
                max="900"
                step="5"
                value={formData.creditScore}
                onChange={(e) => handleInputChange('creditScore', Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>300 (Poor)</span>
                <span>650 (Fair)</span>
                <span>750 (Prime)</span>
                <span>900 (Excellent)</span>
              </div>
            </div>
          </div>

          {/* Requested Loan Terms */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> 3. Loan Requirements & Terms
            </h2>

            {/* Loan Type Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(
                [
                  { id: 'home', label: 'Home Loan' },
                  { id: 'personal', label: 'Personal' },
                  { id: 'auto', label: 'Auto Loan' },
                  { id: 'business', label: 'Business' },
                  { id: 'education', label: 'Education' },
                ] as { id: LoanType; label: string }[]
              ).map((lt) => (
                <button
                  key={lt.id}
                  type="button"
                  onClick={() => handleLoanTypeChange(lt.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    formData.loanType === lt.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                      : 'bg-slate-800/40 text-slate-400 border-white/5 hover:bg-slate-800'
                  }`}
                >
                  {lt.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Requested Amount ({currency === 'INR' ? '₹' : '$'})
                </label>
                <input
                  type="number"
                  step="50000"
                  value={formData.requestedAmount}
                  onChange={(e) => handleInputChange('requestedAmount', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm glass-input font-mono"
                />
                <span className="text-[11px] text-cyan-400 font-semibold mt-1 block">
                  {formatCurrency(formData.requestedAmount, currency)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tenure (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="35"
                  value={formData.tenureYears}
                  onChange={(e) => handleInputChange('tenureYears', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm glass-input font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {formData.tenureYears * 12} Months
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Interest Rate (% p.a.)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="4"
                  max="30"
                  value={formData.expectedInterestRate}
                  onChange={(e) => handleInputChange('expectedInterestRate', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm glass-input font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Bureau Tier rate
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Decision & Underwriting Dashboard (5 Columns) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Decision Card */}
          <div
            className={`glass-card rounded-2xl p-6 border transition-all ${
              result.isEligible
                ? 'border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.2)]'
                : 'border-rose-500/40 shadow-[0_0_35px_rgba(244,63,94,0.2)]'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                {result.isEligible ? (
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {result.isEligible ? 'Loan Qualified' : 'Risk Threshold Exceeded'}
                  </h3>
                  <span
                    className={`text-xs font-semibold ${
                      result.riskCategory === 'Low'
                        ? 'text-emerald-400'
                        : result.riskCategory === 'Moderate'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {result.riskCategory} Risk Underwriting Profile
                  </span>
                </div>
              </div>

              {/* Approval Probability Badge */}
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Probability
                </span>
                <span
                  className={`text-2xl font-extrabold font-mono ${
                    result.approvalProbability >= 70
                      ? 'text-emerald-400'
                      : result.approvalProbability >= 50
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {result.approvalProbability}%
                </span>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-[11px] text-slate-400 block mb-0.5">Max Borrowing Capacity</span>
                <span className="text-base sm:text-lg font-bold text-cyan-300 font-mono">
                  {formatCurrency(result.maxEligibleLoan, currency)}
                </span>
                <span className="text-[10px] text-slate-500 block">Based on 50% FOIR cap</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-[11px] text-slate-400 block mb-0.5">Estimated Monthly EMI</span>
                <span className="text-base sm:text-lg font-bold text-white font-mono">
                  {formatExactCurrency(result.actualEmi, currency)}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  @ {result.interestRateOffered}% for {formData.tenureYears} yrs
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-[11px] text-slate-400 block mb-0.5">Projected FOIR</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-base font-bold font-mono ${
                      result.foir <= 50 ? 'text-emerald-400' : result.foir <= 60 ? 'text-amber-400' : 'text-rose-400'
                    }`}
                  >
                    {result.foir}%
                  </span>
                  <span className="text-[10px] text-slate-500">(Target ≤ 50%)</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      result.foir <= 50 ? 'bg-emerald-400' : result.foir <= 60 ? 'bg-amber-400' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, result.foir)}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-[11px] text-slate-400 block mb-0.5">Disposable Cash Surplus</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {formatExactCurrency(result.disposableIncome, currency)}
                </span>
                <span className="text-[10px] text-slate-500 block">Net post all outflows</span>
              </div>
            </div>

            {/* Strengths & Risk Factors */}
            <div className="space-y-3 pt-2 text-xs">
              {result.keyStrengths.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                  </span>
                  <ul className="space-y-1">
                    {result.keyStrengths.map((s, idx) => (
                      <li key={idx} className="text-slate-300 flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.riskFactors.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Risk Factors
                  </span>
                  <ul className="space-y-1">
                    {result.riskFactors.map((r, idx) => (
                      <li key={idx} className="text-slate-300 flex items-start gap-1.5">
                        <span className="text-rose-400 mt-0.5">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations.length > 0 && (
                <div className="bg-cyan-950/40 p-3 rounded-xl border border-cyan-800/40">
                  <span className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1 mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Underwriter Recommendations
                  </span>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-cyan-100/80 flex items-start gap-1.5">
                        <span className="text-cyan-400 mt-0.5">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2 pt-4 mt-2 border-t border-white/10">
              <button
                onClick={handleSaveToRecords}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Saved to Records & Google Sheets Queue!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Application to Dynamic Records</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    onNavigateToEmi(formData.requestedAmount, formData.expectedInterestRate || 8.5, formData.tenureYears)
                  }
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition-colors cursor-pointer"
                >
                  <span>Amortize in EMI</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                </button>

                <button
                  onClick={() =>
                    onAskAi(
                      `Analyze loan eligibility for ${formData.fullName}: Requested ${formatCurrency(
                        formData.requestedAmount,
                        currency
                      )} ${formData.loanType} loan with monthly income ${formatCurrency(
                        formData.monthlyIncome,
                        currency
                      )}, existing EMI ${formatCurrency(
                        formData.existingEmi,
                        currency
                      )}, credit score ${formData.creditScore}. FOIR is ${result.foir}%. What specific restructuring do you recommend?`,
                      {
                        ...formData,
                        result,
                      }
                    )
                  }
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 text-xs font-medium border border-cyan-500/30 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI Advisor</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
