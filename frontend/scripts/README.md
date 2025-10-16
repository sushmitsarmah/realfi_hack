# Nillion Collection Setup Script

## Purpose

This script creates the necessary Nillion SecretVault collections for ResistNet's encrypted messenger:
- **Contacts Collection**: Stores encrypted contact information
- **Messages Collection**: Stores encrypted message history

---

## Prerequisites

1. **Nillion API Key**: Already configured in `frontend/.env.local`
2. **Dependencies**: `@nillion/secretvaults` package installed

---

## Running the Script

### Option 1: Using npm script (Recommended)

```bash
cd frontend
npm run nillion:create-collections
```

### Option 2: Direct node execution

```bash
cd frontend
node scripts/create-nillion-collections.js
```

---

## Expected Output

```
🔌 Connecting to Nillion SecretVaults...

✅ Connected to Nillion

📦 Creating Contacts Collection...
✅ Contacts Collection Created: coll_abc123...

📦 Creating Messages Collection...
✅ Messages Collection Created: coll_def456...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 NEXT STEPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add these lines to your frontend/.env.local file:

VITE_NILLION_CONTACTS_COLLECTION_ID=coll_abc123...
VITE_NILLION_MESSAGES_COLLECTION_ID=coll_def456...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Collections created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## After Running

1. **Copy the collection IDs** from the output
2. **Add them to `.env.local`**:
   ```env
   VITE_NILLION_CONTACTS_COLLECTION_ID=coll_abc123...
   VITE_NILLION_MESSAGES_COLLECTION_ID=coll_def456...
   ```
3. **Update the hook** in `src/hooks/useNillionMessenger.ts`:
   - Add collection ID constants at the top
   - Uncomment the Nillion storage code
4. **Restart your dev server**: `npm run dev`

---

## What the Collections Store

### Contacts Collection Schema

```json
{
  "address": "string",          // Wallet address (plaintext)
  "name": "string (encrypted)", // Contact name (encrypted with %allot)
  "addedAt": "number",          // Timestamp (plaintext)
  "addedBy": "string"           // Your wallet address (plaintext)
}
```

### Messages Collection Schema

```json
{
  "id": "string",               // Message ID (plaintext)
  "from": "string",             // Sender address (plaintext)
  "to": "string",               // Recipient address (plaintext)
  "content": "string (encrypted)", // Message text (encrypted with %allot)
  "type": "string",             // Message type: chat/payment/payment-request
  "timestamp": "number",        // Unix timestamp (plaintext)
  "metadata": "string (encrypted)" // Additional data (encrypted with %allot)
}
```

---

## Troubleshooting

### Error: "Failed to initialize Nillion client"

**Cause**: API key is invalid or network issues

**Fix**:
1. Check `VITE_NILLION_API_KEY` in `.env.local`
2. Verify internet connection
3. Try again

### Error: "Collection already exists"

**Cause**: Collections were already created

**Fix**: The script can only be run once. Collection IDs don't change, so just use the existing ones.

### Error: "Module not found: @nillion/secretvaults"

**Cause**: Dependencies not installed

**Fix**:
```bash
cd frontend
npm install
```

---

## Security Notes

⚠️ **Important:**
- The script contains your **private API key** hardcoded
- This is for **one-time setup only**
- Never commit this script to a public repository
- Already gitignored via `*.local` pattern

---

## Re-running

**You only need to run this script ONCE.**

Collections are permanent on the Nillion network. If you need to create new collections (e.g., for a different environment), you'll get new collection IDs.

---

## Support

If you encounter issues:
1. Check Nillion documentation: https://docs.nillion.com/build/private-storage/
2. Verify API key has an active subscription
3. Check console logs for detailed errors
