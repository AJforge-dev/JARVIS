import { AnthropicProvider } from './anthropic';
import { GeminiProvider } from './gemini';
import { OllamaProvider } from './ollama';
import { OpenAIProvider } from './openai';
import { ChatMessage, LLMEvent, LLMProvider, ProviderConfig, ToolDefinition } from './types';
import { AutonomousEngine } from '../autonomous/engine';

export type TaskMode = 'auto' | 'fast' | 'smart';

export interface ProviderSettings {
  primaryProvider: 'anthropic' | 'openai' | 'gemini' | 'ollama';
  fallbackOrder: Array<'anthropic' | 'openai' | 'gemini' | 'ollama'>;
  fastProvider: 'anthropic' | 'openai' | 'gemini' | 'ollama';
  smartProvider: 'anthropic' | 'openai' | 'gemini' | 'ollama';
  configs: {
    anthropic: ProviderConfig;
    openai: ProviderConfig;
    gemini: ProviderConfig;
    ollama: ProviderConfig;
  };
}

export class LLMRouter {
  private providers: Record<string, LLMProvider>;

  constructor() {
    this.providers = {
      anthropic: new AnthropicProvider(),
      openai: new OpenAIProvider(),
      gemini: new GeminiProvider(),
      ollama: new OllamaProvider()
    };
  }

  getProvider(id: string): LLMProvider | undefined {
    return this.providers[id];
  }

  getAllProviders(): LLMProvider[] {
    return Object.values(this.providers);
  }

  async *stream(
    messages: ChatMessage[],
    tools: ToolDefinition[],
    settings: ProviderSettings,
    mode: TaskMode = 'auto'
  ): AsyncIterable<LLMEvent> {
    let initialProviderId: 'anthropic' | 'openai' | 'gemini' | 'ollama' = settings.primaryProvider;

    if (mode === 'fast') {
      initialProviderId = settings.fastProvider || 'gemini';
    } else if (mode === 'smart') {
      initialProviderId = settings.smartProvider || 'anthropic';
    }

    const queue: Array<'anthropic' | 'openai' | 'gemini' | 'ollama'> = [
      initialProviderId,
      ...(settings.fallbackOrder || ['gemini', 'openai', 'anthropic', 'ollama']).filter(
        id => id !== initialProviderId
      )
    ];

    for (const providerId of queue) {
      const provider = this.providers[providerId];
      if (!provider) continue;

      const config = settings.configs[providerId] || {};

      // For cloud providers, check if an API key exists unless it's Ollama
      if (providerId !== 'ollama' && !config.apiKey) {
        continue;
      }

      let hadYield = false;
      let hadError = false;

      try {
        const stream = provider.stream(messages, tools, config);
        for await (const event of stream) {
          if (event.type === 'error') {
            hadError = true;
            break; // Try next fallback provider
          } else {
            hadYield = true;
            yield event;
          }
        }

        if (hadYield && !hadError) {
          return; // Successfully completed streaming
        }
      } catch (err: any) {
        // Fall to next
      }
    }

    // If all cloud/local providers failed or were unconfigured, seamlessly execute via Jarvis Autonomous Core
    try {
      const autonomousStream = AutonomousEngine.process(messages, tools);
      for await (const event of autonomousStream) {
        yield event;
      }
    } catch (fallbackErr: any) {
      yield {
        type: 'error',
        error: `Jarvis Autonomous Core error: ${fallbackErr.message}`
      };
    }
  }
}

export const defaultProviderSettings: ProviderSettings = {
  primaryProvider: 'ollama',
  fallbackOrder: ['ollama', 'gemini', 'openai', 'anthropic'],
  fastProvider: 'ollama',
  smartProvider: 'ollama',
  configs: {
    anthropic: {
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.7
    },
    openai: {
      model: 'gpt-4o',
      temperature: 0.7
    },
    gemini: {
      model: 'gemini-2.0-flash',
      temperature: 0.7
    },
    ollama: {
      model: 'llama3.2:latest',
      baseUrl: 'http://127.0.0.1:11434',
      temperature: 0.7
    }
  }
};
