'use client'

import { useState } from 'react'
import { MessageCircle, X, Loader2 } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import StockSearchAutocomplete from '@/components/StockSearchAutocomplete'

export default function FloatingWidget() {
  const { theme } = useTheme()
  const [open, setOpen] = useState(false)
  const [symbol, setSymbol] = useState('AAPL')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  const fetchQuote = async (ticker?: string) => {
    try {
      setLoading(true)
      const polygonKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY || ''
      const symbolToUse = ticker || symbol
      
      if (!symbolToUse.trim()) {
        setData({ error: 'Please enter a stock symbol or company name' })
        return
      }

      const res = await fetch(`/api/quote?symbol=${encodeURIComponent(symbolToUse.toUpperCase())}`, { cache: 'no-store' })
      const json = await res.json()
      setData(json)
    } catch (e) {
      setData({ error: 'Failed to fetch quote' })
    } finally {
      setLoading(false)
    }
  }

  const handleStockSelect = (ticker: string, name: string) => {
    setSymbol(ticker)
    fetchQuote(ticker)
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={`w-14 h-14 grid place-items-center rounded-full transition-all shadow-lg ${
            theme === 'dark'
              ? 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 text-white'
              : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm'
          }`}
          aria-label="Open quick stock widget"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
      {open && (
        <div className={`p-4 w-80 rounded-xl shadow-xl transition-all ${
          theme === 'dark'
            ? 'bg-gray-900/95 backdrop-blur-md border border-gray-800 text-white'
            : 'bg-white/70 backdrop-blur-md border border-purple-200/50 text-[#2d3748] shadow-purple-200/20'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <h4 className={`font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-[#2d3748]'
            }`}>Quick Stock Lookup</h4>
            <button 
              onClick={() => setOpen(false)} 
              className={`hover:opacity-80 transition ${
                theme === 'dark' ? 'text-white' : 'text-[#2d3748]'
              }`}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2 mb-3">
            <StockSearchAutocomplete
              value={symbol}
              onChange={setSymbol}
              onSelect={handleStockSelect}
              placeholder="e.g., AAPL or Apple"
              disabled={loading}
              polygonKey={process.env.NEXT_PUBLIC_POLYGON_API_KEY || ''}
              className="flex-1"
              disableAutocomplete={true}
            />
            <button
              onClick={() => fetchQuote()}
              disabled={loading}
              className={`px-3 py-2 rounded-lg border transition ${
                theme === 'dark'
                  ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white disabled:opacity-50'
                  : 'bg-blue-500 border-blue-600 hover:bg-blue-600 text-white disabled:opacity-50'
              }`}
            >
              Go
            </button>
          </div>
          {loading && (
            <div className={`flex items-center gap-2 text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          )}
          {data && !loading && (
            <div className={`text-sm space-y-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <div className={`font-mono ${
                theme === 'dark' ? 'opacity-80' : 'opacity-70'
              }`}>Ticker: {symbol}</div>
              {'results' in data && data.results?.[0] ? (
                <>
                  <div>Prev Close: <span className="font-semibold">${(data.results[0]?.c ?? 0).toFixed(2)}</span></div>
                  <div>High: ${(data.results[0]?.h ?? 0).toFixed(2)} • Low: ${(data.results[0]?.l ?? 0).toFixed(2)}</div>
                  <div>Volume: {(data.results[0]?.v ?? 0).toLocaleString()}</div>
                </>
              ) : data.error ? (
                <div className={`${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>{data.error}</div>
              ) : (
                <div className={`${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>No data found.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

