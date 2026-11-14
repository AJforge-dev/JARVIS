import React, { useState, useEffect } from 'react';
import { Orb, OrbState } from './Orb';
import { Mic, X, ExternalLink } from 'lucide-react';

export const OverlayApp: React.FC = () => {
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    const cleanup = window.electronAPI.onOverlayStateUpdate((data) => {
      setOrbState(data.state as OrbState);
      if (data.transcript !== undefined) {
        setTranscript(data.transcript);
      }
    });
    return () => cleanup();
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-between px-4 py-2 bg-[#090d15]/95 border border-cyan-500/40 rounded-full shadow-2xl backdrop-blur-xl text-slate-100 titlebar-drag">
      <div className="flex items-center gap-3">
        <Orb state={orbState} size={42} />
        <div className="titlebar-nodrag">
          <div className="text-xs font-semibold text-white tracking-wide flex items-center gap-1.5">
            <span>Jarvis</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <div className="text-[11px] text-slate-400 truncate max-w-[240px]">
            {transcript || (orbState === 'listening' ? 'Listening...' : 'Standing by (⌥ Space)')}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 titlebar-nodrag">
        <button
          onClick={() => window.electronAPI.toggleMain()}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Open Dashboard"
        >
          <ExternalLink size={14} />
        </button>
        <button
          onClick={() => window.electronAPI.toggleOverlay()}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Close Overlay"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
