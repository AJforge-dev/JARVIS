import { ChatMessage, LLMEvent, LLMProvider, ProviderConfig, ToolDefinition } from './types';
import { antigravityTrainer } from '../autonomous/antigravityTrainer';

export class OllamaProvider implements LLMProvider {
  id = 'ollama' as const;
  name = 'Ollama (Local)';
  defaultModel = 'llama3.2:latest';
  availableModels = ['llama3.2:latest', 'qwen2.5:latest', 'mistral:latest', 'deepseek-r1:latest'];

  async testConnection(config: ProviderConfig): Promise<{ success: boolean; message: string }> {
    const base = config.baseUrl || 'http://127.0.0.1:11434';
    try {
      const res = await fetch(`${base}/api/tags`);
      if (res.ok) {
        const data = await res.json();
        const models = (data.models || []).map((m: any) => m.name);
        return {
          success: true,
          message: `Ollama connected at ${base}! Available models: ${models.join(', ') || 'None found (run ollama pull llama3.2)'}`
        };
      }
      return { success: false, message: `Ollama returned status ${res.status}` };
    } catch (e: any) {
      return { success: false, message: `Could not reach Ollama at ${base}. Run 'ollama serve' in your terminal.` };
    }
  }

  async getInstalledModels(baseUrl?: string): Promise<string[]> {
    const base = baseUrl || 'http://127.0.0.1:11434';
    try {
      const res = await fetch(`${base}/api/tags`);
      if (res.ok) {
        const data = await res.json();
        return (data.models || []).map((m: any) => m.name);
      }
    } catch (e) {}
    return this.availableModels;
  }

  async *stream(
    messages: ChatMessage[],
    _tools: ToolDefinition[],
    config: ProviderConfig
  ): AsyncIterable<LLMEvent> {
    const base = config.baseUrl || 'http://127.0.0.1:11434';
    const model = config.model || this.defaultModel;

    // Inject Antigravity Self-Trained Autonomous Memory
    const trainedContext = antigravityTrainer.getAntigravityTrainedContext();
    const systemMessage = {
      role: 'system',
      content: `You are JARVIS, an assertive, commanding, high-authority AI assistant engineered for AK. Speak directly, crisply, and with confidence.${trainedContext}`
    };

    const formattedMessages = [
      systemMessage,
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    try {
      const res = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          stream: true
        })
      });

      if (!res.ok) {
        yield { type: 'error', error: `Ollama returned status ${res.status}. Ensure model '${model}' is pulled.` };
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const data = JSON.parse(trimmed);
            if (data.message?.content) {
              yield { type: 'token', content: data.message.content };
            }
          } catch (e) {}
        }
      }
    } catch (e: any) {
      yield { type: 'error', error: `Ollama connection failed: ${e.message}` };
    }
  }
}
