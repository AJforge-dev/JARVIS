import { ChatMessage, LLMEvent, LLMProvider, ProviderConfig, ToolDefinition } from './types';

export class OllamaProvider implements LLMProvider {
  id = 'ollama' as const;
  name = 'Ollama (Local)';
  defaultModel = 'llama3.1:8b';
  availableModels = ['llama3.1:8b', 'qwen2.5:7b', 'mistral', 'deepseek-r1:8b'];

  async testConnection(config: ProviderConfig): Promise<{ success: boolean; message: string }> {
    const base = config.baseUrl || 'http://127.0.0.1:11434';
    try {
      const res = await fetch(`${base}/api/tags`);
      if (res.ok) {
        const data = await res.json();
        const models = (data.models || []).map((m: any) => m.name);
        return { success: true, message: `Ollama connected! Found ${models.length} model(s).` };
      }
      return { success: false, message: `Ollama returned status ${res.status}` };
    } catch (e: any) {
      return { success: false, message: `Could not reach Ollama at ${base}. Ensure it is running.` };
    }
  }

  async *stream(
    messages: ChatMessage[],
    _tools: ToolDefinition[],
    config: ProviderConfig
  ): AsyncIterable<LLMEvent> {
    const base = config.baseUrl || 'http://127.0.0.1:11434';
    const model = config.model || this.defaultModel;

    try {
      const res = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          stream: true
        })
      });

      if (!res.ok) {
        yield { type: 'error', error: `Ollama returned status ${res.status}` };
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
