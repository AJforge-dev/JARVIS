export class TTSEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private onVoicesReadyCallbacks: Array<(voices: SpeechSynthesisVoice[]) => void> = [];

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

  onVoicesReady(callback: (voices: SpeechSynthesisVoice[]) => void): void {
    if (this.voices.length > 0) {
      callback(this.voices);
    }
    this.onVoicesReadyCallbacks.push(callback);
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
    if (options?.voiceURI) {
      const v = this.voices.find(voice => voice.voiceURI === options.voiceURI);
      if (v) utterance.voice = v;
    }

    utterance.rate = options?.rate ?? 1.05;
    utterance.pitch = options?.pitch ?? 1.0;

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
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  isSpeaking(): boolean {
    return Boolean(this.synth?.speaking);
  }
}

export const ttsEngine = new TTSEngine();
