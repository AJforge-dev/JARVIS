import { BrowserWindow, screen, app } from 'electron';
import path from 'path';
import fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function resolveHtmlPath(filename: string): string {
  const candidateDist = path.join(__dirname, '../../dist', filename);
  if (fs.existsSync(candidateDist)) return candidateDist;

  const candidateAppDist = path.join(app.getAppPath(), 'dist', filename);
  if (fs.existsSync(candidateAppDist)) return candidateAppDist;

  const candidateRoot = path.join(__dirname, '../../', filename);
  if (fs.existsSync(candidateRoot)) return candidateRoot;

  return path.join(app.getAppPath(), filename);
}

export function createMainWindow(): BrowserWindow {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    return mainWindow;
  }

  mainWindow = new BrowserWindow({
    width: 1040,
    height: 740,
    minWidth: 780,
    minHeight: 560,
    title: 'Jarvis — AI Assistant',
    backgroundColor: '#070a0f',
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(resolveHtmlPath('index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('close', (e) => {
    if (!(app as any).isQuitting) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });

  return mainWindow;
}

export function createOverlayWindow(): BrowserWindow {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    return overlayWindow;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const overlayWidth = 440;
  const overlayHeight = 94;
  const x = Math.round((screenWidth - overlayWidth) / 2);
  const y = screenHeight - overlayHeight - 24;

  overlayWindow = new BrowserWindow({
    width: overlayWidth,
    height: overlayHeight,
    x,
    y,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    overlayWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/overlay.html`);
  } else {
    overlayWindow.loadFile(resolveHtmlPath('overlay.html'));
  }

  overlayWindow.once('ready-to-show', () => {
    overlayWindow?.show();
  });

  return overlayWindow;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function getOverlayWindow(): BrowserWindow | null {
  return overlayWindow;
}

export function toggleMainWindow(): void {
  const win = getMainWindow();
  if (!win || win.isDestroyed()) {
    createMainWindow();
    return;
  }
  if (win.isVisible() && win.isFocused()) {
    win.hide();
  } else {
    win.show();
    win.focus();
  }
}

export function toggleOverlayWindow(): void {
  const overlay = getOverlayWindow();
  if (!overlay || overlay.isDestroyed()) {
    createOverlayWindow();
    return;
  }
  if (overlay.isVisible()) {
    overlay.hide();
  } else {
    overlay.show();
  }
}
