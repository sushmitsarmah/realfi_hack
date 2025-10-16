import axios from 'axios'
import { config } from '../config/env.js'

class PassportService {
  constructor() {
    this.baseUrl = config.passport.baseUrl
    this.apiKey = config.passport.apiKey
    this.scorerId = config.passport.scorerId
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      }
    })
  }

  /**
   * Get Passport score and stamps for an address
   * @param {string} address - Ethereum address
   * @returns {Promise} Score and stamps data
   */
  async getScoreAndStamps(address) {
    try {
      console.log(`🎯 Fetching Passport score and stamps for address: ${address}`)

      const response = await this.axiosInstance.get(
        `/v2/stamps/${this.scorerId}/score/${address}`
      )

      console.log(`✅ Retrieved Passport score: ${response.data.score}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('❌ Failed to fetch Passport data:', error.response?.data || error.message)
      throw new Error(`Failed to fetch Passport data: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Get all stamps for an address (alias for getScoreAndStamps)
   * @param {string} address - Ethereum address
   * @returns {Promise} Stamps data
   */
  async getStamps(address) {
    const result = await this.getScoreAndStamps(address)
    return {
      success: true,
      data: {
        stamps: result.data.stamp_scores || {},
        address: result.data.address
      }
    }
  }

  /**
   * Get score for an address
   * @param {string} address - Ethereum address
   * @returns {Promise} Score data
   */
  async getScore(address) {
    const result = await this.getScoreAndStamps(address)
    return {
      success: true,
      data: {
        address: result.data.address,
        score: result.data.score,
        passing_score: result.data.passing_score,
        threshold: result.data.threshold,
        last_score_timestamp: result.data.last_score_timestamp,
        expiration_timestamp: result.data.expiration_timestamp
      }
    }
  }

  /**
   * Get a specific stamp by provider
   * @param {string} address - Ethereum address
   * @param {string} provider - Stamp provider (e.g., 'Google', 'Github', 'Twitter')
   * @returns {Promise} Stamp data
   */
  async getStampByProvider(address, provider) {
    try {
      const result = await this.getScoreAndStamps(address)
      const stampScores = result.data.stamp_scores || {}

      const providerScore = stampScores[provider]

      if (!providerScore) {
        return {
          success: false,
          data: null,
          message: `No ${provider} stamp found for this address`
        }
      }

      return {
        success: true,
        data: {
          provider,
          score: providerScore,
          address: result.data.address
        }
      }
    } catch (error) {
      console.error(`❌ Failed to fetch ${provider} stamp:`, error.message)
      throw error
    }
  }

  /**
   * Submit a stamp for verification
   * @param {string} address - Ethereum address
   * @param {Object} stampData - Stamp verification data
   * @returns {Promise} Submission result
   */
  async submitStamp(address, stampData) {
    try {
      console.log(`📤 Submitting stamp for address: ${address}`)

      const response = await this.axiosInstance.post(`/v2/stamps/${address}`, stampData)

      console.log('✅ Stamp submitted successfully')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('❌ Failed to submit stamp:', error.response?.data || error.message)
      throw new Error(`Failed to submit stamp: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Delete a stamp
   * @param {string} address - Ethereum address
   * @param {string} provider - Stamp provider to delete
   * @returns {Promise} Deletion result
   */
  async deleteStamp(address, provider) {
    try {
      console.log(`🗑️ Deleting ${provider} stamp for address: ${address}`)

      const response = await this.axiosInstance.delete(`/v2/stamps/${address}/${provider}`)

      console.log('✅ Stamp deleted successfully')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('❌ Failed to delete stamp:', error.response?.data || error.message)
      throw new Error(`Failed to delete stamp: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Get available stamp providers
   * @returns {Promise} List of available providers
   */
  async getProviders() {
    try {
      console.log('📋 Fetching available stamp providers')

      const response = await this.axiosInstance.get('/v2/providers')

      console.log(`✅ Retrieved ${response.data.length || 0} providers`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('❌ Failed to fetch providers:', error.response?.data || error.message)
      throw new Error(`Failed to fetch providers: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Verify if an address meets a certain score threshold
   * @param {string} address - Ethereum address
   * @param {number} threshold - Minimum score threshold
   * @returns {Promise} Verification result
   */
  async verifyScoreThreshold(address, threshold) {
    try {
      const scoreResult = await this.getScore(address)
      const score = scoreResult.data.score

      const meetsThreshold = score >= threshold

      return {
        success: true,
        data: {
          address,
          score,
          threshold,
          meetsThreshold,
          message: meetsThreshold
            ? `Address meets threshold (${score} >= ${threshold})`
            : `Address does not meet threshold (${score} < ${threshold})`
        }
      }
    } catch (error) {
      console.error('❌ Failed to verify score threshold:', error.message)
      throw error
    }
  }
}

export const passportService = new PassportService()
