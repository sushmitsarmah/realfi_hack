import express from 'express'
import cors from 'cors'
import { config } from './config/env.js'
import passportRoutes from './routes/passport.js'
import nillionRoutes from './routes/nillion.js'
import { nillionService } from './services/nillion.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'RealFi Backend is running' })
})

// Routes
app.use('/api/passport', passportRoutes)
app.use('/api/nillion', nillionRoutes)

// Initialize Nillion on startup
nillionService.initialize().catch(err => {
  console.error('⚠️ Nillion initialization failed:', err.message)
  console.log('Server will continue without Nillion')
})

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`)
  console.log(`📋 Health check: http://localhost:${config.port}/health`)
  console.log(`🔐 Passport API: http://localhost:${config.port}/api/passport`)
  console.log(`🔒 Nillion API: http://localhost:${config.port}/api/nillion`)
})
