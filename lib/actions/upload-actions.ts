'use server'

import { put } from '@vercel/blob'

export interface UploadResult {
  url: string
  pathname: string
  contentType: string
  size: number
}

export async function uploadAudio(formData: FormData): Promise<UploadResult> {
  const file = formData.get('file') as File
  const type = formData.get('type') as string
  const questionId = formData.get('questionId') as string
  const ext = (formData.get('ext') as string) || 'webm'

  if (!file) {
    throw new Error('No file provided')
  }

  const filename = `audio/${type}/${questionId}/${Date.now()}.${ext}`

  const blob = await put(filename, file, {
    access: 'public',
    contentType: file.type || `audio/${ext}`,
  })

  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType: blob.contentType,
    size: file.size,
  }
}
