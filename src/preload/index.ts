import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  toggleMain: () => void;
  toggleOverlay: () => void;
  setOverlayPosition: (x: number, y: number) => void;
  setOverlayIgnoreMouse: (ignore: boolean) => void;
  notifyVoiceState: (state: string, transcript?: string) => void;
  onOverlayStateUpdate: (callback: (data: { state: string; transcript?: string }) => void) => () => void;
  pasteText: (text: string) => Promise<{ success: boolean }>;
  openApp: (appName: string) => Promise<{ success: boolean; message: string }>;
  closeApp: (appName: string) => Promise<{ success: boolean; message: string }>;
  focusWindow: (title: string) => Promise<{ success: boolean; message: string }>;
  typeText: (text: string) => Promise<{ success: boolean }>;
  pressKeys: (keys: string[]) => Promise<{ success: boolean }>;
  systemControl: (action: string, value?: number) => Promise<{ success: boolean; message: string }>;
  takeScreenshot: () => Promise<{ success: boolean; dataUrl?: string; error?: string }>;
  getSettings: () => Promise<Record<string, any>>;
  saveSetting: (key: string, value: any) => Promise<boolean>;
  getApiKey: (provider: string) => Promise<string | null>;
  saveApiKey: (provider: string, key: string) => Promise<boolean>;
  getFollowUps: (status?: 'open' | 'done') => Promise<any[]>;
  addFollowUp: (data: { title: string; description?: string; category?: string; dueDate?: number }) => Promise<any>;
  updateFollowUpStatus: (id: string, status: 'open' | 'done') => Promise<boolean>;
  deleteFollowUp: (id: string) => Promise<boolean>;
  getRoutines: () => Promise<any[]>;
  toggleRoutine: (id: string, enabled: boolean) => Promise<boolean>;
  addRoutine: (data: { name: string; description: string; schedule: string }) => Promise<any>;
  getConnections: () => Promise<any[]>;
  setConnection: (data: { id: string; name: string; category: string; status: string; config?: string }) => Promise<boolean>;
  getMemoryFacts: (category?: string) => Promise<any[]>;
  addMemoryFact: (data: { key: string; value: string; category?: string }) => Promise<any>;
  deleteMemoryFact: (id: string) => Promise<boolean>;
  getActionLogs: (limit?: number) => Promise<any[]>;
  logAction: (logData: any) => Promise<boolean>;
  clearActionLogs: () => Promise<boolean>;
  getSkills: () => Promise<any[]>;
  saveSkill: (data: { id: string; name: string; description: string; icon?: string; type?: 'BUILTIN' | 'INSTALLED' }) => Promise<boolean>;
  deleteSkill: (id: string) => Promise<boolean>;
  checkPermissions: () => Promise<{ microphone: string; accessibility: string; screenRecording: string }>;
  openSystemPreferences: (type: string) => Promise<boolean>;
  sendTestNotification: () => Promise<{ success: boolean; error?: string }>;
  setHotkey: (type: 'voice' | 'dictation', hotkey: string) => Promise<boolean>;
  onGlobalShortcut: (callback: (action: 'toggle-voice' | 'toggle-dictation') => void) => () => void;
}

const api: ElectronAPI = {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  toggleMain: () => ipcRenderer.send('window:toggle-main'),
  toggleOverlay: () => ipcRenderer.send('window:toggle-overlay'),
  setOverlayPosition: (x, y) => ipcRenderer.send('overlay:set-position', { x, y }),
  setOverlayIgnoreMouse: (ignore) => ipcRenderer.send('overlay:ignore-mouse', ignore),
  notifyVoiceState: (state, transcript) => ipcRenderer.send('voice:state-sync', { state, transcript }),
  onOverlayStateUpdate: (callback) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('overlay:state-update', handler);
    return () => ipcRenderer.removeListener('overlay:state-update', handler);
  },
  pasteText: (text) => ipcRenderer.invoke('system:paste-text', text),
  openApp: (appName) => ipcRenderer.invoke('system:open-app', appName),
  closeApp: (appName) => ipcRenderer.invoke('system:close-app', appName),
  focusWindow: (title) => ipcRenderer.invoke('system:focus-window', title),
  typeText: (text) => ipcRenderer.invoke('system:type-text', text),
  pressKeys: (keys) => ipcRenderer.invoke('system:press-keys', keys),
  systemControl: (action, value) => ipcRenderer.invoke('system:control', { action, value }),
  takeScreenshot: () => ipcRenderer.invoke('system:screenshot'),
  getSettings: () => ipcRenderer.invoke('db:get-settings'),
  saveSetting: (key, value) => ipcRenderer.invoke('db:save-setting', key, value),
  getApiKey: (provider) => ipcRenderer.invoke('db:get-api-key', provider),
  saveApiKey: (provider, key) => ipcRenderer.invoke('db:save-api-key', provider, key),
  getFollowUps: (status) => ipcRenderer.invoke('db:get-follow-ups', status),
  addFollowUp: (data) => ipcRenderer.invoke('db:add-follow-up', data),
  updateFollowUpStatus: (id, status) => ipcRenderer.invoke('db:update-follow-up-status', id, status),
  deleteFollowUp: (id) => ipcRenderer.invoke('db:delete-follow-up', id),
  getRoutines: () => ipcRenderer.invoke('db:get-routines'),
  toggleRoutine: (id, enabled) => ipcRenderer.invoke('db:toggle-routine', id, enabled),
  addRoutine: (data) => ipcRenderer.invoke('db:add-routine', data),
  getConnections: () => ipcRenderer.invoke('db:get-connections'),
  setConnection: (data) => ipcRenderer.invoke('db:set-connection', data),
  getMemoryFacts: (category) => ipcRenderer.invoke('db:get-memory-facts', category),
  addMemoryFact: (data) => ipcRenderer.invoke('db:add-memory-fact', data),
  deleteMemoryFact: (id) => ipcRenderer.invoke('db:delete-memory-fact', id),
  getActionLogs: (limit) => ipcRenderer.invoke('db:get-action-logs', limit),
  logAction: (logData) => ipcRenderer.invoke('db:log-action', logData),
  clearActionLogs: () => ipcRenderer.invoke('db:clear-action-logs'),
  getSkills: () => ipcRenderer.invoke('skills:get-all'),
  saveSkill: (data) => ipcRenderer.invoke('skills:save', data),
  deleteSkill: (id) => ipcRenderer.invoke('skills:delete', id),
  checkPermissions: () => ipcRenderer.invoke('system:check-permissions'),
  openSystemPreferences: (type) => ipcRenderer.invoke('system:open-preferences', type),
  sendTestNotification: () => ipcRenderer.invoke('system:send-test-notification'),
  setHotkey: (type, hotkey) => ipcRenderer.invoke('system:set-hotkey', type, hotkey),
  onGlobalShortcut: (callback) => {
    const handler = (_: any, action: any) => callback(action);
    ipcRenderer.on('shortcut:triggered', handler);
    return () => ipcRenderer.removeListener('shortcut:triggered', handler);
  }
};

contextBridge.exposeInMainWorld('electronAPI', api);
