import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  StopCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Globe,
  Zap,
  Cpu,
  Sparkles,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { Orb, OrbState } from './Orb';
import { ExecutionPlan } from '../services/tools/types';
import { TaskMode } from '../services/providers/router';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface ChatViewProps {
  messages: Message[];
  streamingText: string;
  isStreaming: boolean;
  assistantState: OrbState;
  activePlan: ExecutionPlan | null;
  onSendMessage: (text: string, mode: TaskMode) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  isListening: boolean;
  onConfirmPlanStep: (confirmed: boolean) => void;
  onCancelPlan: () => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  hasApiKey?: boolean;
  activeProviderName?: string;
  onOpenSettings?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  streamingText,
  isStreaming,
  assistantState,
  activePlan,
  onSendMessage,
  onStartListening,
  onStopListening,
  isListening,
  onConfirmPlanStep,
  onCancelPlan,
  selectedLanguage,
  onLanguageChange,
  hasApiKey = false,
  activeProviderName = 'Autonomous Core',
  onOpenSettings
}) => {
  const [inputText, setInputText] = useState('');
  const [taskMode, setTaskMode] = useState<TaskMode>('auto');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, activePlan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), taskMode);
    setInputText('');
  };

  const handleChipClick = (prompt: string) => {
    onSendMessage(prompt, taskMode);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestionChips = [
    { label: 'Open Google Chrome', prompt: 'open Google Chrome' },
    { label: 'Open Snapchat', prompt: 'open Snapchat' },
    { label: 'Text on WhatsApp', prompt: 'send WhatsApp to team: Project update is ready' },
    { label: 'Write Raspberry Pi GPIO script', prompt: 'write code for Raspberry Pi GPIO LED blink' },
    { label: 'Take a screenshot', prompt: 'take screenshot' },
    { label: 'Give 60s morning brief', prompt: 'give me my morning brief' }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070a0f] text-slate-100 overflow-hidden select-none font-sans">
      {/* Top Header */}
      <div className="h-14 border-b border-[#141b27] px-6 flex items-center justify-between bg-[#090d15]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <Orb state={assistantState} size={32} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white tracking-wide">Voice & Command Interface</h2>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 capitalize">
              State: <span className="text-cyan-400">{assistantState}</span> · {hasApiKey ? activeProviderName : 'Autonomous Core'}
            </p>
          </div>
        </div>

        {/* Brain Status & Controls */}
        <div className="flex items-center gap-2">
          {/* AI Brain pill */}
          <button
            onClick={onOpenSettings}
            title="Configure AI Brain or connect API keys"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#0f172a] hover:bg-[#1e293b] border border-slate-700/60 text-slate-300 transition-colors"
          >
            <Sparkles size={11} className={hasApiKey ? "text-cyan-400" : "text-amber-400"} />
            <span>{hasApiKey ? activeProviderName : "Autonomous Mode"}</span>
            {!hasApiKey && <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded ml-1">Free / Offline</span>}
          </button>

          {/* Mode selector */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setTaskMode('auto')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                taskMode === 'auto' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => setTaskMode('fast')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                taskMode === 'fast' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap size={10} /> Fast
            </button>
            <button
              onClick={() => setTaskMode('smart')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                taskMode === 'smart' ? 'bg-purple-500/20 text-purple-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu size={10} /> Smart
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <Globe size={11} className="text-cyan-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-[11px] outline-none cursor-pointer text-slate-200"
            >
              <option value="en-US" className="bg-slate-900">English (US)</option>
              <option value="en-IN" className="bg-slate-900">English (India)</option>
              <option value="ta-IN" className="bg-slate-900">தமிழ் (Tamil)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && !streamingText && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-2xl mx-auto my-auto">
            {/* Center Animated Orb Hero */}
            <div className="relative group cursor-pointer" onClick={isListening ? onStopListening : onStartListening}>
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 animate-pulse" />
              <Orb state={assistantState} size={96} />
            </div>

            <h3 className="mt-6 text-xl font-semibold text-white tracking-tight">
              Good afternoon, AK
            </h3>
            <p className="mt-2 text-sm text-slate-400 max-w-md leading-relaxed">
              I am Jarvis — your voice-first AI partner. Click the orb, press the mic, or type any autonomous action below.
            </p>

            {/* Quick Action Suggestion Chips */}
            <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-lg">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChipClick(chip.prompt)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium bg-[#0f172a]/90 hover:bg-[#1e293b] border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 transition-all duration-200 shadow-sm"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Free Tier Info Footnote */}
            {!hasApiKey && (
              <div className="mt-8 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[12px] text-slate-400 flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400 shrink-0" />
                <span>Running on <strong>Jarvis Autonomous Core</strong> (100% local & free).</span>
                <button
                  onClick={onOpenSettings}
                  className="text-cyan-400 hover:underline font-medium inline-flex items-center gap-0.5 ml-1"
                >
                  Connect Gemini Free Key <ExternalLink size={10} />
                </button>
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-md ${
                  isUser
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm'
                    : 'bg-[#0f1522] border border-[#1e293b] text-slate-100 rounded-bl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                <div className="mt-2 pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/5">
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-white"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Streaming Assistant Message */}
        {isStreaming && (
          <div className="flex flex-col items-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-5 py-3.5 bg-[#0f1522] border border-cyan-500/30 text-slate-100 text-sm shadow-lg">
              <div className="whitespace-pre-wrap">{streamingText || 'Jarvis is processing...'}</div>
              <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse align-middle" />
            </div>
          </div>
        )}

        {/* Multi-Step Execution Plan Card */}
        {activePlan && (
          <div className="bg-[#0b101b] border border-cyan-500/40 rounded-xl p-4 shadow-xl glow-cyan-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <h4 className="text-sm font-semibold text-white font-mono">{activePlan.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Step {activePlan.currentStepIndex + 1} of {activePlan.steps.length}
                </span>
                {activePlan.status === 'executing' && (
                  <button
                    onClick={onCancelPlan}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                  >
                    <StopCircle size={12} /> Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Step list */}
            <div className="mt-3 space-y-2">
              {activePlan.steps.map((step, idx) => {
                return (
                  <div
                    key={step.id}
                    className={`flex items-start justify-between p-2.5 rounded-lg border text-xs ${
                      step.status === 'running'
                        ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-200'
                        : step.status === 'awaiting_confirmation'
                        ? 'bg-amber-500/10 border-amber-400/40 text-amber-200'
                        : step.status === 'completed'
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-300'
                        : step.status === 'failed'
                        ? 'bg-red-500/10 border-red-500/30 text-red-300'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {step.status === 'completed' && <CheckCircle2 size={14} className="text-emerald-400" />}
                        {step.status === 'running' && <Clock size={14} className="text-cyan-400 animate-spin" />}
                        {step.status === 'awaiting_confirmation' && <AlertTriangle size={14} className="text-amber-400" />}
                        {step.status === 'failed' && <XCircle size={14} className="text-red-400" />}
                        {step.status === 'pending' && <span className="text-[10px] text-slate-600 font-mono">#{idx + 1}</span>}
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">{step.description}</div>
                        <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                          tool: {step.toolName} ({JSON.stringify(step.parameters)})
                        </div>
                        {step.result && (
                          <div className="text-[10px] text-emerald-400 mt-1 font-mono">
                            ✓ {typeof step.result === 'string' ? step.result : JSON.stringify(step.result)}
                          </div>
                        )}
                        {step.error && (
                          <div className="text-[10px] text-red-400 mt-1 font-mono">
                            ✗ {step.error}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step-specific Confirmation Controls */}
                    {step.status === 'awaiting_confirmation' && (
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          onClick={() => onConfirmPlanStep(true)}
                          className="px-2.5 py-1 rounded bg-emerald-500 text-black font-semibold text-[11px] hover:bg-emerald-400 transition-colors"
                        >
                          Allow
                        </button>
                        <button
                          onClick={() => onConfirmPlanStep(false)}
                          className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[11px] hover:bg-slate-700 transition-colors"
                        >
                          Deny
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-4 bg-[#090d15]/90 border-t border-[#141b27]">
        <div className="relative flex items-center bg-[#0d131f] border border-[#1e293b] rounded-xl px-4 py-2.5 focus-within:border-cyan-500/70 focus-within:ring-1 focus-within:ring-cyan-500/30 transition-all shadow-inner">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? "Listening... speak now or type" : "Ask Jarvis anything, run commands, or open apps..."}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none pr-3"
          />

          <div className="flex items-center gap-2">
            {/* Mic Button */}
            <button
              type="button"
              onClick={isListening ? onStopListening : onStartListening}
              title={isListening ? "Stop listening" : "Start push-to-talk (or say 'Hey Jarvis')"}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isListening
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition-all duration-150"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
