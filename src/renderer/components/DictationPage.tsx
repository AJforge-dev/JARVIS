import React from 'react';
import { Mic, Keyboard, Zap, Sparkles, ArrowLeft, Play } from 'lucide-react';

interface DictationPageProps {
  onBack: () => void;
  onTryIt: () => void;
}

export const DictationPage: React.FC<DictationPageProps> = ({ onBack, onTryIt }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#070a0f] text-slate-100 overflow-y-auto p-8 select-none font-sans">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
            Dictation Engine
          </span>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white">System-wide Voice Dictation</h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Transcribe and type directly into whatever application is currently focused (Slack, VS Code, Notes, Browser, or Terminal).
          </p>
        </div>

        <div className="bg-[#0b101b] border border-cyan-500/20 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold">
              Fn
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Hold Fn to Dictate</h3>
              <p className="text-xs text-slate-400">
                Release when you finish speaking. Text will paste directly into the focused cursor.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Trigger alternative: <span className="text-slate-200 font-mono bg-slate-800 px-2 py-0.5 rounded">Option key</span> or <span className="text-slate-200 font-mono bg-slate-800 px-2 py-0.5 rounded">Control key</span>
            </span>
            <button
              onClick={onTryIt}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold shadow-md transition-colors"
            >
              <Mic size={14} /> Test Dictation Now
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
              <Sparkles size={14} /> AI Auto-cleanup
            </div>
            <h4 className="text-sm font-semibold text-white mt-2">Punctuation & Formatting</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Dictations pass through intelligent processing to remove stutters, fix grammar, and capitalize accurately.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <Zap size={14} /> Multilingual Mode
            </div>
            <h4 className="text-sm font-semibold text-white mt-2">English & Tamil Support</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Auto-detects spoken English and Tamil with accent adaptation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
