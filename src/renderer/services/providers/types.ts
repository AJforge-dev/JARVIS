export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface ChatMessage {
  id?: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export type LLMEvent =
  | { type: 'token'; content: string }
  | { type: 'tool_call'; toolCall: ToolCall }
  | { type: 'done'; fullText: string; toolCalls?: ToolCall[] }
  | { type: 'error'; error: string };

export interface ProviderConfig {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMProvider {
  id: 'anthropic' | 'openai' | 'gemini' | 'ollama';
  name: string;
  defaultModel: string;
  availableModels: string[];
  stream(
    messages: ChatMessage[],
    tools: ToolDefinition[],
    config: ProviderConfig
  ): AsyncIterable<LLMEvent>;
  testConnection(config: ProviderConfig): Promise<{ success: boolean; message: string }>;
}
