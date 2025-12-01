import 'server-only'
import { NextResponse } from 'next/server'

/**
 * Handle GET requests for the health endpoint and respond with a static healthy payload.
 *
 * Responds with a JSON body containing `ok`, `version`, `timestamp`, and `status` and a 200 HTTP status.
 *
 * @returns A NextResponse with the JSON payload `{ ok: true, version: '1', timestamp: string, status: 'healthy' }`, `Content-Type: application/json; charset=utf-8`, `Cache-Control: no-store, no-cache, must-revalidate`, and HTTP status 200.
 */
export async function GET() {
  const body = {
    ok: true,
    version: '1',
    timestamp: new Date().toISOString(),
    status: 'healthy',
  } as const

  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, no-cache, must-revalidate',
    },
  })
}