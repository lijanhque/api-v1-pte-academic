
export function countWords(text: string): number {
  if (!text) return 0
  return text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length
}
