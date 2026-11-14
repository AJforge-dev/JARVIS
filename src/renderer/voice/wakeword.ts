export class WakeWordListener {
  private recognition: any = null;
  private isRunning = false;
  private onDetectedCallback: (() => void) | null = null;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript.toLowerCase();
          if (transcript.includes('hey jarvis') || transcript.includes('jarvis')) {
            if (this.onDetectedCallback) {
              this.onDetectedCallback();
            }
          }
        }
      };

      this.recognition.onend = () => {
        // Auto-restart if active
        if (this.isRunning) {
          try {
            this.recognition.start();
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
}

export const wakeWordListener = new WakeWordListener();
