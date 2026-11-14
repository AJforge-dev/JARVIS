import React from 'react';
import {
  Home,
  CheckSquare,
  Mic,
  Brain,
  Clock,
  Star,
  Link2,
  Plus,
  Settings,
  Sliders,
  ShieldCheck,
  Activity
} from 'lucide-react';

export type MainNavTab =
  | 'talk'
  | 'today'
  | 'follow-ups'
  | 'dictation'
  | 'memory'
  | 'routines'
  | 'skills'
  | 'connections'
  | 'settings';

export type SettingsSubTab =
  | 'general'
  | 'your-jarvis'
  | 'ai-brain'
  | 'dictation'
  | 'voice'
  | 'writing'
  | 'memory'
  | 'automation'
  | 'diagnostics'
  | 'advanced';

interface SidebarProps {
  currentTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  settingsSubTab: SettingsSubTab;
  onSelectSettingsSubTab: (subTab: SettingsSubTab) => void;
  onNewThread: () => void;
  recentThreads: Array<{ id: string; title: string; time: string }>;
  activeThreadId: string;
  onSelectThread: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  settingsSubTab,
  onSelectSettingsSubTab,
  onNewThread,
  recentThreads,
  activeThreadId,
  onSelectThread
}) => {
  const isSettingsActive = currentTab === 'settings';

  const navItems = [
    { id: 'today' as MainNavTab, label: 'Today', icon: Home },
    { id: 'follow-ups' as MainNavTab, label: 'Follow-ups', icon: CheckSquare },
    { id: 'dictation' as MainNavTab, label: 'Dictation', icon: Mic },
    { id: 'memory' as MainNavTab, label: 'Memory', icon: Brain },
    { id: 'routines' as MainNavTab, label: 'Routines', icon: Clock },
    { id: 'skills' as MainNavTab, label: 'Skills', icon: Star },
    { id: 'connections' as MainNavTab, label: 'Connections', icon: Link2 }
  ];

  const settingsItems: Array<{ id: SettingsSubTab; label: string }> = [
    { id: 'general', label: 'General' },
    { id: 'your-jarvis', label: 'Your Jarvis' },
    { id: 'ai-brain', label: 'AI brain' },
    { id: 'dictation', label: 'Dictation' },
    { id: 'voice', label: 'Voice' },
    { id: 'writing', label: 'Writing' },
    { id: 'memory', label: 'Memory' },
    { id: 'automation', label: 'Automation' },
    { id: 'diagnostics', label: 'Diagnostics' },
    { id: 'advanced', label: 'Advanced' }
  ];

  return (
    <div className="flex h-full select-none text-[13px]">
      {/* Primary Left Navigation Bar */}
      <aside className="w-60 bg-[#070a0f] border-r border-[#151c27] flex flex-col justify-between p-3">
        <div className="flex flex-col gap-4">
          {/* Header Brand */}
          <div className="flex items-center gap-2.5 px-2 pt-1 pb-1">
            <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm" />
            </div>
            <span className="font-semibold text-white tracking-wide text-sm">Jarvis</span>
          </div>

          {/* Primary Action Button: "● Talk to Jarvis" */}
          <button
            onClick={() => onSelectTab('talk')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-medium text-white transition-all duration-200 shadow-md ${
              currentTab === 'talk'
                ? 'bg-blue-600 shadow-blue-600/30 ring-1 ring-blue-400/50'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Talk to Jarvis</span>
          </button>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg font-normal transition-all duration-150 text-left ${
                    isActive
                      ? 'bg-[#151c28] text-white font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f141f]'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-blue-400' : 'text-slate-500'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Recent Threads Section */}
          <div className="pt-2 border-t border-[#151c27]/80">
            <div className="flex items-center justify-between px-3 py-1 text-[11px] font-medium text-slate-500">
              <span>Recent threads · {recentThreads.length}</span>
              <button
                onClick={onNewThread}
                className="p-1 rounded hover:text-white hover:bg-[#151c28] transition-colors"
                title="New Thread"
              >
                <Plus size={12} />
              </button>
            </div>

            <div className="flex flex-col gap-0.5 mt-1 overflow-y-auto max-h-48 pr-1">
              {recentThreads.map((thread) => {
                const isActive = activeThreadId === thread.id && currentTab === 'talk';
                return (
                  <button
                    key={thread.id}
                    onClick={() => {
                      onSelectThread(thread.id);
                      onSelectTab('talk');
                    }}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-[12px] truncate text-left transition-colors ${
                      isActive
                        ? 'bg-[#151c28] text-white font-medium'
                        : 'text-slate-400 hover:text-slate-300 hover:bg-[#0f141f]'
                    }`}
                  >
                    <span className="truncate">{thread.title}</span>
                    <span className="text-[10px] text-slate-600 flex-shrink-0 ml-1">{thread.time}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="pt-2 border-t border-[#151c27]">
          <button
            onClick={() => onSelectTab('settings')}
            className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors ${
              isSettingsActive ? 'bg-[#151c28]' : 'hover:bg-[#0f141f]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center">
                AK
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white leading-none">AK</div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-none">Free plan</div>
              </div>
            </div>
            <Settings size={14} className={isSettingsActive ? 'text-blue-400' : 'text-slate-500'} />
          </button>
        </div>
      </aside>

      {/* Secondary Settings Sidebar (Rendered when in Settings view) */}
      {isSettingsActive && (
        <aside className="w-48 bg-[#090d14] border-r border-[#151c27] flex flex-col p-3 overflow-y-auto">
          <div className="px-3 pt-2 pb-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Settings
          </div>
          <nav className="flex flex-col gap-0.5">
            {settingsItems.map((item) => {
              const isActive = settingsSubTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSettingsSubTab(item.id)}
                  className={`flex items-center px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                    isActive
                      ? 'bg-[#151c28] text-white font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f141f]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>
      )}
    </div>
  );
};
