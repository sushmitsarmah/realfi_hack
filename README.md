## 📦 Complete File Structure

After running `npm run setup`, your project will have this structure:

```

resistnet-wallet/
├── 📱 Frontend
│   ├── app/
│   │   ├── page.tsx                    # Main application
│   │   ├── layout.tsx                  # Root layout
│   │   └── globals.css                 # Global styles
│   ├── components/
│   │   ├── WalletView.tsx              # Wallet interface
│   │   ├── PublishingView.tsx          # Publishing platform
│   │   ├── GovernanceView.tsx          # Governance UI
│   │   ├── VaultView.tsx               # Evidence vault
│   │   └── SettingsView.tsx            # Settings panel
│   └── hooks/
│       └── useResistNet.ts             # Main React hook
│
├── 🔧 Core Library
│   ├── lib/
│   │   ├── wallet-core.ts              # Wallet + Waku + Tor
│   │   ├── enhanced-wallet.ts          # + Nillion MPC
│   │   ├── censorship-resistant.ts     # Publishing
│   │   ├── resilient-coordination.ts   # Governance
│   │   ├── secure-vault.ts             # Evidence storage
│   │   ├── gitcoin-passport.ts         # Identity (Gitcoin)
│   │   ├── humanity-protocol.ts        # Identity (Humanity)
│   │   ├── identity-manager.ts         # Combined identity
│   │   ├── tor-provider.ts             # Tor RPC provider
│   │   ├── waku-messenger.ts           # P2P messaging
│   │   ├── nillion-key-manager.ts      # MPC keys
│   │   ├── nillion-analytics.ts        # Private analytics
│   │   ├── nillion-multisig.ts         # Private multi-sig
│   │   ├── nillion-credit.ts           # Credit scoring
│   │   └── nillion-contacts.ts         # Encrypted contacts
│
├── 🤖 Scripts & Automation
│   ├── scripts/
│   │   ├── setup.sh                    # Initial setup
│   │   ├── start-all.sh                # Start all services
│   │   ├── stop-all.sh                 # Stop all services
│   │   ├── check-status.sh             # Health check
│   │   ├── deploy-everywhere.sh        # Multi-platform deploy
│   │   ├── deploy-tor.sh               # Tor hidden service
│   │   └── init-project.sh             # Project structure
│
├── 📚 Documentation
│   ├── docs/
│   │   ├── ARCHITECTURE.md             # System architecture
│   │   ├── PRIVACY_GUARANTEES.md       # Privacy details
│   │   ├── API.md                      # API reference
│   │   └── SECURITY.md                 # Security guide
│   ├── README.md                       # This file
│   ├── QUICKSTART.md                   # Quick reference
│   └── CONTRIBUTING.md                 # Contribution guide
│
├── ⚙️ Configuration
│   ├── .env.example                    # Config template
│   ├── .env.local                      # Your config (gitignored)
│   ├── next.config.js                  # Next.js config
│   ├── tailwind.config.ts              # Tailwind config
│   ├── tsconfig.json                   # TypeScript config
│   ├── package.json                    # Dependencies
│   └── .gitignore                      # Git ignore rules
│
├── 📝 Runtime Data
│   ├── logs/                           # Application logs
│   ├── .pids/                          # Process IDs
│   ├── qr-codes/                       # Generated QR codes
│   └── .onion-address                  # Tor address (generated)
│
└── 🔒 Security
    ├── wallet.json                     # Arweave wallet (gitignored)
    └── DEPLOYMENT_URLS.md              # Access URLs (generated)
```

---

## 🎬 Complete Setup Walkthrough

### Option 1: Automated Setup (Recommended)

```bash
# 1. Clone and enter directory
git clone https://github.com/yourusername/resistnet-wallet.git
cd resistnet-wallet

# 2. Run automated setup
npm run setup
# This will:
# ✅ Check Node.js version
# ✅ Install all dependencies
# ✅ Create .env.local from template
# ✅ Make scripts executable
# ✅ Test build
# ✅ Initialize Git repository

# 3. Configure API keys
nano .env.local
# Add your:
# - Gitcoin Passport API key
# - Humanity Protocol API key
# - (Optional) IPFS Infura credentials

# 4. Start everything
npm run services:start
# This starts:
# ✅ Arti/Tor proxy (port 9150)
# ✅ Nimbus RPC node (port 8545)
# ✅ IPFS daemon (port 5001)
# ✅ Next.js app (port 3000)

# 5. Open your browser
open http://localhost:3000
```

### Option 2: Manual Setup

```bash
# 1. Clone repository
git clone https://github.com/yourusername/resistnet-wallet.git
cd resistnet-wallet

# 2. Create directories
mkdir -p logs .pids qr-codes docs

# 3. Install dependencies
npm install

# 4. Configure environment
cp .env.example .env.local
nano .env.local  # Add your API keys

# 5. Make scripts executable
chmod +x scripts/*.sh

# 6. Start services manually
# Terminal 1: Tor
arti proxy --socks-port 9150

# Terminal 2: Nimbus (Docker)
docker run -d --name nimbus-rpc -p 8545:8545 \
  statusim/nimbus-eth1:latest \
  --http-enabled --http-address=0.0.0.0

# Terminal 3: IPFS (optional)
ipfs daemon

# Terminal 4: Next.js
npm run dev

# 6. Access app
open http://localhost:3000
```

---

## 🎯 First-Time Usage Guide

### Step 1: Create Your Wallet

When you first open the app:

1. Click "Create New Wallet" or import existing
2. Save your recovery phrase securely
3. Enable MPC key management (recommended)
4. Set up social recovery with trusted contacts

### Step 2: Build Your Identity

1. **Get Gitcoin Passport Stamps**
   - Visit: <https://passport.gitcoin.co/>
   - Connect your accounts (GitHub, Twitter, etc.)
   - Return to ResistNet to see your score

2. **Verify with Humanity Protocol**
   - Complete verification process
   - Improve your combined identity score

### Step 3: Test Core Features

1. **Send a Test Transaction**
   - Send 0.001 ETH to yourself
   - Verify it routes through Tor
   - Check transaction confirmation

2. **Publish an Article**
   - Write a test publication
   - Publish to IPFS + Waku network
   - Access via multiple URLs

3. **Create a Proposal**
   - Create a test governance proposal
   - Vote on it privately
   - View results without revealing votes

4. **Upload Evidence**
   - Upload a test file
   - Grant access to another address
   - Verify encryption works

### Step 4: Deploy Publicly

```bash
# Deploy as Tor hidden service
npm run deploy:tor

# Deploy to IPFS
npm run deploy:ipfs

# Deploy everywhere
npm run deploy:all
```

### Step 5: Share Access

After deployment, share these URLs:

- **IPFS**: `https://ipfs.io/ipfs/YourHash`
- **Tor**: `http://your-address.onion` (use Tor Browser)
- **Arweave**: `https://arweave.net/YourTxId`

Find all URLs in: `DEPLOYMENT_URLS.md`

---

## 💻 Development Workflow

### Daily Development

```bash
# Start all services
npm run services:start

# Make changes to code
# (Hot reload is enabled)

# Check service status
npm run services:status

# View logs
npm run logs:view

# Stop when done
npm run services:stop
```

### Testing Changes

```bash
# Run tests
npm test

# E2E tests
npm run test:e2e

# Build production version
npm run build

# Test production build
npm start
```

### Debugging

```bash
# Check all services
./scripts/check-status.sh

# View specific logs
tail -f logs/nextjs.log
tail -f logs/arti.log
docker logs -f nimbus-rpc

# Check Tor routing
curl --socks5 localhost:9150 https://check.torproject.org/api/ip

# Test RPC connection
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## 🚢 Production Deployment Checklist

### Pre-Deployment

- [ ] All tests pass: `npm test`
- [ ] Production build works: `npm run build`
- [ ] API keys configured in production `.env`
- [ ] Security audit completed
- [ ] Backup wallet keys securely
- [ ] Document deployment URLs

### Deploy to All Platforms

```bash
# Build once
npm run build

# Deploy everywhere
npm run deploy:all

# This deploys to:
# ✅ IPFS (via Fleek)
# ✅ Arweave (permanent storage)
# ✅ Tor Hidden Service
# ✅ Web3.Storage
# ✅ Multiple IPFS pinning services
```

### Post-Deployment

- [ ] Test all access URLs
- [ ] Verify Tor hidden service
- [ ] Check IPFS availability
- [ ] Set up ENS domain (optional)
- [ ] Monitor uptime
- [ ] Share URLs with community

### Optional: ENS Domain Setup

```bash
# 1. Get ENS domain at: https://app.ens.domains/
# 2. Set Content Hash to your IPFS hash
# 3. Access via: https://yourname.eth.limo
```

---

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Check all services
./scripts/check-status.sh

# Expected output:
# ✅ Tor/Arti: Running
# ✅ Nimbus RPC: Running
# ✅ IPFS: Running
# ✅ Next.js: Running
```

### Log Management

```bash
# View all logs
npm run logs:view

# Clear old logs
npm run logs:clear

# Archive logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/
```

### Updates

```bash
# Update code
git pull origin main

# Update dependencies
npm install

# Rebuild
npm run build

# Restart services
npm run services:restart
```

### Backup Strategy

**What to Backup:**

1. Wallet private keys (`.env.local`)
2. Arweave wallet (`wallet.json`)
3. Tor hidden service keys (`/var/lib/tor/resistnet/`)
4. Deployment URLs (`DEPLOYMENT_URLS.md`)

**Backup Command:**

```bash
tar -czf resistnet-backup-$(date +%Y%m%d).tar.gz \
  .env.local \
  wallet.json \
  DEPLOYMENT_URLS.md \
  .onion-address
```

---

## 🔐 Security Best Practices

### Development

1. **Never commit sensitive files**
   - `.env.local` is in `.gitignore`
   - `wallet.json` is in `.gitignore`
   - Never commit private keys

2. **Use environment variables**
   - All API keys in `.env.local`
   - Never hardcode credentials

3. **Enable all privacy features**

   ```env
   NEXT_PUBLIC_TOR_ENABLED=true
   NEXT_PUBLIC_ENABLE_MPC_KEYS=true
   NEXT_PUBLIC_ENABLE_PRIVATE_VOTING=true
   ```

### Production

1. **Use strong API keys**
   - Rotate regularly
   - Use production-grade keys
   - Monitor usage

2. **Enable MPC key management**
   - Never store full private key
   - Use Nillion for key splitting
   - Set up social recovery

3. **Monitor for attacks**
   - Watch for unusual traffic
   - Check logs regularly
   - Set up alerts

4. **Keep software updated**

   ```bash
   npm update
   npm audit fix
   ```

### Reporting Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities.

Email: **<security@resistnet.example>**

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Quick Contribution Guide

1. **Fork the repository**

   ```bash
   git clone https://github.com/yourusername/resistnet-wallet.git
   ```

2. **Create feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make changes**
   - Write code
   - Add tests
   - Update documentation

4. **Test thoroughly**

   ```bash
   npm test
   npm run build
   ./scripts/check-status.sh
   ```

5. **Commit with clear message**

   ```bash
   git commit -m "feat: add amazing feature"
   ```

6. **Push and create PR**

   ```bash
   git push origin feature/amazing-feature
   ```

### Development Standards

- **TypeScript** for all new code
- **Tests** for new features
- **Documentation** for APIs
- **ESLint** compliance
- **Security** review for sensitive code

---

## 📞 Support & Community

### Get Help

- **Documentation**: [Full docs](./README.md) | [Quick Start](./QUICKSTART.md)
- **Check Status**: `./scripts/check-status.sh`
- **View Logs**: `npm run logs:view`
- **Discord**: [Join our Discord](https://discord.gg/resistnet)
- **Forum**: [Logos Forum](https://forum.logos.co)

### Report Issues

- **Bugs**: [GitHub Issues](https://github.com/yourusername/resistnet-wallet/issues)
- **Security**: <security@resistnet.example>
- **General Questions**: [Discord](https://discord.gg/resistnet)

### Stay Updated

- **Twitter**: [@ResistNetApp](https://twitter.com/resistnet)
- **Blog**: [blog.resistnet.example](https://blog.resistnet.example)
- **Newsletter**: Subscribe at [resistnet.example](https://resistnet.example)

---

## 🏆 Acknowledgments & Credits

### Built With Love Using

- **[Waku](https://waku.org/)** - P2P messaging protocol
- **[Tor Project](https://www.torproject.org/)** - Network anonymity
- **[Nimbus](https://nimbus.team/)** - Ethereum execution client
- **[Nillion](https://nillion.com/)** - Blind computation network
- **[IPFS](https://ipfs.tech/)** - Distributed file system
- **[Gitcoin Passport](https://passport.gitcoin.co/)** - Sybil resistance
- **[Humanity Protocol](https://www.humanity.tech/)** - Proof of personhood

### Special Thanks

- **Logos Network** for the hackathon and inspiration
- **Ethereum Foundation** for pioneering decentralized tech
- **All open source contributors** who made this possible
- **Early adopters and testers** for valuable feedback

### Inspiration

Built for activists, journalists, whistleblowers, and anyone fighting for a free and open internet.

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

You are free to:

- ✅ Use commercially
- ✅ Modify
- ✅ Distribute
- ✅ Use privately

Under the condition that you:

- ✅ Include copyright notice
- ✅ Include license text

---

## 🗺️ Project Roadmap

### ✅ Phase 1: Foundation (Current - v1.0)

- [x] Core wallet functionality
- [x] P2P messaging (Waku)
- [x] Tor routing (Arti)
- [x] Private RPC (Nimbus)
- [x] MPC key management (Nillion)
- [x] Identity scoring (Gitcoin + Humanity)
- [x] Publishing platform
- [x] Governance tools
- [x] Evidence vault

### 🚧 Phase 2: Enhanced Privacy (Q2 2025)

- [ ] Stealth addresses (ERC-5564)
- [ ] Zero-knowledge proofs for transactions
- [ ] Coin mixing integration
- [ ] Multi-hop Tor routing
- [ ] Private smart contracts

### 📱 Phase 3: Mobile & Extensions (Q3 2025)

- [ ] React Native mobile app
- [ ] Browser extension (Chrome/Firefox)
- [ ] Hardware wallet integration
- [ ] Biometric authentication
- [ ] Offline mode improvements

### 🌐 Phase 4: Ecosystem (Q4 2025)

- [ ] Plugin system for developers
- [ ] SDK for third-party apps
- [ ] Grant program for projects
- [ ] Ambassador program
- [ ] Developer documentation portal

### 🚀 Phase 5: Scale (2026)

- [ ] Multi-chain support (Polygon, Arbitrum, etc.)
- [ ] Decentralized identity (DID)
- [ ] Advanced governance features
- [ ] Mobile app stores (iOS/Android)
- [ ] 100,000+ active users

---

## 📈 Project Stats

- **Version**: 1.0.0-beta
- **Status**: Beta (Testnet Only)
- **Technologies**: 7 (Waku, Tor, Nimbus, Nillion, IPFS, Gitcoin, Humanity)
- **Lines of Code**: ~15,000
- **Test Coverage**: Target 80%
- **Documentation**: Comprehensive
- **License**: MIT

---

## 💡 Quick Links

| Link | Description |
|------|-------------|
| [Installation](#-installation) | Get started in 5 minutes |
| [Configuration](#-configuration) | Set up your environment |
| [Running Locally](#-running-locally) | Start development |
| [Deployment](#-deployment) | Deploy to production |
| [Troubleshooting](#-troubleshooting) | Fix common issues |
| [API Docs](#-api-documentation) | API reference |
| [Contributing](#-contributing) | Join development |
| [Security](#-security) | Security guidelines |

---

<div align="center">

**Built with ❤️ for a censorship-free internet**

🛡️ **Privacy First** | 🌐 **Decentralized** | 🔒 **Secure**

[Website](https://resistnet.example) • [Discord](https://discord.gg/resistnet) • [Twitter](https://twitter.com/resistnet) • [Forum](https://forum.logos.co)

---

⭐ **Star this repo** if you believe in privacy and free speech!

---

</div># ResistNet Wallet 🛡️

> A fully privacy-resistant, censorship-proof platform combining wallet functionality, secure messaging, evidence vaults, and resilient coordination tools.

![ResistNet Banner](./docs/banner.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?logo=next.js)](https://nextjs.org/)
[![Powered by Waku](https://img.shields.io/badge/Powered%20by-Waku-blueviolet)](https://waku.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [Features](#features)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

---

## 🎯 Overview

ResistNet is a next-generation privacy platform that combines:

- **Private Wallet**: Ethereum wallet with MPC key management
- **Censorship-Resistant Publishing**: Unstoppable content distribution
- **Resilient Coordination**: Offline-capable governance and voting
- **Secure Evidence Vault**: Encrypted storage with chain-of-custody
- **Proof of Personhood**: Sybil-resistant identity via Gitcoin Passport & Humanity Protocol

### Why ResistNet?

- 🚫 **Censorship-Resistant**: Content stored on IPFS, distributed via Waku P2P
- 🔒 **Privacy-First**: All network traffic routed through Tor
- 🔐 **Secure**: MPC key management via Nillion
- 👤 **Sybil-Proof**: Gitcoin Passport + Humanity Protocol integration
- 🌐 **Decentralized**: No central servers or single points of failure

---

## 🛠️ Technology Stack

### Core Technologies

| Technology | Purpose | Documentation |
|------------|---------|---------------|
| **Waku** | P2P messaging & content distribution | [docs.waku.org](https://docs.waku.org/) |
| **Tor (Arti)** | Network anonymity & censorship resistance | [arti docs](https://tpo.pages.torproject.net/core/arti/) |
| **Nimbus** | Private Ethereum RPC endpoint | [nimbus.guide](https://nimbus.guide/) |
| **Nillion** | Blind computation & MPC key management | [docs.nillion.com](https://docs.nillion.com/) |
| **IPFS** | Permanent, distributed file storage | [docs.ipfs.tech](https://docs.ipfs.tech/) |
| **Gitcoin Passport** | Sybil-resistant identity scoring | [docs.passport.xyz](https://docs.passport.xyz/) |
| **Humanity Protocol** | Proof of personhood verification | [passport.human.tech](https://passport.human.tech/) |

### Frontend Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **ethers.js v6** - Ethereum interactions
- **Lucide React** - Icons

---

## 📦 Prerequisites

### Required Software

1. **Node.js** (v18 or higher)

   ```bash
   node --version  # Should be >= 18.0.0
   ```

2. **npm** or **yarn**

   ```bash
   npm --version   # Should be >= 9.0.0
   ```

3. **Git**

   ```bash
   git --version
   ```

### Optional (for full privacy features)

4. **Arti (Tor Client)** - Required for Tor routing

   ```bash
   # macOS
   brew install arti
   
   # Linux (via Cargo)
   cargo install arti
   
   # Or download from: https://gitlab.torproject.org/tpo/core/arti
   ```

5. **Docker** - For running Nimbus RPC node

   ```bash
   docker --version
   ```

6. **IPFS CLI** - For IPFS deployment

   ```bash
   # macOS
   brew install ipfs
   
   # Linux
   wget https://dist.ipfs.tech/kubo/v0.24.0/kubo_v0.24.0_linux-amd64.tar.gz
   tar -xvzf kubo_v0.24.0_linux-amd64.tar.gz
   cd kubo
   sudo bash install.sh
   ```

### API Keys Required

- **Gitcoin Passport API Key**: [Get here](https://scorer.gitcoin.co/)
- **Humanity Protocol API Key**: [Contact team](https://www.humanity.tech/)
- **Infura IPFS Project**: [Get here](https://infura.io/product/ipfs) (optional)

---

## 🚀 Installation

### Quick Start (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/resistnet-wallet.git
cd resistnet-wallet

# 2. Run the setup script (handles everything automatically)
npm run setup

# 3. Start all services
npm run services:start

# 4. Open http://localhost:3000
```

That's it! The setup script will:

- ✅ Check system requirements
- ✅ Install dependencies
- ✅ Create configuration files
- ✅ Make scripts executable
- ✅ Test your build
- ✅ Guide you through next steps

### Manual Installation

If you prefer manual setup:

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/resistnet-wallet.git
cd resistnet-wallet
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# API Keys
NEXT_PUBLIC_GITCOIN_API_KEY=your_gitcoin_api_key_here
NEXT_PUBLIC_GITCOIN_SCORER_ID=your_scorer_id_here
NEXT_PUBLIC_HUMANITY_API_KEY=your_humanity_api_key_here

# RPC Configuration
NEXT_PUBLIC_NIMBUS_RPC_URL=http://localhost:8545
NEXT_PUBLIC_ETHEREUM_NETWORK=mainnet
NEXT_PUBLIC_CHAIN_ID=1

# Tor Configuration
NEXT_PUBLIC_TOR_PROXY=socks5://127.0.0.1:9150
NEXT_PUBLIC_TOR_ENABLED=true

# Waku Configuration
NEXT_PUBLIC_WAKU_BOOTSTRAP=true

# IPFS Configuration
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io
NEXT_PUBLIC_IPFS_API_URL=https://ipfs.infura.io:5001
NEXT_PUBLIC_IPFS_PROJECT_ID=your_infura_project_id
NEXT_PUBLIC_IPFS_PROJECT_SECRET=your_infura_project_secret

# Nillion Configuration
NEXT_PUBLIC_NILLION_NETWORK=testnet
NEXT_PUBLIC_NILLION_APP_ID=your_nillion_app_id

# Feature Flags
NEXT_PUBLIC_ENABLE_MPC_KEYS=true
NEXT_PUBLIC_ENABLE_PRIVATE_VOTING=true
NEXT_PUBLIC_ENABLE_EVIDENCE_VAULT=true

# Development
NEXT_PUBLIC_DEBUG_MODE=false
```

---

## ⚙️ Configuration

### Starting Backend Services

Before running the app, you need to start the privacy infrastructure:

#### 1. Start Arti (Tor Proxy)

```bash
# Terminal 1: Start Arti on port 9150
arti proxy --socks-port 9150

# Expected output:
# Arti 1.x.x starting.
# Listening on SOCKS5 at 127.0.0.1:9150
```

**Alternative: Use system Tor**

```bash
# Linux/macOS
sudo systemctl start tor

# Or
tor --SocksPort 9150
```

#### 2. Start Nimbus RPC Node (Optional)

**Option A: Use Docker**

```bash
# Terminal 2: Start Nimbus with Docker
docker run -d \
  --name nimbus-rpc \
  -p 8545:8545 \
  -v nimbus-data:/data \
  statusim/nimbus-eth1:latest \
  --http-enabled \
  --http-address=0.0.0.0 \
  --http-port=8545 \
  --network=sepolia

# Check logs
docker logs -f nimbus-rpc
```

**Option B: Use public RPC** (update `.env.local`)

```env
NEXT_PUBLIC_NIMBUS_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

#### 3. Start IPFS Node (Optional)

```bash
# Terminal 3: Start IPFS daemon
ipfs daemon

# Expected output:
# Daemon is ready
# API server listening on /ip4/127.0.0.1/tcp/5001
# Gateway server listening on /ip4/127.0.0.1/tcp/8080
```

**Or use Infura IPFS** (already configured in `.env.local`)

---

## 🏃 Running Locally

### Development Mode

```bash
# Terminal 4: Start Next.js development server
npm run dev
```

Visit: **<http://localhost:3000>**

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Using the Convenience Script

We've created a script to start all services at once:

```bash
# Make script executable
chmod +x scripts/start-all.sh

# Start all services
./scripts/start-all.sh
```

This will:

1. ✅ Check if required services are installed
2. 🚀 Start Arti (Tor proxy)
3. 🐳 Start Nimbus RPC (Docker)
4. 📦 Start IPFS daemon
5. 🌐 Start Next.js app

---

## 📜 Available Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "export": "next build && next export",
    
    "services:start": "./scripts/start-all.sh",
    "services:stop": "./scripts/stop-all.sh",
    "services:status": "./scripts/check-status.sh",
    
    "tor:start": "arti proxy --socks-port 9150",
    "nimbus:start": "docker start nimbus-rpc || docker run -d --name nimbus-rpc -p 8545:8545 statusim/nimbus-eth1:latest --http-enabled --http-address=0.0.0.0",
    "nimbus:stop": "docker stop nimbus-rpc",
    "nimbus:logs": "docker logs -f nimbus-rpc",
    "ipfs:start": "ipfs daemon",
    "ipfs:status": "ipfs swarm peers | wc -l",
    
    "deploy:ipfs": "npm run export && fleek sites deploy",
    "deploy:arweave": "npm run export && arweave-deploy out/",
    "deploy:tor": "./scripts/deploy-tor.sh",
    "deploy:all": "./scripts/deploy-everywhere.sh",
    
    "test": "jest",
    "test:e2e": "playwright test"
  }
}
```

---

## 🚢 Deployment

### Method 1: IPFS (Recommended)

#### Using Fleek

```bash
# Install Fleek CLI
npm install -g @fleek-platform/cli

# Login
fleek login

# Initialize project
fleek sites init

# Deploy
npm run deploy:ipfs
```

#### Manual IPFS Deployment

```bash
# Build static export
npm run export

# Add to IPFS
ipfs add -r out/

# Output: added QmYourHashHere

# Pin to Pinata
curl -X POST "https://api.pinata.cloud/pinning/pinFileToIPFS" \
  -H "Authorization: Bearer YOUR_PINATA_JWT" \
  -F "file=@./out"
```

**Access**: `https://ipfs.io/ipfs/QmYourHash`

### Method 2: Tor Hidden Service

```bash
# Run deployment script
./scripts/deploy-tor.sh
```

Or manually:

```bash
# 1. Configure Tor hidden service
sudo nano /etc/tor/torrc

# Add:
HiddenServiceDir /var/lib/tor/resistnet/
HiddenServicePort 80 127.0.0.1:3000

# 2. Restart Tor
sudo systemctl restart tor

# 3. Get your .onion address
sudo cat /var/lib/tor/resistnet/hostname

# 4. Build and start app
npm run build
npm start
```

**Access**: `http://your-address.onion` (use Tor Browser)

### Method 3: Arweave (Permanent)

```bash
# Install Arweave Deploy
npm install -g arweave-deploy

# Generate wallet
arweave key-create wallet.json

# Fund wallet at https://faucet.arweave.net

# Deploy
npm run deploy:arweave
```

**Access**: `https://arweave.net/YOUR_TX_ID`

### Method 4: Deploy Everywhere

```bash
# Build once, deploy to all platforms
./scripts/deploy-everywhere.sh
```

This deploys to:

- ✅ IPFS (via Fleek)
- ✅ Arweave
- ✅ Tor Hidden Service
- ✅ Web3.Storage
- ✅ Pinata

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │  Wallet  │ │ Messaging│ │Publishing│ │   Vault    │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
└─────┬────────────┬─────────────┬────────────┬───────────┘
      │            │             │            │
      ▼            ▼             ▼            ▼
┌─────────────────────────────────────────────────────────┐
│              Application Layer (TypeScript)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │  Wallet  │ │   Waku   │ │ Identity │ │  Nillion   │ │
│  │   Core   │ │Messenger │ │ Manager  │ │   Client   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
└─────┬────────────┬─────────────┬────────────┬───────────┘
      │            │             │            │
      ▼            ▼             ▼            ▼
┌─────────────────────────────────────────────────────────┐
│                  Network Layer                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │   Arti   │ │   Waku   │ │  Nimbus  │ │  Nillion   │ │
│  │  (Tor)   │ │  (P2P)   │ │  (RPC)   │ │   (MPC)    │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Directory Structure

```
resistnet-wallet/
├── app/
│   ├── page.tsx                    # Main app page
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
│
├── lib/
│   ├── wallet-core.ts              # Base wallet (Waku + Tor)
│   ├── enhanced-wallet.ts          # + Nillion MPC
│   ├── censorship-resistant.ts     # Publishing platform
│   ├── resilient-coordination.ts   # Governance tools
│   ├── secure-vault.ts             # Evidence storage
│   ├── gitcoin-passport.ts         # Passport integration
│   ├── humanity-protocol.ts        # Humanity integration
│   ├── identity-manager.ts         # Combined identity
│   ├── tor-provider.ts             # Tor RPC provider
│   ├── waku-messenger.ts           # Waku messaging
│   ├── nillion-key-manager.ts      # MPC key management
│   ├── nillion-analytics.ts        # Private analytics
│   └── nillion-multisig.ts         # Private multi-sig
│
├── components/
│   ├── WalletView.tsx              # Wallet UI
│   ├── PublishingView.tsx          # Publishing UI
│   ├── GovernanceView.tsx          # Governance UI
│   ├── VaultView.tsx               # Vault UI
│   └── SettingsView.tsx            # Settings UI
│
├── hooks/
│   └── useResistNet.ts             # Main React hook
│
├── scripts/
│   ├── start-all.sh                # Start all services
│   ├── stop-all.sh                 # Stop all services
│   ├── check-status.sh             # Check service status
│   ├── deploy-everywhere.sh        # Deploy to all platforms
│   └── deploy-tor.sh               # Deploy to Tor
│
├── docs/
│   ├── ARCHITECTURE.md             # Architecture details
│   ├── PRIVACY_GUARANTEES.md       # Privacy documentation
│   ├── API.md                      # API documentation
│   └── SECURITY.md                 # Security considerations
│
├── public/
│   └── assets/                     # Static assets
│
├── .env.example                    # Example environment variables
├── .env.local                      # Your local config (gitignored)
├── next.config.js                  # Next.js configuration
├── tailwind.config.ts              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies
└── README.md                       # This file
```

---

## ✨ Features

### 1. Private Wallet

- ✅ Ethereum wallet with HD key derivation
- ✅ MPC key management (Nillion)
- ✅ Social recovery mechanism
- ✅ All RPC calls via Tor
- ✅ Private balance tracking

### 2. Secure Messaging

- ✅ E2E encrypted messages (Waku)
- ✅ P2P communication (no servers)
- ✅ Payment requests & confirmations
- ✅ Offline message queue
- ✅ Group chat support

### 3. Censorship-Resistant Publishing

- ✅ IPFS storage (permanent)
- ✅ Waku distribution (P2P)
- ✅ Tor mirrors (.onion)
- ✅ Co-signing & witness verification
- ✅ Spam protection (Gitcoin Passport)

### 4. Resilient Coordination

- ✅ Proposal creation & voting
- ✅ Private voting (Nillion MPC)
- ✅ Meeting scheduling (offline-capable)
- ✅ Emergency alerts
- ✅ Task management

### 5. Secure Evidence Vault

- ✅ Encrypted file storage (Nillion)
- ✅ Chain of custody tracking
- ✅ Access control (granular permissions)
- ✅ Witness signatures
- ✅ Evidence collections

### 6. Proof of Personhood

- ✅ Gitcoin Passport integration
- ✅ Humanity Protocol verification
- ✅ Combined identity scoring
- ✅ Sybil attack prevention
- ✅ Reputation badges

---

## 📖 API Documentation

### Wallet API

```typescript
// Initialize wallet
const wallet = new EnhancedShadowWallet();
await wallet.initialize(true); // Enable MPC

// Get balance
const balance = await wallet.getBalance();

// Send payment
const tx = await wallet.sendPayment(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  '0.1',
  'Payment for services'
);

// Setup social recovery
await wallet.setupSocialRecovery([
  '0xfriend1...',
  '0xfriend2...',
  '0xfriend3...'
]);
```

### Publishing API

```typescript
// Initialize publisher
const publisher = new CensorshipResistantPublisher();
await publisher.initialize();

// Publish article
const publication = await publisher.publish(
  'Important Investigation',
  'Full article content here...',
  'evidence',
  walletAddress,
  passportScore
);

// Subscribe to publications
await publisher.subscribe((pub) => {
  console.log('New publication:', pub);
});
```

### Governance API

```typescript
// Initialize coordination
const coord = new ResilientCoordination();
await coord.initialize();

// Create proposal
const proposal = await coord.createProposal(
  'Fund Journalist Protection',
  'Allocate 10 ETH to protect journalists...',
  ['Approve', 'Reject', 'Abstain'],
  48 // duration in hours
);

// Vote privately
await coord.votePrivately(
  proposal.id,
  0, // option index
  passportScore
);

// Tally votes
const results = await coord.tallyVotes(proposal.id);
```

### Vault API

```typescript
// Initialize vault
const vault = new SecureDataVault();
await vault.initialize();

// Upload evidence
const evidence = await vault.uploadEvidence(
  file,
  {
    title: 'Photo Evidence',
    description: 'Protest documentation',
    type: 'photo'
  },
  ['0xauthorized1...', '0xauthorized2...'],
  passportScore
);

// Grant access
await vault.grantAccess(
  evidence.id,
  '0xnewviewer...',
  passportScore
);

// Download evidence (if authorized)
const blob = await vault.downloadEvidence(evidence.id);
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Tor Connection Failed

**Problem**: `Error: SOCKS connection failed`

**Solution**:

```bash
# Check if Arti is running
ps aux | grep arti

# Restart Arti
killall arti
arti proxy --socks-port 9150

# Or use system Tor
sudo systemctl restart tor
```

#### 2. Waku Connection Issues

**Problem**: `Failed to connect to Waku peers`

**Solution**:

```bash
# Check firewall
sudo ufw allow 9000/tcp

# Try different bootstrap nodes
# Update lib/waku-messenger.ts with alternate peers
```

#### 3. Nimbus RPC Not Responding

**Problem**: `Error: RPC endpoint not available`

**Solution**:

```bash
# Check if Nimbus is running
docker ps | grep nimbus

# View logs
docker logs nimbus-rpc

# Restart container
docker restart nimbus-rpc

# Or use public RPC
# Update .env.local:
NEXT_PUBLIC_NIMBUS_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
```

#### 4. IPFS Upload Fails

**Problem**: `Failed to upload to IPFS`

**Solution**:

```bash
# Check IPFS daemon
ipfs swarm peers

# Restart daemon
ipfs shutdown
ipfs daemon

# Or use Infura IPFS (update .env.local)
```

#### 5. Gitcoin Passport API Errors

**Problem**: `401 Unauthorized` or `Invalid API key`

**Solution**:

- Verify API key at: <https://scorer.gitcoin.co/>
- Check rate limits
- Ensure scorer ID is correct

#### 6. Build Errors

**Problem**: `Module not found` or `Type errors`

**Solution**:

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install

# Check Node version
node --version  # Should be >= 18

# Update TypeScript
npm install -D typescript@latest
```

### Debug Mode

Enable debug logging:

```env
# .env.local
NEXT_PUBLIC_DEBUG_MODE=true
```

Then check browser console for detailed logs.

### Health Check

```bash
# Run system health check
./scripts/check-status.sh
```

This checks:

- ✅ Arti (Tor) status
- ✅ Nimbus RPC connectivity
- ✅ IPFS daemon status
- ✅ Waku peer connections
- ✅ API key validity

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test specific service
npm test -- wallet-core.test.ts
```

### Manual Testing Checklist

- [ ] Wallet creation/import works
- [ ] Can send ETH transaction
- [ ] Messages send/receive via Waku
- [ ] Can publish article
- [ ] Voting works (proposal creation & voting)
- [ ] Evidence upload & access control
- [ ] Gitcoin Passport score displays
- [ ] Humanity Protocol verification works
- [ ] All network indicators show "connected"
- [ ] Tor routing functional (check IP via whatismyip)

---

## 🔒 Security

### Security Best Practices

1. **Private Keys**
   - Never commit `.env.local` to git
   - Use MPC key management in production
   - Enable social recovery

2. **API Keys**
   - Rotate keys regularly
   - Use environment variables
   - Never expose in client-side code

3. **Network Security**
   - Always use Tor for RPC calls
   - Verify .onion addresses
   - Enable HTTPS in production

4. **Smart Contract Interactions**
   - Verify contract addresses
   - Use latest audited contracts
   - Test on testnet first

### Reporting Security Issues

Please report security vulnerabilities to: <security@resistnet.example>

**DO NOT** create public GitHub issues for security bugs.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md)

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Write tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with:

- [Waku](https://waku.org/) - P2P messaging
- [Tor Project](https://www.torproject.org/) - Network anonymity
- [Nimbus](https://nimbus.team/) - Ethereum client
- [Nillion](https://nillion.com/) - Blind computation
- [Gitcoin Passport](https://passport.gitcoin.co/) - Identity
- [Humanity Protocol](https://www.humanity.tech/) - Proof of personhood

Special thanks to:

- Logos Network for the hackathon
- All open source contributors

---

## 📞 Support & Community

- **Documentation**: [docs.resistnet.example](https://docs.resistnet.example)
- **Discord**: [Join our Discord](https://discord.gg/resistnet)
- **Forum**: [forum.logos.co](https://forum.logos.co)
- **Twitter**: [@ResistNetApp](https://twitter.com/resistnet)

---

## 🗺️ Roadmap

### Phase 1: Core Features (Current)

- ✅ Wallet functionality
- ✅ P2P messaging
- ✅ Publishing platform
- ✅ Governance tools
- ✅ Evidence vault

### Phase 2: Enhanced Privacy (Q2 2025)

- [ ] Stealth addresses (ERC-5564)
- [ ] ZK proofs for transactions
- [ ] Coin mixing integration
- [ ] Multi-hop Tor routing

### Phase 3: Advanced Features (Q3 2025)

- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Multi-chain support
- [ ] Decentralized identity (DID)

### Phase 4: Ecosystem (Q4 2025)

- [ ] Plugin system
- [ ] Developer SDK
- [ ] Grant program
- [ ] Ambassador program

---

## 📊 Status

- **Version**: 1.0.0-beta
- **Status**: Beta (testnet only)
- **Last Updated**: October 2025

---

## 💡 Quick Links

- [Installation](#installation)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [API Docs](#api-documentation)

---

**Built with ❤️ for a censorship-free internet**
