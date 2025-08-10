import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    message: 'TonyCash Tool API is working!',
    timestamp: new Date().toISOString(),
    status: 'operational'
  })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      success: true,
      message: 'POST request received successfully',
      data: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid JSON in request body'
    }, { status: 400 })
  }
}
