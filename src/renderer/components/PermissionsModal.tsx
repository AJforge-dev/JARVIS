import React from 'react';
import { ShieldCheck, Mic, Layout, Video, X } from 'lucide-react';

interface PermissionsModalProps {
  permissions: { microphone: string; accessibility: string; screenRecording: string };
  onOpenPreferences: (type: string) => void;
  onRefresh: () => void;
  onDismiss: () => void;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
  permissions,
  onOpenPreferences,
  onRefresh,
  onDismiss
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-[#0b101b] border border-cyan-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X size={16} />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
          <ShieldCheck size={24} />
        </div>

        <h3 className="text-lg font-semibold text-white">System Permissions</h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Jarvis requires macOS permissions to listen to voice commands, control apps, and capture the screen.
        </p>

        <div className="mt-5 space-y-3">
          <div className="p-3 rounded-xl bg-[#070a0f] border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Mic size={16} className="text-cyan-400" />
              <div>
                <div className="text-xs font-medium text-white">Microphone</div>
                <div className="text-[10px] text-slate-500">Dictation & Wake Word</div>
              </div>
            </div>
            <button
              onClick={() => onOpenPreferences('microphone')}
              className="text-xs text-cyan-400 hover:underline font-medium"
            >
              Open Settings
            </button>
          </div>

          <div className="p-3 rounded-xl bg-[#070a0f] border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Layout size={16} className="text-blue-400" />
              <div>
                <div className="text-xs font-medium text-white">Accessibility</div>
                <div className="text-[10px] text-slate-500">Global Typing & Control</div>
              </div>
            </div>
            <button
              onClick={() => onOpenPreferences('accessibility')}
              className="text-xs text-cyan-400 hover:underline font-medium"
            >
              Open Settings
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onDismiss}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
