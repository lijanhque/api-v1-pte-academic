import { NextRequest, NextResponse } from 'next/server'

/**
 * Search the configured MXBAI store for results matching the given query.
 *
 * If the MXBAI API key or store ID is not configured, or if the request fails,
 * an empty array is returned.
 *
 * @param query - The search query string to send to the MXBAI store.
 * @returns An array of result objects with the shape `{ title: string, url: string, source: 'mxbai' }`.
 *          `title` falls back to `'Result'` when the response doesn't provide a title or text.
 */
async function searchMXBAI(query: string) {
  const key = process.env.MXBAI_API_KEY
  const store = process.env.MXBAI_STORE_ID
  if (!key || !store) return []
  try {
    const res = await fetch(`https://api.mxbai.com/v1/stores/${store}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ query, top_k: 8 }),
    })
    const data = await res.json()
    const items = Array.isArray(data?.results) ? data.results : []
    return items.map((i: any) => ({
      title: i.title || i.text || 'Result',
      url: i.url || '/',
      source: 'mxbai',
    }))
  } catch {
    return []
  }
}

/**
 * Handle GET requests for search and return matching results.
 *
 * Reads the `query` search parameter from the incoming request, performs a search using MXBAI, and responds with a JSON object containing the search results. If the `query` is missing or empty after trimming, responds with `{ results: [] }`.
 *
 * @param request - The incoming request whose URL `query` parameter is used as the search term.
 * @returns A JSON HTTP response with shape `{ results: Array<{ title: string; url: string; source: string }> }`.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('query') || ''
  if (!q.trim()) return NextResponse.json({ results: [] })
  const ai = await searchMXBAI(q)
  return NextResponse.json({ results: ai })
}