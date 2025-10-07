# ResistNet - Quick Reference Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Installation
```bash
git clone https://github.com/yourusername/resistnet-wallet.git
cd resistnet-wallet
npm run setup
```

### Step 2: Configuration
```bash
# Edit .env.local with your API keys
nano .env.local

# Required:
# - NEXT_PUBLIC_GITCOIN_API_KEY
# - NEXT_PUBLIC_HUMANITY_API_KEY
```

### Step 3: Start Everything
```bash
npm run services:start
```

### Step 4: Access
Open: **http://localhost:3000**

---

## 📝 Essential Commands

### Development
```bash
npm run dev                    # Development mode (app only)
npm run services:start         # Start all services + app
npm run services:stop          # Stop everything
npm run services:status        # Check what's running
```

### Individual Services
```bash
npm run tor:start             # Start Tor proxy
npm run nimbus:start          # Start Nimbus RPC
npm run ipfs:start            # Start IPFS daemon
```

### Deployment
```bash
npm run deploy:tor            # Deploy as .onion service
npm run deploy:ipfs           # Deploy to IPFS
npm run deploy:all            # Deploy everywhere
```

### Debugging
```bash
./scripts/check-status.sh     # Check all services
npm run logs:view             # View logs
npm run nimbus:logs           # Nimbus logs
```

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or stop all services and restart
npm run services:stop
npm run services:start
```

### Tor Not Connecting
```bash
# Check if Tor is running
lsof -i :9150

# Restart Tor
pkill arti
npm run tor:start
```

### Nimbus RPC Issues
```bash
# Check container status
docker ps | grep nimbus

# Restart Nimbus
npm run nimbus:restart

# View logs
npm run nimbus:logs
```

### Build Errors
```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

---

## 🌐 Access URLs

### Local Development
- **App**: http://localhost:3000
- **IPFS Gateway**: http://localhost:8080
- **Nimbus RPC**: http://localhost:8545

### After Deployment
Check `DEPLOYMENT_URLS.md` for all access points

---

## 🔑 Required API Keys

### Gitcoin Passport
1. Go to: https://scorer.gitcoin.co/
2. Create account
3. Generate API key
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GITCOIN_API_KEY=your_key_here
   NEXT_PUBLIC_GITCOIN_SCORER_ID=your_scorer_id
   ```

### Humanity Protocol
1. Visit: https://www.humanity.tech/
2. Contact team for API access
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_HUMANITY_API_KEY=your_key_here
   ```

---

## 📦 Project Structure

```
resistnet-wallet/
├── app/                    # Next.js pages
├── lib/                    # Core logic
│   ├── wallet-core.ts     # Wallet + Waku + Tor
│   ├── enhanced-wallet.ts # + Nillion MPC
│   └── ...
├── scripts/               # Automation scripts
│   ├── start-all.sh      # Start services
│   ├── deploy-all.sh     # Deploy everywhere
│   └── ...
├── .env.local            # Your config (create this)
└── README.md             # Full documentation
```

---

## 🎯 Common Tasks

### Create Wallet
```typescript
const wallet = new EnhancedShadowWallet();
await wallet.initialize(true); // Enable MPC
```

### Send Payment
```typescript
const tx = await wallet.sendPayment(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  '0.1',
  'Payment note'
);
```

### Publish Article
```typescript
const publication = await publisher.publish(
  'Article Title',
  'Content here...',
  'news',
  walletAddress,
  passportScore
);
```

### Create Proposal
```typescript
const proposal = await coordination.createProposal(
  'Proposal Title',
  'Description...',
  ['Option 1', 'Option 2', 'Option 3'],
  48 // duration in hours
);
```

### Vote Privately
```typescript
await coordination.votePrivately(
  proposalId,
  1, // option index
  passportScore
);
```

---

## 🔒 Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Never commit private keys
- [ ] API keys are environment variables
- [ ] Tor is running for RPC calls
- [ ] Using HTTPS in production
- [ ] MPC key management enabled
- [ ] Regular backups of wallet

---

## 🆘 Getting Help

### Check Service Status
```bash
./scripts/check-status.sh
```

### View Logs
```bash
# All logs
npm run logs:view

# Specific service
tail -f logs/nextjs.log
tail -f logs/arti.log
docker logs -f nimbus-rpc
```

### Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| Port 3000 in use | `lsof -ti:3000 \| xargs kill -9` |
| Tor connection failed | `npm run tor:start` |
| Nimbus not responding | `npm run nimbus:restart` |
| IPFS not starting | `ipfs shutdown && ipfs daemon` |
| Build errors | `npm run clean && npm install` |

---

## 📚 Documentation

- **Full Docs**: [README.md](./README.md)
- **API Reference**: [docs/API.md](./docs/API.md)
- **Architecture**: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Deployment**: [README.md#deployment](./README.md#deployment)

---

## 🎓 Learning Resources

### Technologies Used
- **Waku**: https://docs.waku.org/
- **Tor (Arti)**: https://tpo.pages.torproject.net/core/arti/
- **Nimbus**: https://nimbus.guide/
- **Nillion**: https://docs.nillion.com/
- **Gitcoin Passport**: https://docs.passport.xyz/
- **Humanity Protocol**: https://passport.human.tech/

### Community
- **Logos Forum**: https://forum.logos.co/
- **Waku Discord**: https://discord.waku.org/
- **GitHub Issues**: Submit bugs and feature requests

---

## ✨ Quick Tips

1. **Use `services:start` not `dev`** - It starts all required services
2. **Check status regularly** - Run `./scripts/check-status.sh`
3. **Enable MPC keys** - Set `NEXT_PUBLIC_ENABLE_MPC_KEYS=true`
4. **Test Tor routing** - Verify your IP changes through Tor
5. **Deploy everywhere** - Use multiple access methods for resilience
6. **Keep logs clean** - Run `npm run logs:clear` periodically
7. **Update frequently** - `git pull && npm install`

---

## 🚀 Next Steps After Setup

1. ✅ Configure API keys in `.env.local`
2. ✅ Start services: `npm run services:start`
3. ✅ Create your wallet
4. ✅ Get Gitcoin Passport stamps
5. ✅ Verify with Humanity Protocol
6. ✅ Test publishing an article
7. ✅ Create a proposal and vote
8. ✅ Deploy to Tor: `npm run deploy:tor`
9. ✅ Deploy to IPFS: `npm run deploy:ipfs`
10. ✅ Share with your community!

---

**Happy Building! 🛡️✨**

For detailed information, see [README.md](./README.md)