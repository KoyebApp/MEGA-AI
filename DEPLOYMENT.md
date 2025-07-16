
# 📦 DEPLOYMENT.md

## 🧠 Project Overview

This project is a WhatsApp Bot built using JavaScript and Node.js. It supports self-hosting using Docker, with auto-update capability via Git and a lightweight watchdog process.

This documentation explains:

- How to deploy this bot using Docker
- What the `docker-compose.yml` and `watch.sh` files do
- How to configure and start the bot
- How to use it on platforms like **Termux**, **Ubuntu**, **Render**, **Koyeb**, or any Docker-compatible environment.

---

## 🐳 Docker Requirements

You **must have Docker and Docker Compose installed** on your system **unless you're using a PaaS** (like Render/Koyeb) that handles Docker for you.

### ✅ Supported Environments

| 🌍 Environment                | 🐳 Docker Needed | 📌 Notes                                                                 |
|------------------------------|------------------|-------------------------------------------------------------------------|
| 📱 Termux (via Alpine VM) | ✅ Yes           | Manual setup with `docker` + `dockerd`; best with Alpine in      |
| 🐧 Ubuntu / Debian            | ✅ Yes           | Run: `apt install docker.io docker-compose`                            |
| 🧱 Arch / Manjaro             | ✅ Yes           | Run: `pacman -S docker docker-compose`                                 |
| 🔧 Fedora / RHEL / CentOS     | ✅ Yes           | Use `dnf install docker` or Docker CE script                           |
| 🧊 Alpine Linux               | ✅ Yes           | Use `apk add docker openrc`, enable and start `dockerd`                |
| 🛡️ Kali Linux                | ✅ Yes           | Same as Debian — use `apt install docker.io`                           |
| 🐘 Rocky / AlmaLinux          | ✅ Yes           | Use Docker CE install script or Podman as an alternative               |
| 🪟 Windows (with WSL2)        | ✅ Yes (via Docker Desktop) | Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| 🧩 Docker Desktop (Win/macOS) | ✅ Yes           | Simplest method — official GUI app                                     |
| 💻 Chromebook (Linux/Termux)  | ⚠️ Limited       | Works via Linux Beta or Termux with PRoot workaround                   |
| ☁️ Render / Koyeb / Railway   | ❌ No            | Docker runs behind the scenes automatically                           |

---
![Docker](https://img.shields.io/badge/Works%20with-Docker-blue?logo=docker)
![Linux](https://img.shields.io/badge/Linux-Supported-success?logo=linux)
![Windows](https://img.shields.io/badge/Windows-Supported-success?logo=windows)
![macOS](https://img.shields.io/badge/macOS-Supported-success?logo=apple)
![Termux](https://img.shields.io/badge/Termux-Tested-yellow?logo=termux)

</details> <details> <summary>🛠 <strong>Ubuntu / Debian</strong></summary>
bash
Copy code
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl enable --now docker

</details> <details> <summary>🛠 <strong>Windows (Docker Desktop)</strong></summary>
Download from: https://www.docker.com/products/docker-desktop

Enable WSL2 backend during installation

Run docker --version to verify setup

Use PowerShell or WSL for Compose commands

</details> <details> <summary>🛠 <strong>Chromebook (Crostini)</strong></summary>
bash
Copy code
# Inside Crostini Linux terminal
sudo apt update
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker $USER
newgrp docker
</details>

## 🔧 `docker-compose.yml` Explained

The `docker-compose.yml` file:

- Pulls a prebuilt image of **470~500 MiB** from **Quay.io**
- Clones the bot code from GitHub
- Installs dependencies
- Runs a `watch.sh` file to auto-update the bot when new commits are detected

```yaml
version: '3.8'

services:
  mega-bot:
    image: quay.io/qasimtech/mega-bot:latest
    container_name: mega-bot
    restart: unless-stopped
    working_dir: /root/mega
    volumes:
      - mega_data:/root/mega
      - ./watch.sh:/root/mega/watch.sh
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: ${MONGODB_URI:-mongodb://localhost:27017}
      BOT_NUMBER: ${BOT_NUMBER:-923204566005}
      REMOVEBG_KEY: ${REMOVEBG_KEY:-none}
      TIME_ZONE: ${TIME_ZONE:-Asia/Karachi}
      BOTNAME: ${BOTNAME:-MEGA-BOT}
      OWNERS: ${OWNERS:-923204566005}
      MODE: ${MODE:-public}
      PREFIX: ${PREFIX:-.}
    command: sh -c "
      git clone https://github.com/GlobalTechInfo/MEGA-AI /root/mega || true &&
      rm -rf /root/mega/.git &&
      chmod +x /root/mega/watch.sh &&
      cd /root/mega &&
      npm install || yarn install &&
      ./watch.sh"

volumes:
  mega_data:
```

---

## 🔁 `watch.sh` Explained

The `watch.sh` script:

- Runs in a loop every 60 seconds
- Checks for updates from the GitHub repo
- If updates are found, it pulls the latest code, reinstalls dependencies, and restarts the bot

```bash
#!/bin/bash

echo "🔄 [BOT] Watchdog started..."

while true; do
  git fetch origin
  if ! git diff --quiet HEAD origin/main; then
    echo "🆕 [BOT] Update detected!"
    git reset --hard origin/master
    npm install || yarn install
    pkill -f "node" || true
    echo "🔁 [BOT] Restarting..."
    npm start &
  fi
  sleep 60
done
```

Make sure the script is executable:

```bash
chmod +x watch.sh
```

---

## 🚀 How to Deploy Locally

### 1. Clone the Repo

```bash
git clone https://github.com/GlobalTechInfo/MEGA-AI
cd MEGA-AI
```

### 2. Create `.env` file

- Following is example to set environment variables
```env
HOBBIES = 'CODING'
LANGUAGE = 'ENGLISH'
OWNER_SKILLS = 'JAVASCRIPT'
OWNER_STATUS = 'DEVELOPER'
OWNER_NAME = 'Qasim Ali'
TIME_ZONE = 'Asia/Karachi'
MONGODB_URI = 'mongodb+srv://.....'                 # your MongoDB connection url
DB_NAME = 'mega_ai'                                 # database name
REMOVEBG_KEY = ''                                   # obtain a key from ( www.remove.bg )
PREFIX = '!,.,?'                                    #one or more,remove this if you want multiprefix
MODE = 'private'                                    # public or private
statusview = 'true'                                 # make it false if you don't want auto status view
BOTNAME = 'MEGA-AI'                                 # your bot name
antidelete = 'true'                                 # if true bot will forwards deleted message to you
BOT_NUMBER= '9232045xxxx'                           # your whatsapp phone number for pairing code
OWNERS = '92320xxxx,92300xxxx'                      # your Whatsapp phone number,your second Whatsapp phone number
```

> You can also set these via GUI in **Render**, **Koyeb**, etc.

### 3. Run the Bot:

```bash
docker-compose up --build -d
```
### 4. To verify everything is running:

```bash
docker-compose ps
```
### 5. Stop the Bot:

```bash
docker-compose down
```
### 6. (Optional) Clean volumes and cache too:
```bash
docker-compose down --volumes --remove-orphans
```
---

## 📃 .dockerignore (Optional)

Add this file to prevent unnecessary files from being copied into the Docker image (helps reduce size):

```
node_modules
.git
*.log
*.sqlite
.env
```
---

## 🧠 Notes

- **Don't rename `watch.sh`** unless you also update the reference in `docker-compose.yml`.
