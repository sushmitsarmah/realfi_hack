#!/bin/bash

# ResistNet - Deploy as Tor Hidden Service

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ResistNet - Tor Hidden Service Setup    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check if Tor is installed
if ! command -v tor >/dev/null 2>&1; then
    echo -e "${RED}❌ Tor is not installed${NC}"
    echo ""
    echo "Install Tor:"
    echo "  macOS:  ${GREEN}brew install tor${NC}"
    echo "  Ubuntu: ${GREEN}sudo apt install tor${NC}"
    echo "  Fedora: ${GREEN}sudo dnf install tor${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Tor is installed${NC}"
echo ""

# Check if running as root for configuration
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}⚠️  This script needs sudo access to configure Tor${NC}"
    echo -e "${YELLOW}   You may be prompted for your password${NC}"
    echo ""
fi

# Step 1: Configure Tor Hidden Service
echo -e "${BLUE}[1/4] Configuring Tor hidden service...${NC}"

TORRC="/etc/tor/torrc"
SERVICE_DIR="/var/lib/tor/resistnet"
SERVICE_NAME="ResistNet"

# Backup existing torrc
sudo cp "$TORRC" "${TORRC}.backup.$(date +%Y%m%d-%H%M%S)"

# Check if hidden service already configured
if grep -q "resistnet" "$TORRC"; then
    echo -e "${YELLOW}⚠️  ResistNet hidden service already configured${NC}"
else
    echo -e "${GREEN}📝 Adding hidden service configuration...${NC}"
    
    # Add hidden service configuration
    sudo tee -a "$TORRC" > /dev/null << EOF

# ResistNet Hidden Service
HiddenServiceDir $SERVICE_DIR/
HiddenServicePort 80 127.0.0.1:3000
EOF

    echo -e "${GREEN}✅ Configuration added${NC}"
fi

echo ""

# Step 2: Set correct permissions
echo -e "${BLUE}[2/4] Setting permissions...${NC}"

if [ -d "$SERVICE_DIR" ]; then
    sudo chown -R $(whoami) "$SERVICE_DIR" 2>/dev/null || sudo chown -R tor:tor "$SERVICE_DIR"
    echo -e "${GREEN}✅ Permissions set${NC}"
else
    echo -e "${YELLOW}⚠️  Service directory will be created when Tor starts${NC}"
fi

echo ""

# Step 3: Restart Tor
echo -e "${BLUE}[3/4] Restarting Tor service...${NC}"

if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl restart tor
    sleep 3
    
    if sudo systemctl is-active --quiet tor; then
        echo -e "${GREEN}✅ Tor service restarted successfully${NC}"
    else
        echo -e "${RED}❌ Tor service failed to start${NC}"
        echo "Check logs: ${YELLOW}sudo journalctl -u tor -n 50${NC}"
        exit 1
    fi
else
    # macOS or systems without systemctl
    sudo killall tor 2>/dev/null || true
    sleep 1
    tor -f "$TORRC" &
    sleep 3
    echo -e "${GREEN}✅ Tor restarted${NC}"
fi

echo ""

# Step 4: Get onion address
echo -e "${BLUE}[4/4] Getting your .onion address...${NC}"

# Wait for hostname file to be generated
MAX_WAIT=30
WAIT_COUNT=0

while [ ! -f "$SERVICE_DIR/hostname" ] && [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    echo -e "${YELLOW}⏳ Waiting for Tor to generate .onion address...${NC}"
    sleep 2
    WAIT_COUNT=$((WAIT_COUNT + 2))
done

if [ -f "$SERVICE_DIR/hostname" ]; then
    ONION_ADDRESS=$(sudo cat "$SERVICE_DIR/hostname")
    
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║         Setup Complete!                    ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}🧅 Your .onion address:${NC}"
    echo -e "${BLUE}   http://$ONION_ADDRESS${NC}"
    echo ""
    echo -e "${YELLOW}📝 Important Notes:${NC}"
    echo -e "   1. Keep this address private or share only with trusted users"
    echo -e "   2. Access this address using Tor Browser"
    echo -e "   3. Your Next.js app must be running on port 3000"
    echo ""
    echo -e "${BLUE}To start your app:${NC}"
    echo -e "   ${GREEN}npm run build && npm start${NC}"
    echo ""
    echo -e "${BLUE}To test your hidden service:${NC}"
    echo -e "   1. Open Tor Browser"
    echo -e "   2. Visit: ${GREEN}http://$ONION_ADDRESS${NC}"
    echo ""
    
    # Save address to file
    echo "$ONION_ADDRESS" > .onion-address
    echo -e "${GREEN}✅ Address saved to: .onion-address${NC}"
    echo ""
    
    # Add to deployment URLs
    if [ -f DEPLOYMENT_URLS.md ]; then
        echo "" >> DEPLOYMENT_URLS.md
        echo "## Tor Hidden Service" >> DEPLOYMENT_URLS.md
        echo "- Address: \`http://$ONION_ADDRESS\`" >> DEPLOYMENT_URLS.md
        echo "- Access: Use Tor Browser" >> DEPLOYMENT_URLS.md
        echo "- Configured: $(date)" >> DEPLOYMENT_URLS.md
    fi
    
else
    echo -e "${RED}❌ Failed to generate .onion address${NC}"
    echo -e "Check Tor logs: ${YELLOW}sudo journalctl -u tor -n 50${NC}"
    exit 1
fi

# Optional: Generate QR code
if command -v qrencode >/dev/null 2>&1; then
    echo -e "${BLUE}📱 Generating QR code...${NC}"
    mkdir -p qr-codes
    echo "http://$ONION_ADDRESS" | qrencode -o "qr-codes/onion-qr.png"
    echo -e "${GREEN}✅ QR code saved: qr-codes/onion-qr.png${NC}"
    echo ""
fi

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Your app is now accessible via Tor! ✨${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"