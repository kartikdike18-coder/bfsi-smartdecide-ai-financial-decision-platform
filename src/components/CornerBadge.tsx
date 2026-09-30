import React, { useState } from 'react';
import { Award, ShieldCheck, Sparkles, User, ExternalLink, X, Code2 } from 'lucide-react';

export const CornerBadge: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Top-Right Corner Floating Glassmorphism Badge */}
      <aside 
        aria-label="Developer Information"
        className="fixed top-3 right-3 z-50 flex items-center gap-2"
      >
        <button
          onClick={() => setShowModal(true)}
          className="group relative flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-xl border border-cyan-500/30 hover:border-cyan-400 shadow-[0_4px_25px_rgba(6,182,212,0.25)] transition-all duration-300 hover:scale-105 cursor-pointer text-left"
          title="Engineered by Yogesh Dike - Click for Developer Profile"
        >
          {/* Animated pulsing dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>

          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none">
              Architect & Lead Dev
            </span>
            <span className="text-xs font-bold tracking-wide bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent group-hover:text-cyan-200 transition-colors">
              YOGESH DIKE
            </span>
          </div>

          <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 ml-1">
            <Award className="w-3 h-3" />
          </div>
        </button>
      </aside>

      {/* Developer Profile Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md glass-card rounded-2xl p-6 border border-cyan-500/30 shadow-[0_20px_50px_rgba(6,182,212,0.3)]">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                <Code2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Lead Architect
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    FinTech Specialist
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white mt-0.5">Yogesh Dike</h3>
                <p className="text-xs text-slate-400">Chief BFSI System Engineer</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4 bg-slate-900/60 p-3 rounded-xl border border-white/5">
              Architected the BFSI SmartDecide AI engine combining institutional lending underwriting algorithms (FOIR/DTI), bureau credit models, real-time amortization mathematics, and Generative AI advisory integration with dynamic Google Sheets persistence.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs mb-5">
              <div className="p-2.5 rounded-lg bg-slate-800/50 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Underwriting Engine</span>
                <span className="font-semibold text-cyan-300">FOIR & DTI Algorithm</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/50 border border-white/5">
                <span className="text-slate-400 block text-[10px]">AI Integration</span>
                <span className="font-semibold text-emerald-300">Claude & Gemini 3.8</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/50 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Data Cloud</span>
                <span className="font-semibold text-blue-300">Google Sheets Direct Sync</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/50 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Security Standard</span>
                <span className="font-semibold text-purple-300">Zero-Log Client Shield</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified BFSI Platform
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
