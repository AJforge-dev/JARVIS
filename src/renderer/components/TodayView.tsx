import React from 'react';
import {
  Sparkles,
  Sun,
  Calendar,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Cpu,
  Clock,
  Zap,
  Play
} from 'lucide-react';

interface TodayViewProps {
  onSendMessage: (text: string) => void;
  onOpenConnect: () => void;
  onOpenPersonalize: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  onSendMessage,
  onOpenConnect,
  onOpenPersonalize
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#070a0f] text-slate-100 overflow-y-auto p-8 select-none font-sans">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Header Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Sun size={14} /> Today · Saturday, Nov 14
            </div>
            <h1 className="text-3xl font-bold text-white mt-1">Good afternoon, AK</h1>
            <p className="text-sm text-slate-400 mt-1">
              Your voice-first workspace is synchronized. Heartbeat runner is active.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSendMessage('give me my morning brief')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <Play size={12} fill="currentColor" /> Play Daily Brief
            </button>
          </div>
        </div>

        {/* Morning Brief Card */}
        <div className="bg-[#0b101b] border border-cyan-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Sparkles size={14} /> Morning Synthesis
          </div>
          <h3 className="text-lg font-semibold text-white mt-2">
            Systems Ready · Desktop Automation Standing By
          </h3>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            All 15 skills, 3 background routines, and local memory engines are running. Say <span className="text-cyan-400 font-mono">"Hey Jarvis"</span> or press <span className="text-slate-200 font-mono bg-slate-800 px-1.5 py-0.5 rounded text-xs">⌥ Space</span> anywhere to summon your assistant.
          </p>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><Clock size={13} className="text-cyan-400" /> Next heartbeat: in 12 min</span>
            <span className="flex items-center gap-1.5"><Cpu size={13} className="text-purple-400" /> Engine: Autonomous Local Core</span>
          </div>
        </div>

        {/* Quick Launch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => onSendMessage('open Google Chrome')}
            className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all hover:-translate-y-0.5 group shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm">
              ⚡
            </div>
            <h4 className="text-sm font-semibold text-white mt-3 group-hover:text-cyan-300 transition-colors">
              Launch Browser
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Open Google Chrome and manage active tabs.
            </p>
          </div>

          <div
            onClick={() => onSendMessage('write code for Raspberry Pi')}
            className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all hover:-translate-y-0.5 group shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
              💻
            </div>
            <h4 className="text-sm font-semibold text-white mt-3 group-hover:text-purple-300 transition-colors">
              Code & Scripts
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Write Python, Raspberry Pi GPIO, or automation tasks.
            </p>
          </div>

          <div
            onClick={() => onSendMessage('take screenshot')}
            className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all hover:-translate-y-0.5 group shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
              📸
            </div>
            <h4 className="text-sm font-semibold text-white mt-3 group-hover:text-amber-300 transition-colors">
              Screen Capture
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Capture current desktop screen for analysis.
            </p>
          </div>
        </div>

        {/* Workspace Preferences Quick Card */}
        <div className="p-6 rounded-2xl bg-[#0b101b] border border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white">Personalize Jarvis for AK</h4>
            <p className="text-xs text-slate-400 mt-1">
              Tailor speech style, default response length, and ground rules.
            </p>
          </div>
          <button
            onClick={onOpenPersonalize}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            Configure <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
