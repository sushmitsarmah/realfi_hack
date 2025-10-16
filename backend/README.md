# RealFi Backend

Backend Express server for RealFi with Nillion SecretVaults and Passport Stamps API v2 integration.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment:
```bash
# Edit .env and add your Passport API key
# PASSPORT_API_KEY=your_api_key_here
```

3. Start the server:
```bash
npm run dev
```

Server runs on `http://localhost:3001`

## API Endpoints

### Passport Stamps

- `GET /api/passport/stamps/:address` - Get all stamps for an address
- `GET /api/passport/score/:address` - Get Passport score for an address
- `GET /api/passport/stamps/:address/:provider` - Get specific stamp by provider

### Nillion SecretVaults

- `POST /api/nillion/contacts` - Store encrypted contact
  ```json
  { "userAddress": "0x...", "contact": { "address": "0x...", "name": "..." } }
  ```

- `GET /api/nillion/contacts/:address` - Get contacts for user

- `POST /api/nillion/messages` - Store encrypted message
  ```json
  {
    "userAddress": "0x...",
    "message": {
      "id": "...",
      "from": "0x...",
      "to": "0x...",
      "content": "...",
      "type": "chat",
      "timestamp": 123456
    }
  }
  ```

- `GET /api/nillion/messages/:address/:contactAddress` - Get messages between users

## Frontend Integration

Update your frontend to use:
```javascript
const API_URL = 'http://localhost:3001/api'
```

See `frontend/src/hooks/useBackendAPI.ts` for React hook implementation.
