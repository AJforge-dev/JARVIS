import React, { useState, useEffect, useRef } from 'react';
import { Sidebar, MainNavTab, SettingsSubTab } from './components/Sidebar';
import { TodayView } from './components/TodayView';
import { FollowUpsView } from './components/FollowUpsView';
import { DictationPage } from './components/DictationPage';
import { MemoryPage } from './components/MemoryPage';
import { RoutinesView } from './components/RoutinesView';
import { SkillsView } from './components/SkillsView';
import { ConnectionsView } from './components/ConnectionsView';
import { SettingsAllView } from './components/SettingsAllView';
import { ChatView, Message } from './components/ChatView';
import { PermissionsModal } from './components/PermissionsModal';
import { OrbState } from './components/Orb';
import { audioRecorder } from './voice/audioRecorder';
import { sttEngine } from './voice/stt';
import { ttsEngine } from './voice/tts';
import { wakeWordListener } from './voice/wakeword';
import { soundEffects } from './voice/soundEffects';
import { LLMRouter, ProviderSettings, defaultProviderSettings, TaskMode } from './services/providers/router';
import { PlanExecutor } from './services/tools/executor';
import { SafetyManager } from './services/tools/safety';
import { toolRegistry } from './services/tools/registry';
import { ExecutionPlan } from './services/tools/types';
import { Minus, Square, X } from 'lucide-react';

const router = new LLMRouter();
const safetyManager = new SafetyManager();
const planExecutor = new PlanExecutor(safetyManager);

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<MainNavTab>('talk');
  const [settingsSubTab, setSettingsSubTab] = useState<SettingsSubTab>('your-jarvis');
  const [assistantState, setAssistantState] = useState<OrbState>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activePlan, setActivePlan] = useState<ExecutionPlan | null>(null);

  // Threads
  const [threads, setThreads] = useState([
    { id: 't1', title: 'Create a Siri Shor...', time: '13h ago' },
    { id: 't2', title: 'Does can you clo...', time: '13h ago' },
    { id: 't3', title: 'Yeah okay, can y...', time: '13h ago' },
    { id: 't4', title: 'Can you tell abou...', time: '13h ago' },
    { id: 't5', title: 'Okay Jarvis, what...', time: '13h ago' },
    { id: 't6', title: 'Uh Javesh, can y...', time: '13h ago' },
    { id: 't7', title: 'perfeição', time: '13h ago' },
    { id: 't8', title: 'Voice chat', time: '13h ago' }
  ]);
  const [activeThreadId, setActiveThreadId] = useState('t1');

  // Dictation
  const [isDictationActive, setIsDictationActive] = useState(false);
  const [currentInterim, setCurrentInterim] = useState('');

  // Settings & Memory
  const [settings, setSettings] = useState<ProviderSettings>(defaultProviderSettings);
  const [hotkey, setHotkey] = useState('Option+Space');
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');

  // Permissions & Diagnostics
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [permissions, setPermissions] = useState({
    microphone: 'prompt',
    accessibility: 'prompt',
    screenRecording: 'prompt'
  });

  const assistantStateRef = useRef<OrbState>('idle');
  assistantStateRef.current = assistantState;

  const isDictationRef = useRef<boolean>(false);
  isDictationRef.current = isDictationActive;

  const updateState = (state: OrbState, transcript?: string) => {
    setAssistantState(state);
    window.electronAPI.notifyVoiceState(state, transcript);
  };

  useEffect(() => {
    window.electronAPI.getSettings().then(saved => {
      if (saved) {
        if (saved.llm_settings) {
          try {
            setSettings(JSON.parse(saved.llm_settings));
          } catch (e) {}
        }
        if (saved.hotkey) setHotkey(saved.hotkey);
        if (saved.wake_word_enabled !== undefined) setWakeWordEnabled(saved.wake_word_enabled === 'true');
        if (saved.language) setSelectedLanguage(saved.language);
      }
    }).catch(() => {});

    // Load persisted API keys into router settings
    const loadKeys = () => {
      Promise.all([
        window.electronAPI.getApiKey('gemini'),
        window.electronAPI.getApiKey('openai'),
        window.electronAPI.getApiKey('anthropic')
      ]).then(([geminiKey, openaiKey, anthropicKey]) => {
        setSettings(prev => ({
          ...prev,
          configs: {
            ...prev.configs,
            gemini: { ...prev.configs.gemini, apiKey: geminiKey || '' },
            openai: { ...prev.configs.openai, apiKey: openaiKey || '' },
            anthropic: { ...prev.configs.anthropic, apiKey: anthropicKey || '' }
          }
        }));
      }).catch(() => {});
    };

    loadKeys();
    window.addEventListener('jarvis:keys-updated', loadKeys);

    ttsEngine.onVoicesReady((v: SpeechSynthesisVoice[]) => {
      setVoices(v);
      if (v.length > 0 && !selectedVoice) {
        setSelectedVoice(v[0].voiceURI);
      }
    });

    window.electronAPI.checkPermissions().then(perms => {
      setPermissions(perms);
    }).catch(() => {});

    const cleanupShortcut = window.electronAPI.onGlobalShortcut((action) => {
      if (action === 'toggle-voice') {
        if (assistantStateRef.current === 'idle') {
          handleStartListening();
        } else {
          handleStopListening();
        }
      } else if (action === 'toggle-dictation') {
        handleToggleDictation();
      }
    });

    const cleanupPlan = planExecutor.onUpdate((plan) => {
      setActivePlan(plan);
    });

    return () => {
      window.removeEventListener('jarvis:keys-updated', loadKeys);
      cleanupShortcut();
      cleanupPlan();
    };
  }, []);

  useEffect(() => {
    audioRecorder.onVolumeChange((vol: number) => {
      if (assistantStateRef.current === 'speaking' && vol > 0.22) {
        ttsEngine.stop();
        updateState('listening');
        sttEngine.start();
      }
    });

    const cleanupSTT = sttEngine.onEvent((event: any) => {
      if (event.type === 'interim') {
        if (ttsEngine.isSpeaking()) {
          ttsEngine.stop(); // Immediate barge-in
        }
        setCurrentInterim(event.text);
        updateState('listening', event.text);
      } else if (event.type === 'final') {
        setCurrentInterim('');
        handleUserSpeech(event.text);
      } else if (event.type === 'error') {
        if (assistantStateRef.current === 'listening') {
          updateState('idle');
        }
      }
    });

    if (wakeWordEnabled && !isDictationActive) {
      wakeWordListener.start(() => {
        ttsEngine.stop();
        handleStartListening();
      });
    } else {
      wakeWordListener.stop();
    }

    return () => {
      cleanupSTT();
      wakeWordListener.stop();
    };
  }, [wakeWordEnabled, isDictationActive]);

  const handleStartListening = async () => {
    try {
      soundEffects.playDictationStart();
      await audioRecorder.start();
      sttEngine.setLanguage(selectedLanguage);
      sttEngine.start();
      updateState(isDictationRef.current ? 'dictating' : 'listening');
    } catch (err: any) {
      console.error('Failed to start listening:', err);
    }
  };

  const handleStopListening = () => {
    soundEffects.playDictationEnd();
    sttEngine.stop();
    audioRecorder.stop();
    updateState('idle');
  };

  const handleToggleDictation = () => {
    const next = !isDictationActive;
    setIsDictationActive(next);
    if (next) {
      wakeWordListener.stop();
      handleStartListening();
    } else {
      handleStopListening();
      if (wakeWordEnabled) wakeWordListener.start();
    }
  };

  const handleNewThread = () => {
    const newId = `t_${Date.now()}`;
    setThreads(prev => [{ id: newId, title: 'New chat...', time: 'Just now' }, ...prev]);
    setActiveThreadId(newId);
    setMessages([]);
    setCurrentTab('talk');
  };

  const handleUserSpeech = async (text: string) => {
    if (!text.trim()) return;

    if (isDictationRef.current) {
      await window.electronAPI.pasteText(text + ' ');
      return;
    }

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setCurrentTab('talk');

    updateState('thinking');
    setIsStreaming(true);
    setStreamingText('');

    try {
      const chatHistory = [...messages, userMsg].map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));

      chatHistory.unshift({
        role: 'system' as any,
        content: 'You are Jarvis, a high-performance cross-platform AI assistant with full desktop automation capability. You have persistent memory of the user (AK). Keep answers clear, professional, helpful, and concise.'
      });

      const tools = toolRegistry.getAllDefinitions();
      const stream = router.stream(chatHistory, tools, settings, 'auto');

      let fullResponseText = '';
      const toolCallsToExecute: any[] = [];

      for await (const event of stream) {
        if (event.type === 'token') {
          fullResponseText += event.content;
          setStreamingText(fullResponseText);
        } else if (event.type === 'tool_call') {
          toolCallsToExecute.push(event.toolCall);
        } else if (event.type === 'error') {
          fullResponseText += `\n[${event.error}]`;
          setStreamingText(fullResponseText);
        }
      }

      setIsStreaming(false);

      const assistantMsg: Message = {
        id: `msg_asst_${Date.now()}`,
        role: 'assistant',
        content: fullResponseText || 'Understood, executing your requested desktop action.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMsg]);
      setStreamingText('');

      if (fullResponseText) {
        updateState('speaking');
        ttsEngine.speak(fullResponseText, {
          onEnd: () => updateState('idle'),
          onError: () => updateState('idle')
        });
      } else {
        updateState('idle');
      }

      if (toolCallsToExecute.length > 0) {
        planExecutor.createPlan(
          `Executing ${toolCallsToExecute.length} desktop step(s)`,
          toolCallsToExecute
        );
        await planExecutor.executePlan();
      }
    } catch (err: any) {
      setIsStreaming(false);
      updateState('idle');
      setMessages(prev => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          content: `Apologies, an error occurred: ${err.message}`,
          timestamp: Date.now()
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070a0f] text-slate-100 overflow-hidden select-none font-sans">
      {/* Frameless Window Custom Titlebar with "• Private" status badge */}
      <header className="titlebar-drag h-9 bg-[#070a0f] border-b border-[#141b27] flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          {/* Window control placeholders */}
          <div className="titlebar-nodrag flex items-center gap-2">
            <button
              onClick={() => window.electronAPI.minimize()}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <Minus size={12} />
            </button>
            <button
              onClick={() => window.electronAPI.maximize()}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <Square size={10} />
            </button>
            <button
              onClick={() => window.electronAPI.close()}
              className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Private Privacy Status Badge */}
        <div className="titlebar-nodrag flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Private</span>
        </div>
      </header>

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Primary Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          settingsSubTab={settingsSubTab}
          onSelectSettingsSubTab={(sub) => setSettingsSubTab(sub)}
          onNewThread={handleNewThread}
          recentThreads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={(id) => setActiveThreadId(id)}
        />

        {/* Dynamic Center Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#080c13]">
          {currentTab === 'talk' && (
            <ChatView
              messages={messages}
              streamingText={streamingText}
              isStreaming={isStreaming}
              assistantState={assistantState}
              activePlan={activePlan}
              onSendMessage={(text, mode) => handleUserSpeech(text)}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              isListening={assistantState === 'listening'}
              onConfirmPlanStep={(conf) => planExecutor.resolveConfirmation(conf)}
              onCancelPlan={() => planExecutor.cancelActivePlan()}
              selectedLanguage={selectedLanguage}
              onLanguageChange={(lang) => {
                setSelectedLanguage(lang);
                sttEngine.setLanguage(lang);
              }}
              hasApiKey={Boolean(settings.configs.gemini?.apiKey || settings.configs.openai?.apiKey || settings.configs.anthropic?.apiKey)}
              activeProviderName={
                settings.configs.gemini?.apiKey
                  ? 'Gemini 2.0 Flash'
                  : settings.configs.openai?.apiKey
                  ? 'OpenAI GPT-4o'
                  : settings.configs.anthropic?.apiKey
                  ? 'Claude 3.5 Sonnet'
                  : 'Autonomous Core'
              }
              onOpenSettings={() => {
                setCurrentTab('settings');
                setSettingsSubTab('ai-brain');
              }}
            />
          )}

          {currentTab === 'today' && (
            <TodayView
              onSendMessage={(text) => handleUserSpeech(text)}
              onOpenConnect={() => setCurrentTab('connections')}
              onOpenPersonalize={() => {
                setCurrentTab('settings');
                setSettingsSubTab('your-jarvis');
              }}
            />
          )}

          {currentTab === 'follow-ups' && (
            <FollowUpsView />
          )}

          {currentTab === 'dictation' && (
            <DictationPage
              onBack={() => setCurrentTab('today')}
              onTryIt={() => {
                handleToggleDictation();
                setCurrentTab('talk');
              }}
            />
          )}

          {currentTab === 'memory' && (
            <MemoryPage />
          )}

          {currentTab === 'routines' && (
            <RoutinesView />
          )}

          {currentTab === 'skills' && (
            <SkillsView />
          )}

          {currentTab === 'connections' && (
            <ConnectionsView />
          )}

          {currentTab === 'settings' && (
            <SettingsAllView
              subTab={settingsSubTab}
            />
          )}
        </main>
      </div>

      {showPermissionsModal && (
        <PermissionsModal
          permissions={permissions}
          onOpenPreferences={(type) => window.electronAPI.openSystemPreferences(type)}
          onRefresh={async () => {
            const p = await window.electronAPI.checkPermissions();
            setPermissions(p);
          }}
          onDismiss={() => setShowPermissionsModal(false)}
        />
      )}
    </div>
  );
};
