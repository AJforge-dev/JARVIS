import React, { useState, useEffect } from 'react';
import { Brain, Plus, Trash2, ShieldCheck, Sparkles, Folder } from 'lucide-react';

export const MemoryPage: React.FC = () => {
  const [facts, setFacts] = useState<any[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const loadFacts = async () => {
    try {
      const items = await window.electronAPI.getMemoryFacts();
      setFacts(items);
    } catch {}
  };

  useEffect(() => {
    loadFacts();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    await window.electronAPI.addMemoryFact({ key: newKey.trim(), value: newValue.trim() });
    setNewKey('');
    setNewValue('');
    loadFacts();
  };

  const handleDelete = async (id: string) => {
    await window.electronAPI.deleteMemoryFact(id);
    loadFacts();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070a0f] text-slate-100 overflow-y-auto p-8 select-none font-sans">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Brain size={14} /> Persistent Memory
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Learned User Preferences & Facts</h1>
          <p className="text-xs text-slate-400 mt-1">
            Grounded in your local <span className="font-mono text-cyan-400">~/.jarvis/workspace/</span> folder. Everything stays private on this Mac.
          </p>
        </div>

        {/* Add Memory Fact */}
        <form onSubmit={handleAdd} className="p-4 rounded-xl bg-[#0b101b] border border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-white">Teach Jarvis a New Fact</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder='Topic or key (e.g. "Primary Device")'
              className="bg-[#070a0f] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500"
            />
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder='Detail (e.g. "Raspberry Pi 4 & MacBook Air M-series")'
              className="bg-[#070a0f] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
          >
            <Plus size={13} /> Add to Memory
          </button>
        </form>

        {/* Facts List */}
        <div className="space-y-2">
          {facts.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No custom facts stored yet. Jarvis automatically learns your preferences as you chat.
            </div>
          ) : (
            facts.map((fact) => (
              <div
                key={fact.id}
                className="p-3.5 rounded-xl bg-[#0b101b] border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-cyan-400 font-mono">{fact.fact_key}</div>
                  <div className="text-xs text-slate-300 mt-0.5">{fact.fact_value}</div>
                </div>
                <button
                  onClick={() => handleDelete(fact.id)}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
