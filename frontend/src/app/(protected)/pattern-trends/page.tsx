'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useSearchParams } from 'next/navigation'
import CandlestickChart from '@/components/CandlestickChart'
import { X, Plus, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import StockSearchAutocomplete from '@/components/StockSearchAutocomplete'

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
    startIndex?: number
    endIndex?: number
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
  const [selectedPatternIndex, setSelectedPatternIndex] = useState<number | null>(null)
  const [hoveredPatternIndex, setHoveredPatternIndex] = useState<number | null>(null)

  // Date range controls - Load from localStorage
  const [chartRange, setChartRange] = useState(() => {
    const saved = localStorage.getItem('patternTrendsChartRange')
    return saved ? parseInt(saved) : 7
  })
  const [selectedDate, setSelectedDate] = useState<string>('') // For 1 day view
  const [customFrom, setCustomFrom] = useState(() => {
    const saved = localStorage.getItem('patternTrendsCustomFrom')
    return saved || ''
  })
  const [customTo, setCustomTo] = useState(() => {
    const saved = localStorage.getItem('patternTrendsCustomTo')
    return saved || ''
  })
  const [rangeMode, setRangeMode] = useState<'preset' | 'custom'>(() => {
    const saved = localStorage.getItem('patternTrendsRangeMode')
    return (saved === 'custom' ? 'custom' : 'preset') as 'preset' | 'custom'
  })

  // Save range controls to localStorage
  useEffect(() => {
    localStorage.setItem('patternTrendsChartRange', chartRange.toString())
  }, [chartRange])

  useEffect(() => {
    localStorage.setItem('patternTrendsCustomFrom', customFrom)
  }, [customFrom])

  useEffect(() => {
    localStorage.setItem('patternTrendsCustomTo', customTo)
  }, [customTo])

  useEffect(() => {
    localStorage.setItem('patternTrendsRangeMode', rangeMode)
  }, [rangeMode])

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
      // Reset to 7 days when coming from URL
      setChartRange(7)
      setRangeMode('preset')
      setCustomFrom('')
      setCustomTo('')
      setSelectedDate('')
      // Add to pattern trends if not already there
      handleStockSelect(symbolParam.toUpperCase(), '')
    }
  }, [searchParams])

  // Add stock to pattern trends
  const handleStockSelect = async (ticker: string, name: string) => {
    if (!ticker) {
      setError('Please select a stock from the dropdown.')
      return
    }

    if (!polygonKey) {
      setError('Polygon API key not configured.')
      return
    }

    setError('')
    setLoading(true)
    try {
      const sym = ticker.toUpperCase()

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
      setSelectedSymbol(sym)
      // Reset to 7 days when adding a new stock
      setChartRange(7)
      setRangeMode('preset')
      setCustomFrom('')
      setCustomTo('')
      setSelectedDate('')
    } catch (err: any) {
      console.error('Error adding stock:', err)
      setError(err.message || 'Invalid or unknown stock symbol.')
    } finally {
      setLoading(false)
    }
  }

  const addStock = async () => {
    // Legacy function for button click - will be handled by autocomplete
    if (newSymbol.trim()) {
      handleStockSelect(newSymbol.trim(), '')
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
        setSelectedPatternIndex(null)
        setHoveredPatternIndex(null)
      }
    } catch (err) {
      console.error('Error removing stock:', err)
      setError('Failed to remove stock. Please try again.')
    }
  }

  // Fetch candlestick data
  const fetchCandlestickData = async (symbol: string, specificDate?: string) => {
    if (!polygonKey) {
      setError('Polygon API key not configured.')
      return
    }

    setLoadingAnalysis(true)
    setError('')
    try {
      const now = new Date()
      let from: Date
      
      // Handle intraday data when clicking on a candle
      if (specificDate) {
        const targetDate = specificDate || now.toISOString().split('T')[0]
        setSelectedDate(targetDate)
        
        try {
          // Fetch intraday data (5-minute bars for the day)
          const res = await fetch(
            `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/5/minute/${targetDate}/${targetDate}?adjusted=true&sort=asc&apiKey=${polygonKey}`
          )
          
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: Failed to fetch intraday data`)
          }

          const data = await res.json()
          
          // Check for Polygon API errors in response body
          if (data.status === 'ERROR' || data.error) {
            throw new Error(data.error || 'Polygon API error')
          }
          
          const ohlc = data.results || []

          if (ohlc.length === 0) {
            // Fallback to daily data if no intraday data available
            console.log('No intraday data available, falling back to daily data')
            const dailyRes = await fetch(
              `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${targetDate}/${targetDate}?adjusted=true&sort=asc&apiKey=${polygonKey}`
            )
            
            if (!dailyRes.ok) {
              throw new Error('No data available for this date (market may be closed)')
            }
            
            const dailyData = await dailyRes.json()
            if (dailyData.status === 'ERROR' || dailyData.error) {
              throw new Error(dailyData.error || 'No data available for this date')
            }
            
            const dailyOhlc = dailyData.results || []
            if (dailyOhlc.length === 0) {
              throw new Error('No data available for this date (market may be closed)')
            }
            
            // Use daily data as single candle
            const dailyCandle = dailyOhlc[0]
            const formattedData: CandlestickData[] = [{
              date: new Date(dailyCandle.t).toISOString(),
              open: dailyCandle.o,
              high: dailyCandle.h,
              low: dailyCandle.l,
              close: dailyCandle.c,
              volume: dailyCandle.v,
            }]
            
            setCandlestickData(formattedData)
            setPatternAnalysis(null)
            setLoadingAnalysis(false)
            return
          }

          const formattedData: CandlestickData[] = ohlc.map((d: any) => {
            const date = new Date(d.t)
            return {
              date: date.toISOString(), // Full timestamp for 1 day view
              open: d.o,
              high: d.h,
              low: d.l,
              close: d.c,
              volume: d.v,
            }
          })

          setCandlestickData(formattedData)
          // Don't fetch pattern analysis for 1 day intraday data
          setPatternAnalysis(null)
          setLoadingAnalysis(false)
          return
        } catch (intradayError: any) {
          // If intraday fails, try falling back to daily data
          console.log('Intraday fetch failed, trying daily data fallback:', intradayError.message)
          try {
            const dailyRes = await fetch(
              `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${targetDate}/${targetDate}?adjusted=true&sort=asc&apiKey=${polygonKey}`
            )
            
            if (!dailyRes.ok) {
              throw new Error('No data available for this date (market may be closed)')
            }
            
            const dailyData = await dailyRes.json()
            if (dailyData.status === 'ERROR' || dailyData.error) {
              throw new Error(dailyData.error || 'No data available for this date')
            }
            
            const dailyOhlc = dailyData.results || []
            if (dailyOhlc.length === 0) {
              throw new Error('No data available for this date (market may be closed)')
            }
            
            // Use daily data as single candle
            const dailyCandle = dailyOhlc[0]
            const formattedData: CandlestickData[] = [{
              date: new Date(dailyCandle.t).toISOString(),
              open: dailyCandle.o,
              high: dailyCandle.h,
              low: dailyCandle.l,
              close: dailyCandle.c,
              volume: dailyCandle.v,
            }]
            
            setCandlestickData(formattedData)
            setPatternAnalysis(null)
            setLoadingAnalysis(false)
            return
          } catch (fallbackError: any) {
            // If both fail, throw the original error
            throw new Error(intradayError.message || 'Failed to fetch data for this date')
          }
        }
      }
      
      if (rangeMode === 'custom' && customFrom && customTo) {
        from = new Date(customFrom)
        const toDate = new Date(customTo)
        const fromStr = from.toISOString().split('T')[0]
        const toStr = toDate.toISOString().split('T')[0]
        
        // Use custom range
        const res = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${fromStr}/${toStr}?adjusted=true&sort=asc&apiKey=${polygonKey}`
        )
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to fetch candlestick data`)
        }

        const data = await res.json()
        
        // Check for Polygon API errors in response body
        if (data.status === 'ERROR' || data.error) {
          throw new Error(data.error || 'Failed to fetch candlestick data')
        }
        
        const ohlc = data.results || []

        if (ohlc.length === 0) {
          throw new Error('No data available for this date range')
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
        
        setLoadingAnalysis(false)
        return
      } else {
        // Use preset range
        from = new Date()
        from.setDate(now.getDate() - chartRange)
      }
      
      const fromStr = from.toISOString().split('T')[0]
      const toStr = now.toISOString().split('T')[0]

      const res = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${fromStr}/${toStr}?adjusted=true&sort=asc&apiKey=${polygonKey}`
      )

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch candlestick data`)
      }

      const data = await res.json()
      
      // Check for Polygon API errors in response body
      if (data.status === 'ERROR' || data.error) {
        throw new Error(data.error || 'Failed to fetch candlestick data')
      }
      
      const ohlc = data.results || []

      if (ohlc.length === 0) {
        throw new Error('No data available for this date range')
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
        setSelectedPatternIndex(null)
        setHoveredPatternIndex(null)
    } finally {
      setLoadingAnalysis(false)
    }
  }

  // Reset to 7 days when a new stock is selected
  useEffect(() => {
    if (selectedSymbol) {
      // Only reset if it's a new selection (not from URL param or initial load)
      const lastSymbol = localStorage.getItem('lastSelectedSymbol')
      if (lastSymbol !== selectedSymbol) {
        setChartRange(7)
        setRangeMode('preset')
        setCustomFrom('')
        setCustomTo('')
        setSelectedDate('')
        localStorage.setItem('lastSelectedSymbol', selectedSymbol)
      }
    }
  }, [selectedSymbol])

  // Load data when symbol is selected or date range changes
  useEffect(() => {
    if (selectedSymbol) {
      fetchCandlestickData(selectedSymbol)
    }
  }, [selectedSymbol, chartRange, customFrom, customTo, rangeMode])

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
      className={`min-h-screen transition-colors duration-500 relative overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white'
          : 'bg-gradient-to-b from-white to-[#f0f4ff] text-gray-900'
      }`}
    >
      {/* Animated background elements */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${
        theme === 'dark' ? 'opacity-20' : 'opacity-10'
      }`}>
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl ${
          theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'
        } animate-pulse`} style={{ animationDuration: '4s' }}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl ${
          theme === 'dark' ? 'bg-purple-500' : 'bg-purple-400'
        } animate-pulse`} style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
      </div>
      <div className="relative z-10">
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
            <StockSearchAutocomplete
              value={newSymbol}
              onChange={setNewSymbol}
              onSelect={handleStockSelect}
              placeholder="Enter stock symbol or company name (e.g. AAPL or Apple)"
              disabled={loading}
              polygonKey={polygonKey}
              className="flex-1"
            />
            <button
              onClick={addStock}
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
                    onClick={() => {
                      setSelectedSymbol(stock.symbol)
                      // Reset to 7 days when selecting a stock
                      setChartRange(7)
                      setRangeMode('preset')
                      setCustomFrom('')
                      setCustomTo('')
                      setSelectedDate('')
                    }}
                    className={`font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-[#2d3748]'
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
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}
              >
                {selectedSymbol} - Pattern Analysis
              </h2>
              
              {/* Date Range Selector */}
              <div className="flex flex-wrap gap-2 items-center">
                <label className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>Range:</label>
                <select
                  value={chartRange}
                  onChange={(e) => {
                    const newRange = Number(e.target.value)
                    setChartRange(newRange)
                    setRangeMode('preset')
                    setCustomFrom('')
                    setCustomTo('')
                    setSelectedDate('')
                  }}
                  disabled={rangeMode === 'custom'}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white disabled:opacity-50'
                      : 'bg-white border-gray-300 text-black disabled:opacity-50'
                  }`}
                >
                  <option value={7}>7 Days</option>
                  <option value={30}>30 Days</option>
                  <option value={90}>90 Days</option>
                </select>

                <span className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>or</span>

                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => {
                    const val = e.target.value
                    setCustomFrom(val)
                    if (val && customTo) setRangeMode('custom')
                    else setRangeMode('preset')
                  }}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-black'
                  }`}
                />
                <span>→</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => {
                    const val = e.target.value
                    setCustomTo(val)
                    if (customFrom && val) setRangeMode('custom')
                    else setRangeMode('preset')
                  }}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-black'
                  }`}
                />

                {/* Active Status Display */}
                <span
                  className={`ml-3 text-sm px-3 py-1 rounded-full font-medium ${
                    rangeMode === 'custom'
                      ? theme === 'dark'
                        ? 'bg-purple-700 text-white'
                        : 'bg-purple-200 text-purple-800'
                      : theme === 'dark'
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-200 text-blue-800'
                  }`}
                >
                  {rangeMode === 'custom'
                    ? 'Custom Range Active'
                    : `${chartRange}-Day Preset Active`}
                </span>
              </div>
            </div>

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
                  <div className="mb-6 w-full">
                    {/* Visual indicator when in 1-day view */}
                    {selectedDate && (
                      <div className={`mb-4 p-3 rounded-lg border flex items-center justify-between ${
                        theme === 'dark'
                          ? 'bg-blue-900/30 border-blue-700 text-blue-300'
                          : 'bg-blue-50 border-blue-300 text-blue-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">📊 1-Day Intraday View</span>
                          <span className="text-sm">
                            {new Date(selectedDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedDate('')
                            fetchCandlestickData(selectedSymbol)
                          }}
                          className={`px-3 py-1 rounded text-sm transition-all ${
                            theme === 'dark'
                              ? 'bg-blue-800 hover:bg-blue-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          ← Back to {chartRange}-Day View
                        </button>
                      </div>
                    )}
                    <CandlestickChart 
                      data={candlestickData} 
                      symbol={selectedSymbol} 
                      height={500}
                      isOneDayView={!!selectedDate}
                      onCandleClick={(date) => {
                        // Only allow clicking when not in 1-day view
                        if (!selectedDate) {
                          // When clicking a candle, show intraday data for that date
                          const clickedDate = date.split('T')[0]
                          fetchCandlestickData(selectedSymbol, clickedDate)
                        }
                      }}
                      patternAnalysis={patternAnalysis ? {
                        ...patternAnalysis,
                        patterns: patternAnalysis.patterns.map((pattern, idx) => {
                          // Calculate pattern indices for visualization
                          const patternLength = Math.min(15, Math.floor(candlestickData.length / 3))
                          const startIdx = pattern.startIndex ?? Math.max(0, candlestickData.length - patternLength - idx * 2)
                          const endIdx = pattern.endIndex ?? Math.min(candlestickData.length - 1, candlestickData.length - 1 - idx)
                          return {
                            ...pattern,
                            startIndex: startIdx,
                            endIndex: endIdx
                          }
                        })
                      } : null}
                      selectedPatternIndex={selectedPatternIndex ?? hoveredPatternIndex}
                    />
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
                            theme === 'dark' ? 'text-white' : 'text-[#2d3748]'
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
                            theme === 'dark' ? 'text-white' : 'text-[#2d3748]'
                          }`}
                        >
                          Detected Patterns
                        </h3>
                        <div className="space-y-2">
                          {patternAnalysis.patterns.map((pattern, idx) => {
                            const isSelected = selectedPatternIndex === idx
                            const isHovered = hoveredPatternIndex === idx
                            
                            // Calculate pattern indices for visualization
                            // Patterns are typically detected in recent data, so we'll map them to the last portion of the chart
                            const patternLength = Math.min(15, Math.floor(candlestickData.length / 3))
                            const startIdx = pattern.startIndex ?? Math.max(0, candlestickData.length - patternLength - idx * 2)
                            const endIdx = pattern.endIndex ?? Math.min(candlestickData.length - 1, candlestickData.length - 1 - idx)
                            
                            // Determine predicted outcome based on pattern type
                            const predictedOutcome = pattern.type === 'bullish' 
                              ? 'Potential upward movement expected'
                              : pattern.type === 'bearish'
                              ? 'Potential downward movement expected'
                              : 'Neutral - watch for confirmation'
                            
                            return (
                              <div
                                key={idx}
                                onClick={() => setSelectedPatternIndex(isSelected ? null : idx)}
                                onMouseEnter={() => setHoveredPatternIndex(idx)}
                                onMouseLeave={() => setHoveredPatternIndex(null)}
                                className={`p-3 rounded border cursor-pointer transition-all ${
                                  isSelected
                                    ? theme === 'dark'
                                      ? 'bg-blue-900/30 border-blue-500 ring-2 ring-blue-500'
                                      : 'bg-blue-100 border-blue-500 ring-2 ring-blue-500'
                                    : isHovered
                                    ? theme === 'dark'
                                      ? 'bg-gray-800 border-gray-500'
                                      : 'bg-gray-100 border-gray-300'
                                    : theme === 'dark'
                                    ? 'bg-gray-900 border-gray-600 hover:bg-gray-800'
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span
                                    className={`font-medium ${
                                      theme === 'dark' ? 'text-white' : 'text-[#2d3748]'
                                    }`}
                                  >
                                    {pattern.name}
                                  </span>
                                  <span className={`text-xs font-semibold ${getConfidenceColor(pattern.confidence)}`}>
                                    {pattern.confidence} confidence
                                  </span>
                                </div>
                                <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {pattern.description}
                                </p>
                                {isSelected && (
                                  <div className={`mt-2 p-2 rounded text-xs ${
                                    pattern.type === 'bullish'
                                      ? theme === 'dark'
                                        ? 'bg-green-900/30 border border-green-700 text-green-300'
                                        : 'bg-green-50 border border-green-200 text-green-700'
                                      : pattern.type === 'bearish'
                                      ? theme === 'dark'
                                        ? 'bg-red-900/30 border border-red-700 text-red-300'
                                        : 'bg-red-50 border border-red-200 text-red-700'
                                      : theme === 'dark'
                                      ? 'bg-gray-800 border border-gray-700 text-gray-300'
                                      : 'bg-gray-100 border border-gray-300 text-gray-700'
                                  }`}>
                                    <div className="font-semibold mb-1">Predicted Outcome:</div>
                                    <div>{predictedOutcome}</div>
                                  </div>
                                )}
                                <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                  {isSelected ? 'Click to deselect' : 'Click to view on chart'}
                                </div>
                              </div>
                            )
                          })}
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
                            theme === 'dark' ? 'text-white' : 'text-[#2d3748]'
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
                            theme === 'dark' ? 'text-white' : 'text-[#2d3748]'
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
      </div>
    </main>
  )
}
