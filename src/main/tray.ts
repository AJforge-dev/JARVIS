import { Tray, Menu, nativeImage, app } from 'electron';
import { toggleMainWindow, toggleOverlayWindow } from './windows';

let tray: Tray | null = null;
let isDictationActive = false;

export function createTray(): Tray {
  if (tray) return tray;

  // Clean SVG-based 22x22 template icon
  const iconSvg = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#00dcff" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="#00dcff"/>
      <path d="M12 3V5M12 19V21M3 12H5M19 12H21" stroke="#00dcff" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
  const icon = nativeImage.createFromBuffer(Buffer.from(iconSvg));
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.setToolTip('Jarvis — AI Assistant');

  updateTrayMenu();

  tray.on('click', () => {
    toggleMainWindow();
  });

  return tray;
}

export function updateTrayMenu(): void {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Jarvis — AI Assistant', enabled: false },
    { type: 'separator' },
    {
      label: 'Open Dashboard',
      click: () => toggleMainWindow()
    },
    {
      label: 'Toggle Floating Voice Orb (⌥ Space)',
      click: () => toggleOverlayWindow()
    },
    {
      label: isDictationActive ? '✓ Dictation Mode (Active)' : 'Enable Fn Dictation Mode',
      type: 'checkbox',
      checked: isDictationActive,
      click: (item) => {
        isDictationActive = item.checked;
        updateTrayMenu();
      }
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => toggleMainWindow()
    },
    {
      label: 'Quit Jarvis',
      click: () => {
        (app as any).isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
}
