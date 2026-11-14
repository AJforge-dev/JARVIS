import { ChatMessage, LLMEvent, LLMProvider, ProviderConfig, ToolDefinition } from './types';

export class AnthropicProvider implements LLMProvider {
  id = 'anthropic' as const;
  name = 'Anthropic Claude';
  defaultModel = 'claude-3-5-sonnet-20241022';
  availableModels = [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229'
  ];

  async testConnection(config: ProviderConfig): Promise<{ success: boolean; message: string }> {
    if (!config.apiKey) return { success: false, message: 'Anthropic API key required' };
    return { success: true, message: 'Claude ready for requests.' };
  }

  async *stream(
    messages: ChatMessage[],
    tools: ToolDefinition[],
    config: ProviderConfig
  ): AsyncIterable<LLMEvent> {
    if (!config.apiKey) {
      yield { type: 'error', error: 'Anthropic API key not configured' };
      return;
    }

    const model = config.model || this.defaultModel;
    let systemPrompt = '';
    const formattedMessages: any[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemPrompt = msg.content;
      } else {
        formattedMessages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      }
    }

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          system: systemPrompt || undefined,
          messages: formattedMessages,
          stream: true,
          max_tokens: config.maxTokens ?? 2048,
          temperature: config.temperature ?? 0.7
        })
      });

      if (!res.ok) {
        yield { type: 'error', error: `Anthropic error ${res.status}: ${await res.text()}` };
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
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.type === 'content_block_delta' && data.delta?.text) {
                yield { type: 'token', content: data.delta.text };
              }
            } catch (e) {}
          }
        }
      }
    } catch (e: any) {
      yield { type: 'error', error: `Anthropic connection failed: ${e.message}` };
    }
  }
}
