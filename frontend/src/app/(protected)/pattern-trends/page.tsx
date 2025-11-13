'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useSearchParams } from 'next/navigation'
import CandlestickChart from '@/components/CandlestickChart'
import { X, Plus, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

interface PatternTrendsItem {
  id: number
  symbol: string
  created_at: string
}

interface CandlestickData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

interface PatternAnalysis {
  patterns: Array<{
    name: string
    type: 'bullish' | 'bearish' | 'neutral'
    confidence: 'high' | 'medium' | 'low'
    description: string
  }>
  trend: {
    direction: 'uptrend' | 'downtrend' | 'sideways'
    strength: 'strong' | 'moderate' | 'weak'
    description: string
  }
  supportResistance: {
    support: number[]
    resistance: number[]
    description: string
  }
  alerts: Array<{
    type: 'bullish' | 'bearish' | 'reversal'
    message: string
    confidence: 'high' | 'medium' | 'low'
  }>
}

export default function PatternTrendsPage() {
  const { theme } = useTheme()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [stocks, setStocks] = useState<PatternTrendsItem[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState<string>('')
  const [newSymbol, setNewSymbol] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStocks, setLoadingStocks] = useState(true)
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([])
  const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysis | null>(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [error, setError] = useState('')

  const polygonKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY || ''

  // Load user
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/me', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setUser(data)
        }
      } catch (err) {
        console.error('Error fetching user:', err)
      }
    })()
  }, [])

  // Load pattern trends stocks
  const loadStocks = async () => {
    setLoadingStocks(true)
    setError('')
    try {
      const res = await fetch('/api/pattern-trends', {
        credentials: 'include',
        cache: 'no-store',
      })

      if (!res.ok) {
        if (res.status === 401) {
          setError('Please log in to view your pattern trends.')
          setStocks([])
          return
        }
        throw new Error(`Failed to load pattern trends: ${res.status}`)
      }

      const data = await res.json()
      setStocks(data.items || [])
    } catch (e: any) {
      console.error('Error loading pattern trends:', e)
      setError('Failed to load pattern trends. Please try again.')
      setStocks([])
    } finally {
      setLoadingStocks(false)
    }
  }

  useEffect(() => {
    loadStocks()

    // Check for symbol from URL params (when coming from dashboard)
    const symbolParam = searchParams?.get('symbol')
    if (symbolParam) {
      setSelectedSymbol(symbolParam.toUpperCase())
      // Add to pattern trends if not already there
      addStock(symbolParam.toUpperCase())
    }
  }, [searchParams])

  // Add stock to pattern trends
  const addStock = async (symbol?: string) => {
    const sym = (symbol || newSymbol.trim().toUpperCase()).trim()
    if (!sym) {
      setError('Please enter a stock symbol.')
      return
    }

    if (!polygonKey) {
      setError('Polygon API key not configured.')
      return
    }

    setError('')
    setLoading(true)
    try {
      // Validate symbol with Polygon
      const checkRes = await fetch(
        `https://api.polygon.io/v3/reference/tickers/${sym}?apiKey=${polygonKey}`
      )
      if (!checkRes.ok || !(await checkRes.json())?.results?.ticker) {
        throw new Error('Invalid ticker.')
      }

      // Add to backend
      const res = await fetch('/api/pattern-trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ symbol: sym }),
      })

      if (!res.ok) {
        let errorData: any = {};
        try {
          errorData = await res.json();
        } catch (e) {
          // If response is not JSON, use status text
          errorData = { detail: res.statusText || 'Failed to add to pattern trends' };
        }
        
        if (res.status === 400 && errorData.detail?.includes('already')) {
          setError('Symbol already in pattern trends.')
          await loadStocks()
          return
        }
        throw new Error(errorData.detail || 'Failed to add to pattern trends')
      }

      await loadStocks()
      setNewSymbol('')
      if (!symbol) {
        setSelectedSymbol(sym)
      }
    } catch (err: any) {
      console.error('Error adding stock:', err)
      setError(err.message || 'Invalid or unknown stock symbol.')
    } finally {
      setLoading(false)
    }
  }

  // Remove stock from pattern trends
  const removeStock = async (symbol: string) => {
    setError('')
    try {
      const res = await fetch(`/api/pattern-trends/${encodeURIComponent(symbol)}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!res.ok) {
        throw new Error('Failed to remove from pattern trends')
      }

      await loadStocks()
      if (selectedSymbol === symbol) {
        setSelectedSymbol('')
        setCandlestickData([])
        setPatternAnalysis(null)
      }
    } catch (err) {
      console.error('Error removing stock:', err)
      setError('Failed to remove stock. Please try again.')
    }
  }

  // Fetch candlestick data
  const fetchCandlestickData = async (symbol: string) => {
    if (!polygonKey) {
      setError('Polygon API key not configured.')
      return
    }

    setLoadingAnalysis(true)
    setError('')
    try {
      const now = new Date()
      const past = new Date()
      past.setDate(now.getDate() - 60) // Last 60 days
      const from = past.toISOString().split('T')[0]
      const to = now.toISOString().split('T')[0]

      const res = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=${polygonKey}`
      )

      if (!res.ok) {
        throw new Error('Failed to fetch candlestick data')
      }

      const data = await res.json()
      const ohlc = data.results || []

      if (ohlc.length === 0) {
        throw new Error('No data available for this symbol')
      }

      const formattedData: CandlestickData[] = ohlc.map((d: any) => ({
        date: new Date(d.t).toISOString().split('T')[0],
        open: d.o,
        high: d.h,
        low: d.l,
        close: d.c,
        volume: d.v,
      }))

      setCandlestickData(formattedData)

      // Fetch pattern analysis
      const analysisRes = await fetch('/api/pattern-detection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          ohlcData: formattedData,
        }),
      })

      if (analysisRes.ok) {
        const analysis = await analysisRes.json()
        setPatternAnalysis(analysis)
      } else {
        console.error('Failed to get pattern analysis')
      }
    } catch (err: any) {
      console.error('Error fetching candlestick data:', err)
      setError(err.message || 'Failed to fetch candlestick data.')
      setCandlestickData([])
      setPatternAnalysis(null)
    } finally {
      setLoadingAnalysis(false)
    }
  }

  // Load data when symbol is selected
  useEffect(() => {
    if (selectedSymbol) {
      fetchCandlestickData(selectedSymbol)
    }
  }, [selectedSymbol])

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <main
      className={`min-h-screen transition-colors duration-500 ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-black via-gray-950 to-black text-white'
          : 'bg-gradient-to-b from-[#f5f7fa] via-[#c3e0dc] to-[#9ad0c2] text-gray-900'
      }`}
    >
      <div className="max-w-7xl mx-auto p-6 pt-24">
        <h1
          className={`text-3xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-blue-600'
          }`}
        >
          Pattern Trends 📈
        </h1>

        {/* Add Stock Input */}
        <div
          className={`rounded-xl shadow-md p-6 mb-6 transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gray-900 border border-gray-800'
              : 'bg-white border border-gray-200'
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}
          >
            Add Stock for Pattern Analysis
          </h2>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="Enter stock symbol (e.g. AAPL)"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addStock()
                }
              }}
              className={`flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-black'
              }`}
            />
            <button
              onClick={() => addStock()}
              disabled={loading || !newSymbol.trim()}
              className={`px-4 py-2 rounded-lg disabled:opacity-50 transition-all flex items-center gap-2 ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
          {error && (
            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
              {error}
            </p>
          )}
        </div>

        {/* Stock List */}
        {!loadingStocks && stocks.length > 0 && (
          <div
            className={`rounded-xl shadow-md p-6 mb-6 transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gray-900 border border-gray-800'
                : 'bg-white border border-gray-200'
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}
            >
              Your Pattern Trends Stocks
            </h2>
            <div className="flex flex-wrap gap-2">
              {stocks.map((stock) => (
                <div
                  key={stock.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    selectedSymbol === stock.symbol
                      ? theme === 'dark'
                        ? 'bg-blue-900 border-blue-700'
                        : 'bg-blue-100 border-blue-300'
                      : theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <button
                    onClick={() => setSelectedSymbol(stock.symbol)}
                    className={`font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {stock.symbol}
                  </button>
                  <button
                    onClick={() => removeStock(stock.symbol)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart and Analysis */}
        {selectedSymbol && (
          <div
            className={`rounded-xl shadow-md p-6 mb-6 transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gray-900 border border-gray-800'
                : 'bg-white border border-gray-200'
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}
            >
              {selectedSymbol} - Pattern Analysis
            </h2>

            {loadingAnalysis ? (
              <div className="flex items-center justify-center py-12">
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Loading candlestick data and analyzing patterns...
                </p>
              </div>
            ) : (
              <>
                {/* Candlestick Chart */}
                {candlestickData.length > 0 && (
                  <div className="mb-6">
                    <CandlestickChart data={candlestickData} symbol={selectedSymbol} height={400} />
                  </div>
                )}

                {/* Pattern Analysis */}
                {patternAnalysis && (
                  <div className="space-y-4">
                    {/* Trend Analysis */}
                    <div
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {patternAnalysis.trend.direction === 'uptrend' ? (
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        ) : patternAnalysis.trend.direction === 'downtrend' ? (
                          <TrendingDown className="w-5 h-5 text-red-500" />
                        ) : null}
                        <h3
                          className={`font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          Trend: {patternAnalysis.trend.direction} ({patternAnalysis.trend.strength})
                        </h3>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {patternAnalysis.trend.description}
                      </p>
                    </div>

                    {/* Detected Patterns */}
                    {patternAnalysis.patterns.length > 0 && (
                      <div
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <h3
                          className={`font-semibold mb-3 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          Detected Patterns
                        </h3>
                        <div className="space-y-2">
                          {patternAnalysis.patterns.map((pattern, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded border ${
                                theme === 'dark' ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className={`font-medium ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                  }`}
                                >
                                  {pattern.name}
                                </span>
                                <span className={`text-xs font-semibold ${getConfidenceColor(pattern.confidence)}`}>
                                  {pattern.confidence} confidence
                                </span>
                              </div>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {pattern.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Support & Resistance */}
                    {(patternAnalysis.supportResistance.support.length > 0 ||
                      patternAnalysis.supportResistance.resistance.length > 0) && (
                      <div
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <h3
                          className={`font-semibold mb-2 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          Support & Resistance Levels
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {patternAnalysis.supportResistance.support.length > 0 && (
                            <div>
                              <p className={`mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Support:
                              </p>
                              <div className="space-y-1">
                                {patternAnalysis.supportResistance.support.map((level, idx) => (
                                  <p
                                    key={idx}
                                    className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}
                                  >
                                    ${level.toFixed(2)}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                          {patternAnalysis.supportResistance.resistance.length > 0 && (
                            <div>
                              <p className={`mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Resistance:
                              </p>
                              <div className="space-y-1">
                                {patternAnalysis.supportResistance.resistance.map((level, idx) => (
                                  <p
                                    key={idx}
                                    className={`font-semibold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}
                                  >
                                    ${level.toFixed(2)}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Pattern Alerts */}
                    {patternAnalysis.alerts.length > 0 && (
                      <div
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <h3
                          className={`font-semibold mb-3 flex items-center gap-2 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          <AlertCircle className="w-5 h-5" />
                          Pattern Alerts
                        </h3>
                        <div className="space-y-2">
                          {patternAnalysis.alerts.map((alert, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center justify-between p-3 rounded transition-all ${
                                theme === 'dark'
                                  ? 'bg-gray-900 border border-gray-700'
                                  : 'bg-white border border-gray-200'
                              }`}
                            >
                              <span
                                className={`text-sm ${
                                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                                }`}
                              >
                                {alert.message}
                              </span>
                              <span className={`text-xs font-semibold ${getConfidenceColor(alert.confidence)}`}>
                                {alert.confidence} confidence
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Info Section */}
        <div
          className={`rounded-xl shadow-md p-6 mb-6 transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gray-900 border border-gray-800'
              : 'bg-white border border-gray-200'
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}
          >
            Market Pattern Recognition & Trend Analysis
          </h2>
          <p
            className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
          >
            Identify trading patterns, trends, and opportunities using advanced AI-powered
            pattern recognition algorithms.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`border rounded-lg p-4 transition-all ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-800'
                  : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
              }`}
            >
              <h3
                className={`font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}
              >
                Chart Patterns
              </h3>
              <p
                className={`text-sm mb-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Head & Shoulders, Triangles, Flags, and more
              </p>
              <div
                className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
              >
                AI-detected patterns with confidence scores
              </div>
            </div>
            <div
              className={`border rounded-lg p-4 transition-all ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-800'
                  : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
              }`}
            >
              <h3
                className={`font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}
              >
                Trend Analysis
              </h3>
              <p
                className={`text-sm mb-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Uptrends, downtrends, and sideways movements
              </p>
              <div
                className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Real-time trend identification and strength metrics
              </div>
            </div>
            <div
              className={`border rounded-lg p-4 transition-all ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-800'
                  : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
              }`}
            >
              <h3
                className={`font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}
              >
                Support & Resistance
              </h3>
              <p
                className={`text-sm mb-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Key price levels and breakout opportunities
              </p>
              <div
                className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Automated level detection and validation
              </div>
            </div>
          </div>
        </div>

        {user && (
          <div
            className={`rounded-lg p-6 transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gray-900 border border-gray-800'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <p
              className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
            >
              Logged in as:{' '}
              <span
                className={`font-semibold ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {user.email}
              </span>
            </p>
            <p
              className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
            >
              Backend connection verified ✅
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
