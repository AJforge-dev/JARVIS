export class WakeWordListener {
  private recognition: any = null;
  private isRunning = false;
  private onDetectedCallback: (() => void) | null = null;
  private lastTriggerTime = 0;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        const now = Date.now();
        // Prevent rapid double triggers within 2.5 seconds
        if (now - this.lastTriggerTime < 2500) return;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript.toLowerCase().trim();

          const isWakeWord =
            transcript.includes('hey jarvis') ||
            transcript.includes('wake up jarvis') ||
            transcript.includes('jarvis wake up') ||
            transcript.includes('yo jarvis') ||
            transcript.includes('listen jarvis') ||
            transcript === 'jarvis' ||
            transcript.startsWith('jarvis ');

          if (isWakeWord) {
            this.lastTriggerTime = now;
            if (this.onDetectedCallback) {
              this.onDetectedCallback();
            }
            break;
          }
        }
      };

      this.recognition.onend = () => {
        // Auto-restart continuous audio stream listener
        if (this.isRunning) {
          try {
            this.recognition.start();
          } catch (e) {}
        }
      };

      this.recognition.onerror = () => {
        // Soft recover on silence / no speech
        if (this.isRunning) {
          try {
            this.recognition.stop();
            setTimeout(() => {
              if (this.isRunning) this.recognition.start();
            }, 300);
          } catch (e) {}
        }
      };
    }
  }

  start(onDetected?: () => void): void {
    if (!this.recognition || this.isRunning) return;
    if (onDetected) this.onDetectedCallback = onDetected;
    this.isRunning = true;
    try {
      this.recognition.start();
    } catch (e) {}
  }

  stop(): void {
    if (!this.recognition || !this.isRunning) return;
    this.isRunning = false;
    try {
      this.recognition.stop();
    } catch (e) {}
  }

  isActive(): boolean {
    return this.isRunning;
  }
}

export const wakeWordListener = new WakeWordListener();
