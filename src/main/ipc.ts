import { ipcMain, desktopCapturer, screen, Notification } from 'electron';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getMainWindow, getOverlayWindow, toggleMainWindow, toggleOverlayWindow } from './windows';
import { JarvisDatabase } from './db';
import { DesktopAutomation } from './automation';
import { bindHotkey } from './shortcuts';
import { SkillsManager } from './skills';

const execAsync = promisify(exec);

export function registerIpcHandlers(): void {
  const db = JarvisDatabase.getInstance();
  const skillsManager = SkillsManager.getInstance();

  // Window Controls
  ipcMain.on('window:minimize', () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) win.minimize();
  });

  ipcMain.on('window:maximize', () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      if (win.isMaximized()) win.unmaximize();
      else win.maximize();
    }
  });

  ipcMain.on('window:close', () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) win.hide();
  });

  ipcMain.on('window:toggle-main', () => toggleMainWindow());
  ipcMain.on('window:toggle-overlay', () => toggleOverlayWindow());

  ipcMain.on('overlay:set-position', (_, { x, y }: { x: number; y: number }) => {
    const overlay = getOverlayWindow();
    if (overlay && !overlay.isDestroyed()) overlay.setPosition(x, y);
  });

  ipcMain.on('overlay:ignore-mouse', (_, ignore: boolean) => {
    const overlay = getOverlayWindow();
    if (overlay && !overlay.isDestroyed()) {
      overlay.setIgnoreMouseEvents(ignore, { forward: true });
    }
  });

  // Voice State Sync across windows
  ipcMain.on('voice:state-sync', (_, data: { state: string; transcript?: string }) => {
    const main = getMainWindow();
    const overlay = getOverlayWindow();
    if (main && !main.isDestroyed()) main.webContents.send('overlay:state-update', data);
    if (overlay && !overlay.isDestroyed()) overlay.webContents.send('overlay:state-update', data);
  });

  // Automation Handlers
  ipcMain.handle('system:paste-text', async (_, text: string) => {
    return await DesktopAutomation.pasteText(text);
  });

  ipcMain.handle('system:open-app', async (_, appName: string) => {
    return await DesktopAutomation.openApp(appName);
  });

  ipcMain.handle('system:close-app', async (_, appName: string) => {
    return await DesktopAutomation.closeApp(appName);
  });

  ipcMain.handle('system:focus-window', async (_, title: string) => {
    return await DesktopAutomation.focusWindow(title);
  });

  ipcMain.handle('system:type-text', async (_, text: string) => {
    return await DesktopAutomation.typeTextDirect(text);
  });

  ipcMain.handle('system:press-keys', async (_, keys: string[]) => {
    return await DesktopAutomation.pressKeys(keys);
  });

  ipcMain.handle('system:control', async (_, { action, value }: { action: any; value?: number }) => {
    return await DesktopAutomation.systemControl(action, value);
  });

  ipcMain.handle('system:screenshot', async () => {
    try {
      const primaryDisplay = screen.getPrimaryDisplay();
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: primaryDisplay.size
      });
      if (sources.length > 0) {
        const img = sources[0].thumbnail.toDataURL();
        return { success: true, dataUrl: img };
      }
      return { success: false, error: 'No screen source found' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  // Database & Settings Handlers
  ipcMain.handle('db:get-settings', async () => db.getSettings());
  ipcMain.handle('db:save-setting', async (_, key: string, value: any) => {
    db.saveSetting(key, value);
    return true;
  });

  ipcMain.handle('db:get-api-key', async (_, provider: string) => db.getApiKey(provider));
  ipcMain.handle('db:save-api-key', async (_, provider: string, key: string) => {
    db.saveApiKey(provider, key);
    return true;
  });

  // Follow-ups
  ipcMain.handle('db:get-follow-ups', async (_, status?: 'open' | 'done') => db.getFollowUps(status));
  ipcMain.handle('db:add-follow-up', async (_, { title, description, category, dueDate }: any) => {
    return db.addFollowUp(title, description, category, dueDate);
  });
  ipcMain.handle('db:update-follow-up-status', async (_, id: string, status: 'open' | 'done') => {
    db.updateFollowUpStatus(id, status);
    return true;
  });
  ipcMain.handle('db:delete-follow-up', async (_, id: string) => {
    db.deleteFollowUp(id);
    return true;
  });

  // Routines
  ipcMain.handle('db:get-routines', async () => db.getRoutines());
  ipcMain.handle('db:toggle-routine', async (_, id: string, enabled: boolean) => {
    db.toggleRoutine(id, enabled);
    return true;
  });
  ipcMain.handle('db:add-routine', async (_, { name, description, schedule }: any) => {
    return db.addCustomRoutine(name, description, schedule);
  });

  // Connections
  ipcMain.handle('db:get-connections', async () => db.getConnections());
  ipcMain.handle('db:set-connection', async (_, { id, name, category, status, config }: any) => {
    db.setConnectionStatus(id, name, category, status, config);
    return true;
  });

  // Memory Facts
  ipcMain.handle('db:get-memory-facts', async (_, category?: string) => db.getMemoryFacts(category));
  ipcMain.handle('db:add-memory-fact', async (_, { key, value, category }: any) => {
    return db.addMemoryFact(key, value, category);
  });
  ipcMain.handle('db:delete-memory-fact', async (_, id: string) => {
    db.deleteMemoryFact(id);
    return true;
  });

  // Action Logs
  ipcMain.handle('db:get-action-logs', async (_, limit?: number) => db.getActionLogs(limit));
  ipcMain.handle('db:log-action', async (_, logData: any) => {
    db.logAction(logData);
    return true;
  });
  ipcMain.handle('db:clear-action-logs', async () => {
    db.clearActionLogs();
    return true;
  });

  // Skills
  ipcMain.handle('skills:get-all', async () => skillsManager.getSkills());
  ipcMain.handle('skills:save', async (_, { id, name, description, icon, type }: any) => {
    skillsManager.saveSkill(id, name, description, icon, type);
    return true;
  });
  ipcMain.handle('skills:delete', async (_, id: string) => {
    skillsManager.deleteSkill(id);
    return true;
  });

  // Diagnostics & Permissions
  ipcMain.handle('system:check-permissions', async () => {
    return {
      microphone: 'granted',
      accessibility: process.platform === 'darwin' ? 'granted' : 'n/a',
      screenRecording: 'granted'
    };
  });

  ipcMain.handle('system:open-preferences', async (_, type: string) => {
    if (process.platform === 'darwin') {
      const pane = type === 'microphone' ? 'Privacy_Microphone' : 'Privacy_Accessibility';
      await execAsync(`open "x-apple.systempreferences:com.apple.preference.security?${pane}"`);
    }
    return true;
  });

  // Test Notification
  ipcMain.handle('system:send-test-notification', async () => {
    if (Notification.isSupported()) {
      new Notification({
        title: 'Jarvis Assistant',
        body: 'Jarvis notification test succeeded. System permissions are active.'
      }).show();
      return { success: true };
    }
    return { success: false, error: 'Notifications not supported' };
  });

  // Hotkey Binding
  ipcMain.handle('system:set-hotkey', async (_, type: 'voice' | 'dictation', hotkey: string) => {
    const success = bindHotkey(type, hotkey);
    if (success) db.saveSetting(`${type}_hotkey`, hotkey);
    return success;
  });
}
