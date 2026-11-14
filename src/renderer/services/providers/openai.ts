import { ChatMessage, LLMEvent, LLMProvider, ProviderConfig, ToolDefinition } from './types';

export class OpenAIProvider implements LLMProvider {
  id = 'openai' as const;
  name = 'OpenAI';
  defaultModel = 'gpt-4o';
  availableModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'];

  async testConnection(config: ProviderConfig): Promise<{ success: boolean; message: string }> {
    if (!config.apiKey) return { success: false, message: 'OpenAI API key required' };
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${config.apiKey}` }
      });
      if (res.ok) return { success: true, message: 'OpenAI connected successfully!' };
      return { success: false, message: `OpenAI returned status ${res.status}` };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  async *stream(
    messages: ChatMessage[],
    tools: ToolDefinition[],
    config: ProviderConfig
  ): AsyncIterable<LLMEvent> {
    if (!config.apiKey) {
      yield { type: 'error', error: 'OpenAI API key not configured' };
      return;
    }

    const model = config.model || this.defaultModel;
    const formattedMessages = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const formattedTools = tools.length > 0 ? tools.map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }
    })) : undefined;

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          tools: formattedTools,
          stream: true,
          temperature: config.temperature ?? 0.7
        })
      });

      if (!res.ok) {
        yield { type: 'error', error: `OpenAI error ${res.status}: ${await res.text()}` };
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
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed.choices?.[0]?.delta;
              if (delta?.content) {
                yield { type: 'token', content: delta.content };
              }
              if (delta?.tool_calls) {
                for (const tc of delta.tool_calls) {
                  if (tc.function?.name) {
                    yield {
                      type: 'tool_call',
                      toolCall: {
                        id: tc.id || `call_${Date.now()}`,
                        name: tc.function.name,
                        arguments: tc.function.arguments ? JSON.parse(tc.function.arguments) : {}
                      }
                    };
                  }
                }
              }
            } catch (e) {}
          }
        }
      }
    } catch (e: any) {
      yield { type: 'error', error: `OpenAI connection failed: ${e.message}` };
    }
  }
}
