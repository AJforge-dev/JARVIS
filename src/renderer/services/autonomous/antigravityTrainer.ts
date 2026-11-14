export interface LearnedPattern {
  id: string;
  trigger: string;
  action: string;
  frequency: number;
  lastUsed: number;
  confidence: number;
}

export class AntigravitySelfTrainer {
  private learnedPatterns: Map<string, LearnedPattern> = new Map();
  private trainingEpoch = 1;
  private isAutoTraining = true;

  constructor() {
    this.loadPersistedKnowledge();
  }

  private async loadPersistedKnowledge(): Promise<void> {
    try {
      const facts = await window.electronAPI.getMemoryFacts('antigravity_training');
      if (facts && facts.length > 0) {
        for (const f of facts) {
          try {
            const pattern = JSON.parse(f.value);
            this.learnedPatterns.set(pattern.trigger, pattern);
          } catch (e) {}
        }
        this.trainingEpoch = facts.length + 1;
      }
    } catch (e) {}
  }

  // Record an interaction and autonomously train on the pattern
  public recordInteraction(userSpeech: string, executedTool?: string, outputSuccess: boolean = true): void {
    if (!this.isAutoTraining || !userSpeech) return;

    const normalized = userSpeech.toLowerCase().trim();
    const existing = this.learnedPatterns.get(normalized);

    if (existing) {
      existing.frequency += 1;
      existing.lastUsed = Date.now();
      if (outputSuccess) {
        existing.confidence = Math.min(1.0, existing.confidence + 0.05);
      }
      this.learnedPatterns.set(normalized, existing);
    } else {
      const newPattern: LearnedPattern = {
        id: `pat_${Date.now()}`,
        trigger: normalized,
        action: executedTool || 'general_response',
        frequency: 1,
        lastUsed: Date.now(),
        confidence: outputSuccess ? 0.8 : 0.4
      };
      this.learnedPatterns.set(normalized, newPattern);
    }

    this.trainingEpoch += 1;

    // Persist learned memory fact through IPC
    try {
      window.electronAPI.addMemoryFact({
        key: `pattern_${normalized.slice(0, 30)}`,
        value: JSON.stringify(this.learnedPatterns.get(normalized)),
        category: 'antigravity_training'
      });
    } catch (e) {}
  }

  // Returns dynamically synthesized Antigravity Self-Trained System Prompt
  public getAntigravityTrainedContext(): string {
    const topPatterns = Array.from(this.learnedPatterns.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5)
      .map(p => `• User often triggers "${p.trigger}" -> execute ${p.action} (Confidence: ${(p.confidence * 100).toFixed(0)}%)`)
      .join('\n');

    return (
      `\n\n[ANTIGRAVITY AUTONOMOUS SELF-TRAINING ENGINE (Epoch ${this.trainingEpoch})]\n` +
      `Active Agent: JARVIS (Autonomous Tactical Intelligence for AK)\n` +
      `Tone Directive: Aggressive, authoritative, sharp, commanding voice speech. Never hesitant.\n` +
      `Learned Behavioral Patterns:\n${topPatterns || '• Initializing baseline neural pathways for AK.'}\n` +
      `Directive: Acknowledge orders directly and execute tools immediately without passive fluff.`
    );
  }

  public getStats() {
    return {
      epoch: this.trainingEpoch,
      patternsCount: this.learnedPatterns.size,
      status: 'Self-Training Active (Antigravity Core)'
    };
  }
}

export const antigravityTrainer = new AntigravitySelfTrainer();
