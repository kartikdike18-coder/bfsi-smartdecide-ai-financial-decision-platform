import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CornerBadge } from './components/CornerBadge';
import { LoanEligibilityModule } from './components/LoanEligibilityModule';
import { CreditScoreAnalyzerModule } from './components/CreditScoreAnalyzerModule';
import { EmiCalculatorModule } from './components/EmiCalculatorModule';
import { AiFinancialAdvisorModule } from './components/AiFinancialAdvisorModule';
import { GoogleSheetsRecordsModule } from './components/GoogleSheetsRecordsModule';
import { ReportModal } from './components/ReportModal';
import { ArchitectureDocsModal } from './components/ArchitectureDocsModal';
import { Currency, FinancialRecord } from './types/bfsi';
import { ShieldCheck, Heart, Sparkles, Award } from 'lucide-react';

const INITIAL_RECORDS: FinancialRecord[] = [
  {
    id: 'REC-892101',
    timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    applicantName: 'Dr. Ananya Iyer',
    email: 'ananya.iyer@healthcorp.in',
    phone: '+91 99201 11223',
    loanType: 'home',
    requestedAmount: 6000000,
    monthlyIncome: 180000,
    creditScore: 815,
    maxEligibleLoan: 7800000,
    foir: 38.2,
    status: 'Approved',
    notes: 'Low Risk Underwriting • Projected EMI ₹51,100',
    syncedToGoogleSheets: true,
  },
  {
    id: 'REC-654923',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    applicantName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    loanType: 'home',
    requestedAmount: 3500000,
    monthlyIncome: 85000,
    creditScore: 765,
    maxEligibleLoan: 4200000,
    foir: 42.5,
    status: 'Approved',
    notes: 'Low Risk Underwriting • Projected EMI ₹30,140',
    syncedToGoogleSheets: false,
  },
  {
    id: 'REC-312984',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    applicantName: 'Vikram Malhotra',
    email: 'vikram.m@techstart.io',
    phone: '+91 98112 33445',
    loanType: 'personal',
    requestedAmount: 800000,
    monthlyIncome: 65000,
    creditScore: 685,
    maxEligibleLoan: 650000,
    foir: 58.4,
    status: 'Conditional',
    notes: 'Moderate Risk Underwriting • Exceeds 50% FOIR cap',
    syncedToGoogleSheets: false,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('loan');
  const [currency, setCurrency] = useState<Currency>('INR');

  // Persistence
  const [records, setRecords] = useState<FinancialRecord[]>(() => {
    try {
      const stored = localStorage.getItem('bfsi_records');
      return stored ? JSON.parse(stored) : INITIAL_RECORDS;
    } catch {
      return INITIAL_RECORDS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bfsi_records', JSON.stringify(records));
    } catch (e) {
      console.error('Failed to persist records:', e);
    }
  }, [records]);

  // Modal states
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [docsModalOpen, setDocsModalOpen] = useState<boolean>(false);

  // Cross-module states
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiContext, setAiContext] = useState<any>(null);

  const [emiParams, setEmiParams] = useState<{
    principal: number;
    rate: number;
    tenureYears: number;
  }>({
    principal: 3500000,
    rate: 8.5,
    tenureYears: 20,
  });

  const handleSaveRecord = (newRec: FinancialRecord) => {
    setRecords((prev) => [newRec, ...prev]);
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearAllRecords = () => {
    setRecords([]);
  };

  const handleNavigateToEmi = (principal: number, rate: number, tenureYears: number) => {
    setEmiParams({ principal, rate, tenureYears });
    setActiveTab('emi');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAskAi = (prompt: string, context: any) => {
    setAiPrompt(prompt);
    setAiContext(context);
    setActiveTab('ai');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Prominent Corner Developer Badge mentioning Yogesh Dike */}
      <CornerBadge />

      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-10 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="fixed top-1/2 right-10 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        onOpenReport={() => setReportModalOpen(true)}
        onOpenDocs={() => setDocsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'loan' && (
          <LoanEligibilityModule
            currency={currency}
            onSaveRecord={handleSaveRecord}
            onNavigateToEmi={handleNavigateToEmi}
            onAskAi={handleAskAi}
          />
        )}

        {activeTab === 'credit' && (
          <CreditScoreAnalyzerModule
            currency={currency}
            onAskAi={handleAskAi}
          />
        )}

        {activeTab === 'emi' && (
          <EmiCalculatorModule
            currency={currency}
            initialPrincipal={emiParams.principal}
            initialRate={emiParams.rate}
            initialTenureYears={emiParams.tenureYears}
            onAskAi={handleAskAi}
          />
        )}

        {activeTab === 'ai' && (
          <AiFinancialAdvisorModule
            currency={currency}
            initialPrompt={aiPrompt}
            initialContext={aiContext}
            onClearInitialPrompt={() => setAiPrompt('')}
          />
        )}

        {activeTab === 'sheets' && (
          <GoogleSheetsRecordsModule
            records={records}
            currency={currency}
            onDeleteRecord={handleDeleteRecord}
            onClearAll={handleClearAllRecords}
            onAddManualRecord={handleSaveRecord}
          />
        )}
      </main>

      {/* Modals */}
      {reportModalOpen && (
        <ReportModal
          onClose={() => setReportModalOpen(false)}
          currency={currency}
          latestRecord={records[0]}
        />
      )}

      {docsModalOpen && (
        <ArchitectureDocsModal onClose={() => setDocsModalOpen(false)} />
      )}

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-[#060a12]/80 backdrop-blur-md py-6 sm:py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="font-extrabold text-white tracking-tight">
              BFSI SmartDecide<span className="text-cyan-400">.AI</span>
            </span>
            <span>•</span>
            <span>Zero-Knowledge Underwriting</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Client Side Protection
            </span>
          </div>

          {/* Prominent Footer Credit to Yogesh Dike */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Architected & Engineered by</span>
            <span className="font-extrabold text-white bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              YOGESH DIKE
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} BFSI SmartDecide AI Platform • All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
