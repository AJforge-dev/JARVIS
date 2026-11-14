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
    id: 'jarvis-aggressive',
    name: 'JARVIS Prime',
    gender: 'm',
    style: 'aggressive & commanding',
    previewSample: "Systems primed, AK. Give the order and I will execute without hesitation.",
    rate: 1.18,
    pitch: 0.92
  },
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
    id: 'charon-informative',
    name: 'Charon',
    gender: 'm',
    style: 'informative',
    previewSample: "Good afternoon AK. Here is your daily intelligence briefing.",
    rate: 1.0,
    pitch: 0.88
  },
  {
    id: 'fenrir-excitable',
    name: 'Fenrir',
    gender: 'm',
    style: 'excitable',
    previewSample: "Executing that right now, AK. Command dispatched!",
    rate: 1.15,
    pitch: 1.0
  },
  {
    id: 'aoede-breezy',
    name: 'Aoede',
    gender: 'f',
    style: 'breezy',
    previewSample: "All neural network channels active and responsive, AK.",
    rate: 1.05,
    pitch: 1.1
  }
];

export class TTSEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private onVoicesReadyCallbacks: Array<(voices: SpeechSynthesisVoice[]) => void> = [];
  private activeVoiceId = 'jarvis-aggressive'; // Default to Aggressive JARVIS

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

    // Clean text and make delivery punchy and assertive
    let cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block generated.')
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/\bi think\b/gi, 'Tactical analysis confirms')
      .replace(/\bmaybe\b/gi, 'Affirmative')
      .replace(/\bi would suggest\b/gi, 'Directive:')
      .trim();

    if (!cleanText) {
      if (options?.onEnd) options.onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const profile = JARVIS_VOICE_PROFILES.find(p => p.id === this.activeVoiceId) || JARVIS_VOICE_PROFILES[0];

    // Aggressive voice selection: prefer authoritative masculine commanding voices
    if (options?.voiceURI) {
      const v = this.voices.find(voice => voice.voiceURI === options.voiceURI);
      if (v) utterance.voice = v;
    } else if (this.voices.length > 0) {
      const preferred = this.voices.find(v => {
        const n = v.name.toLowerCase();
        if (profile.id === 'jarvis-aggressive') {
          return n.includes('daniel') || n.includes('fred') || n.includes('alex') || n.includes('oliver') || n.includes('tom');
        }
        return n.includes('daniel') || n.includes('alex') || n.includes('samantha');
      });
      if (preferred) {
        utterance.voice = preferred;
      }
    }

    utterance.rate = options?.rate ?? profile.rate;
    utterance.pitch = options?.pitch ?? profile.pitch;

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
