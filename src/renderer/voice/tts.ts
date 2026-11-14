export interface VoiceProfile {
  id: string;
  name: string;
  gender: 'm' | 'f';
  style: string;
  previewSample: string;
  rate: number;
  pitch: number;
}

export const JARVIS_VOICE_PROFILES: VoiceProfile[] = [
  {
    id: 'puck-playful',
    name: 'Default (Puck)',
    gender: 'm',
    style: 'playful',
    previewSample: "Hey AK, I'm ready to roll. What are we building today?",
    rate: 1.05,
    pitch: 1.05
  },
  {
    id: 'puck-upbeat',
    name: 'Puck',
    gender: 'm',
    style: 'upbeat',
    previewSample: "All systems online and running at peak performance, AK!",
    rate: 1.1,
    pitch: 1.1
  },
  {
    id: 'charon-informative',
    name: 'Charon',
    gender: 'm',
    style: 'informative',
    previewSample: "Good afternoon AK. Here is your daily intelligence briefing.",
    rate: 0.98,
    pitch: 0.88
  },
  {
    id: 'fenrir-excitable',
    name: 'Fenrir',
    gender: 'm',
    style: 'excitable',
    previewSample: "Executing that right now, AK. Command dispatched!",
    rate: 1.12,
    pitch: 1.0
  },
  {
    id: 'orus-firm',
    name: 'Orus',
    gender: 'm',
    style: 'firm',
    previewSample: "Acknowledged. Routine confirmed and secured.",
    rate: 0.95,
    pitch: 0.82
  },
  {
    id: 'aoede-breezy',
    name: 'Aoede',
    gender: 'f',
    style: 'breezy',
    previewSample: "Everything looks clear on your calendar for today, AK.",
    rate: 1.02,
    pitch: 1.1
  },
  {
    id: 'kore-firm',
    name: 'Kore',
    gender: 'f',
    style: 'firm',
    previewSample: "All background tasks completed with zero errors, AK.",
    rate: 1.0,
    pitch: 1.0
  },
  {
    id: 'leda-youthful',
    name: 'Leda',
    gender: 'f',
    style: 'youthful',
    previewSample: "Hey! Ready whenever you are. Let's do this!",
    rate: 1.08,
    pitch: 1.15
  }
];

export class TTSEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private onVoicesReadyCallbacks: Array<(voices: SpeechSynthesisVoice[]) => void> = [];
  private activeVoiceId = 'puck-playful';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices(): void {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    if (this.voices.length > 0) {
      for (const cb of this.onVoicesReadyCallbacks) {
        cb(this.voices);
      }
    }
  }

  setActiveVoice(id: string): void {
    this.activeVoiceId = id;
  }

  getActiveVoice(): string {
    return this.activeVoiceId;
  }

  onVoicesReady(callback: (voices: SpeechSynthesisVoice[]) => void): void {
    if (this.voices.length > 0) {
      callback(this.voices);
    }
    this.onVoicesReadyCallbacks.push(callback);
  }

  playVoicePreview(profileId: string): void {
    const profile = JARVIS_VOICE_PROFILES.find(p => p.id === profileId);
    if (!profile) return;
    this.speak(profile.previewSample, {
      rate: profile.rate,
      pitch: profile.pitch
    });
  }

  speak(text: string, options?: { voiceURI?: string; rate?: number; pitch?: number; onEnd?: () => void; onError?: () => void }): void {
    if (!this.synth) return;
    this.stop();

    // Strip markdown formatting before speaking
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[*_#`~[\]()]/g, '')
      .trim();

    if (!cleanText) {
      if (options?.onEnd) options.onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const profile = JARVIS_VOICE_PROFILES.find(p => p.id === this.activeVoiceId);

    // Pick best matching system voice
    if (options?.voiceURI) {
      const v = this.voices.find(voice => voice.voiceURI === options.voiceURI);
      if (v) utterance.voice = v;
    } else if (this.voices.length > 0) {
      const targetGender = profile?.gender ?? 'm';
      const preferred = this.voices.find(v => {
        const n = v.name.toLowerCase();
        if (targetGender === 'm') {
          return n.includes('daniel') || n.includes('alex') || n.includes('oliver') || n.includes('male');
        } else {
          return n.includes('samantha') || n.includes('karen') || n.includes('ava') || n.includes('female');
        }
      });
      if (preferred) {
        utterance.voice = preferred;
      }
    }

    utterance.rate = options?.rate ?? (profile?.rate ?? 1.05);
    utterance.pitch = options?.pitch ?? (profile?.pitch ?? 1.0);

    utterance.onend = () => {
      this.currentUtterance = null;
      if (options?.onEnd) options.onEnd();
    };

    utterance.onerror = () => {
      this.currentUtterance = null;
      if (options?.onError) options.onError();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  isSpeaking(): boolean {
    return Boolean(this.synth?.speaking);
  }
}

export const ttsEngine = new TTSEngine();
