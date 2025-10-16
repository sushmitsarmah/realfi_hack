import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: process.env.PORT || 3001,

  nillion: {
    apiKey: process.env.NILLION_API_KEY,
    chainUrl: process.env.NILLION_CHAIN_URL,
    authUrl: process.env.NILLION_AUTH_URL,
    dbUrls: [
      process.env.NILLION_DB_URL_1,
      process.env.NILLION_DB_URL_2,
      process.env.NILLION_DB_URL_3
    ]
  },

  passport: {
    apiKey: process.env.PASSPORT_API_KEY,
    scorerId: process.env.PASSPORT_SCORER_ID,
    baseUrl: process.env.PASSPORT_API_BASE_URL || 'https://api.passport.xyz'
  }
}

// Validate required env vars
const requiredEnvVars = [
  'NILLION_API_KEY',
  'PASSPORT_API_KEY',
  'PASSPORT_SCORER_ID'
]

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '))
  console.error('Please create a .env file based on .env.example')
  console.error('Get your Passport API credentials at: https://www.passport.xyz/dashboard')
  process.exit(1)
}
