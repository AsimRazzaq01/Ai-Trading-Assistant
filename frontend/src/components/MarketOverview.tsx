'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'

type Row = { symbol: string; name?: string; price?: number|null; changePct?: number|null }

export default function MarketOverview() {
  const { theme } = useTheme();
  const router = useRouter();
  const [gainers, setGainers] = useState<Row[]>([])
  const [losers, setLosers] = useState<Row[]>([])
  const [err, setErr] = useState<string | null>(null)
  
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/market/top', { cache: 'no-store' })
        const j = await r.json()
        if (!r.ok) throw new Error(j?.error || 'Failed')
        const gainersList = j.gainers || []
        const losersList = j.losers || []
        // Ensure we have up to 50 items
        setGainers(gainersList.slice(0, 50))
        setLosers(losersList.slice(0, 50))
      } catch (e: any) { setErr(e.message) }
    })()
  }, [])

  const handleStockClick = (symbol: string) => {
    router.push(`/deep-research?symbol=${encodeURIComponent(symbol)}`)
  }
  
  const List = ({ title, items }: { title: string; items: Row[] }) => (
    <div className={`h-full flex flex-col overflow-hidden rounded-xl transition-all duration-300 ${
      theme === 'dark'
        ? 'bg-gray-900 border border-gray-800 shadow-md'
        : 'bg-[#eaf5f3] border border-[#cde3dd] shadow-sm'
    }`}>
      <h3 className={`text-base font-semibold px-4 py-3 border-b ${
        theme === 'dark' 
          ? 'text-white border-gray-700' 
          : 'text-gray-900 border-gray-300'
      }`}>{title}</h3>
      <div className="relative flex-1 overflow-auto max-h-[500px]">
        <div className="p-4 space-y-2">
          {items.map(r => (
            <div 
              key={r.symbol} 
              onClick={() => handleStockClick(r.symbol)}
              className={`flex items-center justify-between text-sm cursor-pointer transition-all rounded-lg p-2 ${
                theme === 'dark'
                  ? 'hover:bg-gray-800'
                  : 'hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold">{r.symbol}</span>
                <span className="opacity-70">{r.name?.slice(0,28)}</span>
              </div>
              <div className="text-right">
                <div className="opacity-80">${(r.price ?? 0).toFixed(2)}</div>
                <div className={(r.changePct ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {(r.changePct ?? 0) >= 0 ? '+' : ''}{(r.changePct ?? 0).toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
          {!items.length && <div className={`text-sm ${
            theme === 'dark' ? 'opacity-60 text-gray-400' : 'opacity-60 text-gray-600'
          }`}>No data.</div>}
        </div>
      </div>
    </div>
  )
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {err && <div className={`p-4 rounded-xl text-red-300 text-sm ${
        theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-red-50 border border-red-200'
      }`}>Market data error: {err}</div>}
      <List title="Top Gainers" items={gainers} />
      <List title="Top Losers"  items={losers} />
    </div>
  )
}

