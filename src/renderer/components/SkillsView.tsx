import React, { useState, useEffect } from 'react';
import { Star, Search, Plus, Sparkles, CheckCircle2, ExternalLink } from 'lucide-react';

export const SkillsView: React.FC = () => {
  const [skills, setSkills] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'builtin' | 'installed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.electronAPI.getSkills().then(list => {
      setSkills(list);
    }).catch(() => {});
  }, []);

  const filteredSkills = skills.filter(s => {
    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'builtin' && s.type === 'BUILTIN') ||
      (selectedFilter === 'installed' && s.type === 'INSTALLED');

    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070a0f] text-slate-100 overflow-y-auto p-8 select-none font-sans">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Star size={14} /> Skills Architecture
          </div>
          <h1 className="text-3xl font-bold text-white mt-1">What Jarvis Can Do</h1>
          <p className="text-sm text-slate-400 mt-1 leading-relaxed">
            Skills are markdown files in <span className="font-mono text-cyan-400">~/.jarvis/workspace/SKILLS/</span> with frontmatter. Drop one in, save, watch it light up. Hot-reloaded as you edit.
          </p>
        </div>

        {/* Status banner */}
        <div className="bg-[#0b101b] border border-cyan-500/20 rounded-2xl p-5 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-base">
              ⚡
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{skills.length} skills active</h3>
              <p className="text-xs text-slate-400">
                12 built-in · 3 from Marketplace / authored.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All {skills.length}
            </button>
            <button
              onClick={() => setSelectedFilter('installed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedFilter === 'installed' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Yours 3
            </button>
            <button
              onClick={() => setSelectedFilter('builtin')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedFilter === 'builtin' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Built-in 12
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active skills or tools..."
            className="w-full bg-[#0b101b] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
          />
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{skill.icon || '⚡'}</span>
                    <h4 className="text-sm font-semibold text-white font-mono">{skill.name}</h4>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded tracking-wider ${
                      skill.type === 'BUILTIN'
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    {skill.type}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                  {skill.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-mono">
                  <CheckCircle2 size={11} className="text-emerald-400" /> active
                </span>
                <span className="font-mono text-[10px]">~/.jarvis/workspace/SKILLS/{skill.id}.md</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
