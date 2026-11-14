import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, CheckCircle2, Clock } from 'lucide-react';

export const FollowUpsView: React.FC = () => {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState('');

  const loadItems = async () => {
    try {
      const items = await window.electronAPI.getFollowUps();
      setFollowUps(items);
    } catch {}
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await window.electronAPI.addFollowUp({ title: newTitle.trim() });
    setNewTitle('');
    loadItems();
  };

  const handleToggle = async (id: string, current: string) => {
    const next = current === 'open' ? 'done' : 'open';
    await window.electronAPI.updateFollowUpStatus(id, next);
    loadItems();
  };

  const handleDelete = async (id: string) => {
    await window.electronAPI.deleteFollowUp(id);
    loadItems();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070a0f] text-slate-100 overflow-y-auto p-8 select-none font-sans">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <CheckSquare size={14} /> Follow-ups & Reminders
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Action Items</h1>
          <p className="text-xs text-slate-400 mt-1">
            Tasks, commitments, and proactive suggestions remembered by Jarvis.
          </p>
        </div>

        {/* Add Input */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new follow-up or reminder..."
            className="flex-1 bg-[#0b101b] border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
          >
            <Plus size={14} /> Add
          </button>
        </form>

        {/* Task List */}
        <div className="space-y-2">
          {followUps.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No follow-ups recorded yet. Tell Jarvis "Remind me to..." or add one above.
            </div>
          ) : (
            followUps.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#0b101b] border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(item.id, item.status)}
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      item.status === 'done'
                        ? 'bg-emerald-500 border-emerald-500 text-black'
                        : 'border-slate-600 hover:border-cyan-400'
                    }`}
                  >
                    {item.status === 'done' && <CheckCircle2 size={14} />}
                  </button>
                  <span
                    className={`text-xs ${
                      item.status === 'done' ? 'line-through text-slate-500' : 'text-slate-200'
                    }`}
                  >
                    {item.title}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
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
