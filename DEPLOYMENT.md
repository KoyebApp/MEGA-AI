
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

| Environment      | Docker Needed | Notes                          |
|------------------|---------------|--------------------------------|
| Termux (via proot or Alpine) | ✅          | Needs `docker` setup manually |
| Ubuntu / Debian  | ✅             | Use `apt install docker.io docker-compose` |
| Render / Koyeb / Railway | ❌             | Docker runs behind the scenes |

---

## 🔧 `docker-compose.yml` Explained

The `docker-compose.yml` file:

- Pulls a prebuilt image from **Quay.io**
- Clones the bot code from GitHub
- Installs dependencies
- Runs a `watch.sh` file to auto-update the bot when new commits are detected

```yaml
version: '3.8'

services:
  bot:
    image: quay.io/qasimtech/mega-ai:latest
    container_name: mega-ai
    restart: unless-stopped
    working_dir: /root/mega-ai
    environment:
      - API_KEY=${API_KEY}
      - BOT_MODE=${BOT_MODE}
    volumes:
      - mega_ai_data:/root/mega-ai
      - ./watch.sh:/root/mega-ai/watch.sh
    ports:
      - "5000:5000"
    command: sh -c "
      git clone https://github.com/GlobalTechInfo/MEGA-AI /root/mega-ai || true &&
      rm -rf /root/mega-ai/.git &&
      chmod +x /root/mega-ai/watch.sh &&
      cd /root/mega-ai &&
      npm install || yarn install &&
      ./watch.sh"

volumes:
  mega_ai_data:
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
  if ! git diff --quiet HEAD origin/master; then
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
git clone https://github.com/YourName/YourBot
cd YourBot
```

### 2. Create `.env` file

```env
API_KEY=your_api_key
BOT_MODE=public
```

> You can also set these via GUI in **Render**, **Koyeb**, etc.

### 3. Run the Bot

```bash
docker-compose up --build -d
```

### 4. Stop the Bot

```bash
docker-compose down
```

---

## 🧾 .dockerignore (Optional)

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
