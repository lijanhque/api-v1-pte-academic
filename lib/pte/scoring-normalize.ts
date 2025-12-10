/**
 * Normalize and clamp scores to PTE Academic ranges
 */

/**
 * Clamp a score to the 0-90 PTE Academic range
 */
export function clampTo90(score: number): number {
  return Math.max(0, Math.min(90, Math.round(score)))
}

/**
 * Clamp a score to the 0-5 PTE Academic rubric range
 */
export function clampTo5(score: number): number {
  return Math.max(0, Math.min(5, Math.round(score * 10) / 10))
}

/**
 * Convert a 0-5 rubric score to 0-90 scale
 */
export function rubricTo90(score: number): number {
  return clampTo90((score / 5) * 90)
}

/**
 * Convert a 0-90 score to 0-5 rubric scale
 */
export function scoreTo5(score: number): number {
  return clampTo5((score / 90) * 5)
}

/**
 * Calculate percentage from two values
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Normalize a score from any range to 0-90
 */
export function normalizeToScale(
  score: number,
  minOriginal: number,
  maxOriginal: number
): number {
  if (maxOriginal === minOriginal) return 0
  const normalized = ((score - minOriginal) / (maxOriginal - minOriginal)) * 90
  return clampTo90(normalized)
}

/**
 * Apply band scoring (PTE uses 10-point bands)
 */
export function toBand(score: number): number {
  return Math.floor(clampTo90(score) / 10) * 10
}

/**
 * Get score descriptor based on PTE Academic bands
 */
export function getScoreDescriptor(score: number): string {
  const s = clampTo90(score)
  if (s >= 85) return 'Expert'
  if (s >= 76) return 'Very Good'
  if (s >= 65) return 'Good'
  if (s >= 50) return 'Competent'
  if (s >= 36) return 'Modest'
  if (s >= 10) return 'Limited'
  return 'Extremely Limited'
}
