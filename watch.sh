#!/bin/bash

echo "🔄 [MEGA-AI] Watchdog started..."

while true; do
  git fetch origin
  if ! git diff --quiet HEAD origin/master; then
    echo "🆕 [MEGA-AI] Update detected!"
    git reset --hard origin/master
    npm install || yarn install
    pkill -f "node" || true
    echo "🔁 [MEGA-AI] Restarting..."
    npm start &
  fi
  sleep 60
done
