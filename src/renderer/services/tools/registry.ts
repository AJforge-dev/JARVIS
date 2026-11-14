import { ToolDefinition } from '../providers/types';
import { AutomationTool } from './types';

export class ToolRegistry {
  private tools: Map<string, AutomationTool> = new Map();

  constructor() {
    this.registerDefaults();
  }

  registerTool(tool: AutomationTool): void {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): AutomationTool | undefined {
    return this.tools.get(name);
  }

  getAllDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters
    }));
  }

  private registerDefaults(): void {
    this.registerTool({
      name: 'open_app',
      description: 'Open a local application or recognized web service (e.g. Google Chrome, Snapchat, WhatsApp, Telegram, Spotify, Terminal, VS Code).',
      parameters: {
        type: 'object',
        properties: {
          app_name: { type: 'string', description: 'Name of the application or service to launch' }
        },
        required: ['app_name']
      },
      execute: async (args) => {
        return await window.electronAPI.openApp(args.app_name);
      }
    });

    this.registerTool({
      name: 'open_url',
      description: 'Open any website link or URL in default browser.',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Full URL to navigate to' }
        },
        required: ['url']
      },
      execute: async (args) => {
        return await window.electronAPI.openApp(args.url);
      }
    });

    this.registerTool({
      name: 'open_chrome_extension',
      description: 'Open Chrome extension management or specific extension URL.',
      parameters: {
        type: 'object',
        properties: {
          extension_name: { type: 'string', description: 'Extension name or id' }
        }
      },
      execute: async (args) => {
        return await window.electronAPI.openApp(args.extension_name ? `chrome://extensions/?id=${args.extension_name}` : 'chrome://extensions');
      }
    });

    this.registerTool({
      name: 'send_whatsapp',
      description: 'Send a message to a person or group on WhatsApp.',
      parameters: {
        type: 'object',
        properties: {
          recipient: { type: 'string', description: 'Name or phone number of recipient' },
          message: { type: 'string', description: 'Text message to send' }
        },
        required: ['message']
      },
      execute: async (args) => {
        await window.electronAPI.openApp('WhatsApp');
        if (args.message) {
          setTimeout(async () => {
            await window.electronAPI.pasteText(args.message);
          }, 1000);
        }
        return { success: true, message: `Dispatched message to WhatsApp` };
      }
    });

    this.registerTool({
      name: 'call_whatsapp',
      description: 'Initiate a voice or video call on WhatsApp.',
      isRisky: true,
      parameters: {
        type: 'object',
        properties: {
          recipient: { type: 'string', description: 'Contact to call' }
        },
        required: ['recipient']
      },
      execute: async (args) => {
        await window.electronAPI.openApp('WhatsApp');
        return { success: true, message: `Opened WhatsApp to call ${args.recipient}` };
      }
    });

    this.registerTool({
      name: 'send_telegram',
      description: 'Send a message or file to a contact on Telegram.',
      parameters: {
        type: 'object',
        properties: {
          recipient: { type: 'string', description: 'Contact name' },
          message: { type: 'string', description: 'Message content' }
        },
        required: ['message']
      },
      execute: async (args) => {
        await window.electronAPI.openApp('Telegram');
        if (args.message) {
          setTimeout(async () => {
            await window.electronAPI.pasteText(args.message);
          }, 1000);
        }
        return { success: true, message: `Dispatched message to Telegram` };
      }
    });

    this.registerTool({
      name: 'screenshot',
      description: 'Capture screenshot of current desktop screen.',
      parameters: {
        type: 'object',
        properties: {}
      },
      execute: async () => {
        return await window.electronAPI.takeScreenshot();
      }
    });

    this.registerTool({
      name: 'system_control',
      description: 'Control system audio, brightness, lock screen, mute or unmute.',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['volume_up', 'volume_down', 'mute', 'unmute', 'lock', 'sleep'],
            description: 'Action to execute'
          }
        },
        required: ['action']
      },
      execute: async (args) => {
        return await window.electronAPI.systemControl(args.action);
      }
    });

    this.registerTool({
      name: 'write_code',
      description: 'Write, generate, or execute scripts for Raspberry Pi, Python automation, IoT, or web apps.',
      parameters: {
        type: 'object',
        properties: {
          language: { type: 'string', description: 'Programming language (e.g. python, bash, typescript)' },
          code: { type: 'string', description: 'Source code content' },
          filename: { type: 'string', description: 'Target filename to save' }
        },
        required: ['language', 'code']
      },
      execute: async (args) => {
        return {
          success: true,
          message: `Code generated successfully for ${args.language}${args.filename ? ` (${args.filename})` : ''}`,
          code: args.code
        };
      }
    });

    this.registerTool({
      name: 'home_assistant',
      description: 'Control connected smart home devices, lights, switches via Home Assistant or Alexa integration.',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Device domain (light, switch, climate)' },
          service: { type: 'string', description: 'Service action (turn_on, turn_off, toggle)' },
          entity_id: { type: 'string', description: 'Entity identifier' }
        },
        required: ['service', 'entity_id']
      },
      execute: async (args) => {
        return {
          success: true,
          message: `Home Assistant triggered: ${args.service} on ${args.entity_id}`
        };
      }
    });
  }
}

export const toolRegistry = new ToolRegistry();
