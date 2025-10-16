# Quick Start - Backend Server

## Problem Solved

Your frontend had `process.nextTick is undefined` errors because Nillion SDK requires Node.js APIs. Since polyfills don't work, I've created a backend Express server to handle:

✅ **Nillion SecretVaults** - Encrypted storage for contacts/messages
✅ **Passport Stamps API v2** - User verification and scores

## Setup (2 minutes)

### 1. Get Passport Credentials

Go to https://www.passport.xyz/dashboard:
1. Create account / sign in
2. Create an API key
3. Create or select a Scorer
4. Copy both values

### 2. Configure Backend

Edit `backend/.env`:

```bash
PASSPORT_API_KEY=your_actual_api_key
PASSPORT_SCORER_ID=your_actual_scorer_id
```

(Nillion key is already configured)

### 3. Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
✅ Nillion SecretVault client connected
🚀 Server running on http://localhost:3001
```

### 4. Use in Frontend

```typescript
import { useBackendAPI } from '@/hooks/useBackendAPI'

const { getScore, getStamps, storeContact } = useBackendAPI()

// Get Passport score
const result = await getScore(userAddress)
console.log(result.data.score)

// Store encrypted contact
await storeContact(userAddress, {
  address: '0x...',
  name: 'Alice'
})
```

## API Endpoints

**Passport:**
- `GET /api/passport/score/:address` - Get score
- `GET /api/passport/stamps/:address` - Get stamps

**Nillion:**
- `POST /api/nillion/contacts` - Store contact
- `GET /api/nillion/contacts/:address` - Get contacts
- `POST /api/nillion/messages` - Store message
- `GET /api/nillion/messages/:address/:contact` - Get messages

## Test It

```bash
# Health check
curl http://localhost:3001/health

# Test Passport (replace with real address)
curl http://localhost:3001/api/passport/score/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
```

## What's Included

```
backend/
├── src/
│   ├── index.js              # Main server
│   ├── config/env.js         # Config & validation
│   ├── services/
│   │   ├── nillion.js        # Nillion SecretVaults
│   │   └── passport.js       # Passport API v2
│   └── routes/
│       ├── nillion.js        # Nillion endpoints
│       └── passport.js       # Passport endpoints
├── package.json
└── .env

frontend/
└── src/hooks/
    └── useBackendAPI.ts      # React hook for backend
```

## Running Both

**Terminal 1:**
```bash
cd backend && npm run dev
```

**Terminal 2:**
```bash
cd frontend && npm run dev
```

That's it! No more polyfill errors. 🎉

---

**Need help?** See `BACKEND_SETUP.md` for detailed docs.
