#!/bin/bash

# ResistNet - Stop All Services Script

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}╔════════════════════════════════════════════╗${NC}"
echo -e "${RED}║   ResistNet - Stopping All Services        ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════╝${NC}"
echo ""

# Function to kill process by PID file
kill_by_pidfile() {
    local pidfile=$1
    local name=$2
    
    if [ -f "$pidfile" ]; then
        local pid=$(cat "$pidfile")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo -e "${YELLOW}⏹️  Stopping $name (PID: $pid)...${NC}"
            kill "$pid" 2>/dev/null || true
            sleep 1
            
            if ps -p "$pid" > /dev/null 2>&1; then
                echo -e "${RED}   Force killing $name...${NC}"
                kill -9 "$pid" 2>/dev/null || true
            fi
            
            echo -e "${GREEN}✅ $name stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  $name not running${NC}"
        fi
        rm -f "$pidfile"
    fi
}

# Stop Next.js
echo -e "${BLUE}[1/4] Stopping Next.js app...${NC}"
kill_by_pidfile ".pids/nextjs.pid" "Next.js"

# Stop Arti/Tor
echo -e "\n${BLUE}[2/4] Stopping Tor/Arti...${NC}"
kill_by_pidfile ".pids/arti.pid" "Arti"
kill_by_pidfile ".pids/tor.pid" "Tor"

# Also kill any remaining Arti/Tor processes
pkill -f "arti proxy" 2>/dev/null || true
echo -e "${GREEN}✅ Tor services stopped${NC}"

# Stop Nimbus
echo -e "\n${BLUE}[3/4] Stopping Nimbus RPC...${NC}"
if command -v docker >/dev/null 2>&1; then
    if docker ps | grep -q nimbus-rpc; then
        docker stop nimbus-rpc
        echo -e "${GREEN}✅ Nimbus RPC stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  Nimbus RPC not running${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Docker not found${NC}"
fi

# Stop IPFS
echo -e "\n${BLUE}[4/4] Stopping IPFS daemon...${NC}"
kill_by_pidfile ".pids/ipfs.pid" "IPFS"

# Cleanup
rm -f .pids/all.pids

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        All Services Stopped                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ All services have been stopped${NC}"
echo ""
echo -e "${BLUE}To start services again:${NC}"
echo -e "  ${GREEN}→ ./scripts/start-all.sh${NC}"
echo ""