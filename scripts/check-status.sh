#!/bin/bash

# ResistNet - Check Status of All Services

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ResistNet - Service Status Check        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if port is open
check_port() {
    local port=$1
    nc -z localhost "$port" >/dev/null 2>&1
}

# Function to check service status
check_service() {
    local name=$1
    local port=$2
    local url=$3
    
    echo -e "${BLUE}Checking $name...${NC}"
    
    if check_port "$port"; then
        echo -e "  Status: ${GREEN}✅ Running${NC}"
        echo -e "  Port:   ${GREEN}$port${NC}"
        
        if [ -n "$url" ]; then
            echo -e "  URL:    ${GREEN}$url${NC}"
            
            # Try to get additional info
            if [ "$name" = "IPFS" ]; then
                if command -v ipfs >/dev/null 2>&1; then
                    PEERS=$(ipfs swarm peers 2>/dev/null | wc -l || echo "0")
                    echo -e "  Peers:  ${GREEN}$PEERS${NC}"
                fi
            elif [ "$name" = "Nimbus RPC" ]; then
                # Try to get block number
                BLOCK=$(curl -s -X POST "$url" \
                    -H "Content-Type: application/json" \
                    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
                    2>/dev/null | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
                
                if [ -n "$BLOCK" ]; then
                    BLOCK_DEC=$((16#${BLOCK#0x}))
                    echo -e "  Block:  ${GREEN}$BLOCK_DEC${NC}"
                fi
            fi
        fi
    else
        echo -e "  Status: ${RED}❌ Not Running${NC}"
        echo -e "  Port:   ${RED}$port (closed)${NC}"
    fi
    
    echo ""
}

# Check Node.js
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           System Requirements              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo -e "Node.js:  ${GREEN}✅ $NODE_VERSION${NC}"
else
    echo -e "Node.js:  ${RED}❌ Not installed${NC}"
fi

if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    echo -e "npm:      ${GREEN}✅ v$NPM_VERSION${NC}"
else
    echo -e "npm:      ${RED}❌ Not installed${NC}"
fi

if command -v docker >/dev/null 2>&1; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
    echo -e "Docker:   ${GREEN}✅ $DOCKER_VERSION${NC}"
else
    echo -e "Docker:   ${YELLOW}⚠️  Not installed${NC}"
fi

echo ""

# Check Services
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Service Status                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check Tor/Arti
check_service "Tor/Arti" 9150 "socks5://localhost:9150"

# Check Nimbus RPC
check_service "Nimbus RPC" 8545 "http://localhost:8545"

# Check IPFS
check_service "IPFS API" 5001 "http://localhost:5001"
check_service "IPFS Gateway" 8080 "http://localhost:8080"

# Check Next.js
check_service "Next.js App" 3000 "http://localhost:3000"

# Check Configuration
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║            Configuration Check             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

if [ -f .env.local ]; then
    echo -e ".env.local: ${GREEN}✅ Found${NC}"
    
    # Check for required variables
    if grep -q "NEXT_PUBLIC_GITCOIN_API_KEY=" .env.local && \
       ! grep -q "NEXT_PUBLIC_GITCOIN_API_KEY=your_" .env.local; then
        echo -e "Gitcoin API Key: ${GREEN}✅ Configured${NC}"
    else
        echo -e "Gitcoin API Key: ${YELLOW}⚠️  Not configured${NC}"
    fi
    
    if grep -q "NEXT_PUBLIC_HUMANITY_API_KEY=" .env.local && \
       ! grep -q "NEXT_PUBLIC_HUMANITY_API_KEY=your_" .env.local; then
        echo -e "Humanity API Key: ${GREEN}✅ Configured${NC}"
    else
        echo -e "Humanity API Key: ${YELLOW}⚠️  Not configured${NC}"
    fi
else
    echo -e ".env.local: ${RED}❌ Not found${NC}"
    echo -e "${YELLOW}Run: cp .env.example .env.local${NC}"
fi

echo ""

# Check Process IDs
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║            Running Processes               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

if [ -d .pids ]; then
    for pidfile in .pids/*.pid; do
        if [ -f "$pidfile" ]; then
            name=$(basename "$pidfile" .pid)
            pid=$(cat "$pidfile")
            
            if ps -p "$pid" > /dev/null 2>&1; then
                echo -e "$name: ${GREEN}✅ Running (PID: $pid)${NC}"
            else
                echo -e "$name: ${RED}❌ Not running (stale PID)${NC}"
            fi
        fi
    done
else
    echo -e "${YELLOW}No PID files found${NC}"
fi

echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                 Summary                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Count running services
RUNNING=0
TOTAL=5

check_port 9150 && RUNNING=$((RUNNING + 1))
check_port 8545 && RUNNING=$((RUNNING + 1))
check_port 5001 && RUNNING=$((RUNNING + 1))
check_port 8080 && RUNNING=$((RUNNING + 1))
check_port 3000 && RUNNING=$((RUNNING + 1))

if [ "$RUNNING" -eq "$TOTAL" ]; then
    echo -e "${GREEN}✅ All services are running ($RUNNING/$TOTAL)${NC}"
    echo -e "${GREEN}🚀 ResistNet is fully operational!${NC}"
elif [ "$RUNNING" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Some services are running ($RUNNING/$TOTAL)${NC}"
    echo -e "${YELLOW}Run ./scripts/start-all.sh to start missing services${NC}"
else
    echo -e "${RED}❌ No services are running (0/$TOTAL)${NC}"
    echo -e "${RED}Run ./scripts/start-all.sh to start all services${NC}"
fi

echo ""

# Network Test
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Network Tests                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Test Tor connectivity
if check_port 9150; then
    echo -e "Testing Tor connection..."
    if command -v curl >/dev/null 2>&1; then
        TOR_IP=$(curl -s --socks5 localhost:9150 https://api.ipify.org 2>/dev/null)
        DIRECT_IP=$(curl -s https://api.ipify.org 2>/dev/null)
        
        if [ -n "$TOR_IP" ] && [ "$TOR_IP" != "$DIRECT_IP" ]; then
            echo -e "  Tor IP:    ${GREEN}$TOR_IP${NC}"
            echo -e "  Direct IP: ${BLUE}$DIRECT_IP${NC}"
            echo -e "  Status:    ${GREEN}✅ Tor routing works!${NC}"
        else
            echo -e "  Status:    ${YELLOW}⚠️  Could not verify Tor routing${NC}"
        fi
    fi
else
    echo -e "Tor:       ${RED}❌ Not running${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"