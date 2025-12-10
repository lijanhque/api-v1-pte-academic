import 'server-only'
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Writing test AI endpoint',
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Placeholder for writing test scoring
    return NextResponse.json({
      status: 'success',
      message: 'Writing test submitted',
      data: body,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
