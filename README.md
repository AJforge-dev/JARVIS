# Jarvis AI Assistant 2.0 ⚡

> Cross-platform, voice-first desktop AI assistant & autonomous companion for **macOS**, **Windows**, and **Raspberry Pi OS**. Engineered as an exact replica of the official `jarvis.ceo` v2 architecture with built-in desktop automation, local skills, and multi-provider intelligence.

---

## 🌟 Features

- **Exact `jarvis.ceo` Design System**: Frameless dark-themed shell (`#070a0f`), vibrant `● Talk to Jarvis` blue pill, sidebar navigation (`Today`, `Follow-ups`, `Dictation`, `Memory`, `Routines`, `Skills`, `Connections`, `Settings`), and glowing audio-reactive soundwave Orb.
- **Global Hotkeys & Floating HUD**:
  - `Option + Space` (Mac) / `Ctrl + Space` (Windows): Instantly summons the transparent floating soundwave Orb overlay.
  - `Fn` key / push-to-talk: Hold-to-dictate into whatever text field is active across your operating system.
  - Wake word: Instant local voice detection for *"Hey Jarvis"*.
- **Autonomous Desktop Automation**:
  - Open & control apps: Google Chrome, WhatsApp, Telegram, Snapchat, Spotify, VS Code, Terminal.
  - System controls: Volume, brightness, window focus, screenshots, and lock screen.
  - Code generation & file operations: Autonomous file writing, script creation, and shell command execution.
- **Multi-Provider Brain with Offline Fallback**:
  - **Google Gemini**: Gemini 2.5 Pro / Flash with free-tier auto fallback.
  - **OpenAI**: GPT-4o / GPT-4o-mini streaming with tool-use.
  - **Anthropic**: Claude 3.5 Sonnet / Haiku.
  - **Local Ollama**: 100% offline local inference (`llama3.2`, `qwen2.5`, etc.).
  - **Autonomous Core**: Built-in zero-config offline engine addressing you as **AK** with full desktop control even without API keys or internet!
- **Raspberry Pi OS & Terminal OS Ready**:
  - Run as a terminal CLI or 24/7 background systemd daemon on Raspberry Pi 3/4/5.

---

## 🚀 Quick Start

### 1. macOS (DMG Installation)
The production DMG is generated and ready in the repository:
```bash
# Double-click or mount the DMG:
open "release/Jarvis - AI Assistant-2.0.0-arm64.dmg"

# Drag Jarvis into Applications, or launch the installed app directly:
open "/Applications/Jarvis - AI Assistant.app"
```

### 2. Run From Source (Development & Testing)
```bash
# Clone the repository
git clone https://github.com/AJforge-dev/JARVIS.git
cd JARVIS

# Install dependencies
npm install

# Start in development mode with hot-reloading
npm run dev

# Or build the production binaries
npm run build
npm run build:mac   # Generates .dmg and .zip in release/
npm run build:win   # Generates Windows NSIS installer
```

---

## 🍓 Raspberry Pi OS Setup (Terminal & 24/7 Daemon)

Jarvis is fully optimized to run on Raspberry Pi OS (Debian Bookworm) either headlessly or with a desktop display.

### Automated 1-Click Setup:
```bash
chmod +x setup_pi.sh
./setup_pi.sh
```

### Interactive Terminal Mode:
```bash
python3 pi_cli.py
```
> Jarvis will greet you with voice TTS and listen for commands like *"open chrome"*, *"write code"*, *"volume up"*, or *"status"*.

### Enable 24/7 Background Service:
```bash
sudo systemctl enable --now jarvis
sudo systemctl status jarvis
```

---

## 🛠 Skills & Local Workspace

Jarvis hot-reloads skills dynamically from your user workspace:
```
~/.jarvis/
├── data/
│   └── jarvis-store.json       # Preferences, connections, memory facts
└── workspace/
    ├── SOUL.md                 # Assistant persona & core rules
    ├── USER.md                 # User identity (AK)
    └── SKILLS/                 # Custom skills (.md files with YAML frontmatter)
```

Add your own custom skills in `~/.jarvis/workspace/SKILLS/<skill-name>.md` and watch them light up in the Jarvis Skills dashboard!

---

## 📜 License
MIT License. Created for AK.
