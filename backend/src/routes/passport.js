import express from 'express'
import { passportService } from '../services/passport.js'

const router = express.Router()

// Get all stamps for an address
router.get('/stamps/:address', async (req, res) => {
  try {
    const result = await passportService.getStamps(req.params.address)
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get score for an address
router.get('/score/:address', async (req, res) => {
  try {
    const result = await passportService.getScore(req.params.address)
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get stamp by provider
router.get('/stamps/:address/:provider', async (req, res) => {
  try {
    const result = await passportService.getStampByProvider(
      req.params.address,
      req.params.provider
    )
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
