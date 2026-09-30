import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Key,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  TrendingUp,
  Cpu,
  Copy,
  Check,
  Flame,
  Lightbulb,
} from 'lucide-react';
import { AiChatMessage, Currency } from '../types/bfsi';

interface AiFinancialAdvisorProps {
  currency: Currency;
  initialPrompt?: string;
  initialContext?: any;
  onClearInitialPrompt?: () => void;
}

export const AiFinancialAdvisorModule: React.FC<AiFinancialAdvisorProps> = ({
  currency,
  initialPrompt,
  initialContext,
  onClearInitialPrompt,
}) => {
  const [provider, setProvider] = useState<'gemini' | 'claude' | 'auto'>('gemini');
  const [claudeApiKey, setClaudeApiKey] = useState<string>(() => {
    return localStorage.getItem('bfsi_claude_api_key') || '';
  });
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `### Welcome to BFSI SmartDecide AI Advisory
I am your institutional Banking, Credit & Wealth Risk Advisor engineered by **Yogesh Dike**.

I can evaluate:
- **Debt Service Capacity & FOIR optimization**
- **CIBIL / Experian Credit Score rehabilitation plans**
- **Home Loan tax shielding (Sec 24b & Sec 80C)**
- **Amortization & prepayment vs investment arbitration**

Select a preset question below or ask any financial scenario!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle passed-in prompt from other modules (e.g. Loan Eligibility or Credit Analyzer)
  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt, initialContext);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSaveClaudeKey = (key: string) => {
    setClaudeApiKey(key);
    localStorage.setItem('bfsi_claude_api_key', key);
  };

  const handleSendMessage = async (textToSend?: string, contextOverride?: any) => {
    const text = textToSend || inputQuery;
    if (!text.trim() || loading) return;

    const userMsg: AiChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          userPrompt: text,
          financialContext: contextOverride || initialContext || { currency },
          claudeApiKey: provider === 'claude' ? claudeApiKey : undefined,
        }),
      });

      const data = await response.json();
      const aiContent = data.text || 'Unable to generate recommendation at this moment.';

      const aiMsg: AiChatMessage = {
        id: 'msg-ai-' + Date.now(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tags: [data.provider || provider],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: AiChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        content: `**Notice:** Unable to connect to AI engine (${err.message}). Using institutional BFSI underwriting guidelines:
- Ensure FOIR does not exceed 50%
- Maintain credit card balance under 30% limit
- Keep 6 months emergency funds prior to expanding borrowing.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const presetQueries = [
    'How do I reduce my FOIR from 58% to under 45%?',
    'Strategies to elevate credit score from 680 to 800+ in 180 days',
    'Prepay home loan vs Invest surplus in Mutual Funds / S&P?',
    'Explain tax deductions on Home Loan (Section 24b vs 80C)',
    'Should I choose a floating or fixed interest rate in the current cycle?',
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Module 4
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              AI Financial Advisor & Strategic Guidance
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generative underwriting insights powered by Google Gemini 3.8 & Anthropic Claude architecture.
          </p>
        </div>

        {/* Model Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-white/10 text-xs">
            <button
              onClick={() => setProvider('gemini')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                provider === 'gemini'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gemini 3.8</span>
            </button>

            <button
              onClick={() => {
                setProvider('claude');
                setShowKeyInput(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                provider === 'claude'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Anthropic Claude</span>
            </button>
          </div>

          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
            title="Configure Custom Anthropic Claude API Key"
          >
            <Key className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Claude API Key config drawer if open */}
      {showKeyInput && (
        <div className="glass-card rounded-2xl p-4 border border-amber-500/30 bg-amber-950/15 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> Anthropic Claude API Configuration
            </span>
            <span className="text-[11px] text-slate-400">Stored locally in your browser</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={claudeApiKey}
              onChange={(e) => handleSaveClaudeKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="flex-1 px-3 py-1.5 text-xs rounded-xl glass-input font-mono"
            />
            <button
              onClick={() => setShowKeyInput(false)}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-colors"
            >
              Save Key
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
            When set, queries routed to Claude will invoke your Anthropic key. Default Gemini 3.8 and institutional BFSI models are always active!
          </p>
        </div>
      )}

      {/* Preset Query Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 whitespace-nowrap">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Quick Topics:
        </span>
        {presetQueries.map((pq, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(pq)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/70 hover:bg-cyan-950/50 border border-white/5 hover:border-cyan-500/30 text-xs text-slate-300 hover:text-cyan-200 whitespace-nowrap transition-all cursor-pointer"
          >
            {pq}
          </button>
        ))}
      </div>

      {/* Chat Thread Container */}
      <div className="glass-card rounded-2xl border border-white/10 flex flex-col h-[520px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white'
                    : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                }`}
              >
                {msg.role === 'user' ? <span className="text-xs font-bold">You</span> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border relative group ${
                  msg.role === 'user'
                    ? 'bg-cyan-600/20 border-cyan-500/30 text-white rounded-tr-none'
                    : 'bg-slate-900/80 border-white/10 text-slate-200 rounded-tl-none'
                }`}
              >
                {/* Copy button for assistant responses */}
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-white bg-slate-800/60 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}

                <div className="whitespace-pre-wrap font-sans space-y-2">
                  {msg.content}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-white/5">
                  <span>{msg.timestamp}</span>
                  {msg.tags && (
                    <span className="uppercase text-[9px] font-semibold text-cyan-400/80">
                      Engine: {msg.tags.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-lg mr-auto">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-slate-900/80 border border-white/10 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="text-xs text-slate-300 font-medium">
                  Formulating institutional financial analysis...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950/70 border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything: 'How to optimize debt?', 'Home loan balance transfer viability', 'FOIR formula'..."
              className="flex-1 px-4 py-3 rounded-xl text-xs sm:text-sm glass-input"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-4 sm:px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <span>Ask AI</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
            <span>Powered by Gemini 3.8 Flash & Anthropic Claude SDK</span>
            <span>Architect: Yogesh Dike</span>
          </div>
        </div>
      </div>
    </div>
  );
};
