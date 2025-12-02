/**
 * Unit tests for lib/pte/blob-upload.ts
 * Tests audio file upload with fallback handling
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { uploadAudioWithFallback, type AudioUploadParams } from '@/lib/pte/blob-upload'

// Mock the upload action
jest.mock('@/lib/actions/upload-actions', () => ({
  uploadAudio: jest.fn(),
}))

import { uploadAudio } from '@/lib/actions/upload-actions'

describe('lib/pte/blob-upload', () => {
  const mockUploadAudio = uploadAudio as jest.MockedFunction<typeof uploadAudio>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('uploadAudioWithFallback', () => {
    it('should successfully upload audio file', async () => {
      const mockBlob = new Blob(['audio data'], { type: 'audio/webm' })
      const params: AudioUploadParams = {
        type: 'read_aloud',
        questionId: 'q-123',
        ext: 'webm',
      }

      const expectedResult = {
        url: 'https://blob.vercel.com/audio/file.webm',
        pathname: '/audio/file.webm',
      }

      mockUploadAudio.mockResolvedValue(expectedResult)

      const result = await uploadAudioWithFallback(mockBlob, params)

      expect(mockUploadAudio).toHaveBeenCalledWith(expect.any(FormData))
      expect(result).toEqual({
        blobUrl: expectedResult.url,
        pathname: expectedResult.pathname,
      })
    })

    it('should include all parameters in FormData', async () => {
      const mockBlob = new Blob(['audio'], { type: 'audio/mp3' })
      const params: AudioUploadParams = {
        type: 'describe_image',
        questionId: 'q-456',
        ext: 'mp3',
      }

      let capturedFormData: FormData | null = null
      mockUploadAudio.mockImplementation(async (formData) => {
        capturedFormData = formData
        return { url: 'test-url', pathname: 'test-path' }
      })

      await uploadAudioWithFallback(mockBlob, params)

      expect(capturedFormData).not.toBeNull()
      expect(capturedFormData!.get('type')).toBe('describe_image')
      expect(capturedFormData!.get('questionId')).toBe('q-456')
      expect(capturedFormData!.get('ext')).toBe('mp3')
      expect(capturedFormData!.get('file')).toBe(mockBlob)
    })

    it('should work without ext parameter', async () => {
      const mockBlob = new Blob(['audio'], { type: 'audio/wav' })
      const params: AudioUploadParams = {
        type: 'repeat_sentence',
        questionId: 'q-789',
      }

      let capturedFormData: FormData | null = null
      mockUploadAudio.mockImplementation(async (formData) => {
        capturedFormData = formData
        return { url: 'url', pathname: 'path' }
      })

      await uploadAudioWithFallback(mockBlob, params)

      expect(capturedFormData!.get('ext')).toBeNull()
    })

    it('should handle different speaking types', async () => {
      const speakingTypes: Array<AudioUploadParams['type']> = [
        'read_aloud',
        'repeat_sentence',
        'describe_image',
        'retell_lecture',
        'answer_short_question',
        'respond_to_a_situation',
        'summarize_group_discussion',
      ]

      for (const type of speakingTypes) {
        const mockBlob = new Blob(['audio'], { type: 'audio/webm' })
        const params: AudioUploadParams = {
          type,
          questionId: `q-${type}`,
        }

        mockUploadAudio.mockResolvedValue({
          url: `url-${type}`,
          pathname: `path-${type}`,
        })

        const result = await uploadAudioWithFallback(mockBlob, params)

        expect(result.blobUrl).toBe(`url-${type}`)
        expect(result.pathname).toBe(`path-${type}`)
      }
    })

    it('should handle different file extensions', async () => {
      const extensions: Array<'webm' | 'mp3' | 'wav' | 'm4a'> = ['webm', 'mp3', 'wav', 'm4a']

      for (const ext of extensions) {
        const mockBlob = new Blob(['audio'], { type: `audio/${ext}` })
        const params: AudioUploadParams = {
          type: 'read_aloud',
          questionId: 'q-ext-test',
          ext,
        }

        mockUploadAudio.mockResolvedValue({
          url: `url.${ext}`,
          pathname: `path.${ext}`,
        })

        const result = await uploadAudioWithFallback(mockBlob, params)

        expect(result.blobUrl).toBe(`url.${ext}`)
      }
    })

    it('should throw error when upload fails', async () => {
      const mockBlob = new Blob(['audio'], { type: 'audio/webm' })
      const params: AudioUploadParams = {
        type: 'read_aloud',
        questionId: 'q-fail',
      }

      mockUploadAudio.mockRejectedValue(new Error('Network error'))

      await expect(uploadAudioWithFallback(mockBlob, params)).rejects.toThrow('Network error')
    })

    it('should handle generic upload error without message', async () => {
      const mockBlob = new Blob(['audio'], { type: 'audio/webm' })
      const params: AudioUploadParams = {
        type: 'read_aloud',
        questionId: 'q-generic',
      }

      mockUploadAudio.mockRejectedValue({})

      await expect(uploadAudioWithFallback(mockBlob, params)).rejects.toThrow('Upload failed')
    })

    it('should handle large audio files', async () => {
      const largeAudioData = new Uint8Array(10 * 1024 * 1024) // 10MB
      const mockBlob = new Blob([largeAudioData], { type: 'audio/webm' })
      const params: AudioUploadParams = {
        type: 'retell_lecture',
        questionId: 'q-large',
        ext: 'webm',
      }

      mockUploadAudio.mockResolvedValue({
        url: 'url-large-file',
        pathname: 'path-large-file',
      })

      const result = await uploadAudioWithFallback(mockBlob, params)

      expect(result).toBeDefined()
      expect(result.blobUrl).toBe('url-large-file')
    })

    it('should handle empty blob', async () => {
      const emptyBlob = new Blob([], { type: 'audio/webm' })
      const params: AudioUploadParams = {
        type: 'read_aloud',
        questionId: 'q-empty',
      }

      mockUploadAudio.mockResolvedValue({
        url: 'url-empty',
        pathname: 'path-empty',
      })

      const result = await uploadAudioWithFallback(emptyBlob, params)

      expect(result).toBeDefined()
    })

    it('should handle special characters in questionId', async () => {
      const mockBlob = new Blob(['audio'], { type: 'audio/webm' })
      const params: AudioUploadParams = {
        type: 'read_aloud',
        questionId: 'q-特殊-文字-123_test',
      }

      let capturedFormData: FormData | null = null
      mockUploadAudio.mockImplementation(async (formData) => {
        capturedFormData = formData
        return { url: 'url', pathname: 'path' }
      })

      await uploadAudioWithFallback(mockBlob, params)

      expect(capturedFormData!.get('questionId')).toBe('q-特殊-文字-123_test')
    })

    it('should preserve blob type information', async () => {
      const mimeType = 'audio/webm;codecs=opus'
      const mockBlob = new Blob(['audio'], { type: mimeType })
      const params: AudioUploadParams = {
        type: 'read_aloud',
        questionId: 'q-mime',
      }

      let capturedBlob: Blob | null = null
      mockUploadAudio.mockImplementation(async (formData) => {
        capturedBlob = formData.get('file') as Blob
        return { url: 'url', pathname: 'path' }
      })

      await uploadAudioWithFallback(mockBlob, params)

      expect(capturedBlob).toBeDefined()
      expect(capturedBlob!.type).toBe(mimeType)
    })

    it('should handle timeout errors', async () => {
      const mockBlob = new Blob(['audio'], { type: 'audio/webm' })
      const params: AudioUploadParams = {
        type: 'read_aloud',
        questionId: 'q-timeout',
      }

      mockUploadAudio.mockRejectedValue(new Error('Request timeout'))

      await expect(uploadAudioWithFallback(mockBlob, params)).rejects.toThrow('Request timeout')
    })

    it('should handle quota exceeded errors', async () => {
      const mockBlob = new Blob(['audio'], { type: 'audio/webm' })
      const params: AudioUploadParams = {
        type: 'read_aloud',
        questionId: 'q-quota',
      }

      mockUploadAudio.mockRejectedValue(new Error('Storage quota exceeded'))

      await expect(uploadAudioWithFallback(mockBlob, params)).rejects.toThrow('Storage quota exceeded')
    })
  })
})