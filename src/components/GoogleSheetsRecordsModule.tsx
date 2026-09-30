import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Trash2,
  ExternalLink,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { Currency, FinancialRecord, GoogleSheetsConfig } from '../types/bfsi';
import { formatCurrency, formatExactCurrency } from '../utils/bfsiCalculators';

interface GoogleSheetsRecordsProps {
  records: FinancialRecord[];
  currency: Currency;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onAddManualRecord: (rec: FinancialRecord) => void;
}

export const GoogleSheetsRecordsModule: React.FC<GoogleSheetsRecordsProps> = ({
  records,
  currency,
  onDeleteRecord,
  onClearAll,
  onAddManualRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Webhook Sync state
  const [config, setConfig] = useState<GoogleSheetsConfig>(() => {
    const saved = localStorage.getItem('bfsi_sheets_config');
    return saved
      ? JSON.parse(saved)
      : {
          webhookUrl: '',
          sheetName: 'BFSI_Evaluations',
          autoSync: false,
        };
  });

  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const saveConfig = (newCfg: GoogleSheetsConfig) => {
    setConfig(newCfg);
    localStorage.setItem('bfsi_sheets_config', JSON.stringify(newCfg));
  };

  // Filtered records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.loanType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || r.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Export to Google Sheets (.csv)
  const exportToGoogleSheetsCsv = () => {
    if (records.length === 0) return;

    let csvContent = 'Record ID,Timestamp,Applicant Name,Email,Phone,Loan Type,Requested Amount,Monthly Income,Credit Score,Max Eligible Loan,FOIR (%),Status,Underwriting Notes\n';

    records.forEach((r) => {
      const row = [
        `"${r.id}"`,
        `"${new Date(r.timestamp).toLocaleString()}"`,
        `"${r.applicantName}"`,
        `"${r.email}"`,
        `"${r.phone}"`,
        `"${r.loanType.toUpperCase()}"`,
        r.requestedAmount,
        r.monthlyIncome,
        r.creditScore,
        r.maxEligibleLoan,
        r.foir,
        `"${r.status}"`,
        `"${r.notes.replace(/"/g, '""')}"`,
      ].join(',');
      csvContent += row + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BFSI_SmartDecide_Records_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sync to Live Google Sheets Webhook
  const handleSyncToSheets = async () => {
    if (!config.webhookUrl) {
      setSyncStatus({
        success: false,
        message: 'Please provide your Google Apps Script Webhook URL below.',
      });
      return;
    }

    setSyncing(true);
    setSyncStatus(null);

    try {
      const response = await fetch('/api/sheets-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: config.webhookUrl,
          records,
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        setSyncStatus({ success: true, message: 'Records securely synced to Google Sheets cloud!' });
        saveConfig({ ...config, lastSyncTime: new Date().toLocaleTimeString() });
      } else {
        setSyncStatus({ success: false, message: resData.error || 'Failed to sync with Google Sheets.' });
      }
    } catch (err: any) {
      setSyncStatus({ success: false, message: err.message });
    } finally {
      setSyncing(false);
    }
  };

  // Google Apps Script template for 1-click deployment
  const googleAppsScriptCode = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("BFSI_Evaluations") || ss.insertSheet("BFSI_Evaluations");
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Record ID", "Timestamp", "Applicant Name", "Email", "Phone",
        "Loan Type", "Requested Amount", "Monthly Income", "Credit Score",
        "Max Eligible Loan", "FOIR %", "Decision Status", "Underwriting Notes"
      ]);
      sheet.getRange(1, 1, 1, 13).setFontWeight("bold").setBackground("#0f172a").setFontColor("#38bdf8");
    }
    
    var records = data.records || [];
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      sheet.appendRow([
        r.id, r.timestamp, r.applicantName, r.email, r.phone,
        r.loanType, r.requestedAmount, r.monthlyIncome, r.creditScore,
        r.maxEligibleLoan, r.foir, r.status, r.notes
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", appended: records.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyScriptCode = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Module 5
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Google Sheets Cloud & Records Storage
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dynamic client-side persistence with one-click Google Sheets CSV export and live Webhook cloud synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSetupModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-medium transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Setup Instructions</span>
          </button>

          <button
            onClick={exportToGoogleSheetsCsv}
            disabled={records.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Google Sheets (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Google Sheets Webhook Connector Panel */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" /> Live Google Sheets Webhook Integration
            </h2>
            <p className="text-xs text-slate-400">
              Connect directly to your personal or organization's Google Sheet via Google Apps Script Webhook.
            </p>
          </div>

          {config.lastSyncTime && (
            <span className="text-[11px] text-emerald-400 font-mono">
              Last Synced: {config.lastSyncTime}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-8">
            <input
              type="url"
              value={config.webhookUrl}
              onChange={(e) => saveConfig({ ...config, webhookUrl: e.target.value })}
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono glass-input"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <button
              onClick={handleSyncToSheets}
              disabled={syncing || records.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
            >
              {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>{syncing ? 'Pushing Data...' : 'Sync to Sheet'}</span>
            </button>

            <button
              onClick={() => {
                if (records.length > 0 && window.confirm('Clear all local underwriting records?')) {
                  onClearAll();
                }
              }}
              disabled={records.length === 0}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-white/10 transition-colors"
              title="Clear all stored records"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {syncStatus && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              syncStatus.success
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
            }`}
          >
            {syncStatus.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{syncStatus.message}</span>
          </div>
        )}
      </div>

      {/* Records Table and Filter Toolbar */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search applicant, loan type, ID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs glass-input"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filter Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-200 text-xs focus:outline-none"
            >
              <option value="all">All Records ({records.length})</option>
              <option value="approved">Approved</option>
              <option value="conditional">Conditional</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-white/5 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-3">Applicant / ID</th>
                <th className="py-3 px-3">Loan Type</th>
                <th className="py-3 px-3">Requested</th>
                <th className="py-3 px-3">Monthly Inc.</th>
                <th className="py-3 px-3">Bureau Score</th>
                <th className="py-3 px-3">FOIR</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-slate-300">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-sans font-bold text-white">{r.applicantName}</div>
                      <div className="text-[10px] text-slate-400">{r.id} • {new Date(r.timestamp).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3 px-3 uppercase text-cyan-300 font-semibold font-sans">
                      {r.loanType}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {formatCurrency(r.requestedAmount, currency)}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {formatCurrency(r.monthlyIncome, currency)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          r.creditScore >= 750
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : r.creditScore >= 650
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {r.creditScore}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={r.foir <= 50 ? 'text-emerald-400' : 'text-amber-400'}>
                        {r.foir}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                          r.status === 'Approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : r.status === 'Conditional'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onDeleteRecord(r.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                    No financial records found. Generate an evaluation in the Loan Eligibility Checker to save!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Google Sheets Setup Instructions Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl glass-card rounded-2xl p-6 border border-cyan-500/30 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Connect Your Google Sheet in 60 Seconds
                </h3>
              </div>
              <button
                onClick={() => setShowSetupModal(false)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800 text-xs"
              >
                Close
              </button>
            </div>

            <ol className="space-y-3 text-xs text-slate-300 list-decimal pl-4">
              <li>
                Open <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold inline-flex items-center gap-0.5">sheets.new <ExternalLink className="w-3 h-3" /></a> to create a new Google Sheet.
              </li>
              <li>
                Click <strong className="text-white">Extensions → Apps Script</strong> in the top menu bar.
              </li>
              <li>
                Delete any template code and paste the following snippet:
              </li>
            </ol>

            {/* Code Block with Copy Button */}
            <div className="relative rounded-xl bg-slate-950 p-4 border border-white/10 font-mono text-xs text-cyan-200 overflow-x-auto max-h-56">
              <button
                onClick={copyScriptCode}
                className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-sans transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
              <pre>{googleAppsScriptCode}</pre>
            </div>

            <ol start={4} className="space-y-2 text-xs text-slate-300 list-decimal pl-4">
              <li>
                Click <strong className="text-white">Deploy → New deployment</strong>.
              </li>
              <li>
                Select type: <strong className="text-white">Web app</strong>. Under "Who has access", choose <strong className="text-cyan-300">Anyone</strong> (so the client webhook can append).
              </li>
              <li>
                Click <strong className="text-white">Deploy</strong>, copy the resulting Web App URL, and paste it into the Webhook field above!
              </li>
            </ol>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSetupModal(false)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
