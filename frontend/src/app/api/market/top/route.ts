import { NextResponse } from 'next/server'

function yyyymmdd(d = new Date()) {
  const dt = new Date(d.getTime() - 24 * 60 * 60 * 1000) // yesterday (simple fallback)
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Fetch company name using ticker search (works on free tier)
async function fetchTickerName(symbol: string, apiKey: string): Promise<string> {
  try {
    // Method 1: Try the direct ticker endpoint first
    const directUrl = `https://api.polygon.io/v3/reference/tickers/${encodeURIComponent(symbol)}?apiKey=${apiKey}`
    const directRes = await fetch(directUrl, { cache: 'no-store' })
    if (directRes.ok) {
      const data = await directRes.json()
      if (data?.results?.name) {
        return data.results.name
      }
    }
    
    // Method 2: Fallback to search endpoint
    const searchUrl = `https://api.polygon.io/v3/reference/tickers?ticker=${encodeURIComponent(symbol)}&active=true&limit=1&apiKey=${apiKey}`
    const searchRes = await fetch(searchUrl, { cache: 'no-store' })
    if (searchRes.ok) {
      const data = await searchRes.json()
      const results = data?.results ?? []
      if (results.length > 0 && results[0]?.name) {
        return results[0].name
      }
    }
  } catch {
    // Silently fail
  }
  return ''
}

// Fetch company names for multiple symbols in parallel with concurrency control
async function fetchTickerNames(symbols: string[], apiKey: string): Promise<Record<string, string>> {
  const nameMap: Record<string, string> = {}
  
  if (!symbols.length) return nameMap
  
  // Deduplicate symbols
  const uniqueSymbols = [...new Set(symbols.filter(Boolean))]
  
  // Process in parallel batches to avoid overwhelming the API
  const concurrency = 15 // Process 15 at a time
  
  for (let i = 0; i < uniqueSymbols.length; i += concurrency) {
    const batch = uniqueSymbols.slice(i, i + concurrency)
    
    const results = await Promise.allSettled(
      batch.map(async (symbol) => {
        const name = await fetchTickerName(symbol, apiKey)
        return { symbol, name }
      })
    )
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.name) {
        nameMap[result.value.symbol] = result.value.name
      }
    }
    
    // Small delay between batches to respect rate limits
    if (i + concurrency < uniqueSymbols.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  return nameMap
}

export async function GET() {
  const key = process.env.POLYGON_API_KEY || process.env.NEXT_PUBLIC_POLYGON_API_KEY
  if (!key)
    return NextResponse.json({ error: 'Missing POLYGON_API_KEY' }, { status: 500 })

  // ✅ Request up to 50 gainers and losers
  const snapGainers = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/gainers?limit=50&apiKey=${key}`
  const snapLosers = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/losers?limit=50&apiKey=${key}`

  try {
    const [gRes, lRes] = await Promise.all([
      fetch(snapGainers, { cache: 'no-store' }),
      fetch(snapLosers, { cache: 'no-store' }),
    ])

    if (gRes.ok && lRes.ok) {
      const [gainers, losers] = await Promise.all([gRes.json(), lRes.json()])

      // Extract symbols to fetch names
      const gainerData = (gainers?.tickers ?? gainers?.results ?? []).slice(0, 50)
      const loserData = (losers?.tickers ?? losers?.results ?? []).slice(0, 50)
      
      const allSymbols = [
        ...gainerData.map((x: any) => x?.ticker ?? x?.T ?? ''),
        ...loserData.map((x: any) => x?.ticker ?? x?.T ?? '')
      ].filter(Boolean)
      
      // Fetch company names in parallel
      const nameMap = await fetchTickerNames(allSymbols, key)

      // ✅ Map with names included
      const pick = (arr: any[] = [], n = 50) =>
        arr.slice(0, n).map((x: any) => {
          const symbol = x?.ticker ?? x?.T ?? ''
          return {
            symbol,
            name: nameMap[symbol] || '',
            price: x?.day?.c ?? x?.min?.c ?? x?.lastTrade?.p ?? null,
            change: x?.todaysChange ?? null,
            changePct: x?.todaysChangePerc ?? null,
            volume: x?.day?.v ?? x?.volume ?? null,
          }
        })

      return NextResponse.json({
        gainers: pick(gainerData),
        losers: pick(loserData),
      })
    }

    // 🧩 Fallback: previous-day grouped bars
    const day = yyyymmdd()
    const grouped = `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${day}?adjusted=true&include_otc=false&apiKey=${key}`
    const gr = await fetch(grouped, { cache: 'no-store' })
    if (!gr.ok) {
      const detail = await gr.text()
      return NextResponse.json({ error: 'Polygon error', detail }, { status: gr.status })
    }
    const gj = await gr.json()
    const rows: any[] = gj?.results ?? []

    const mapped = rows
      .map((x: any) => {
        const o = x.o, c = x.c
        const pct = o ? ((c - o) / o) * 100 : null
        return {
          symbol: x.T,
          name: '',
          price: c ?? null,
          change: o != null && c != null ? (c - o) : null,
          changePct: pct,
          volume: x.v ?? null,
        }
      })
      .filter(r => r.changePct != null && isFinite(r.changePct as number))

    const sortedGainers = [...mapped].sort((a, b) => b.changePct! - a.changePct!).slice(0, 50)
    const sortedLosers = [...mapped].sort((a, b) => a.changePct! - b.changePct!).slice(0, 50)

    // Fetch names for fallback data
    const allSymbols = [
      ...sortedGainers.map(r => r.symbol),
      ...sortedLosers.map(r => r.symbol)
    ].filter(Boolean)
    
    const nameMap = await fetchTickerNames(allSymbols, key)
    
    // Add names to results
    const gainersWithNames = sortedGainers.map(r => ({
      ...r,
      name: nameMap[r.symbol] || ''
    }))
    const losersWithNames = sortedLosers.map(r => ({
      ...r,
      name: nameMap[r.symbol] || ''
    }))

    return NextResponse.json({ gainers: gainersWithNames, losers: losersWithNames })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: String(e) }, { status: 500 })
  }
}
