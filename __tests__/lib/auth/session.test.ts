/**
 * Unit tests for lib/auth/session.ts
 * Tests password hashing, JWT token management, and session handling
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import * as bcryptjs from 'bcryptjs'
import * as jose from 'jose'

// Mock dependencies
jest.mock('bcryptjs')
jest.mock('jose')
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))
jest.mock('server-only', () => ({}))

// Import after mocks
import {
  hashPassword,
  comparePasswords,
  signToken,
  verifyToken,
  getSession,
  setSession,
} from '@/lib/auth/session'
import { cookies } from 'next/headers'

describe('lib/auth/session', () => {
  const mockCookies = cookies as jest.MockedFunction<typeof cookies>
  const mockBcrypt = bcryptjs as jest.Mocked<typeof bcryptjs>
  const mockJose = jose as jest.Mocked<typeof jose>

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.AUTH_SECRET = 'test-secret-key-for-testing'
  })

  afterEach(() => {
    delete process.env.AUTH_SECRET
  })

  describe('hashPassword', () => {
    it('should hash a password with bcrypt', async () => {
      const password = 'mySecurePassword123!'
      const hashedPassword = '$2a$10$hashedvalue'

      mockBcrypt.hash = jest.fn().mockResolvedValue(hashedPassword)

      const result = await hashPassword(password)

      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 10)
      expect(result).toBe(hashedPassword)
    })

    it('should handle empty password', async () => {
      const hashedEmpty = '$2a$10$emptyvalue'
      mockBcrypt.hash = jest.fn().mockResolvedValue(hashedEmpty)

      const result = await hashPassword('')

      expect(mockBcrypt.hash).toHaveBeenCalledWith('', 10)
      expect(result).toBe(hashedEmpty)
    })

    it('should handle special characters in password', async () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const hashedSpecial = '$2a$10$specialvalue'
      mockBcrypt.hash = jest.fn().mockResolvedValue(hashedSpecial)

      const result = await hashPassword(specialPassword)

      expect(result).toBe(hashedSpecial)
    })

    it('should handle very long passwords', async () => {
      const longPassword = 'a'.repeat(1000)
      const hashedLong = '$2a$10$longvalue'
      mockBcrypt.hash = jest.fn().mockResolvedValue(hashedLong)

      const result = await hashPassword(longPassword)

      expect(result).toBe(hashedLong)
    })
  })

  describe('comparePasswords', () => {
    it('should return true for matching passwords', async () => {
      const plainText = 'myPassword123'
      const hashed = '$2a$10$hashedvalue'

      mockBcrypt.compare = jest.fn().mockResolvedValue(true)

      const result = await comparePasswords(plainText, hashed)

      expect(mockBcrypt.compare).toHaveBeenCalledWith(plainText, hashed)
      expect(result).toBe(true)
    })

    it('should return false for non-matching passwords', async () => {
      const plainText = 'wrongPassword'
      const hashed = '$2a$10$hashedvalue'

      mockBcrypt.compare = jest.fn().mockResolvedValue(false)

      const result = await comparePasswords(plainText, hashed)

      expect(result).toBe(false)
    })

    it('should handle empty password comparison', async () => {
      mockBcrypt.compare = jest.fn().mockResolvedValue(false)

      const result = await comparePasswords('', '$2a$10$hash')

      expect(result).toBe(false)
    })

    it('should handle case-sensitive comparison', async () => {
      mockBcrypt.compare = jest.fn().mockResolvedValue(false)

      const result = await comparePasswords('Password', '$2a$10$hash')

      expect(mockBcrypt.compare).toHaveBeenCalledWith('Password', '$2a$10$hash')
    })
  })

  describe('signToken', () => {
    it('should sign a valid JWT token', async () => {
      const payload = {
        user: { id: 'user-123' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      }
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature'

      const mockSign = jest.fn().mockResolvedValue(mockToken)
      const mockSetExpirationTime = jest.fn().mockReturnValue({ sign: mockSign })
      const mockSetIssuedAt = jest.fn().mockReturnValue({ setExpirationTime: mockSetExpirationTime })
      const mockSetProtectedHeader = jest.fn().mockReturnValue({ setIssuedAt: mockSetIssuedAt })

      mockJose.SignJWT = jest.fn().mockImplementation(() => ({
        setProtectedHeader: mockSetProtectedHeader,
      })) as any

      const result = await signToken(payload)

      expect(mockJose.SignJWT).toHaveBeenCalledWith(payload)
      expect(mockSetProtectedHeader).toHaveBeenCalledWith({ alg: 'HS256' })
      expect(mockSetIssuedAt).toHaveBeenCalled()
      expect(mockSetExpirationTime).toHaveBeenCalledWith('1 day from now')
      expect(result).toBe(mockToken)
    })

    it('should use BETTER_AUTH_SECRET if AUTH_SECRET not set', async () => {
      delete process.env.AUTH_SECRET
      process.env.BETTER_AUTH_SECRET = 'better-auth-secret'

      const payload = {
        user: { id: 'user-456' },
        expires: new Date().toISOString(),
      }
      const mockToken = 'token-with-better-auth'

      const mockSign = jest.fn().mockResolvedValue(mockToken)
      const mockSetExpirationTime = jest.fn().mockReturnValue({ sign: mockSign })
      const mockSetIssuedAt = jest.fn().mockReturnValue({ setExpirationTime: mockSetExpirationTime })
      const mockSetProtectedHeader = jest.fn().mockReturnValue({ setIssuedAt: mockSetIssuedAt })

      mockJose.SignJWT = jest.fn().mockImplementation(() => ({
        setProtectedHeader: mockSetProtectedHeader,
      })) as any

      const result = await signToken(payload)

      expect(result).toBe(mockToken)
      delete process.env.BETTER_AUTH_SECRET
    })
  })

  describe('verifyToken', () => {
    it('should verify and decode a valid token', async () => {
      const token = 'valid.jwt.token'
      const expectedPayload = {
        user: { id: 'user-789' },
        expires: new Date().toISOString(),
      }

      mockJose.jwtVerify = jest.fn().mockResolvedValue({
        payload: expectedPayload,
      })

      const result = await verifyToken(token)

      expect(mockJose.jwtVerify).toHaveBeenCalledWith(
        token,
        expect.any(Uint8Array),
        { algorithms: ['HS256'] }
      )
      expect(result).toEqual(expectedPayload)
    })

    it('should throw error for invalid token', async () => {
      const invalidToken = 'invalid.token'

      mockJose.jwtVerify = jest.fn().mockRejectedValue(new Error('Invalid token'))

      await expect(verifyToken(invalidToken)).rejects.toThrow('Invalid token')
    })

    it('should throw error for expired token', async () => {
      const expiredToken = 'expired.jwt.token'

      mockJose.jwtVerify = jest.fn().mockRejectedValue(new Error('Token expired'))

      await expect(verifyToken(expiredToken)).rejects.toThrow('Token expired')
    })

    it('should handle malformed token', async () => {
      mockJose.jwtVerify = jest.fn().mockRejectedValue(new Error('Malformed token'))

      await expect(verifyToken('malformed')).rejects.toThrow('Malformed token')
    })
  })

  describe('getSession', () => {
    it('should return session data when valid cookie exists', async () => {
      const sessionToken = 'valid.session.token'
      const sessionData = {
        user: { id: 'user-001' },
        expires: new Date().toISOString(),
      }

      const mockGet = jest.fn().mockReturnValue({ value: sessionToken })
      mockCookies.mockResolvedValue({ get: mockGet } as any)
      mockJose.jwtVerify = jest.fn().mockResolvedValue({ payload: sessionData })

      const result = await getSession()

      expect(mockGet).toHaveBeenCalledWith('session')
      expect(result).toEqual(sessionData)
    })

    it('should return null when no session cookie exists', async () => {
      const mockGet = jest.fn().mockReturnValue(undefined)
      mockCookies.mockResolvedValue({ get: mockGet } as any)

      const result = await getSession()

      expect(result).toBeNull()
    })

    it('should return null when session cookie value is undefined', async () => {
      const mockGet = jest.fn().mockReturnValue({ value: undefined })
      mockCookies.mockResolvedValue({ get: mockGet } as any)

      const result = await getSession()

      expect(result).toBeNull()
    })

    it('should throw error when token verification fails', async () => {
      const mockGet = jest.fn().mockReturnValue({ value: 'invalid.token' })
      mockCookies.mockResolvedValue({ get: mockGet } as any)
      mockJose.jwtVerify = jest.fn().mockRejectedValue(new Error('Verification failed'))

      await expect(getSession()).rejects.toThrow('Verification failed')
    })
  })

  describe('setSession', () => {
    it('should set session cookie with correct parameters', async () => {
      const user = { id: 'user-123', email: 'test@example.com', name: 'Test User' }
      const mockToken = 'encrypted.session.token'
      const mockSet = jest.fn()

      const mockSign = jest.fn().mockResolvedValue(mockToken)
      const mockSetExpirationTime = jest.fn().mockReturnValue({ sign: mockSign })
      const mockSetIssuedAt = jest.fn().mockReturnValue({ setExpirationTime: mockSetExpirationTime })
      const mockSetProtectedHeader = jest.fn().mockReturnValue({ setIssuedAt: mockSetIssuedAt })

      mockJose.SignJWT = jest.fn().mockImplementation(() => ({
        setProtectedHeader: mockSetProtectedHeader,
      })) as any

      mockCookies.mockResolvedValue({ set: mockSet } as any)

      await setSession(user)

      expect(mockSet).toHaveBeenCalledWith(
        'session',
        mockToken,
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          expires: expect.any(Date),
        })
      )
    })

    it('should create session with expiry 1 day from now', async () => {
      const user = { id: 'user-456', email: 'user@test.com', name: 'User' }
      const mockToken = 'token'
      const mockSet = jest.fn()

      const mockSign = jest.fn().mockResolvedValue(mockToken)
      const mockSetExpirationTime = jest.fn().mockReturnValue({ sign: mockSign })
      const mockSetIssuedAt = jest.fn().mockReturnValue({ setExpirationTime: mockSetExpirationTime })
      const mockSetProtectedHeader = jest.fn().mockReturnValue({ setIssuedAt: mockSetIssuedAt })

      mockJose.SignJWT = jest.fn().mockImplementation(() => ({
        setProtectedHeader: mockSetProtectedHeader,
      })) as any

      mockCookies.mockResolvedValue({ set: mockSet } as any)

      const beforeCall = Date.now()
      await setSession(user)
      const afterCall = Date.now()

      expect(mockSet).toHaveBeenCalled()
      const cookieOptions = mockSet.mock.calls[0][2]
      const expiryTime = cookieOptions.expires.getTime()
      const expectedMin = beforeCall + 24 * 60 * 60 * 1000
      const expectedMax = afterCall + 24 * 60 * 60 * 1000

      expect(expiryTime).toBeGreaterThanOrEqual(expectedMin)
      expect(expiryTime).toBeLessThanOrEqual(expectedMax)
    })

    it('should include user id in session payload', async () => {
      const user = { id: 'user-789', email: 'test@domain.com', name: 'Test' }
      const mockToken = 'token'
      const mockSet = jest.fn()
      let capturedPayload: any

      const mockSign = jest.fn().mockResolvedValue(mockToken)
      const mockSetExpirationTime = jest.fn().mockReturnValue({ sign: mockSign })
      const mockSetIssuedAt = jest.fn().mockReturnValue({ setExpirationTime: mockSetExpirationTime })
      const mockSetProtectedHeader = jest.fn().mockReturnValue({ setIssuedAt: mockSetIssuedAt })

      mockJose.SignJWT = jest.fn().mockImplementation((payload) => {
        capturedPayload = payload
        return {
          setProtectedHeader: mockSetProtectedHeader,
        }
      }) as any

      mockCookies.mockResolvedValue({ set: mockSet } as any)

      await setSession(user)

      expect(capturedPayload).toMatchObject({
        user: { id: 'user-789' },
        expires: expect.any(String),
      })
    })

    it('should handle user without explicit id field', async () => {
      const user = { id: undefined, email: 'test@example.com' } as any
      const mockToken = 'token'
      const mockSet = jest.fn()

      const mockSign = jest.fn().mockResolvedValue(mockToken)
      const mockSetExpirationTime = jest.fn().mockReturnValue({ sign: mockSign })
      const mockSetIssuedAt = jest.fn().mockReturnValue({ setExpirationTime: mockSetExpirationTime })
      const mockSetProtectedHeader = jest.fn().mockReturnValue({ setIssuedAt: mockSetIssuedAt })

      mockJose.SignJWT = jest.fn().mockImplementation(() => ({
        setProtectedHeader: mockSetProtectedHeader,
      })) as any

      mockCookies.mockResolvedValue({ set: mockSet } as any)

      await setSession(user)

      expect(mockSet).toHaveBeenCalled()
    })
  })

  describe('Integration scenarios', () => {
    it('should complete full auth flow: hash, compare, sign, verify', async () => {
      const password = 'testPassword123'
      const hashedPassword = '$2a$10$hashedvalue'
      const userId = 'user-integration-test'

      // Hash password
      mockBcrypt.hash = jest.fn().mockResolvedValue(hashedPassword)
      const hashed = await hashPassword(password)

      // Compare passwords
      mockBcrypt.compare = jest.fn().mockResolvedValue(true)
      const isValid = await comparePasswords(password, hashed)
      expect(isValid).toBe(true)

      // Create token
      const payload = {
        user: { id: userId },
        expires: new Date(Date.now() + 86400000).toISOString(),
      }
      const mockToken = 'integration.test.token'
      const mockSign = jest.fn().mockResolvedValue(mockToken)
      const mockSetExpirationTime = jest.fn().mockReturnValue({ sign: mockSign })
      const mockSetIssuedAt = jest.fn().mockReturnValue({ setExpirationTime: mockSetExpirationTime })
      const mockSetProtectedHeader = jest.fn().mockReturnValue({ setIssuedAt: mockSetIssuedAt })

      mockJose.SignJWT = jest.fn().mockImplementation(() => ({
        setProtectedHeader: mockSetProtectedHeader,
      })) as any

      const token = await signToken(payload)

      // Verify token
      mockJose.jwtVerify = jest.fn().mockResolvedValue({ payload })
      const verified = await verifyToken(token)

      expect(verified.user.id).toBe(userId)
    })
  })
})