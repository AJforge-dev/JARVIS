import { ChatMessage, LLMEvent, ToolDefinition } from '../providers/types';

export class AutonomousEngine {
  public static async *process(
    messages: ChatMessage[],
    _tools: ToolDefinition[]
  ): AsyncIterable<LLMEvent> {
    const lastMsg = messages[messages.length - 1];
    const userText = (lastMsg?.content || '').trim().toLowerCase();

    // Small delay to simulate natural conversational pacing
    yield { type: 'token', content: '' };

    // 1. GREETINGS & WAKE WORD
    if (
      userText === 'hey jarvis' ||
      userText === 'hi jarvis' ||
      userText === 'hello jarvis' ||
      userText === 'hello' ||
      userText === 'hi' ||
      userText === 'who are you' ||
      userText === 'what can you do'
    ) {
      const greeting = `Hello AK. I'm Jarvis, your voice-first AI partner. All systems are operational.\n\nI can execute desktop automation, open applications (Chrome, Snapchat, WhatsApp, Telegram), control system settings, write code, run routines, and manage your day-to-day workflow. What would you like me to do?`;
      
      for (const token of greeting.split(' ')) {
        yield { type: 'token', content: token + ' ' };
        await new Promise(r => setTimeout(r, 20));
      }
      return;
    }

    // 2. OPEN APPLICATIONS (Chrome, Snapchat, WhatsApp, Telegram, Spotify, Terminal, VS Code, etc.)
    const openMatch = userText.match(/(?:open|launch|start|show)\s+(.+)/i);
    if (openMatch) {
      const target = openMatch[1].trim();

      // Check if it's a chrome extension
      if (target.includes('chrome extension') || target.includes('extension')) {
        const extName = target.replace(/chrome extension|extension/gi, '').trim();
        yield {
          type: 'tool_call',
          toolCall: {
            id: `call_${Date.now()}`,
            name: 'open_chrome_extension',
            arguments: { extension_name: extName || 'extensions' }
          }
        };
        const reply = `Opening Chrome extensions page for you.`;
        for (const token of reply.split(' ')) {
          yield { type: 'token', content: token + ' ' };
          await new Promise(r => setTimeout(r, 20));
        }
        return;
      }

      // Check if it's Snapchat
      if (target.includes('snapchat')) {
        yield {
          type: 'tool_call',
          toolCall: {
            id: `call_${Date.now()}`,
            name: 'open_app',
            arguments: { app_name: 'Snapchat' }
          }
        };
        const reply = `Opening Snapchat for you, AK.`;
        for (const token of reply.split(' ')) {
          yield { type: 'token', content: token + ' ' };
          await new Promise(r => setTimeout(r, 20));
        }
        return;
      }

      // Check if it's WhatsApp
      if (target.includes('whatsapp')) {
        yield {
          type: 'tool_call',
          toolCall: {
            id: `call_${Date.now()}`,
            name: 'open_app',
            arguments: { app_name: 'WhatsApp' }
          }
        };
        const reply = `Opening WhatsApp for you.`;
        for (const token of reply.split(' ')) {
          yield { type: 'token', content: token + ' ' };
          await new Promise(r => setTimeout(r, 20));
        }
        return;
      }

      // Check if it's Telegram
      if (target.includes('telegram')) {
        yield {
          type: 'tool_call',
          toolCall: {
            id: `call_${Date.now()}`,
            name: 'open_app',
            arguments: { app_name: 'Telegram' }
          }
        };
        const reply = `Opening Telegram for you.`;
        for (const token of reply.split(' ')) {
          yield { type: 'token', content: token + ' ' };
          await new Promise(r => setTimeout(r, 20));
        }
        return;
      }

      // Generic App or URL
      yield {
        type: 'tool_call',
        toolCall: {
          id: `call_${Date.now()}`,
          name: target.startsWith('http') ? 'open_url' : 'open_app',
          arguments: target.startsWith('http') ? { url: target } : { app_name: target }
        }
      };
      const reply = `Executing request: Opening ${target}.`;
      for (const token of reply.split(' ')) {
        yield { type: 'token', content: token + ' ' };
        await new Promise(r => setTimeout(r, 20));
      }
      return;
    }

    // 3. WHATSAPP & TELEGRAM MESSAGING / CALLING
    if (userText.includes('whatsapp') || userText.includes('text') || userText.includes('call')) {
      if (userText.includes('call') && userText.includes('whatsapp')) {
        yield {
          type: 'tool_call',
          toolCall: {
            id: `call_${Date.now()}`,
            name: 'call_whatsapp',
            arguments: { recipient: 'Contact' }
          }
        };
        yield { type: 'token', content: 'Initiating WhatsApp call.' };
        return;
      }

      if (userText.includes('whatsapp')) {
        yield {
          type: 'tool_call',
          toolCall: {
            id: `call_${Date.now()}`,
            name: 'send_whatsapp',
            arguments: { recipient: '', message: lastMsg.content }
          }
        };
        yield { type: 'token', content: 'Opening WhatsApp to send your message.' };
        return;
      }

      if (userText.includes('telegram')) {
        yield {
          type: 'tool_call',
          toolCall: {
            id: `call_${Date.now()}`,
            name: 'send_telegram',
            arguments: { recipient: '', message: lastMsg.content }
          }
        };
        yield { type: 'token', content: 'Opening Telegram to send your message.' };
        return;
      }
    }

    // 4. SCREENSHOT
    if (userText.includes('screenshot') || userText.includes('screen capture') || userText.includes('capture screen')) {
      yield {
        type: 'tool_call',
        toolCall: {
          id: `call_${Date.now()}`,
          name: 'screenshot',
          arguments: {}
        }
      };
      yield { type: 'token', content: 'Capturing current screen screenshot.' };
      return;
    }

    // 5. SYSTEM CONTROLS (Volume, Lock, Mute)
    if (userText.includes('volume') || userText.includes('mute') || userText.includes('lock screen')) {
      let action = 'volume_up';
      if (userText.includes('down')) action = 'volume_down';
      else if (userText.includes('mute')) action = 'mute';
      else if (userText.includes('lock')) action = 'lock';

      yield {
        type: 'tool_call',
        toolCall: {
          id: `call_${Date.now()}`,
          name: 'system_control',
          arguments: { action }
        }
      };
      yield { type: 'token', content: `Adjusting system control: ${action.replace('_', ' ')}.` };
      return;
    }

    // 6. CODE GENERATION (Raspberry Pi, Python, Robotics, Scripts)
    if (
      userText.includes('write code') ||
      userText.includes('code') ||
      userText.includes('script') ||
      userText.includes('python') ||
      userText.includes('raspberry pi')
    ) {
      let codeSnippet = '';
      if (userText.includes('raspberry pi') || userText.includes('gpio') || userText.includes('robot')) {
        codeSnippet = `\`\`\`python
# Raspberry Pi Autonomous Control Script
# Generated by Jarvis for AK
import time
try:
    import RPi.GPIO as GPIO
except ImportError:
    import Mock.GPIO as GPIO # Simulated GPIO

LED_PIN = 18
BUZZER_PIN = 23

GPIO.setmode(GPIO.BCM)
GPIO.setup(LED_PIN, GPIO.OUT)
GPIO.setup(BUZZER_PIN, GPIO.OUT)

print("[Jarvis] Raspberry Pi hardware initialized.")
try:
    while True:
        GPIO.output(LED_PIN, GPIO.HIGH)
        time.sleep(0.5)
        GPIO.output(LED_PIN, GPIO.LOW)
        time.sleep(0.5)
except KeyboardInterrupt:
    GPIO.cleanup()
    print("[Jarvis] GPIO cleaned up successfully.")
\`\`\``;
      } else {
        codeSnippet = `\`\`\`python
# Python Automation Task
# Generated by Jarvis for AK

def run_automation_task():
    print("[Jarvis] Task initiated successfully.")
    # Process automation steps
    return {"status": "success", "user": "AK"}

if __name__ == "__main__":
    result = run_automation_task()
    print(result)
\`\`\``;
      }

      const response = `Here is the implementation code you requested, AK:\n\n${codeSnippet}\n\nI can execute this or save it to your documents folder.`;
      for (const token of response.split(' ')) {
        yield { type: 'token', content: token + ' ' };
        await new Promise(r => setTimeout(r, 20));
      }
      return;
    }

    // 7. HOME ASSISTANT / SMART HOME
    if (userText.includes('home assistant') || userText.includes('light') || userText.includes('alexa')) {
      yield {
        type: 'tool_call',
        toolCall: {
          id: `call_${Date.now()}`,
          name: 'home_assistant',
          arguments: { domain: 'light', service: 'toggle', entity_id: 'light.main_room' }
        }
      };
      yield { type: 'token', content: 'Sending smart device trigger command to Home Assistant.' };
      return;
    }

    // 8. GENERAL ASSISTANT DIALOGUE
    const intelligentResponse = `I've noted that, AK. All desktop automation and voice subsystems are standing by.\n\n` +
      `You can ask me to open any app, send messages on WhatsApp or Telegram, write Python / Raspberry Pi code, take screenshots, or schedule background routines.\n\n` +
      `*(💡 Tip: To enable deep cloud reasoning across open-ended research topics, connect your free Google Gemini API key in Settings → AI Brain).*`;

    for (const token of intelligentResponse.split(' ')) {
      yield { type: 'token', content: token + ' ' };
      await new Promise(r => setTimeout(r, 20));
    }
  }
}
