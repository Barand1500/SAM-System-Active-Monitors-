#!/bin/bash
export NVM_DIR="/home/guzelteknoloji-sam/.nvm"
source "$NVM_DIR/nvm.sh"

if ! pgrep -f "node.*server.js" > /dev/null; then
    cd /home/guzelteknoloji-sam/Backend
    nohup node server.js >> /home/guzelteknoloji-sam/Backend/logs/app.log 2>&1 &
fi