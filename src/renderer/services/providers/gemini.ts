import { ChatMessage, LLMEvent, LLMProvider, ProviderConfig, ToolDefinition } from './types';

export class GeminiProvider implements LLMProvider {
  id = 'gemini' as const;
  name = 'Google Gemini';
  defaultModel = 'gemini-2.0-flash';
  availableModels = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];

  async testConnection(config: ProviderConfig): Promise<{ success: boolean; message: string }> {
    if (!config.apiKey) {
      return { success: false, message: 'Gemini API key is required' };
    }
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${config.apiKey}`;
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.text();
        return { success: false, message: `Gemini API error: ${err}` };
      }
      return { success: true, message: 'Connected successfully to Google Gemini!' };
    } catch (e: any) {
      return { success: false, message: `Failed to connect: ${e.message}` };
    }
  }

  async *stream(
    messages: ChatMessage[],
    tools: ToolDefinition[],
    config: ProviderConfig
  ): AsyncIterable<LLMEvent> {
    const apiKey = config.apiKey;
    if (!apiKey) {
      yield { type: 'error', error: 'Gemini API key not configured' };
      return;
    }

    const model = config.model || this.defaultModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

    // Convert chat messages to Gemini contents format
    const contents: any[] = [];
    let systemInstruction: any = undefined;

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction = {
          parts: [{ text: msg.content }]
        };
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }

    // Convert tools to Gemini format
    const geminiTools = tools.length > 0 ? [{
      functionDeclarations: tools.map(t => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }))
    }] : undefined;

    const body: any = {
      contents,
      generationConfig: {
        temperature: config.temperature ?? 0.7,
        maxOutputTokens: config.maxTokens ?? 2048
      }
    };

    if (systemInstruction) body.systemInstruction = systemInstruction;
    if (geminiTools) body.tools = geminiTools;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errText = await response.text();
        yield { type: 'error', error: `Gemini API returned status ${response.status}: ${errText}` };
        return;
      }

      if (!response.body) {
        yield { type: 'error', error: 'No response body stream received from Gemini' };
        return;
      }

      const reader = response.body.getReader();
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
              const data = JSON.parse(dataStr);
              const candidate = data.candidates?.[0];
              const parts = candidate?.content?.parts || [];

              for (const part of parts) {
                if (part.text) {
                  yield { type: 'token', content: part.text };
                }
                if (part.functionCall) {
                  yield {
                    type: 'tool_call',
                    toolCall: {
                      id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                      name: part.functionCall.name,
                      arguments: part.functionCall.args || {}
                    }
                  };
                }
              }
            } catch (e) {}
          }
        }
      }
    } catch (e: any) {
      yield { type: 'error', error: `Gemini stream failure: ${e.message}` };
    }
  }
}
