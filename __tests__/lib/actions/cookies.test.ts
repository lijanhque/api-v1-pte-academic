/**
 * Unit tests for lib/actions/cookies.ts
 * Tests cookie consent management actions
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock the cookies module
jest.mock('@/lib/cookies', () => ({
  setCookieConsent: jest.fn(),
}))

import { setCookieConsent, type CookieConsent } from '@/lib/cookies'
import {
  acceptAllCookies,
  rejectAllCookies,
  saveCookiePreferences,
} from '@/lib/actions/cookies'

describe('lib/actions/cookies', () => {
  const mockSetCookieConsent = setCookieConsent as jest.MockedFunction<typeof setCookieConsent>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('acceptAllCookies', () => {
    it('should set all cookie categories to true', async () => {
      await acceptAllCookies()

      expect(mockSetCookieConsent).toHaveBeenCalledWith({
        necessary: true,
        analytics: true,
        marketing: true,
        preferences: true,
      })
    })

    it('should call setCookieConsent exactly once', async () => {
      await acceptAllCookies()

      expect(mockSetCookieConsent).toHaveBeenCalledTimes(1)
    })

    it('should handle errors from setCookieConsent', async () => {
      mockSetCookieConsent.mockRejectedValue(new Error('Cookie storage failed'))

      await expect(acceptAllCookies()).rejects.toThrow('Cookie storage failed')
    })
  })

  describe('rejectAllCookies', () => {
    it('should set necessary to true and others to false', async () => {
      await rejectAllCookies()

      expect(mockSetCookieConsent).toHaveBeenCalledWith({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      })
    })

    it('should always keep necessary cookies enabled', async () => {
      await rejectAllCookies()

      const calledWith = mockSetCookieConsent.mock.calls[0][0]
      expect(calledWith.necessary).toBe(true)
    })

    it('should call setCookieConsent exactly once', async () => {
      await rejectAllCookies()

      expect(mockSetCookieConsent).toHaveBeenCalledTimes(1)
    })

    it('should handle errors from setCookieConsent', async () => {
      mockSetCookieConsent.mockRejectedValue(new Error('Failed to save rejection'))

      await expect(rejectAllCookies()).rejects.toThrow('Failed to save rejection')
    })
  })

  describe('saveCookiePreferences', () => {
    it('should save custom preferences with necessary always true', async () => {
      const preferences: CookieConsent = {
        necessary: false, // Should be overridden to true
        analytics: true,
        marketing: false,
        preferences: true,
      }

      await saveCookiePreferences(preferences)

      expect(mockSetCookieConsent).toHaveBeenCalledWith({
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: true,
      })
    })

    it('should normalize truthy values to boolean true', async () => {
      const preferences: any = {
        necessary: true,
        analytics: 1,
        marketing: 'true',
        preferences: {},
      }

      await saveCookiePreferences(preferences)

      const calledWith = mockSetCookieConsent.mock.calls[0][0]
      expect(calledWith.necessary).toBe(true)
      expect(calledWith.analytics).toBe(true)
      expect(calledWith.marketing).toBe(true)
      expect(calledWith.preferences).toBe(true)
    })

    it('should normalize falsy values to boolean false', async () => {
      const preferences: any = {
        necessary: true,
        analytics: 0,
        marketing: '',
        preferences: null,
      }

      await saveCookiePreferences(preferences)

      const calledWith = mockSetCookieConsent.mock.calls[0][0]
      expect(calledWith.analytics).toBe(false)
      expect(calledWith.marketing).toBe(false)
      expect(calledWith.preferences).toBe(false)
    })

    it('should handle undefined values as false', async () => {
      const preferences: any = {
        necessary: true,
        analytics: undefined,
        marketing: undefined,
        preferences: true,
      }

      await saveCookiePreferences(preferences)

      const calledWith = mockSetCookieConsent.mock.calls[0][0]
      expect(calledWith.analytics).toBe(false)
      expect(calledWith.marketing).toBe(false)
    })

    it('should handle all false preferences except necessary', async () => {
      const preferences: CookieConsent = {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      }

      await saveCookiePreferences(preferences)

      expect(mockSetCookieConsent).toHaveBeenCalledWith({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      })
    })

    it('should handle all true preferences', async () => {
      const preferences: CookieConsent = {
        necessary: true,
        analytics: true,
        marketing: true,
        preferences: true,
      }

      await saveCookiePreferences(preferences)

      expect(mockSetCookieConsent).toHaveBeenCalledWith({
        necessary: true,
        analytics: true,
        marketing: true,
        preferences: true,
      })
    })

    it('should call setCookieConsent exactly once', async () => {
      const preferences: CookieConsent = {
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: true,
      }

      await saveCookiePreferences(preferences)

      expect(mockSetCookieConsent).toHaveBeenCalledTimes(1)
    })

    it('should handle errors from setCookieConsent', async () => {
      mockSetCookieConsent.mockRejectedValue(new Error('Save failed'))

      const preferences: CookieConsent = {
        necessary: true,
        analytics: true,
        marketing: true,
        preferences: true,
      }

      await expect(saveCookiePreferences(preferences)).rejects.toThrow('Save failed')
    })

    it('should preserve other properties if present', async () => {
      const preferences: any = {
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: true,
        extraField: 'should be ignored',
      }

      await saveCookiePreferences(preferences)

      const calledWith = mockSetCookieConsent.mock.calls[0][0]
      expect(calledWith).toEqual({
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: true,
      })
    })
  })

  describe('Integration scenarios', () => {
    it('should handle rapid successive calls', async () => {
      await acceptAllCookies()
      await rejectAllCookies()
      await saveCookiePreferences({
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: true,
      })

      expect(mockSetCookieConsent).toHaveBeenCalledTimes(3)
    })

    it('should maintain consistency across different consent types', async () => {
      // Accept all
      await acceptAllCookies()
      let consentCall1 = mockSetCookieConsent.mock.calls[0][0]
      expect(consentCall1.necessary).toBe(true)

      // Reject all
      mockSetCookieConsent.mockClear()
      await rejectAllCookies()
      let consentCall2 = mockSetCookieConsent.mock.calls[0][0]
      expect(consentCall2.necessary).toBe(true)

      // Custom
      mockSetCookieConsent.mockClear()
      await saveCookiePreferences({
        necessary: false,
        analytics: true,
        marketing: false,
        preferences: false,
      })
      let consentCall3 = mockSetCookieConsent.mock.calls[0][0]
      expect(consentCall3.necessary).toBe(true)
    })
  })
})