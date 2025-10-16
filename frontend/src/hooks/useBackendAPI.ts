import { useState } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:3001/api'

export function useBackendAPI() {
  const [loading, setLoading] = useState(false)

  // Passport API methods
  const getStamps = async (address: string) => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/passport/stamps/${address}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch stamps:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getScore = async (address: string) => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/passport/score/${address}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch score:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Nillion API methods
  const storeContact = async (userAddress: string, contact: any) => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/nillion/contacts`, {
        userAddress,
        contact
      })
      return response.data
    } catch (error) {
      console.error('Failed to store contact:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getContacts = async (address: string) => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/nillion/contacts/${address}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const storeMessage = async (userAddress: string, message: any) => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/nillion/messages`, {
        userAddress,
        message
      })
      return response.data
    } catch (error) {
      console.error('Failed to store message:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getMessages = async (address: string, contactAddress: string) => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${API_URL}/nillion/messages/${address}/${contactAddress}`
      )
      return response.data
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    // Passport
    getStamps,
    getScore,
    // Nillion
    storeContact,
    getContacts,
    storeMessage,
    getMessages
  }
}
