import express from 'express'
import { nillionService } from '../services/nillion.js'

const router = express.Router()

// Store a contact
router.post('/contacts', async (req, res) => {
  try {
    const { userAddress, contact } = req.body
    const result = await nillionService.storeContact(userAddress, contact)
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get contacts for a user
router.get('/contacts/:address', async (req, res) => {
  try {
    const result = await nillionService.getContacts(req.params.address)
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Store a message
router.post('/messages', async (req, res) => {
  try {
    const { userAddress, message } = req.body
    const result = await nillionService.storeMessage(userAddress, message)
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get messages between users
router.get('/messages/:address/:contactAddress', async (req, res) => {
  try {
    const result = await nillionService.getMessages(
      req.params.address,
      req.params.contactAddress
    )
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
