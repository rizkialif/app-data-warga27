'use client'

import { useEffect } from 'react'

/**
 * AppTokenHandler is a Client Component that ensures a valid 'app_token' 
 * is always present in the cookies. It fetches a new token if one is 
 * missing or expired.
 */
export default function AppTokenHandler() {
  useEffect(() => {
    const handleAppToken = async () => {
      const getCookie = (name) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop().split(';').shift()
        return null
      }

      const token = getCookie('app_token')
      let shouldFetch = !token

      // Check if token is expired if it exists
      if (token) {
        try {
          // JWT payload is the second part, base64 encoded
          const payloadBase64 = token.split('.')[1]
          const payload = JSON.parse(atob(payloadBase64))
          
          // Check expiration (exp is in seconds)
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            shouldFetch = true
          }
        } catch (e) {
          console.error('Failed to parse app_token, regenerating...', e)
          shouldFetch = true
        }
      }

      if (shouldFetch) {
        try {
          const response = await fetch('/api/auth/app-token')
          const result = await response.json()

          if (response.ok && result.data?.app_token) {
            // Set cookie to expire in 1 day (matching the JWT expiry)
            const maxAge = 24 * 60 * 60 
            document.cookie = `app_token=${result.data.app_token}; path=/; max-age=${maxAge}; SameSite=Lax`
            console.log('App token initialized/refreshed')
          } else {
            console.error('Failed to fetch app token:', result.message)
          }
        } catch (error) {
          console.error('Error fetching app token:', error)
        }
      }
    }

    handleAppToken()
  }, [])

  return null
}
