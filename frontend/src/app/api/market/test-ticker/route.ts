import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const symbol = url.searchParams.get('symbol') || 'AAPL'
  
  const key = process.env.POLYGON_API_KEY || process.env.NEXT_PUBLIC_POLYGON_API_KEY
  if (!key) {
    return NextResponse.json({ error: 'Missing POLYGON_API_KEY' }, { status: 500 })
  }

  try {
    const tickerUrl = `https://api.polygon.io/v3/reference/tickers/${encodeURIComponent(symbol)}?apiKey=${key}`
    
    const res = await fetch(tickerUrl, { cache: 'no-store' })
    const data = await res.json()
    
    return NextResponse.json({
      url: tickerUrl.replace(key, 'REDACTED'),
      status: res.status,
      ok: res.ok,
      data,
      extractedName: data?.results?.name || 'NOT FOUND'
    })
  } catch (e: any) {
    return NextResponse.json({ 
      error: 'Failed to fetch', 
      detail: String(e) 
    }, { status: 500 })
  }
}

