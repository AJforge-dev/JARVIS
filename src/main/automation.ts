import { exec } from 'child_process';
import { promisify } from 'util';
import { clipboard, shell } from 'electron';

const execAsync = promisify(exec);

export class DesktopAutomation {
  public static async openApp(appName: string): Promise<{ success: boolean; message: string }> {
    const cleanName = appName.trim();

    // Check specific web apps or browser extensions
    if (cleanName.toLowerCase() === 'snapchat') {
      try {
        await execAsync(`open -a "Snapchat"`);
        return { success: true, message: `Opened native Snapchat app` };
      } catch {
        await shell.openExternal('https://web.snapchat.com');
        return { success: true, message: `Opened Snapchat Web in your browser` };
      }
    }

    if (cleanName.toLowerCase() === 'whatsapp') {
      try {
        await execAsync(`open -a "WhatsApp"`);
        return { success: true, message: `Opened WhatsApp desktop app` };
      } catch {
        await shell.openExternal('https://web.whatsapp.com');
        return { success: true, message: `Opened WhatsApp Web in your browser` };
      }
    }

    if (cleanName.toLowerCase() === 'telegram') {
      try {
        await execAsync(`open -a "Telegram"`);
        return { success: true, message: `Opened Telegram desktop app` };
      } catch {
        await shell.openExternal('https://web.telegram.org');
        return { success: true, message: `Opened Telegram Web in your browser` };
      }
    }

    if (cleanName.toLowerCase().includes('chrome extension') || cleanName.toLowerCase() === 'extensions') {
      await shell.openExternal('chrome://extensions');
      return { success: true, message: `Opened Chrome Extensions management page` };
    }

    if (cleanName.startsWith('http://') || cleanName.startsWith('https://')) {
      await shell.openExternal(cleanName);
      return { success: true, message: `Opened URL: ${cleanName}` };
    }

    try {
      if (process.platform === 'darwin') {
        await execAsync(`open -a "${cleanName}"`);
      } else if (process.platform === 'win32') {
        await execAsync(`start "" "${cleanName}"`);
      } else {
        await execAsync(`xdg-open "${cleanName}" || ${cleanName} &`);
      }
      return { success: true, message: `Successfully opened ${cleanName}` };
    } catch (e: any) {
      // Fallback try Spotlight search / launch
      try {
        await shell.openPath(`/Applications/${cleanName}.app`);
        return { success: true, message: `Opened ${cleanName} from Applications` };
      } catch {
        return { success: false, message: `Failed to open ${cleanName}: ${e.message}` };
      }
    }
  }

  public static async closeApp(appName: string): Promise<{ success: boolean; message: string }> {
    try {
      if (process.platform === 'darwin') {
        await execAsync(`osascript -e 'quit app "${appName}"'`);
      } else if (process.platform === 'win32') {
        await execAsync(`taskkill /IM "${appName}.exe" /F`);
      } else {
        await execAsync(`pkill -f "${appName}"`);
      }
      return { success: true, message: `Closed ${appName}` };
    } catch (e: any) {
      return { success: false, message: `Could not close ${appName}: ${e.message}` };
    }
  }

  public static async focusWindow(windowTitle: string): Promise<{ success: boolean; message: string }> {
    try {
      if (process.platform === 'darwin') {
        const script = `
          tell application "System Events"
            set procList to every process whose visible is true
            repeat with proc in procList
              if name of proc contains "${windowTitle}" then
                set frontmost of proc to true
                return
              end if
            end repeat
          end tell
        `;
        await execAsync(`osascript -e '${script}'`);
      }
      return { success: true, message: `Focused window for ${windowTitle}` };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  public static async pasteText(text: string): Promise<{ success: boolean }> {
    clipboard.writeText(text);
    try {
      if (process.platform === 'darwin') {
        await execAsync(`osascript -e 'tell application "System Events" to keystroke "v" using command down'`);
      } else {
        await execAsync(`powershell -command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys('^v')"`);
      }
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  public static async typeTextDirect(text: string): Promise<{ success: boolean }> {
    try {
      if (process.platform === 'darwin') {
        const safeText = text.replace(/"/g, '\\"');
        await execAsync(`osascript -e 'tell application "System Events" to keystroke "${safeText}"'`);
      } else {
        const safeText = text.replace(/"/g, '`"');
        await execAsync(`powershell -command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys('${safeText}')"`);
      }
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  public static async pressKeys(keys: string[]): Promise<{ success: boolean }> {
    try {
      if (process.platform === 'darwin') {
        const key = keys[keys.length - 1];
        await execAsync(`osascript -e 'tell application "System Events" to key code 36'`); // Return key
      }
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  public static async systemControl(action: string, value?: number): Promise<{ success: boolean; message: string }> {
    try {
      if (process.platform === 'darwin') {
        if (action === 'volume_up') {
          await execAsync(`osascript -e "set volume output volume ((output volume of (get volume settings)) + 10)"`);
        } else if (action === 'volume_down') {
          await execAsync(`osascript -e "set volume output volume ((output volume of (get volume settings)) - 10)"`);
        } else if (action === 'mute') {
          await execAsync(`osascript -e "set volume with output muted"`);
        } else if (action === 'unmute') {
          await execAsync(`osascript -e "set volume without output muted"`);
        } else if (action === 'lock') {
          await execAsync(`pmset displaysleepnow`);
        }
      }
      return { success: true, message: `System control '${action}' executed` };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }
}
