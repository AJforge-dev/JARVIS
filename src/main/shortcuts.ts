import { globalShortcut } from 'electron';
import { toggleMainWindow, toggleOverlayWindow } from './windows';

let currentVoiceHotkey = 'Option+Space';
let currentDictationHotkey = 'Option';

export function registerGlobalShortcuts(): void {
  // Voice hotkey toggles floating orb
  try {
    globalShortcut.register(currentVoiceHotkey, () => {
      toggleOverlayWindow();
    });
  } catch (err) {
    console.warn(`Could not register shortcut ${currentVoiceHotkey}:`, err);
  }

  // Alternative shortcut for main dashboard toggle
  try {
    globalShortcut.register('CommandOrControl+Shift+J', () => {
      toggleMainWindow();
    });
  } catch (err) {}
}

export function unregisterGlobalShortcuts(): void {
  globalShortcut.unregisterAll();
}

export function bindHotkey(type: 'voice' | 'dictation', hotkey: string): boolean {
  if (type === 'voice') {
    globalShortcut.unregister(currentVoiceHotkey);
    currentVoiceHotkey = hotkey;
    try {
      return globalShortcut.register(currentVoiceHotkey, () => {
        toggleOverlayWindow();
      });
    } catch {
      return false;
    }
  }
  return true;
}
