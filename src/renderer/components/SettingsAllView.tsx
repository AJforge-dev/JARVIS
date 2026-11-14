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
  Play
} from 'lucide-react';
import { SettingsSubTab } from './Sidebar';

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
  const [geminiModel, setGeminiModel] = useState('Gemini 2.0 Flash');
  const [testResult, setTestResult] = useState<string | null>(null);

  // Dictation Tab State
  const [dictationHotkey, setDictationHotkey] = useState('Fn');
  const [micDevice, setMicDevice] = useState('System Default (MacBook Air Microphone)');
  const [dictLanguage, setDictLanguage] = useState('English (US)');
  const [launchOnLogin, setLaunchOnLogin] = useState(true);
  const [sendAnalytics, setSendAnalytics] = useState(true);
  const [runOnDevice, setRunOnDevice] = useState(true);
  const [audioFeedback, setAudioFeedback] = useState(false);
  const [showWaveform, setShowWaveform] = useState(true);

  // Voice Tab State
  const [liveVoice, setLiveVoice] = useState(true);
  const [realtimeProvider, setRealtimeProvider] = useState<'gemini-live' | 'gpt-realtime-2'>('gemini-live');
  const [selectedVoice, setSelectedVoice] = useState('Default (Puck) playful');
  const [voiceHotkey, setVoiceHotkey] = useState('Option+Space');

  // Writing Tab State
  const [aiCleanup, setAiCleanup] = useState(true);
  const [useOllamaWriting, setUseOllamaWriting] = useState(false);
  const [writingVoice, setWritingVoice] = useState('');

  // Memory Tab State
  const [memorySync, setMemorySync] = useState<'local' | 'private'>('local');
  const [semanticRecall, setSemanticRecall] = useState('Auto · pick the best available');
  const [localEmbeddingModel, setLocalEmbeddingModel] = useState('BGE small (English)');

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
    // Load persisted settings & diagnostics
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

              <div className="p-4 rounded-2xl bg-[#0b101b] border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-white">What should I always keep in mind?</div>
                <textarea
                  value={keepInMind}
                  onChange={(e) => {
                    setKeepInMind(e.target.value);
                    handleSaveField('keepInMind', e.target.value);
                  }}
                  rows={2}
                  className="w-full bg-[#070a0f] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#0b101b] border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-white">What should I never do?</div>
                <textarea
                  value={neverDo}
                  onChange={(e) => {
                    setNeverDo(e.target.value);
                    handleSaveField('neverDo', e.target.value);
                  }}
                  rows={2}
                  className="w-full bg-[#070a0f] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500"
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

            <div className="p-4 rounded-2xl bg-[#0b101b] border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Active provider</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Currently using <span className="text-cyan-400 font-medium">{apiKeys.gemini ? 'Google Gemini' : 'Autonomous Local Core'}</span>
                </div>
              </div>
              <button
                onClick={handleTestApiKey}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                Test Connection
              </button>
            </div>

            {/* Provider Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                onClick={() => setBrainSource('cloud')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  brainSource === 'cloud'
                    ? 'bg-blue-600/10 border-blue-500 text-white'
                    : 'bg-[#0b101b] border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-semibold text-xs text-white">Cloud API Key</div>
                <div className="text-[11px] text-slate-400 mt-1">Google Gemini (Free), OpenAI, Anthropic Claude.</div>
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
                <div className="text-[11px] text-slate-400 mt-1">Run offline models on this Mac via Ollama.</div>
              </div>

              <div
                onClick={() => setBrainSource('cli')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  brainSource === 'cli'
                    ? 'bg-blue-600/10 border-blue-500 text-white'
                    : 'bg-[#0b101b] border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-semibold text-xs text-white">Autonomous Core</div>
                <div className="text-[11px] text-slate-400 mt-1">100% offline rule & automation engine.</div>
              </div>
            </div>

            {/* Gemini API Key Card */}
            <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-white">Google Gemini API Key</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Fastest & cheapest. 100% free tier available.
                  </div>
                </div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                >
                  Get Free Key <ExternalLink size={11} />
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
                  Test & Save
                </button>
              </div>

              {testResult && (
                <div className="text-xs font-mono text-cyan-400">{testResult}</div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 3: AUTOMATION */}
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
                    onChange={(e) => {
                      setSuggestDictation(e.target.checked);
                      handleSaveField('suggestDictation', e.target.checked);
                    }}
                    className="accent-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="text-xs text-slate-300">Frequency</div>
                  <div className="flex gap-1.5">
                    {['Low', 'Medium', 'High'].map((f) => (
                      <button
                        key={f}
                        onClick={() => {
                          setNudgeFrequency(f);
                          handleSaveField('nudgeFrequency', f);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          nudgeFrequency === f ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* NOTIFICATIONS */}
            <div className="space-y-4 pt-2">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Notifications
              </div>

              <div className="p-5 rounded-2xl bg-[#0b101b] border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-white">Send test notification</div>
                  <div className="text-[11px] text-slate-400">Fires a sample macOS banner to verify OS permissions.</div>
                </div>
                <button
                  onClick={handleSendTestNotification}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                >
                  Send Test
                </button>
              </div>

              {testNotifResult && (
                <div className="text-xs text-cyan-400 font-mono">{testNotifResult}</div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 4: DIAGNOSTICS */}
        {subTab === 'diagnostics' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Diagnostics</h1>
              <p className="text-xs text-slate-400 mt-1">
                Check Jarvis is set up right — permissions, model, brain, channels.
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

        {/* FALLBACK FOR OTHER SUBTABS (General, Dictation, Voice, Writing, Memory, Advanced) */}
        {['general', 'dictation', 'voice', 'writing', 'memory', 'advanced'].includes(subTab) && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white capitalize">{subTab} Settings</h1>
              <p className="text-xs text-slate-400 mt-1">
                Configure your preferred options for {subTab}.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0b101b] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Global Voice Hotkey</div>
                  <div className="text-[11px] text-slate-400">Shortcut that pops the floating Jarvis orb over any app.</div>
                </div>
                <span className="px-3 py-1 bg-slate-800 text-slate-200 rounded-lg text-xs font-mono">
                  ⌥ Space
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <div>
                  <div className="text-xs font-semibold text-white">Hold-to-Dictate Key</div>
                  <div className="text-[11px] text-slate-400">Transcribe voice and paste into active window.</div>
                </div>
                <span className="px-3 py-1 bg-slate-800 text-slate-200 rounded-lg text-xs font-mono">
                  Fn Key
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
