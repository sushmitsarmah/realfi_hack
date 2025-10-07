#!/bin/bash

# ResistNet - Start All Services Script
# This script starts all required backend services and the Next.js app

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ResistNet - Starting All Services        ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :"$1" >/dev/null 2>&1
}

# Function to wait for service to be ready
wait_for_service() {
    local port=$1
    local service=$2
    local max_attempts=30
    local attempt=0
    
    echo -e "${YELLOW}⏳ Waiting for $service to be ready...${NC}"
    
    while ! nc -z localhost "$port" 2>/dev/null; do
        attempt=$((attempt + 1))
        if [ $attempt -eq $max_attempts ]; then
            echo -e "${RED}❌ Timeout waiting for $service${NC}"
            return 1
        fi
        sleep 1
    done
    
    echo -e "${GREEN}✅ $service is ready${NC}"
}

# Step 1: Check Prerequisites
echo -e "${BLUE}[1/6] Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js v18 or higher from https://nodejs.org/"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) and npm $(npm --version) found${NC}"

# Step 2: Check if .env.local exists
echo -e "\n${BLUE}[2/6] Checking configuration...${NC}"

if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found, creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo -e "${YELLOW}⚠️  Please edit .env.local with your API keys${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Configuration file found${NC}"

# Step 3: Start Arti (Tor)
echo -e "\n${BLUE}[3/6] Starting Arti (Tor proxy)...${NC}"

if command_exists arti; then
    if port_in_use 9150; then
        echo -e "${YELLOW}⚠️  Arti already running on port 9150${NC}"
    else
        echo -e "${GREEN}🧅 Starting Arti on port 9150...${NC}"
        arti proxy --socks-port 9150 > logs/arti.log 2>&1 &
        ARTI_PID=$!
        echo $ARTI_PID > .pids/arti.pid
        sleep 2
        
        if port_in_use 9150; then
            echo -e "${GREEN}✅ Arti started successfully (PID: $ARTI_PID)${NC}"
        else
            echo -e "${RED}❌ Failed to start Arti${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Arti not installed. Using system Tor if available...${NC}"
    
    if command_exists tor; then
        if port_in_use 9150; then
            echo -e "${GREEN}✅ Tor already running on port 9150${NC}"
        else
            tor --SocksPort 9150 > logs/tor.log 2>&1 &
            TOR_PID=$!
            echo $TOR_PID > .pids/tor.pid
            sleep 2
            echo -e "${GREEN}✅ Tor started (PID: $TOR_PID)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Neither Arti nor Tor found. Install with:${NC}"
        echo -e "   macOS: ${GREEN}brew install arti${NC}"
        echo -e "   Linux: ${GREEN}cargo install arti${NC}"
        echo -e "${YELLOW}   Continuing without Tor (reduced privacy)...${NC}"
    fi
fi

# Step 4: Start Nimbus RPC
echo -e "\n${BLUE}[4/6] Starting Nimbus RPC node...${NC}"

if command_exists docker; then
    # Check if container already exists
    if docker ps -a | grep -q nimbus-rpc; then
        if docker ps | grep -q nimbus-rpc; then
            echo -e "${YELLOW}⚠️  Nimbus container already running${NC}"
        else
            echo -e "${GREEN}🔄 Starting existing Nimbus container...${NC}"
            docker start nimbus-rpc
            wait_for_service 8545 "Nimbus RPC"
        fi
    else
        echo -e "${GREEN}🐳 Creating and starting Nimbus container...${NC}"
        docker run -d \
            --name nimbus-rpc \
            -p 8545:8545 \
            -v nimbus-data:/data \
            statusim/nimbus-eth1:latest \
            --http-enabled \
            --http-address=0.0.0.0 \
            --http-port=8545 \
            --network=sepolia
        
        wait_for_service 8545 "Nimbus RPC"
    fi
    
    echo -e "${GREEN}✅ Nimbus RPC ready at http://localhost:8545${NC}"
else
    echo -e "${YELLOW}⚠️  Docker not found. Using public RPC endpoint...${NC}"
    echo -e "   To install Docker: ${GREEN}https://docs.docker.com/get-docker/${NC}"
fi

# Step 5: Start IPFS (optional)
echo -e "\n${BLUE}[5/6] Starting IPFS daemon...${NC}"

if command_exists ipfs; then
    if port_in_use 5001; then
        echo -e "${YELLOW}⚠️  IPFS already running on port 5001${NC}"
    else
        echo -e "${GREEN}📦 Starting IPFS daemon...${NC}"
        ipfs daemon > logs/ipfs.log 2>&1 &
        IPFS_PID=$!
        echo $IPFS_PID > .pids/ipfs.pid
        
        wait_for_service 5001 "IPFS"
        
        # Check peer count
        PEER_COUNT=$(ipfs swarm peers | wc -l)
        echo -e "${GREEN}✅ IPFS running with $PEER_COUNT peers${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  IPFS not installed. Using public gateways...${NC}"
    echo -e "   To install IPFS: ${GREEN}brew install ipfs${NC} or ${GREEN}https://ipfs.tech${NC}"
fi

# Step 6: Start Next.js App
echo -e "\n${BLUE}[6/6] Starting Next.js application...${NC}"

# Create necessary directories
mkdir -p logs .pids

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Start Next.js in development mode
echo -e "${GREEN}🚀 Starting Next.js dev server...${NC}"
npm run dev > logs/nextjs.log 2>&1 &
NEXTJS_PID=$!
echo $NEXTJS_PID > .pids/nextjs.pid

wait_for_service 3000 "Next.js"

# Summary
echo -e "\n${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           All Services Started             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}🎉 ResistNet is now running!${NC}"
echo ""
echo -e "${BLUE}Service Status:${NC}"
echo -e "  🧅 Tor/Arti:     ${GREEN}http://localhost:9150${NC} (SOCKS5)"
echo -e "  ⚡ Nimbus RPC:   ${GREEN}http://localhost:8545${NC}"
echo -e "  📦 IPFS:         ${GREEN}http://localhost:5001${NC} (API)"
echo -e "  🌐 Next.js App:  ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}Access your app:${NC}"
echo -e "  ${GREEN}→ Open: http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo -e "  ${YELLOW}→ tail -f logs/nextjs.log${NC}  (App logs)"
echo -e "  ${YELLOW}→ tail -f logs/arti.log${NC}    (Tor logs)"
echo -e "  ${YELLOW}→ docker logs -f nimbus-rpc${NC} (Nimbus logs)"
echo ""
echo -e "${BLUE}To stop all services:${NC}"
echo -e "  ${RED}→ ./scripts/stop-all.sh${NC}"
echo ""

# Save process IDs for cleanup
cat > .pids/all.pids << EOF
NEXTJS_PID=$NEXTJS_PID
ARTI_PID=${ARTI_PID:-}
TOR_PID=${TOR_PID:-}
IPFS_PID=${IPFS_PID:-}
EOF

echo -e "${GREEN}✨ Setup complete! Happy building! ✨${NC}"