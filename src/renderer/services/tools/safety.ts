export class SafetyManager {
  private allowlist: Set<string> = new Set([
    'open_app',
    'open_url',
    'focus_window',
    'type_text',
    'press_keys',
    'screenshot',
    'system_control',
    'open_chrome_extension',
    'write_code'
  ]);

  private denylist: Set<string> = new Set([
    'format_disk',
    'rm_rf_root',
    'shutdown_force'
  ]);

  private riskyTools: Set<string> = new Set([
    'run_shell',
    'delete_file',
    'send_email',
    'call_whatsapp',
    'call_telegram'
  ]);

  isAllowed(toolName: string): boolean {
    if (this.denylist.has(toolName)) return false;
    return true;
  }

  requiresConfirmation(toolName: string): boolean {
    return this.riskyTools.has(toolName);
  }
}
