import React, { useState, useEffect } from 'react';
import { Clock, Play, CheckCircle2, Bell, AlertCircle, Plus } from 'lucide-react';

export const RoutinesView: React.FC = () => {
  const [routines, setRoutines] = useState<any[]>([]);

  const loadRoutines = async () => {
    try {
      const items = await window.electronAPI.getRoutines();
      setRoutines(items);
    } catch {}
  };

  useEffect(() => {
    loadRoutines();
  }, []);

  const handleToggle = async (id: string, current: number) => {
    await window.electronAPI.toggleRoutine(id, current !== 1);
    loadRoutines();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070a0f] text-slate-100 overflow-y-auto p-8 select-none font-sans">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Clock size={14} /> Background Automations
          </div>
          <h1 className="text-3xl font-bold text-white mt-1">Autonomous Routines</h1>
          <p className="text-sm text-slate-400 mt-1 leading-relaxed">
            Background tasks that execute proactively without requiring manual prompts.
          </p>
        </div>

        {/* Heartbeat Status Box */}
        <div className="bg-[#0b101b] border border-cyan-500/20 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-base font-semibold text-white">30-Minute Heartbeat Runner</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ticks every 30 minutes · reviews calendar, background observations, and drafts summaries.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
            Live
          </span>
        </div>

        {/* Routines List */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Scheduled Tasks
          </div>

          {routines.map((routine) => (
            <div
              key={routine.id}
              className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">{routine.name}</h4>
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                    {routine.schedule}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{routine.description}</p>
              </div>

              <button
                onClick={() => handleToggle(routine.id, routine.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  routine.enabled === 1 ? 'bg-blue-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    routine.enabled === 1 ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
