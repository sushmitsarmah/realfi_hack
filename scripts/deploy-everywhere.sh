#!/bin/bash

# ResistNet - Deploy Everywhere Script
# Deploys the app to multiple censorship-resistant platforms

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ResistNet - Deploy to All Platforms     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Create deployment log
DEPLOY_LOG="logs/deploy-$(date +%Y%m%d-%H%M%S).log"
mkdir -p logs

log() {
    echo "$1" | tee -a "$DEPLOY_LOG"
}

# Check if required tools are installed
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Build the application
echo -e "${BLUE}[1/5] Building application...${NC}"
log "Building Next.js application for static export..."

# Update next.config.js for static export
cat > next.config.js.tmp << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
EOF

# Backup original config
if [ -f next.config.js ]; then
    cp next.config.js next.config.js.backup
fi

cp next.config.js.tmp next.config.js
rm next.config.js.tmp

# Build
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
    log "✅ Build completed successfully"
else
    echo -e "${RED}❌ Build failed${NC}"
    log "❌ Build failed"
    
    # Restore config
    if [ -f next.config.js.backup ]; then
        mv next.config.js.backup next.config.js
    fi
    
    exit 1
fi

# Restore original config
if [ -f next.config.js.backup ]; then
    mv next.config.js.backup next.config.js
fi

echo ""

# Store deployment URLs
DEPLOY_URLS_FILE="DEPLOYMENT_URLS.md"
echo "# ResistNet - Deployment URLs" > "$DEPLOY_URLS_FILE"
echo "" >> "$DEPLOY_URLS_FILE"
echo "Deployed on: $(date)" >> "$DEPLOY_URLS_FILE"
echo "" >> "$DEPLOY_URLS_FILE"

# Step 2: Deploy to IPFS
echo -e "${BLUE}[2/5] Deploying to IPFS...${NC}"

if command_exists fleek; then
    echo -e "${GREEN}📦 Deploying via Fleek...${NC}"
    log "Deploying to IPFS via Fleek..."
    
    fleek sites deploy 2>&1 | tee -a "$DEPLOY_LOG"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Fleek deployment successful${NC}"
        log "✅ Fleek deployment successful"
        echo "## Fleek/IPFS" >> "$DEPLOY_URLS_FILE"
        echo "- Primary: Check Fleek dashboard for URL" >> "$DEPLOY_URLS_FILE"
        echo "" >> "$DEPLOY_URLS_FILE"
    fi
elif command_exists ipfs; then
    echo -e "${GREEN}📦 Deploying via IPFS CLI...${NC}"
    log "Deploying to IPFS via CLI..."
    
    IPFS_HASH=$(ipfs add -r -Q out/)
    
    if [ -n "$IPFS_HASH" ]; then
        echo -e "${GREEN}✅ IPFS deployment successful${NC}"
        echo -e "   Hash: ${GREEN}$IPFS_HASH${NC}"
        log "✅ IPFS deployment successful: $IPFS_HASH"
        
        echo "## IPFS" >> "$DEPLOY_URLS_FILE"
        echo "- IPFS Hash: \`$IPFS_HASH\`" >> "$DEPLOY_URLS_FILE"
        echo "- IPFS.io: https://ipfs.io/ipfs/$IPFS_HASH" >> "$DEPLOY_URLS_FILE"
        echo "- Cloudflare: https://cloudflare-ipfs.com/ipfs/$IPFS_HASH" >> "$DEPLOY_URLS_FILE"
        echo "- Dweb.link: https://dweb.link/ipfs/$IPFS_HASH" >> "$DEPLOY_URLS_FILE"
        echo "" >> "$DEPLOY_URLS_FILE"
        
        # Pin to Pinata if configured
        if [ -n "$PINATA_JWT" ]; then
            echo -e "${YELLOW}📌 Pinning to Pinata...${NC}"
            curl -X POST "https://api.pinata.cloud/pinning/pinByHash" \
                -H "Authorization: Bearer $PINATA_JWT" \
                -H "Content-Type: application/json" \
                -d "{\"hashToPin\":\"$IPFS_HASH\"}" \
                2>&1 | tee -a "$DEPLOY_LOG"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Neither Fleek nor IPFS CLI found${NC}"
    log "⚠️ Skipping IPFS deployment - tools not found"
    echo "   Install: ${GREEN}npm install -g @fleek-platform/cli${NC}"
    echo "   Or: ${GREEN}brew install ipfs${NC}"
fi

echo ""

# Step 3: Deploy to Arweave
echo -e "${BLUE}[3/5] Deploying to Arweave...${NC}"

if command_exists arweave; then
    if [ -f wallet.json ]; then
        echo -e "${GREEN}♾️  Deploying to Arweave...${NC}"
        log "Deploying to Arweave..."
        
        ARWEAVE_TX=$(arweave deploy out/ --key-file wallet.json 2>&1 | grep -o 'https://arweave.net/[A-Za-z0-9_-]*' | head -1)
        
        if [ -n "$ARWEAVE_TX" ]; then
            echo -e "${GREEN}✅ Arweave deployment successful${NC}"
            echo -e "   URL: ${GREEN}$ARWEAVE_TX${NC}"
            log "✅ Arweave deployment successful: $ARWEAVE_TX"
            
            echo "## Arweave (Permanent)" >> "$DEPLOY_URLS_FILE"
            echo "- URL: $ARWEAVE_TX" >> "$DEPLOY_URLS_FILE"
            echo "" >> "$DEPLOY_URLS_FILE"
        fi
    else
        echo -e "${YELLOW}⚠️  Arweave wallet.json not found${NC}"
        log "⚠️ Skipping Arweave - wallet not found"
        echo "   Generate: ${GREEN}arweave key-create wallet.json${NC}"
        echo "   Fund: ${GREEN}https://faucet.arweave.net${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Arweave CLI not found${NC}"
    log "⚠️ Skipping Arweave deployment - CLI not found"
    echo "   Install: ${GREEN}npm install -g arweave-deploy${NC}"
fi

echo ""

# Step 4: Deploy to Web3.Storage
echo -e "${BLUE}[4/5] Deploying to Web3.Storage...${NC}"

if command_exists w3; then
    if [ -n "$WEB3_STORAGE_TOKEN" ]; then
        echo -e "${GREEN}🌐 Deploying to Web3.Storage...${NC}"
        log "Deploying to Web3.Storage..."
        
        W3_OUTPUT=$(w3 up out/ 2>&1 | tee -a "$DEPLOY_LOG")
        W3_CID=$(echo "$W3_OUTPUT" | grep -o 'bafy[A-Za-z0-9]*' | head -1)
        
        if [ -n "$W3_CID" ]; then
            echo -e "${GREEN}✅ Web3.Storage deployment successful${NC}"
            echo -e "   CID: ${GREEN}$W3_CID${NC}"
            log "✅ Web3.Storage deployment successful: $W3_CID"
            
            echo "## Web3.Storage" >> "$DEPLOY_URLS_FILE"
            echo "- CID: \`$W3_CID\`" >> "$DEPLOY_URLS_FILE"
            echo "- URL: https://w3s.link/ipfs/$W3_CID" >> "$DEPLOY_URLS_FILE"
            echo "- Alt: https://dweb.link/ipfs/$W3_CID" >> "$DEPLOY_URLS_FILE"
            echo "" >> "$DEPLOY_URLS_FILE"
        fi
    else
        echo -e "${YELLOW}⚠️  WEB3_STORAGE_TOKEN not set${NC}"
        log "⚠️ Skipping Web3.Storage - token not set"
    fi
else
    echo -e "${YELLOW}⚠️  Web3.Storage CLI (w3) not found${NC}"
    log "⚠️ Skipping Web3.Storage deployment - CLI not found"
    echo "   Install: ${GREEN}npm install -g @web3-storage/w3cli${NC}"
fi

echo ""

# Step 5: Update Tor Hidden Service
echo -e "${BLUE}[5/5] Updating Tor Hidden Service...${NC}"

if [ -d /var/lib/tor/resistnet ]; then
    ONION_ADDRESS=$(sudo cat /var/lib/tor/resistnet/hostname 2>/dev/null || echo "")
    
    if [ -n "$ONION_ADDRESS" ]; then
        echo -e "${GREEN}🧅 Tor Hidden Service configured${NC}"
        echo -e "   Address: ${GREEN}http://$ONION_ADDRESS${NC}"
        log "✅ Tor hidden service: http://$ONION_ADDRESS"
        
        echo "## Tor Hidden Service" >> "$DEPLOY_URLS_FILE"
        echo "- Address: \`http://$ONION_ADDRESS\`" >> "$DEPLOY_URLS_FILE"
        echo "- Access: Use Tor Browser" >> "$DEPLOY_URLS_FILE"
        echo "" >> "$DEPLOY_URLS_FILE"
        
        # Check if Next.js is running
        if pgrep -f "next" > /dev/null; then
            echo -e "${GREEN}   Next.js is running - hidden service accessible${NC}"
        else
            echo -e "${YELLOW}   Start app: npm start${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Could not read .onion address${NC}"
        log "⚠️ Could not read Tor hidden service address"
    fi
else
    echo -e "${YELLOW}⚠️  Tor hidden service not configured${NC}"
    log "⚠️ Tor hidden service not configured"
    echo "   Setup: ${GREEN}./scripts/deploy-tor.sh${NC}"
fi

echo ""

# Summary
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       Deployment Complete!                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

log "Deployment completed successfully"

# Display all URLs
if [ -f "$DEPLOY_URLS_FILE" ]; then
    echo -e "${BLUE}📋 Access URLs saved to: ${GREEN}$DEPLOY_URLS_FILE${NC}"
    echo ""
    cat "$DEPLOY_URLS_FILE"
fi

echo ""
echo -e "${BLUE}📝 Deployment log: ${GREEN}$DEPLOY_LOG${NC}"
echo ""

# Generate QR codes if qrencode is available
if command_exists qrencode && [ -n "$IPFS_HASH" ]; then
    echo -e "${BLUE}📱 Generating QR codes...${NC}"
    mkdir -p qr-codes
    
    echo "https://ipfs.io/ipfs/$IPFS_HASH" | qrencode -o "qr-codes/ipfs-qr.png"
    echo -e "${GREEN}✅ QR code saved: qr-codes/ipfs-qr.png${NC}"
fi

echo ""
echo -e "${GREEN}✨ Your app is now accessible from multiple platforms! ✨${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. ${YELLOW}Test all URLs to ensure they work${NC}"
echo -e "  2. ${YELLOW}Set up ENS domain (optional): https://app.ens.domains${NC}"
echo -e "  3. ${YELLOW}Share access URLs with your community${NC}"
echo -e "  4. ${YELLOW}Monitor uptime and re-deploy as needed${NC}"
echo ""
echo -e "${BLUE}To update deployment:${NC}"
echo -e "  ${GREEN}→ Make changes and run ./scripts/deploy-everywhere.sh again${NC}"
echo ""