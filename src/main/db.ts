import path from 'path';
import fs from 'fs';
import os from 'os';
import { app } from 'electron';

export interface DatabaseSchema {
  settings: Record<string, any>;
  api_keys: Record<string, string>;
  memory_facts: Array<{
    id: string;
    fact_key: string;
    fact_value: string;
    category: string;
    created_at: number;
  }>;
  messages: Array<{
    id: string;
    thread_id: string;
    role: string;
    content: string;
    tool_calls?: string;
    created_at: number;
  }>;
  action_logs: Array<{
    id: string;
    tool_name: string;
    parameters: string;
    result?: string;
    status: string;
    confirmed: number;
    created_at: number;
  }>;
  follow_ups: Array<{
    id: string;
    title: string;
    description: string;
    status: 'open' | 'done';
    category: string;
    due_date?: number;
    created_at: number;
  }>;
  routines: Array<{
    id: string;
    name: string;
    description: string;
    schedule: string;
    enabled: number;
    last_run?: number;
    created_at: number;
  }>;
  connections: Array<{
    id: string;
    name: string;
    category: string;
    status: string;
    config?: string;
    updated_at: number;
  }>;
}

export class JarvisDatabase {
  private static instance: JarvisDatabase;
  private dbPath: string;
  private data: DatabaseSchema;

  private constructor() {
    let userDataPath: string;
    try {
      userDataPath = app ? app.getPath('userData') : path.join(os.homedir(), '.jarvis');
    } catch {
      userDataPath = path.join(os.homedir(), '.jarvis');
    }

    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    this.dbPath = path.join(userDataPath, 'jarvis-store.json');
    this.data = this.loadData();
    this.seedDefaults();
  }

  public static getInstance(): JarvisDatabase {
    if (!JarvisDatabase.instance) {
      JarvisDatabase.instance = new JarvisDatabase();
    }
    return JarvisDatabase.instance;
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read existing db file, creating fresh store:', e);
    }

    return {
      settings: {},
      api_keys: {},
      memory_facts: [],
      messages: [],
      action_logs: [],
      follow_ups: [],
      routines: [],
      connections: []
    };
  }

  private persist(): void {
    try {
      const tempPath = `${this.dbPath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.dbPath);
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  private seedDefaults(): void {
    if (Object.keys(this.data.settings).length === 0) {
      this.saveSetting('hotkey', 'Option+Space');
      this.saveSetting('wake_word_enabled', 'true');
      this.saveSetting('language', 'en-US');
      this.saveSetting('theme', 'dark');
      this.saveSetting('tone', 'Professional');
      this.saveSetting('answerLength', 'Full detail');
      this.saveSetting('addressForm', 'First name');
      this.saveSetting('disagreementStyle', 'Mention it gently');
      this.saveSetting('brainSource', 'cloud');
      this.saveSetting('cloudProvider', 'Google Gemini');
      this.saveSetting('dictationHotkey', 'Fn');
      this.saveSetting('liveVoice', 'true');
      this.saveSetting('user_name', 'AK');
      this.saveSetting('ai_cleanup', 'true');
      this.saveSetting('heartbeatRunner', 'true');
      this.saveSetting('suggestDictation', 'true');
    }

    if (this.data.connections.length === 0) {
      const defaults = [
        { id: 'telegram', name: 'Telegram', category: 'Chat & Messaging', status: 'available' },
        { id: 'whatsapp', name: 'WhatsApp', category: 'Chat & Messaging', status: 'connected' },
        { id: 'gmail', name: 'Google Mail', category: 'Workspace', status: 'connected' },
        { id: 'calendar', name: 'Google Calendar', category: 'Workspace', status: 'connected' },
        { id: 'slack', name: 'Slack', category: 'Team & Channels', status: 'available' },
        { id: 'github', name: 'GitHub', category: 'Developer', status: 'connected' },
        { id: 'linear', name: 'Linear', category: 'Project Management', status: 'available' },
        { id: 'notion', name: 'Notion', category: 'Notes & Wiki', status: 'available' },
        { id: 'home_assistant', name: 'Home Assistant', category: 'Smart Home', status: 'connected' },
        { id: 'snapchat', name: 'Snapchat', category: 'Social', status: 'available' }
      ];
      defaults.forEach(c => this.setConnectionStatus(c.id, c.name, c.category, c.status));
    }

    if (this.data.routines.length === 0) {
      this.addCustomRoutine('30-Minute Heartbeat Runner', 'Checks your active queue and background observations', '*/30 * * * *');
      this.addCustomRoutine('Morning Digest Briefing', 'Synthesizes weather, schedule, and priority tasks at 7:00 AM', '0 7 * * *');
      this.addCustomRoutine('Nightly Reflection & Task Sync', 'Reviews commitments and extracts recurring habits', '0 23 * * *');
    }
  }

  // Settings
  public getSettings(): Record<string, any> {
    return this.data.settings;
  }

  public getSetting(key: string): any {
    return this.data.settings[key];
  }

  public saveSetting(key: string, value: any): void {
    this.data.settings[key] = value;
    this.persist();
  }

  // API Keys
  public getApiKey(provider: string): string | null {
    return this.data.api_keys[provider] || null;
  }

  public saveApiKey(provider: string, key: string): void {
    if (!key) {
      delete this.data.api_keys[provider];
    } else {
      this.data.api_keys[provider] = key;
    }
    this.persist();
  }

  // Follow-ups
  public getFollowUps(status?: 'open' | 'done'): any[] {
    let items = [...this.data.follow_ups];
    if (status) items = items.filter(f => f.status === status);
    return items.sort((a, b) => b.created_at - a.created_at);
  }

  public addFollowUp(title: string, description: string = '', category: string = 'general', dueDate?: number): any {
    const item = {
      id: `fup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      description,
      status: 'open' as const,
      category,
      due_date: dueDate,
      created_at: Date.now()
    };
    this.data.follow_ups.push(item);
    this.persist();
    return item;
  }

  public updateFollowUpStatus(id: string, status: 'open' | 'done'): void {
    const item = this.data.follow_ups.find(f => f.id === id);
    if (item) {
      item.status = status;
      this.persist();
    }
  }

  public deleteFollowUp(id: string): void {
    this.data.follow_ups = this.data.follow_ups.filter(f => f.id !== id);
    this.persist();
  }

  // Routines
  public getRoutines(): any[] {
    return this.data.routines;
  }

  public toggleRoutine(id: string, enabled: boolean): void {
    const r = this.data.routines.find(x => x.id === id);
    if (r) {
      r.enabled = enabled ? 1 : 0;
      this.persist();
    }
  }

  public addCustomRoutine(name: string, description: string, schedule: string): any {
    const newRoutine = {
      id: `r_${Date.now()}`,
      name,
      description,
      schedule,
      enabled: 1,
      created_at: Date.now()
    };
    this.data.routines.push(newRoutine);
    this.persist();
    return newRoutine;
  }

  // Connections
  public getConnections(): any[] {
    return this.data.connections;
  }

  public setConnectionStatus(id: string, name: string, category: string, status: string, config?: string): void {
    const existingIndex = this.data.connections.findIndex(c => c.id === id);
    const item = {
      id,
      name,
      category,
      status,
      config: config || '',
      updated_at: Date.now()
    };
    if (existingIndex >= 0) {
      this.data.connections[existingIndex] = item;
    } else {
      this.data.connections.push(item);
    }
    this.persist();
  }

  // Memory facts
  public getMemoryFacts(category?: string): any[] {
    let facts = [...this.data.memory_facts];
    if (category && category !== 'all') {
      facts = facts.filter(f => f.category === category);
    }
    return facts.sort((a, b) => b.created_at - a.created_at);
  }

  public addMemoryFact(key: string, value: string, category: string = 'general'): any {
    const newFact = {
      id: `fact_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fact_key: key,
      fact_value: value,
      category,
      created_at: Date.now()
    };
    this.data.memory_facts.push(newFact);
    this.persist();
    return newFact;
  }

  public deleteMemoryFact(id: string): void {
    this.data.memory_facts = this.data.memory_facts.filter(f => f.id !== id);
    this.persist();
  }

  // Action logs
  public logAction(log: {
    toolName: string;
    parameters: any;
    result?: any;
    status: string;
    error?: string;
  }): void {
    const newLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tool_name: log.toolName,
      parameters: typeof log.parameters === 'string' ? log.parameters : JSON.stringify(log.parameters),
      result: log.result ? (typeof log.result === 'string' ? log.result : JSON.stringify(log.result)) : (log.error || ''),
      status: log.status,
      confirmed: 1,
      created_at: Date.now()
    };
    this.data.action_logs.unshift(newLog);
    if (this.data.action_logs.length > 200) {
      this.data.action_logs = this.data.action_logs.slice(0, 200);
    }
    this.persist();
  }

  public getActionLogs(limit: number = 50): any[] {
    return this.data.action_logs.slice(0, limit);
  }

  public clearActionLogs(): void {
    this.data.action_logs = [];
    this.persist();
  }
}
