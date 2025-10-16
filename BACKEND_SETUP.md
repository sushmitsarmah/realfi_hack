# Backend Setup Guide

This guide will help you set up the Express backend server with Nillion SecretVaults and Passport Stamps API v2.

## Why Backend?

The frontend was getting `process.nextTick is undefined` errors because Nillion SDK requires Node.js APIs that aren't available in browsers, and polyfills don't work. The backend handles:

- **Nillion SecretVaults**: Encrypted storage for contacts and messages
- **Passport Stamps API v2**: User verification and reputation scores

## Prerequisites

- Node.js 18+
- Nillion API Key (already configured)
- Passport API Key and Scorer ID (get from [Passport Dashboard](https://www.passport.xyz/dashboard))

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Edit `backend/.env` and add your Passport credentials:

```bash
# Passport API Configuration
PASSPORT_API_KEY=your_passport_api_key_here
PASSPORT_SCORER_ID=your_scorer_id_here
```

**How to get Passport credentials:**

1. Go to https://www.passport.xyz/dashboard
2. Create an account or sign in
3. Create a new API key
4. Create or select a Scorer - copy the Scorer ID
5. Add both to your `.env` file

### 3. Start the Backend Server

```bash
npm run dev
```

Server runs on `http://localhost:3001`

You should see:
```
🚀 Server running on http://localhost:3001
📋 Health check: http://localhost:3001/health
🔐 Passport API: http://localhost:3001/api/passport
🔒 Nillion API: http://localhost:3001/api/nillion
🔌 Initializing Nillion SecretVault client...
✅ Authentication token refreshed
✅ Using existing builder profile: [profile_id]
✅ Nillion SecretVault client connected
```

## Testing the API

### Test Health Check

```bash
curl http://localhost:3001/health
```

### Test Passport API

```bash
# Get score for an address
curl http://localhost:3001/api/passport/score/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0

# Get all stamps for an address
curl http://localhost:3001/api/passport/stamps/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
```

### Test Nillion API

```bash
# Store a contact
curl -X POST http://localhost:3001/api/nillion/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
    "contact": {
      "address": "0x123...",
      "name": "Alice"
    }
  }'

# Get contacts
curl http://localhost:3001/api/nillion/contacts/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
```

## Frontend Integration

Use the `useBackendAPI` hook in your frontend:

```typescript
import { useBackendAPI } from '@/hooks/useBackendAPI'

function MyComponent() {
  const { getScore, getStamps, storeContact } = useBackendAPI()

  const handleCheckScore = async () => {
    const result = await getScore(address)
    console.log('Passport score:', result.data.score)
  }

  return (
    <button onClick={handleCheckScore}>
      Check Passport Score
    </button>
  )
}
```

## API Endpoints Reference

### Passport Stamps API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/passport/stamps/:address` | Get all stamps for an address |
| GET | `/api/passport/score/:address` | Get Passport score for an address |
| GET | `/api/passport/stamps/:address/:provider` | Get specific stamp by provider |

### Nillion SecretVaults API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/nillion/contacts` | Store encrypted contact |
| GET | `/api/nillion/contacts/:address` | Get contacts for user |
| POST | `/api/nillion/messages` | Store encrypted message |
| GET | `/api/nillion/messages/:address/:contactAddress` | Get messages between users |

## Running Both Frontend and Backend

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Now your frontend can make requests to `http://localhost:3001/api` and everything will work without Node.js polyfill issues!

## Troubleshooting

### "Missing required environment variables"

Make sure you've added `PASSPORT_API_KEY` and `PASSPORT_SCORER_ID` to `backend/.env`

### "Failed to initialize Nillion client"

Check that:
- `NILLION_API_KEY` is correct in `backend/.env`
- Nillion testnet URLs are accessible
- You're using Node.js 18+

### "Failed to fetch Passport data"

Check that:
- `PASSPORT_API_KEY` is valid
- `PASSPORT_SCORER_ID` is correct
- The address you're querying exists in Passport system

### CORS errors from frontend

The backend has CORS enabled by default. If you still get errors, make sure the frontend is running on a different port than the backend.

## Production Deployment

For production:

1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Set up HTTPS with a reverse proxy (nginx/Caddy)
4. Configure CORS to only allow your frontend domain
5. Use proper secrets management for API keys
6. Add rate limiting
7. Add request validation

```bash
# Production start
NODE_ENV=production npm start
```

## Next Steps

- Add authentication/authorization for API endpoints
- Implement rate limiting
- Add request validation with a library like Joi or Zod
- Set up logging with Winston or Pino
- Add monitoring and error tracking (Sentry)
- Implement caching for Passport API calls
