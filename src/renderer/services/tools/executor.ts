import { toolRegistry } from './registry';
import { SafetyManager } from './safety';
import { ExecutionPlan, ExecutionStep } from './types';

export class PlanExecutor {
  private activePlan: ExecutionPlan | null = null;
  private safetyManager: SafetyManager;
  private onUpdateCallbacks: Array<(plan: ExecutionPlan | null) => void> = [];
  private pendingConfirmationResolve: ((value: boolean) => void) | null = null;

  constructor(safetyManager: SafetyManager) {
    this.safetyManager = safetyManager;
  }

  onUpdate(callback: (plan: ExecutionPlan | null) => void): () => void {
    this.onUpdateCallbacks.push(callback);
    return () => {
      this.onUpdateCallbacks = this.onUpdateCallbacks.filter(cb => cb !== callback);
    };
  }

  private notify(): void {
    for (const cb of this.onUpdateCallbacks) {
      cb(this.activePlan);
    }
  }

  createPlan(title: string, rawSteps: Array<{ name: string; arguments: Record<string, any> }>): ExecutionPlan {
    const steps: ExecutionStep[] = rawSteps.map((raw, idx) => ({
      id: `step_${Date.now()}_${idx}`,
      toolName: raw.name,
      description: `Execute ${raw.name}`,
      parameters: raw.arguments || {},
      status: 'pending'
    }));

    this.activePlan = {
      id: `plan_${Date.now()}`,
      title,
      steps,
      currentStepIndex: 0,
      status: 'planning'
    };

    this.notify();
    return this.activePlan;
  }

  async executePlan(): Promise<boolean> {
    if (!this.activePlan) return false;
    this.activePlan.status = 'executing';
    this.notify();

    for (let i = 0; i < this.activePlan.steps.length; i++) {
      if ((this.activePlan.status as string) === 'cancelled') return false;

      this.activePlan.currentStepIndex = i;
      const step = this.activePlan.steps[i];

      // Safety checks
      if (!this.safetyManager.isAllowed(step.toolName)) {
        step.status = 'failed';
        step.error = `Tool ${step.toolName} is blocked by system safety policy`;
        this.notify();
        continue;
      }

      if (this.safetyManager.requiresConfirmation(step.toolName)) {
        step.status = 'awaiting_confirmation';
        this.notify();
        const confirmed = await this.waitForConfirmation();
        if (!confirmed) {
          step.status = 'failed';
          step.error = 'Action denied by user';
          this.notify();
          continue;
        }
      }

      step.status = 'running';
      this.notify();

      try {
        const tool = toolRegistry.getTool(step.toolName);
        if (!tool) throw new Error(`Unknown tool: ${step.toolName}`);

        const result = await tool.execute(step.parameters);
        step.status = 'completed';
        step.result = result;

        // Log to database
        await window.electronAPI.logAction({
          toolName: step.toolName,
          parameters: step.parameters,
          result,
          status: 'success'
        });
      } catch (err: any) {
        step.status = 'failed';
        step.error = err.message;
        await window.electronAPI.logAction({
          toolName: step.toolName,
          parameters: step.parameters,
          status: 'failed',
          error: err.message
        });
      }

      this.notify();
    }

    this.activePlan.status = 'completed';
    this.notify();
    return true;
  }

  resolveConfirmation(confirmed: boolean): void {
    if (this.pendingConfirmationResolve) {
      this.pendingConfirmationResolve(confirmed);
      this.pendingConfirmationResolve = null;
    }
  }

  cancelActivePlan(): void {
    if (this.activePlan) {
      this.activePlan.status = 'cancelled';
      if (this.pendingConfirmationResolve) {
        this.pendingConfirmationResolve(false);
        this.pendingConfirmationResolve = null;
      }
      this.notify();
    }
  }

  private waitForConfirmation(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.pendingConfirmationResolve = resolve;
    });
  }
}
