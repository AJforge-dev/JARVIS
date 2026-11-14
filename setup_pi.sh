#!/usr/bin/env bash
# ==============================================================================
# Jarvis AI Assistant - Raspberry Pi OS Installation & Setup Script
# Works on Raspberry Pi 3/4/5 (Raspberry Pi OS 32-bit & 64-bit / Debian Bookworm)
# ==============================================================================

set -e

echo "=========================================="
echo "⚡ Installing Jarvis AI Assistant on Raspberry Pi OS"
echo "=========================================="

# 1. System updates & audio/automation prerequisites
echo "[1/5] Updating apt packages and installing system utilities..."
sudo apt-get update -y
sudo apt-get install -y \
  curl \
  git \
  build-essential \
  python3 \
  python3-pip \
  python3-venv \
  alsa-utils \
  sox \
  libsox-fmt-all \
  ffmpeg \
  espeak-ng \
  xdotool \
  wmctrl \
  jq

# 2. Install Node.js (v20 LTS recommended for Pi)
if ! command -v node &> /dev/null; then
  echo "[2/5] Installing Node.js LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  echo "[2/5] Node.js is already installed: $(node -v)"
fi

# 3. Create Jarvis workspace and Python environment
echo "[3/5] Setting up ~/.jarvis workspace and Python virtual environment..."
mkdir -p "$HOME/.jarvis/workspace/SKILLS"
mkdir -p "$HOME/.jarvis/workspace/ROUTINES"
mkdir -p "$HOME/.jarvis/data"

cd "$HOME"
if [ ! -d "$HOME/.jarvis/venv" ]; then
  python3 -m venv "$HOME/.jarvis/venv"
fi
source "$HOME/.jarvis/venv/bin/activate"
pip install --upgrade pip
pip install google-genai requests pydantic rich sounddevice speechrecognition

# 4. Optional Ollama for Local Offline AI
echo "[4/5] Checking Ollama installation for offline local reasoning..."
if ! command -v ollama &> /dev/null; then
  echo "Tip: Run 'curl -fsSL https://ollama.com/install.sh | sh' if you want offline LLM models (e.g. qwen2.5:0.5b / tinydolphin) on Raspberry Pi 4/5."
fi

# 5. Configure Systemd Service for 24/7 background execution
echo "[5/5] Configuring systemd background service..."
CURRENT_USER=$(whoami)
SERVICE_PATH="/etc/systemd/system/jarvis.service"

sudo tee "$SERVICE_PATH" > /dev/null <<EOF
[Unit]
Description=Jarvis AI Assistant Background Service
After=network.target sound.target

[Service]
Type=simple
User=${CURRENT_USER}
WorkingDirectory=/home/${CURRENT_USER}/.jarvis
ExecStart=/home/${CURRENT_USER}/.jarvis/venv/bin/python /home/${CURRENT_USER}/jarvis/pi_cli.py --daemon
Restart=always
RestartSec=5
Environment=PATH=/usr/bin:/bin:/usr/local/bin
Environment=HOME=/home/${CURRENT_USER}

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
echo "To enable Jarvis 24/7 on boot, run: sudo systemctl enable --now jarvis"

echo "=========================================="
echo "✅ Jarvis installation complete on Raspberry Pi OS!"
echo "Run terminal mode with: python3 pi_cli.py"
echo "=========================================="
