export class STTEngine {
  private recognition: any = null;
  private isListening = false;
  private currentLanguage = 'en-US';
  private eventCallbacks: Array<(event: { type: 'interim' | 'final' | 'error'; text: string }) => void> = [];

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentLanguage;

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          this.emit({ type: 'final', text: final.trim() });
        } else if (interim) {
          this.emit({ type: 'interim', text: interim.trim() });
        }
      };

      this.recognition.onerror = (e: any) => {
        this.emit({ type: 'error', text: e.error || 'STT recognition error' });
      };
    }
  }

  setLanguage(lang: string): void {
    this.currentLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  start(): void {
    if (this.isListening || !this.recognition) return;
    try {
      this.recognition.start();
      this.isListening = true;
    } catch (err) {}
  }

  stop(): void {
    if (!this.isListening || !this.recognition) return;
    try {
      this.recognition.stop();
      this.isListening = false;
    } catch (err) {}
  }

  onEvent(callback: (event: { type: 'interim' | 'final' | 'error'; text: string }) => void): () => void {
    this.eventCallbacks.push(callback);
    return () => {
      this.eventCallbacks = this.eventCallbacks.filter(cb => cb !== callback);
    };
  }

  private emit(event: { type: 'interim' | 'final' | 'error'; text: string }): void {
    for (const cb of this.eventCallbacks) {
      cb(event);
    }
  }
}

export const sttEngine = new STTEngine();
