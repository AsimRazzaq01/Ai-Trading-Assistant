import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const key = process.env.POLYGON_API_KEY || process.env.NEXT_PUBLIC_POLYGON_API_KEY
  if (!key)
    return NextResponse.json({ error: 'Missing POLYGON_API_KEY' }, { status: 500 })

  const url = new URL(req.url)
  const tickers = url.searchParams.get('tickers') // e.g. "AAPL,TSLA"
  const query = url.searchParams.get('q') // free text

  // ✅ Increase limit to 50 for more results
  const base = new URL('https://api.polygon.io/v2/reference/news')
  base.searchParams.set('order', 'desc')
  base.searchParams.set('sort', 'published_utc')
  base.searchParams.set('limit', '50') // ⬅️ changed from 20 → 50
  base.searchParams.set('apiKey', key)

  if (tickers) base.searchParams.set('ticker', tickers)
  if (query && !tickers) base.searchParams.set('query', query)

  try {
    const res = await fetch(base.toString(), { cache: 'no-store' })
    if (!res.ok) {
      const detail = await res.text()
      return NextResponse.json({ error: 'Polygon news error', detail }, { status: res.status })
    }

    const json = await res.json()
    const items = (json?.results ?? []).map((n: any) => ({
      title: n.title,
      url: n.article_url,
      source: n.publisher?.name,
      publishedAt: n.published_utc,
      image: n.image_url,
      summary: n.description,
    }))

    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: 'News fetch failed', detail: String(e) }, { status: 500 })
  }
}

