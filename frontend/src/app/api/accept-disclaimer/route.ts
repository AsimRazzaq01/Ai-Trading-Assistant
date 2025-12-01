import { NextRequest, NextResponse } from 'next/server'
import { getBackendUrl } from "@/lib/api/get-backend-url";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json(
      { detail: 'Invalid request body' },
      { status: 400 }
    );
  }

  try {
    // ✅ Get backend URL (handles Docker, local, and production)
    const backend = getBackendUrl()

    // Forward cookies from the request
    const cookieHeader = req.headers.get('cookie') || ''

    const res = await fetch(`${backend}/auth/accept-disclaimer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { detail: data.detail || 'Failed to accept disclaimer' },
        { status: res.status }
      )
    }

    // Forward response cookies
    const response = NextResponse.json(data, { status: res.status })
    const setCookieHeader = res.headers.get('set-cookie')
    if (setCookieHeader) {
      response.headers.set('set-cookie', setCookieHeader)
    }

    return response
  } catch (error: any) {
    console.error('Error accepting disclaimer:', error)
    const errorMessage = error?.message || error?.toString() || 'Internal server error';
    const safeErrorMessage = errorMessage.includes("Body has already been read")
      ? "Request processing error. Please try again."
      : errorMessage;
    return NextResponse.json(
      { detail: safeErrorMessage },
      { status: 500 }
    )
  }
}

