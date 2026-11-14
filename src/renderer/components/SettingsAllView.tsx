import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cpu,
  Key,
  Mic,
  Volume2,
  Edit3,
  Brain,
  Sliders,
  Bell,
  Activity,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  Radio,
  FileText
} from 'lucide-react';
import { SettingsSubTab } from './Sidebar';
import { JARVIS_VOICE_PROFILES, ttsEngine } from '../voice/tts';
import { soundEffects } from '../voice/soundEffects';

interface SettingsAllViewProps {
  subTab: SettingsSubTab;
  onSaveToast?: (msg: string) => void;
}

export const SettingsAllView: React.FC<SettingsAllViewProps> = ({ subTab, onSaveToast }) => {
  // Common Settings State
  const [settings, setSettings] = useState<any>({});
  const [apiKeys, setApiKeys] = useState<{ anthropic: string; openai: string; gemini: string }>({
    anthropic: '',
    openai: '',
    gemini: ''
  });
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [testNotifResult, setTestNotifResult] = useState<string | null>(null);

  // Your Jarvis Tab State
  const [tone, setTone] = useState('Professional');
  const [answerLength, setAnswerLength] = useState('Full detail');
  const [addressForm, setAddressForm] = useState('First name');
  const [disagreementStyle, setDisagreementStyle] = useState('Mention it gently');
  const [keepInMind, setKeepInMind] = useState('AK is passionate about AI, IoT, Raspberry Pi, and robotics.');
  const [neverDo, setNeverDo] = useState('Never perform destructive actions without spoken or click confirmation.');

  // AI Brain Tab State
  const [brainSource, setBrainSource] = useState<'cli' | 'cloud' | 'ollama'>('cloud');
  const [cloudProvider, setCloudProvider] = useState('Google Gemini');
  const [geminiModel, setGeminiModel] = useState('Gemini 3 Flash');
  const [testResult, setTestResult] = useState<string | null>(null);

  // Voice Tab State (Exact jarvis.ceo replica)
  const [liveVoice, setLiveVoice] = useState(true);
  const [realtimeProvider, setRealtimeProvider] = useState<'gemini-live' | 'gpt-realtime-2'>('gemini-live');
  const [activeVoiceId, setActiveVoiceId] = useState('puck-playful');
  const [voiceHotkey, setVoiceHotkey] = useState('⌥ Space');

  // Dictation Tab State (Exact jarvis.ceo replica)
  const [dictationHotkey, setDictationHotkey] = useState('Fn');
  const [micDevice, setMicDevice] = useState('System Default (MacBook Air Microphone)');
  const [dictLanguage, setDictLanguage] = useState('English (US)');
  const [launchOnLogin, setLaunchOnLogin] = useState(true);
  const [sendAnalytics, setSendAnalytics] = useState(true);
  const [runOnDevice, setRunOnDevice] = useState(true);
  const [activeSTTModel, setActiveSTTModel] = useState('Base (Multilingual) · 142 MB');
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [showWaveform, setShowWaveform] = useState(true);

  // Writing Tab State (Exact jarvis.ceo replica)
  const [aiCleanup, setAiCleanup] = useState(true);
  const [useOllamaWriting, setUseOllamaWriting] = useState(false);
  const [writingVoice, setWritingVoice] = useState('e.g. Casual, short sentences, signs off "thanks", rarely uses exclamation marks...');

  // Automation & Nudges State
  const [suggestDictation, setSuggestDictation] = useState(true);
  const [nudgeFrequency, setNudgeFrequency] = useState('Medium');
  const [maxNudgesPerDay, setMaxNudgesPerDay] = useState(3);
  const [snoozeDuration, setSnoozeDuration] = useState('15 min');
  const [smartTiming, setSmartTiming] = useState(true);
  const [heartbeatRunner, setHeartbeatRunner] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [notifyTopics, setNotifyTopics] = useState<Record<string, boolean>>({
    chatReplies: true,
    routineCompleted: true,
    meetingAlert: true,
    briefReady: true,
    morningCheckIn: true,
    integrationStatus: true,
    memoryObservations: true,
    connectionAlerts: true,
    incomingMessages: true,
    firstRunUnlocks: true
  });
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('08:00');

  useEffect(() => {
    // Load persisted settings
    window.electronAPI.getSettings().then(s => {
      if (s) {
        setSettings(s);
        if (s.tone) setTone(s.tone);
        if (s.answerLength) setAnswerLength(s.answerLength);
        if (s.addressForm) setAddressForm(s.addressForm);
        if (s.disagreementStyle) setDisagreementStyle(s.disagreementStyle);
        if (s.keepInMind) setKeepInMind(s.keepInMind);
        if (s.neverDo) setNeverDo(s.neverDo);
        if (s.brainSource) setBrainSource(s.brainSource);
        if (s.cloudProvider) setCloudProvider(s.cloudProvider);
        if (s.activeVoiceId) {
          setActiveVoiceId(s.activeVoiceId);
          ttsEngine.setActiveVoice(s.activeVoiceId);
        }
      }
    }).catch(() => {});

    Promise.all([
      window.electronAPI.getApiKey('gemini'),
      window.electronAPI.getApiKey('anthropic'),
      window.electronAPI.getApiKey('openai')
    ]).then(([gemini, anthropic, openai]) => {
      setApiKeys({
        gemini: gemini || '',
        anthropic: anthropic || '',
        openai: openai || ''
      });
    }).catch(() => {});

    window.electronAPI.checkPermissions().then(perms => {
      setDiagnostics(perms);
    }).catch(() => {});
  }, []);

  const handleSaveField = (key: string, value: any) => {
    window.electronAPI.saveSetting(key, value);
    if (onSaveToast) onSaveToast(`Saved ${key}`);
  };

  const handleSelectVoice = (profileId: string) => {
    setActiveVoiceId(profileId);
    ttsEngine.setActiveVoice(profileId);
    handleSaveField('activeVoiceId', profileId);
  };

  const handlePlayVoicePreview = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    ttsEngine.playVoicePreview(profileId);
  };

  const handleTestApiKey = async () => {
    if (cloudProvider === 'Google Gemini') {
      if (!apiKeys.gemini) {
        setTestResult('Please enter a Gemini API key first');
        return;
      }
      setTestResult('Testing Gemini connection...');
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKeys.gemini}`);
        if (res.ok) {
          setTestResult('✓ Connected successfully to Google Gemini!');
        } else {
          setTestResult(`✗ Failed: ${await res.text()}`);
        }
      } catch (e: any) {
        setTestResult(`✗ Network error: ${e.message}`);
      }
    }
  };

  const handleSendTestNotification = async () => {
    const res = await window.electronAPI.sendTestNotification();
    if (res.success) {
      setTestNotifResult('✓ Sample notification fired successfully');
    } else {
      setTestNotifResult(`✗ Failed: ${res.error}`);
    }
    setTimeout(() => setTestNotifResult(null), 4000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070a0f] text-slate-100 overflow-y-auto p-8 select-none font-sans">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        {/* SUBTAB 1: YOUR JARVIS */}
        {subTab === 'your-jarvis' && (
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                How I Talk to You
              </div>
              <h1 className="text-2xl font-bold text-white mt-1">Your Jarvis</h1>
            </div>

            {/* How should I talk to you? */}
            <div className="space-y-2">
              <div className="text-slate-200 text-xs">
                <span className="font-semibold text-white">How should I talk to you?</span> · Pick the vibe that fits — I'll match it.
              </div>
              <div className="flex items-center gap-2 pt-1">
                {['Concise', 'Friendly', 'Warm', 'Professional', 'Playful'].map((vibe) => (
                  <button
                    key={vibe}
                    onClick={() => {
                      setTone(vibe);
                      handleSaveField('tone', vibe);
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      tone === vibe
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-[#0c111a] text-slate-400 hover:text-white border border-[#192233]'
                    }`}
                  >
                    {vibe}
                  </button>
                ))}
              </div>
            </div>

            {/* How long should answers run? */}
            <div className="space-y-2 pt-2">
              <div className="text-slate-200 text-xs">
                <span className="font-semibold text-white">How long should answers run?</span> · Default response length.
              </div>
              <div className="flex items-center gap-2 pt-1">
                {['One-liner', 'Few sentences', 'Full detail'].map((len) => (
                  <button
                    key={len}
                    onClick={() => {
                      setAnswerLength(len);
                      handleSaveField('answerLength', len);
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      answerLength === len
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-[#0c111a] text-slate-400 hover:text-white border border-[#192233]'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>

            {/* How should I address you? */}
            <div className="space-y-2 pt-2">
              <div className="text-slate-200 text-xs">
                <span className="font-semibold text-white">How should I address you?</span> · Form of address in replies.
              </div>
              <div className="flex items-center gap-2 pt-1">
                {['First name', 'No name', 'AK'].map((addr) => (
                  <button
                    key={addr}
                    onClick={() => {
                      setAddressForm(addr);
                      handleSaveField('addressForm', addr);
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      addressForm === addr
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-[#0c111a] text-slate-400 hover:text-white border border-[#192233]'
                    }`}
                  >
                    {addr}
                  </button>
                ))}
              </div>
            </div>

            {/* Ground Rules */}
            <div className="pt-4 border-t border-[#151c27] space-y-4">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Ground Rules
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-white">What should I always keep in mind?</div>
                <textarea
                  value={keepInMind}
                  onChange={(e) => setKeepInMind(e.target.value)}
                  onBlur={() => handleSaveField('keepInMind', keepInMind)}
                  rows={3}
                  className="w-full bg-[#0b101b] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-white">What should I never do?</div>
                <textarea
                  value={neverDo}
                  onChange={(e) => setNeverDo(e.target.value)}
                  onBlur={() => handleSaveField('neverDo', neverDo)}
                  rows={3}
                  className="w-full bg-[#0b101b] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: AI BRAIN */}
        {subTab === 'ai-brain' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">AI brain</h1>
              <p className="text-xs text-slate-400 mt-1">
                Active provider, CLI backends, and the API keys that power them.
              </p>
            </div>

            {/* Active Provider Indicator */}
            <div className="p-4 rounded-xl bg-[#0b101b] border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">AI BRAIN</div>
                <div className="font-semibold text-sm text-white mt-0.5">Active provider</div>
                <div className="text-xs text-slate-400">
                  Currently using {apiKeys.gemini ? 'Google Gemini' : 'Autonomous Core'}
                </div>
              </div>
              <button
                onClick={handleTestApiKey}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                Test
              </button>
            </div>

            {/* Brain Source Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                onClick={() => setBrainSource('cloud')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  brainSource === 'cloud'
                    ? 'bg-blue-600/10 border-blue-500 text-white'
                    : 'bg-[#0b101b] border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-semibold text-xs text-white">Cloud API key</div>
                <div className="text-[11px] text-slate-400 mt-1">Paste a key from Anthropic, OpenAI, or Gemini (Free).</div>
              </div>

              <div
                onClick={() => setBrainSource('ollama')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  brainSource === 'ollama'
                    ? 'bg-blue-600/10 border-blue-500 text-white'
                    : 'bg-[#0b101b] border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-semibold text-xs text-white">Local · Ollama</div>
                <div className="text-[11px] text-slate-400 mt-1">Run a model on this Mac via Ollama. Fully offline.</div>
              </div>

              <div
                onClick={() => setBrainSource('cli')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  brainSource === 'cli'
                    ? 'bg-blue-600/10 border-blue-500 text-white'
                    : 'bg-[#0b101b] border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-semibold text-xs text-white">Built-in CLI / Core</div>
                <div className="text-[11px] text-slate-400 mt-1">Autonomous rule engine. Zero API key needed.</div>
              </div>
            </div>

            {/* Gemini API Key Card */}
            <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-white">Google Gemini API key</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Gemini 3 Flash default · cheap and fast. Pro preview available for hard reasoning.
                  </div>
                </div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                >
                  Get a free Gemini key →
                </a>
              </div>

              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeys.gemini}
                  onChange={(e) => {
                    const k = e.target.value;
                    setApiKeys({ ...apiKeys, gemini: k });
                    window.electronAPI.saveApiKey('gemini', k).then(() => {
                      window.dispatchEvent(new CustomEvent('jarvis:keys-updated'));
                    });
                  }}
                  placeholder="Paste your Gemini API key (AIzaSy...)"
                  className="flex-1 bg-[#070a0f] border border-slate-800 rounded-xl px-4 py-2 text-xs text-white font-mono placeholder-slate-600 outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleTestApiKey}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                >
                  Test
                </button>
              </div>

              {testResult && (
                <div className="text-xs font-mono text-cyan-400">{testResult}</div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 3: VOICE (Exact jarvis.ceo replica) */}
        {subTab === 'voice' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white font-serif">Voice</h1>
              <p className="text-xs text-slate-400 mt-1">
                How Jarvis sounds out loud — pick a voice, and talk with it live.
              </p>
            </div>

            {/* Live Voice Banner */}
            <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-white">Live voice — talk to Jarvis</span>
                  <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] font-bold uppercase tracking-wider">
                    BETA
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-lg">
                  A real back-and-forth conversation with the orb — you talk, it talks back, and you can cut in any time. Needs an OpenAI or Gemini key (set below).
                </p>
              </div>
              <button
                onClick={() => {
                  setLiveVoice(!liveVoice);
                  handleSaveField('liveVoice', !liveVoice);
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  liveVoice ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {liveVoice ? 'On' : 'Off'}
              </button>
            </div>

            {/* Realtime Provider */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-300">Realtime provider</div>
              <p className="text-[11px] text-slate-400">
                Keys reuse AI Brain · OpenAI for reasoning depth, Gemini for proactive silence.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div
                  onClick={() => {
                    setRealtimeProvider('gemini-live');
                    handleSaveField('realtimeProvider', 'gemini-live');
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    realtimeProvider === 'gemini-live'
                      ? 'bg-blue-600/10 border-blue-500'
                      : 'bg-[#0b101b] border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">Gemini Live</span>
                    <span className="text-[10px] text-slate-400 font-mono">$ · proactive</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Cheaper. Proactive audio lets Jarvis stay silent in passing conversations.
                  </p>
                  <div className="text-[11px] text-emerald-400 mt-3 font-medium flex items-center gap-1">
                    ✓ Key added · reuses AI Brain
                  </div>
                </div>

                <div
                  onClick={() => {
                    setRealtimeProvider('gpt-realtime-2');
                    handleSaveField('realtimeProvider', 'gpt-realtime-2');
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    realtimeProvider === 'gpt-realtime-2'
                      ? 'bg-blue-600/10 border-blue-500'
                      : 'bg-[#0b101b] border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">gpt-realtime-2</span>
                    <span className="text-[10px] text-slate-400 font-mono">$$$ · GPT-5 reasoning</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Best reasoning + native preamble UX. More expensive per minute.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="password"
                      placeholder="Paste OpenAI API key"
                      value={apiKeys.openai}
                      onChange={(e) => {
                        const k = e.target.value;
                        setApiKeys({ ...apiKeys, openai: k });
                        window.electronAPI.saveApiKey('openai', k);
                      }}
                      className="flex-1 bg-[#070a0f] border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-white font-mono placeholder-slate-600 outline-none"
                    />
                    <button className="px-3 py-1 bg-slate-800 text-slate-200 text-xs rounded-lg font-medium">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Voice Persona Selector */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-semibold text-slate-300">Voice</div>
              <p className="text-[11px] text-slate-400">
                Provider-specific. Default is a balanced natural voice. Click play to preview.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {JARVIS_VOICE_PROFILES.map((p) => {
                  const isSelected = activeVoiceId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectVoice(p.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                          : 'bg-[#0b101b] text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>
                        {p.name} {p.style} · {p.gender}
                      </span>
                      <button
                        onClick={(e) => handlePlayVoicePreview(e, p.id)}
                        className={`p-1 rounded-full transition-colors ${
                          isSelected ? 'hover:bg-blue-500 text-white' : 'hover:bg-slate-700 text-slate-400 hover:text-white'
                        }`}
                        title="Preview voice"
                      >
                        <Play size={10} fill="currentColor" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SUMMON JARVIS Hotkey */}
            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Summon Jarvis
              </div>
              <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Voice hotkey</div>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-md">
                    A global shortcut that pops the floating Jarvis orb over any app so you can just talk — separate from the dictation key. Use a modifier combo (e.g. ⌥ Space) or a bare F-key. Press Esc in the orb to dismiss it.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-200 rounded-xl text-xs font-mono">
                    {voiceHotkey}
                  </span>
                  <button className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors">
                    Rebind
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: DICTATION (Exact jarvis.ceo replica) */}
        {subTab === 'dictation' && (
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Voice & Dictation
              </div>
              <h1 className="text-2xl font-bold text-white mt-1">Dictation</h1>
            </div>

            {/* Hotkey Selector */}
            <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 space-y-3">
              <div>
                <div className="text-xs font-semibold text-white">Hotkey</div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hold to dictate · release to send. Fn is invisible to other apps; Option and Control are the safe alternatives if Fn isn't reachable on your keyboard.
                </p>
              </div>
              <div className="flex gap-2 pt-1">
                {['Fn', '⌥ Option', '^ Control'].map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      setDictationHotkey(k);
                      handleSaveField('dictationHotkey', k);
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      dictationHotkey === k
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* Microphone Selector */}
            <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Microphone</div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  System default usually picks the right one. Override if you have an external mic.
                </p>
              </div>
              <select
                value={micDevice}
                onChange={(e) => setMicDevice(e.target.value)}
                className="bg-[#070a0f] border border-slate-800 text-xs text-white rounded-xl px-3 py-2 outline-none"
              >
                <option>System Default (MacBook Air Microphone)</option>
                <option>Built-in Internal Microphone</option>
                <option>External USB Microphone</option>
              </select>
            </div>

            {/* Language Selector */}
            <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Language</div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Whisper auto-detects but a hint speeds things up and improves accuracy.
                </p>
              </div>
              <select
                value={dictLanguage}
                onChange={(e) => {
                  setDictLanguage(e.target.value);
                  handleSaveField('dictLanguage', e.target.value);
                }}
                className="bg-[#070a0f] border border-slate-800 text-xs text-white rounded-xl px-3 py-2 outline-none"
              >
                <option>English (US)</option>
                <option>Tamil (தமிழ்)</option>
                <option>English (UK)</option>
                <option>French (Français)</option>
                <option>Spanish (Español)</option>
              </select>
            </div>

            {/* Transcription Controls */}
            <div className="pt-2 space-y-4">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Transcription
              </div>

              {/* Run on device */}
              <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Run on device</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 max-w-lg">
                    Off (recommended): cloud transcription using your OpenAI, Gemini, or Deepgram key — fastest, most accurate. On: runs fully offline via Whisper — private.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={runOnDevice}
                  onChange={(e) => setRunOnDevice(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </div>

              {/* Active Model */}
              <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Active model</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Fast, supports multiple languages · 142 MB · good</p>
                </div>
                <span className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl font-mono">
                  Base (Multilingual) · 142 MB
                </span>
              </div>

              {/* Audio feedback */}
              <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Audio feedback</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Subtle click on dictation start / end. Off = silent.</p>
                </div>
                <button
                  onClick={() => {
                    const next = !audioFeedback;
                    setAudioFeedback(next);
                    if (next) soundEffects.playDictationStart();
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    audioFeedback ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {audioFeedback ? 'On' : 'Off'}
                </button>
              </div>

              {/* Show waveform */}
              <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Show waveform</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Floating horizontal wave near caret while dictating.</p>
                </div>
                <input
                  type="checkbox"
                  checked={showWaveform}
                  onChange={(e) => setShowWaveform(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 5: WRITING (Exact jarvis.ceo replica) */}
        {subTab === 'writing' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Writing</h1>
              <p className="text-xs text-slate-400 mt-1">
                Post-processing prompts and the custom dictionary Jarvis never auto-corrects.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Post-Processing
              </div>

              {/* AI cleanup */}
              <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">AI cleanup</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Pass dictations through an LLM to fix punctuation, capitalisation, and formatting. Off = raw transcript output.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={aiCleanup}
                  onChange={(e) => setAiCleanup(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </div>

              {/* Use Ollama writing */}
              <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Use Ollama (local LLM)</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 max-w-lg">
                    Route cleanup through a local model instead of your cloud brain. Free, private, slower. Requires ollama serve running.
                    Tip: small models (qwen2.5:0.5b, llama3.2:1b) finish in 1–2 s once warm.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={useOllamaWriting}
                  onChange={(e) => setUseOllamaWriting(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </div>

              {/* Your writing voice */}
              <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-white">Your writing voice</div>
                <p className="text-[11px] text-slate-400">
                  Jarvis learns how you write from your dictations and matches it when cleaning up — so output sounds like you, not generic.
                </p>
                <textarea
                  value={writingVoice}
                  onChange={(e) => setWritingVoice(e.target.value)}
                  rows={3}
                  className="w-full bg-[#070a0f] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 6: AUTOMATION */}
        {subTab === 'automation' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Automation</h1>
              <p className="text-xs text-slate-400 mt-1">
                Background routines, nudges, and gateway channels (Telegram, WhatsApp, etc.).
              </p>
            </div>

            {/* NUDGES */}
            <div className="space-y-4">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Nudges
              </div>

              <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-white">Suggest dictation</div>
                    <div className="text-[11px] text-slate-400">Nudge you to try Fn-dictation while you're hand-typing.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={suggestDictation}
                    onChange={(e) => setSuggestDictation(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-white">Frequency</div>
                    <div className="text-[11px] text-slate-400">Higher = nudges more often during long typing sessions.</div>
                  </div>
                  <div className="flex gap-1.5">
                    {['Low', 'Medium', 'High'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setNudgeFrequency(f)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          nudgeFrequency === f
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ROUTINES */}
            <div className="space-y-4 pt-2">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Routines
              </div>

              <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-white">Heartbeat runner</div>
                    <div className="text-[11px] text-slate-400">Ticks every 30 minutes · runs the next task in your queue.</div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold">
                    Live
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-white">System notifications</div>
                    <div className="text-[11px] text-slate-400">macOS banner when a task completes (or fails).</div>
                  </div>
                  <button
                    onClick={handleSendTestNotification}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                  >
                    Send test
                  </button>
                </div>

                {testNotifResult && (
                  <div className="text-xs text-cyan-400 font-mono">{testNotifResult}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 7: DIAGNOSTICS */}
        {subTab === 'diagnostics' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Diagnostics</h1>
              <p className="text-xs text-slate-400 mt-1">
                Check Jarvis is set up right — permissions, model, brain, channels — fix what isn't.
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-4 rounded-xl bg-[#0b101b] border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">Microphone</div>
                    <div className="text-[11px] text-slate-400">Granted — dictation + voice work.</div>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-medium">Granted</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0b101b] border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">Accessibility</div>
                    <div className="text-[11px] text-slate-400">Granted — routines that type/click and screen control work.</div>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-medium">Granted</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0b101b] border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">Screen recording</div>
                    <div className="text-[11px] text-slate-400">Available for live-screen analysis and screenshots.</div>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-medium">Active</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0b101b] border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-cyan-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">AI brain</div>
                    <div className="text-[11px] text-slate-400">
                      {apiKeys.gemini ? 'Google Gemini cloud provider live' : 'Autonomous Core ready'}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-cyan-400 font-medium">Operational</span>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 8: GENERAL & ADVANCED */}
        {(subTab === 'general' || subTab === 'advanced' || subTab === 'memory') && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white capitalize">{subTab}</h1>
              <p className="text-xs text-slate-400 mt-1">
                System configuration, memory facts sync, and local storage.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Jarvis Version</div>
                  <div className="text-[11px] text-slate-400">Jarvis - AI Assistant 2.0.0-beta.84</div>
                </div>
                <span className="px-2.5 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-xs font-mono">
                  v2.0.0-beta.84
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Target Architecture</div>
                  <div className="text-[11px] text-slate-400">macOS (Apple Silicon arm64) + Windows x64 + Raspberry Pi OS</div>
                </div>
                <span className="text-xs text-slate-300 font-mono">darwin-arm64</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
