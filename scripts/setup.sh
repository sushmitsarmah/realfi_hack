#!/bin/bash

# ResistNet - Initial Setup Script
# Run this script after cloning the repository

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

clear

echo -e "${PURPLE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ██████╗ ███████╗███████╗██╗███████╗████████╗          ║
║   ██╔══██╗██╔════╝██╔════╝██║██╔════╝╚══██╔══╝          ║
║   ██████╔╝█████╗  ███████╗██║███████╗   ██║             ║
║   ██╔══██╗██╔══╝  ╚════██║██║╚════██║   ██║             ║
║   ██║  ██║███████╗███████║██║███████║   ██║             ║
║   ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝╚══════╝   ╚═╝             ║
║                                                           ║
║   ███╗   ██╗███████╗████████╗                            ║
║   ████╗  ██║██╔════╝╚══██╔══╝                            ║
║   ██╔██╗ ██║█████╗     ██║                               ║
║   ██║╚██╗██║██╔══╝     ██║                               ║
║   ██║ ╚████║███████╗   ██║                               ║
║   ╚═╝  ╚═══╝╚══════╝   ╚═╝                               ║
║                                                           ║
║   Privacy-First Censorship-Resistant Platform            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}Welcome to ResistNet setup!${NC}"
echo -e "${BLUE}This script will help you get started.${NC}"
echo ""

# Step 1: Check Node.js
echo -e "${BLUE}[1/8] Checking system requirements...${NC}"

if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo ""
    echo "Please install Node.js v18 or higher:"
    echo "  ${GREEN}https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo -e "${RED}❌ Node.js version $NODE_VERSION is too old${NC}"
    echo "Please upgrade to Node.js v18 or higher"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
echo -e "${GREEN}✅ npm v$(npm --version)${NC}"
echo ""

# Step 2: Create directories
echo -e "${BLUE}[2/8] Creating project directories...${NC}"

mkdir -p logs
mkdir -p .pids
mkdir -p qr-codes
mkdir -p docs

echo -e "${GREEN}✅ Directories created${NC}"
echo ""

# Step 3: Install dependencies
echo -e "${BLUE}[3/8] Installing npm dependencies...${NC}"
echo -e "${YELLOW}This may take a few minutes...${NC}"
echo ""

npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo ""

# Step 4: Set up environment variables
echo -e "${BLUE}[4/8] Setting up environment configuration...${NC}"

if [ ! -f .env.local ]; then
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✅ Created .env.local from .env.example${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env.local with your API keys${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env.local already exists (skipping)${NC}"
fi

echo ""

# Step 5: Make scripts executable
echo -e "${BLUE}[5/8] Making scripts executable...${NC}"

chmod +x scripts/*.sh

echo -e "${GREEN}✅ Scripts are now executable${NC}"
echo ""

# Step 6: Check optional tools
echo -e "${BLUE}[6/8] Checking optional tools...${NC}"

TOOLS_INSTALLED=0
TOOLS_TOTAL=5

if command -v arti >/dev/null 2>&1; then
    echo -e "  Arti (Tor):     ${GREEN}✅ Installed${NC}"
    TOOLS_INSTALLED=$((TOOLS_INSTALLED + 1))
elif command -v tor >/dev/null 2>&1; then
    echo -e "  Tor:            ${GREEN}✅ Installed${NC}"
    TOOLS_INSTALLED=$((TOOLS_INSTALLED + 1))
else
    echo -e "  Arti/Tor:       ${YELLOW}⚠️  Not installed${NC}"
    echo -e "                  Install: ${GREEN}brew install arti${NC} or ${GREEN}apt install tor${NC}"
fi

if command -v docker >/dev/null 2>&1; then
    echo -e "  Docker:         ${GREEN}✅ Installed${NC}"
    TOOLS_INSTALLED=$((TOOLS_INSTALLED + 1))
else
    echo -e "  Docker:         ${YELLOW}⚠️  Not installed${NC}"
    echo -e "                  Install: ${GREEN}https://docs.docker.com/get-docker/${NC}"
fi

if command -v ipfs >/dev/null 2>&1; then
    echo -e "  IPFS:           ${GREEN}✅ Installed${NC}"
    TOOLS_INSTALLED=$((TOOLS_INSTALLED + 1))
else
    echo -e "  IPFS:           ${YELLOW}⚠️  Not installed${NC}"
    echo -e "                  Install: ${GREEN}brew install ipfs${NC} or ${GREEN}https://ipfs.tech${NC}"
fi

if command -v fleek >/dev/null 2>&1; then
    echo -e "  Fleek CLI:      ${GREEN}✅ Installed${NC}"
    TOOLS_INSTALLED=$((TOOLS_INSTALLED + 1))
else
    echo -e "  Fleek CLI:      ${YELLOW}⚠️  Not installed${NC}"
    echo -e "                  Install: ${GREEN}npm install -g @fleek-platform/cli${NC}"
fi

if command -v arweave >/dev/null 2>&1; then
    echo -e "  Arweave Deploy: ${GREEN}✅ Installed${NC}"
    TOOLS_INSTALLED=$((TOOLS_INSTALLED + 1))
else
    echo -e "  Arweave Deploy: ${YELLOW}⚠️  Not installed${NC}"
    echo -e "                  Install: ${GREEN}npm install -g arweave-deploy${NC}"
fi

echo ""
echo -e "${BLUE}Optional tools installed: $TOOLS_INSTALLED/$TOOLS_TOTAL${NC}"

if [ $TOOLS_INSTALLED -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No optional tools installed. The app will work but with limited features.${NC}"
elif [ $TOOLS_INSTALLED -lt $TOOLS_TOTAL ]; then
    echo -e "${YELLOW}⚠️  Some optional tools are missing. Install them for full functionality.${NC}"
else
    echo -e "${GREEN}✅ All optional tools are installed!${NC}"
fi

echo ""

# Step 7: Test build
echo -e "${BLUE}[7/8] Testing build...${NC}"
echo -e "${YELLOW}This will verify your setup is working...${NC}"
echo ""

npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    echo -e "${RED}Please check the errors above and fix them${NC}"
    exit 1
fi

echo ""

# Step 8: Initialize Git (if not already)
echo -e "${BLUE}[8/8] Checking Git repository...${NC}"

if [ -d .git ]; then
    echo -e "${GREEN}✅ Git repository already initialized${NC}"
else
    echo -e "${YELLOW}⚠️  Initializing Git repository...${NC}"
    git init
    
    # Create .gitignore if it doesn't exist
    if [ ! -f .gitignore ]; then
        cat > .gitignore << 'EOF'
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# Typescript
*.tsbuildinfo
next-env.d.ts

# ResistNet specific
logs/
.pids/
*.log
.onion-address
wallet.json
qr-codes/
EOF
        echo -e "${GREEN}✅ Created .gitignore${NC}"
    fi
    
    echo -e "${GREEN}✅ Git repository initialized${NC}"
fi

echo ""

# Final summary
echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                 Setup Complete! 🎉                    ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo -e "${YELLOW}1. Configure your API keys${NC}"
echo -e "   ${GREEN}→ Edit .env.local with your API keys${NC}"
echo -e "   ${BLUE}   - Gitcoin Passport: https://scorer.gitcoin.co/${NC}"
echo -e "   ${BLUE}   - Humanity Protocol: https://www.humanity.tech/${NC}"
echo ""

echo -e "${YELLOW}2. Start the development server${NC}"
echo -e "   ${GREEN}→ npm run services:start${NC}"
echo -e "   ${BLUE}   This will start all required services and the app${NC}"
echo ""

echo -e "${YELLOW}3. Access your app${NC}"
echo -e "   ${GREEN}→ Open http://localhost:3000 in your browser${NC}"
echo ""

echo -e "${YELLOW}4. (Optional) Set up Tor Hidden Service${NC}"
echo -e "   ${GREEN}→ ./scripts/deploy-tor.sh${NC}"
echo -e "   ${BLUE}   This creates a .onion address for your app${NC}"
echo ""

echo -e "${BLUE}📚 Useful Commands:${NC}"
echo ""
echo -e "  ${GREEN}npm run dev${NC}                - Start development server only"
echo -e "  ${GREEN}npm run services:start${NC}    - Start all services (recommended)"
echo -e "  ${GREEN}npm run services:stop${NC}     - Stop all services"
echo -e "  ${GREEN}npm run services:status${NC}   - Check service status"
echo -e "  ${GREEN}npm run deploy:all${NC}        - Deploy to all platforms"
echo ""

echo -e "${BLUE}📖 Documentation:${NC}"
echo ""
echo -e "  ${GREEN}README.md${NC}              - Full documentation"
echo -e "  ${GREEN}.env.example${NC}           - Configuration options"
echo -e "  ${GREEN}docs/${NC}                  - Additional documentation"
echo ""

echo -e "${BLUE}🆘 Need Help?${NC}"
echo ""
echo -e "  ${GREEN}./scripts/check-status.sh${NC}  - Debug service issues"
echo -e "  ${GREEN}npm run logs:view${NC}          - View application logs"
echo -e "  ${BLUE}Discord: https://discord.gg/resistnet${NC}"
echo -e "  ${BLUE}Forum: https://forum.logos.co${NC}"
echo ""

echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}       Thanks for choosing ResistNet! 🛡️✨${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""

# Ask if user wants to start services now
read -p "Would you like to start all services now? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Starting services...${NC}"
    ./scripts/start-all.sh
fi