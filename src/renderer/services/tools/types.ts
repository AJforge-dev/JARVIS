import { ToolDefinition } from '../providers/types';

export interface AutomationTool {
  name: string;
  description: string;
  parameters: ToolDefinition['parameters'];
  isRisky?: boolean;
  execute: (args: Record<string, any>) => Promise<any>;
}

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'awaiting_confirmation';

export interface ExecutionStep {
  id: string;
  toolName: string;
  description: string;
  parameters: Record<string, any>;
  status: StepStatus;
  result?: any;
  error?: string;
}

export interface ExecutionPlan {
  id: string;
  title: string;
  steps: ExecutionStep[];
  currentStepIndex: number;
  status: 'planning' | 'executing' | 'paused' | 'completed' | 'cancelled';
}
