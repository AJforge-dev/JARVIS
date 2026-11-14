import React, { useState, useEffect } from 'react';
import { Link2, Search, CheckCircle2, Globe, ShieldCheck, ExternalLink, ArrowRight } from 'lucide-react';

export const ConnectionsView: React.FC = () => {
  const [connections, setConnections] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.electronAPI.getConnections().then(list => {
      setConnections(list);
    }).catch(() => {});
  }, []);

  const filtered = connections.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070a0f] text-slate-100 overflow-y-auto p-8 select-none font-sans">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Link2 size={14} /> Integrations & Gateway
          </div>
          <h1 className="text-3xl font-bold text-white mt-1">Connections</h1>
          <p className="text-sm text-slate-400 mt-1 leading-relaxed">
            Plug Jarvis into the apps and inboxes you actually use. Talk to it on Telegram, WhatsApp, Slack — connect your calendar and files with Google, and your inbox. Tokens stay strictly on this Mac.
          </p>
        </div>

        {/* Identity Claim Box */}
        <div className="bg-[#0b101b] border border-cyan-500/20 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Claim your Jarvis identity</h3>
            <p className="text-xs text-slate-400 mt-1">
              Give your Jarvis a private agent endpoint so external gateway channels can route messages directly to your Mac.
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors">
            Claim Handle <ArrowRight size={12} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps — Notion, Telegram, Slack, WhatsApp, Home Assistant..."
            className="w-full bg-[#0b101b] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
          />
        </div>

        {/* Connectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{item.category}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs">
                  {item.status === 'connected' ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 size={12} /> Connected · Live
                    </span>
                  ) : (
                    <span className="text-slate-500">Available to connect</span>
                  )}
                </div>
              </div>

              <button
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  item.status === 'connected'
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {item.status === 'connected' ? 'Manage' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
