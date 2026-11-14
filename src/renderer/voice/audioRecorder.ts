export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private volumeCallbacks: Array<(vol: number) => void> = [];
  private isRecording = false;
  private animFrameId: number | null = null;

  async start(): Promise<void> {
    if (this.isRecording) return;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
      this.isRecording = true;
      this.monitorVolume();
    } catch (err) {
      console.error('Audio recorder error:', err);
      throw err;
    }
  }

  stop(): void {
    if (!this.isRecording) return;
    this.isRecording = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  onVolumeChange(callback: (vol: number) => void): () => void {
    this.volumeCallbacks.push(callback);
    return () => {
      this.volumeCallbacks = this.volumeCallbacks.filter(cb => cb !== callback);
    };
  }

  private monitorVolume(): void {
    if (!this.isRecording || !this.analyser) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    const normalized = Math.min(1, average / 128);

    for (const cb of this.volumeCallbacks) {
      cb(normalized);
    }

    this.animFrameId = requestAnimationFrame(() => this.monitorVolume());
  }
}

export const audioRecorder = new AudioRecorder();
