'use client'

import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { Palette, X, BarChart3, LineChart } from 'lucide-react'

interface CandlestickData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

interface PatternAnalysis {
  patterns?: Array<{
    name: string
    type: 'bullish' | 'bearish' | 'neutral'
    confidence: 'high' | 'medium' | 'low'
    description: string
    startIndex?: number
    endIndex?: number
  }>
  trend?: {
    direction: 'uptrend' | 'downtrend' | 'sideways'
    strength: 'strong' | 'moderate' | 'weak'
    description: string
  }
  supportResistance?: {
    support: number[]
    resistance: number[]
    description: string
  }
}

interface ChartColors {
  trendUptrend: string
  trendDowntrend: string
  trendSideways: string
  patternBullish: string
  patternBearish: string
  patternNeutral: string
  support: string
  resistance: string
  bullishCandle: string
  bearishCandle: string
  bollingerUpper: string
  bollingerMiddle: string
  bollingerLower: string
}

type ChartType = 'candlestick' | 'area'

interface CandlestickChartProps {
  data: CandlestickData[]
  symbol?: string
  height?: number
  patternAnalysis?: PatternAnalysis | null
  selectedPatternIndex?: number | null
  isOneDayView?: boolean
  onCandleClick?: (date: string) => void
}

export default function CandlestickChart({ 
  data, 
  symbol, 
  height = 400, 
  patternAnalysis,
  selectedPatternIndex = null,
  isOneDayView = false,
  onCandleClick
}: CandlestickChartProps) {
  const { theme } = useTheme()
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(800)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showTrendColorMenu, setShowTrendColorMenu] = useState(false)
  const [showSupportColorMenu, setShowSupportColorMenu] = useState(false)
  const [showResistanceColorMenu, setShowResistanceColorMenu] = useState(false)
  const [showBollingerColorMenu, setShowBollingerColorMenu] = useState(false)
  const [showBollingerBands, setShowBollingerBands] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showBollingerBands')
      return saved === 'true'
    }
    return false
  })
  const [chartType, setChartType] = useState<ChartType>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chartType')
      return (saved === 'area' || saved === 'candlestick') ? saved : 'candlestick'
    }
    return 'candlestick'
  })

  // Color presets - use consistent colors that work in both themes
  const colorPresets = {
    trend: [
      { name: 'Cyan', value: '#06b6d4' },
      { name: 'Purple', value: '#8b5cf6' },
      { name: 'Blue', value: '#3b82f6' },
      { name: 'Green', value: '#10b981' },
      { name: 'Orange', value: '#f59e0b' },
    ],
    support: [
      { name: 'Green', value: '#10b981' },
      { name: 'Emerald', value: '#059669' },
      { name: 'Teal', value: '#14b8a6' },
      { name: 'Cyan', value: '#06b6d4' },
      { name: 'Blue', value: '#3b82f6' },
      { name: 'Indigo', value: '#6366f1' },
    ],
    resistance: [
      { name: 'Red', value: '#ef4444' },
      { name: 'Orange', value: '#f59e0b' },
      { name: 'Amber', value: '#fbbf24' },
      { name: 'Pink', value: '#ec4899' },
      { name: 'Rose', value: '#f43f5e' },
      { name: 'Magenta', value: '#d946ef' },
    ],
  }
  
  // Default colors based on theme
  const defaultColors: ChartColors = {
    trendUptrend: theme === 'dark' ? '#06b6d4' : '#0891b2',
    trendDowntrend: theme === 'dark' ? '#8b5cf6' : '#7c3aed',
    trendSideways: theme === 'dark' ? '#3b82f6' : '#2563eb',
    patternBullish: theme === 'dark' ? '#10b981' : '#059669',
    patternBearish: theme === 'dark' ? '#ef4444' : '#dc2626',
    patternNeutral: theme === 'dark' ? '#f59e0b' : '#d97706',
    support: theme === 'dark' ? '#10b981' : '#059669',
    resistance: theme === 'dark' ? '#ef4444' : '#dc2626',
    bullishCandle: theme === 'dark' ? '#10b981' : '#059669',
    bearishCandle: theme === 'dark' ? '#ef4444' : '#dc2626',
    bollingerUpper: theme === 'dark' ? '#8b5cf6' : '#7c3aed',
    bollingerMiddle: theme === 'dark' ? '#a78bfa' : '#8b5cf6',
    bollingerLower: theme === 'dark' ? '#8b5cf6' : '#7c3aed',
  }

  // Load custom colors from localStorage
  const [colors, setColors] = useState<ChartColors>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chartColors')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          return { ...defaultColors, ...parsed }
        } catch (e) {
          return defaultColors
        }
      }
    }
    return defaultColors
  })

  // Update colors when theme changes
  useEffect(() => {
    const currentDefaultColors: ChartColors = {
      trendUptrend: theme === 'dark' ? '#06b6d4' : '#0891b2',
      trendDowntrend: theme === 'dark' ? '#8b5cf6' : '#7c3aed',
      trendSideways: theme === 'dark' ? '#3b82f6' : '#2563eb',
      patternBullish: theme === 'dark' ? '#10b981' : '#059669',
      patternBearish: theme === 'dark' ? '#ef4444' : '#dc2626',
      patternNeutral: theme === 'dark' ? '#f59e0b' : '#d97706',
      support: theme === 'dark' ? '#10b981' : '#059669',
      resistance: theme === 'dark' ? '#ef4444' : '#dc2626',
      bullishCandle: theme === 'dark' ? '#10b981' : '#059669',
      bearishCandle: theme === 'dark' ? '#ef4444' : '#dc2626',
      bollingerUpper: theme === 'dark' ? '#8b5cf6' : '#7c3aed',
      bollingerMiddle: theme === 'dark' ? '#a78bfa' : '#8b5cf6',
      bollingerLower: theme === 'dark' ? '#8b5cf6' : '#7c3aed',
    }
    
    const saved = localStorage.getItem('chartColors')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setColors({ ...currentDefaultColors, ...parsed })
      } catch (e) {
        setColors(currentDefaultColors)
      }
    } else {
      setColors(currentDefaultColors)
    }
  }, [theme])

  // Save colors to localStorage
  useEffect(() => {
    localStorage.setItem('chartColors', JSON.stringify(colors))
  }, [colors])

  // Save chart type to localStorage
  useEffect(() => {
    localStorage.setItem('chartType', chartType)
  }, [chartType])

  // Save Bollinger Bands toggle to localStorage
  useEffect(() => {
    localStorage.setItem('showBollingerBands', showBollingerBands.toString())
  }, [showBollingerBands])

  // Close color menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.color-menu-container')) {
        setShowTrendColorMenu(false)
        setShowSupportColorMenu(false)
        setShowResistanceColorMenu(false)
        setShowBollingerColorMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Calculate Bollinger Bands - return bands for all data points
  const calculateBollingerBands = (period: number = 20, stdDev: number = 2) => {
    if (data.length < period) {
      // For data with less than period points, calculate with available data
      const bands: Array<{ upper: number; middle: number; lower: number; index: number }> = []
      
      for (let i = 0; i < data.length; i++) {
        // Use available data up to current point
        const availablePeriod = Math.min(period, i + 1)
        const slice = data.slice(Math.max(0, i - availablePeriod + 1), i + 1)
        const sma = slice.reduce((sum, d) => sum + d.close, 0) / availablePeriod
        
        // Calculate standard deviation
        const variance = slice.reduce((sum, d) => sum + Math.pow(d.close - sma, 2), 0) / availablePeriod
        const sd = Math.sqrt(variance)
        
        bands.push({
          upper: sma + (stdDev * sd),
          middle: sma,
          lower: sma - (stdDev * sd),
          index: i,
        })
      }
      
      return bands
    }
    
    const bands: Array<{ upper: number; middle: number; lower: number; index: number }> = []
    
    // Calculate for first period-1 points using available data
    for (let i = 0; i < period - 1; i++) {
      const slice = data.slice(0, i + 1)
      const sma = slice.reduce((sum, d) => sum + d.close, 0) / slice.length
      const variance = slice.reduce((sum, d) => sum + Math.pow(d.close - sma, 2), 0) / slice.length
      const sd = Math.sqrt(variance)
      
      bands.push({
        upper: sma + (stdDev * sd),
        middle: sma,
        lower: sma - (stdDev * sd),
        index: i,
      })
    }
    
    // Calculate for remaining points with full period
    for (let i = period - 1; i < data.length; i++) {
      // Calculate SMA (middle band)
      const slice = data.slice(i - period + 1, i + 1)
      const sma = slice.reduce((sum, d) => sum + d.close, 0) / period
      
      // Calculate standard deviation
      const variance = slice.reduce((sum, d) => sum + Math.pow(d.close - sma, 2), 0) / period
      const sd = Math.sqrt(variance)
      
      // Calculate bands
      bands.push({
        upper: sma + (stdDev * sd),
        middle: sma,
        lower: sma - (stdDev * sd),
        index: i,
      })
    }
    
    return bands
  }

  // Measure container width
  useEffect(() => {
    const updateWidth = () => {
      if (chartContainerRef.current) {
        const width = chartContainerRef.current.offsetWidth
        // Use full width minus padding, with a minimum of 800px
        setContainerWidth(Math.max(width - 40, 800))
      }
    }

    // Initial measurement
    updateWidth()
    
    // Use ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(updateWidth)
    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current)
    }
    
    window.addEventListener('resize', updateWidth)
    return () => {
      window.removeEventListener('resize', updateWidth)
      resizeObserver.disconnect()
    }
  }, [])

  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border ${
          theme === 'dark'
            ? 'bg-gray-900 border-gray-700 text-gray-400'
            : 'bg-gray-50 border-gray-200 text-gray-600'
        }`}
        style={{ height }}
      >
        No data available
      </div>
    )
  }

  // Calculate chart dimensions - increased right padding for price labels
  const padding = { top: 20, right: 80, bottom: 40, left: 60 }
  // chartWidth is the actual plotting area (excluding padding)
  const chartWidth = Math.max(containerWidth - padding.left - padding.right, 660) // Min 660px for plotting area
  const chartHeight = height - padding.top - padding.bottom
  
  // Calculate spacing between candles - ensure minimum spacing to prevent overlap
  // Use a more robust calculation that works for all data ranges
  const minCandleSpacing = 4 // Minimum pixels between candles (increased for better separation)
  const maxCandleWidth = 10 // Maximum candle width
  const minCandleWidth = 3 // Minimum candle width for visibility
  const availableWidth = chartWidth
  
  // Calculate spacing: ensure candles fit within chart bounds
  // First candle center at 0.5 * spacing, last candle center at (data.length - 0.5) * spacing
  // Total width used: (data.length - 1) * spacing
  // To fit within availableWidth: (data.length - 1) * spacing <= availableWidth
  const maxSpacing = data.length > 1 ? availableWidth / (data.length - 1) : availableWidth
  const spacingPerCandle = maxSpacing
  
  // Calculate candle width: leave space for gaps between candles
  const calculatedWidth = spacingPerCandle - minCandleSpacing
  const candleWidth = Math.min(maxCandleWidth, Math.max(minCandleWidth, calculatedWidth))
  
  // Final spacing: use spacingPerCandle which ensures candles fit within bounds
  // First candle at padding.left + 0.5 * spacingPerCandle
  // Last candle at padding.left + (data.length - 0.5) * spacingPerCandle
  // This ensures: last candle center <= padding.left + availableWidth (since (data.length - 0.5) * spacingPerCandle <= (data.length - 1) * spacingPerCandle <= availableWidth)
  const candleSpacing = spacingPerCandle

  // Calculate Bollinger Bands if enabled - only show in 1-day view
  const shouldShowBollingerBands = showBollingerBands && isOneDayView
  const bollingerBands = shouldShowBollingerBands ? calculateBollingerBands(20, 2) : []
  
  // Find min/max for scaling (include Bollinger Bands if shown)
  let allValues = data.flatMap((d) => [d.high, d.low])
  if (shouldShowBollingerBands && bollingerBands.length > 0) {
    const bbValues = bollingerBands.flatMap((bb) => [bb.upper, bb.lower])
    allValues = [...allValues, ...bbValues]
  }
  const minPrice = Math.min(...allValues)
  const maxPrice = Math.max(...allValues)
  const priceRange = maxPrice - minPrice || 1
  const pricePadding = priceRange * 0.1

  const scaleY = (price: number) => {
    return (
      padding.top +
      chartHeight -
      ((price - minPrice + pricePadding) / (priceRange + pricePadding * 2)) * chartHeight
    )
  }

  const getCandleColor = (d: CandlestickData) => {
    return d.close >= d.open ? colors.bullishCandle : colors.bearishCandle
  }

  const updateColor = (key: keyof ChartColors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div
      ref={chartContainerRef}
      className={`rounded-lg border overflow-hidden relative ${
        theme === 'dark' 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-300 shadow-sm'
      }`}
    >
      <div
        className={`px-4 py-2 border-b flex items-center justify-between ${
          theme === 'dark' 
            ? 'border-gray-700 text-white bg-gray-900' 
            : 'border-gray-300 text-gray-900 bg-white'
        }`}
      >
        {symbol && <h3 className="font-semibold">{symbol}</h3>}
        
        <div className="flex items-center gap-4 ml-6">
          {/* Chart Type Toggle */}
          <div className={`flex items-center rounded-lg border ${
            theme === 'dark' 
              ? 'border-gray-700 bg-gray-800' 
              : 'border-gray-300 bg-gray-100'
          }`}>
            <button
              onClick={() => setChartType('candlestick')}
              className={`px-3 py-1.5 rounded-l-lg transition-all flex items-center gap-1.5 text-sm ${
                chartType === 'candlestick'
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              title="Candlestick Chart"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Candles</span>
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded-r-lg transition-all flex items-center gap-1.5 text-sm ${
                chartType === 'area'
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              title="Area Chart"
            >
              <LineChart className="w-4 h-4" />
              <span>Area</span>
            </button>
          </div>
        </div>
        
        {/* Indicators Toggle and Legend */}
        <div className="flex items-center gap-4 text-xs ml-auto">
          {/* Bollinger Bands Toggle - Only show in 1-day view */}
          {isOneDayView && (
            <label className={`flex items-center gap-2 cursor-pointer ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <input
                type="checkbox"
                checked={showBollingerBands}
                onChange={(e) => setShowBollingerBands(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span>Bollinger Bands</span>
            </label>
          )}
          
          {/* Legend with clickable color options */}
          {(patternAnalysis?.supportResistance || patternAnalysis?.trend || selectedPatternIndex !== null || shouldShowBollingerBands) && (
            <div className="flex items-center gap-4">
              {patternAnalysis?.trend && (
                <div className="flex items-center gap-1 relative color-menu-container">
                <div 
                  className="w-3 h-0.5"
                  style={{ 
                    borderTop: `2.5px dashed ${
                      patternAnalysis.trend.direction === 'uptrend' 
                        ? colors.trendUptrend 
                        : patternAnalysis.trend.direction === 'downtrend'
                        ? colors.trendDowntrend
                        : colors.trendSideways
                    }` 
                  }}
                />
                <button
                  onClick={() => {
                    setShowTrendColorMenu(!showTrendColorMenu)
                    setShowSupportColorMenu(false)
                    setShowResistanceColorMenu(false)
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-opacity-20 ${
                    theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>Trend</span>
                  <Palette className="w-3 h-3" />
                </button>
                {showTrendColorMenu && (
                  <div className={`absolute top-full right-0 mt-1 z-50 rounded-lg border shadow-xl p-2 min-w-[180px] color-menu-container ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    {/* Custom Color Picker */}
                    <div className={`mb-2 pb-2 border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                      <label className={`text-xs font-medium mb-1 block ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Custom Color:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={
                            patternAnalysis?.trend?.direction === 'uptrend'
                              ? colors.trendUptrend
                              : patternAnalysis?.trend?.direction === 'downtrend'
                              ? colors.trendDowntrend
                              : colors.trendSideways
                          }
                          onChange={(e) => {
                            if (patternAnalysis?.trend) {
                              if (patternAnalysis.trend.direction === 'uptrend') {
                                updateColor('trendUptrend', e.target.value)
                              } else if (patternAnalysis.trend.direction === 'downtrend') {
                                updateColor('trendDowntrend', e.target.value)
                              } else {
                                updateColor('trendSideways', e.target.value)
                              }
                            }
                          }}
                          className="w-12 h-8 rounded cursor-pointer border border-gray-600"
                        />
                        <span className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Pick color
                        </span>
                      </div>
                    </div>
                    {/* Preset Colors */}
                    <div className="text-xs font-medium mb-1 text-gray-400">Presets:</div>
                    {colorPresets.trend.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          if (patternAnalysis?.trend) {
                            if (patternAnalysis.trend.direction === 'uptrend') {
                              updateColor('trendUptrend', preset.value)
                            } else if (patternAnalysis.trend.direction === 'downtrend') {
                              updateColor('trendDowntrend', preset.value)
                            } else {
                              updateColor('trendSideways', preset.value)
                            }
                          }
                          setShowTrendColorMenu(false)
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-xs flex items-center gap-2 hover:bg-opacity-20 ${
                          theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.value }} />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                </div>
              )}
              {patternAnalysis?.supportResistance && patternAnalysis.supportResistance.support.length > 0 && (
                <div className="flex items-center gap-1 relative color-menu-container">
                  <div className="w-3 h-0.5" style={{ backgroundColor: colors.support }} />
                  <button
                    onClick={() => {
                      setShowSupportColorMenu(!showSupportColorMenu)
                      setShowTrendColorMenu(false)
                      setShowResistanceColorMenu(false)
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-opacity-20 ${
                      theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>Support</span>
                    <Palette className="w-3 h-3" />
                  </button>
                  {showSupportColorMenu && (
                  <div className={`absolute top-full right-0 mt-1 z-50 rounded-lg border shadow-xl p-2 min-w-[180px] color-menu-container ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    {/* Custom Color Picker */}
                    <div className={`mb-2 pb-2 border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                      <label className={`text-xs font-medium mb-1 block ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Custom Color:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={colors.support}
                          onChange={(e) => {
                            updateColor('support', e.target.value)
                          }}
                          className="w-12 h-8 rounded cursor-pointer border border-gray-600"
                        />
                        <span className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Pick color
                        </span>
                      </div>
                    </div>
                    {/* Preset Colors */}
                    <div className="text-xs font-medium mb-1 text-gray-400">Presets:</div>
                    {colorPresets.support.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          updateColor('support', preset.value)
                          setShowSupportColorMenu(false)
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-xs flex items-center gap-2 hover:bg-opacity-20 ${
                          theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.value }} />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                  )}
                </div>
              )}
              {patternAnalysis?.supportResistance && patternAnalysis.supportResistance.resistance.length > 0 && (
                <div className="flex items-center gap-1 relative color-menu-container">
                  <div className="w-3 h-0.5" style={{ backgroundColor: colors.resistance }} />
                  <button
                    onClick={() => {
                      setShowResistanceColorMenu(!showResistanceColorMenu)
                      setShowTrendColorMenu(false)
                      setShowSupportColorMenu(false)
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-opacity-20 ${
                      theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>Resistance</span>
                    <Palette className="w-3 h-3" />
                  </button>
                  {showResistanceColorMenu && (
                  <div className={`absolute top-full right-0 mt-1 z-50 rounded-lg border shadow-xl p-2 min-w-[180px] color-menu-container ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    {/* Custom Color Picker */}
                    <div className={`mb-2 pb-2 border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                      <label className={`text-xs font-medium mb-1 block ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Custom Color:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={colors.resistance}
                          onChange={(e) => {
                            updateColor('resistance', e.target.value)
                          }}
                          className="w-12 h-8 rounded cursor-pointer border border-gray-600"
                        />
                        <span className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Pick color
                        </span>
                      </div>
                    </div>
                    {/* Preset Colors */}
                    <div className="text-xs font-medium mb-1 text-gray-400">Presets:</div>
                    {colorPresets.resistance.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          updateColor('resistance', preset.value)
                          setShowResistanceColorMenu(false)
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-xs flex items-center gap-2 hover:bg-opacity-20 ${
                          theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.value }} />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                  )}
                </div>
              )}
              {selectedPatternIndex !== null && patternAnalysis?.patterns && patternAnalysis.patterns[selectedPatternIndex] && (
                <div className="flex items-center gap-1">
                  <div 
                  className="w-3 h-1"
                  style={{ 
                    backgroundColor: patternAnalysis.patterns[selectedPatternIndex].type === 'bullish'
                      ? colors.patternBullish
                      : patternAnalysis.patterns[selectedPatternIndex].type === 'bearish'
                      ? colors.patternBearish
                      : colors.patternNeutral
                  }}
                />
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Pattern
                </span>
                </div>
              )}
              {shouldShowBollingerBands && (
                <div className="flex items-center gap-1 relative color-menu-container">
                  <div className="w-3 h-0.5" style={{ backgroundColor: colors.bollingerMiddle }} />
                  <button
                    onClick={() => {
                      setShowBollingerColorMenu(!showBollingerColorMenu)
                      setShowTrendColorMenu(false)
                      setShowSupportColorMenu(false)
                      setShowResistanceColorMenu(false)
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-opacity-20 ${
                      theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>Bollinger</span>
                    <Palette className="w-3 h-3" />
                  </button>
                  {showBollingerColorMenu && (
                  <div className={`absolute top-full right-0 mt-1 z-50 rounded-lg border shadow-xl p-2 min-w-[180px] color-menu-container ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    {/* Custom Color Pickers */}
                    <div className="mb-2 pb-2 space-y-2">
                      <div>
                        <label className={`text-xs font-medium mb-1 block ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Upper Band:
                        </label>
                        <input
                          type="color"
                          value={colors.bollingerUpper}
                          onChange={(e) => updateColor('bollingerUpper', e.target.value)}
                          className="w-full h-8 rounded cursor-pointer border border-gray-600"
                        />
                      </div>
                      <div>
                        <label className={`text-xs font-medium mb-1 block ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Middle Band:
                        </label>
                        <input
                          type="color"
                          value={colors.bollingerMiddle}
                          onChange={(e) => updateColor('bollingerMiddle', e.target.value)}
                          className="w-full h-8 rounded cursor-pointer border border-gray-600"
                        />
                      </div>
                      <div>
                        <label className={`text-xs font-medium mb-1 block ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Lower Band:
                        </label>
                        <input
                          type="color"
                          value={colors.bollingerLower}
                          onChange={(e) => updateColor('bollingerLower', e.target.value)}
                          className="w-full h-8 rounded cursor-pointer border border-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Color Picker Panel */}
      {showColorPicker && (
        <div
          className={`absolute top-12 right-4 z-50 rounded-lg border shadow-xl p-4 w-64 ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Chart Colors
            </h4>
            <button
              onClick={() => setShowColorPicker(false)}
              className={`p-1 rounded ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <div>
              <label className={`text-xs font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Trend Lines
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Uptrend</span>
                  <input
                    type="color"
                    value={colors.trendUptrend}
                    onChange={(e) => updateColor('trendUptrend', e.target.value)}
                    className="w-12 h-6 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Downtrend</span>
                  <input
                    type="color"
                    value={colors.trendDowntrend}
                    onChange={(e) => updateColor('trendDowntrend', e.target.value)}
                    className="w-12 h-6 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Sideways</span>
                  <input
                    type="color"
                    value={colors.trendSideways}
                    onChange={(e) => updateColor('trendSideways', e.target.value)}
                    className="w-12 h-6 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={`text-xs font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Pattern Lines
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Bullish</span>
                  <input
                    type="color"
                    value={colors.patternBullish}
                    onChange={(e) => updateColor('patternBullish', e.target.value)}
                    className="w-12 h-6 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Bearish</span>
                  <input
                    type="color"
                    value={colors.patternBearish}
                    onChange={(e) => updateColor('patternBearish', e.target.value)}
                    className="w-12 h-6 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Neutral</span>
                  <input
                    type="color"
                    value={colors.patternNeutral}
                    onChange={(e) => updateColor('patternNeutral', e.target.value)}
                    className="w-12 h-6 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={`text-xs font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Support & Resistance
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Support</span>
                  <input
                    type="color"
                    value={colors.support}
                    onChange={(e) => updateColor('support', e.target.value)}
                    className="w-12 h-6 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Resistance</span>
                  <input
                    type="color"
                    value={colors.resistance}
                    onChange={(e) => updateColor('resistance', e.target.value)}
                    className="w-12 h-6 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={`text-xs font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Candlesticks
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Bullish</span>
                  <input
                    type="color"
                    value={colors.bullishCandle}
                    onChange={(e) => updateColor('bullishCandle', e.target.value)}
                    className="w-12 h-6 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Bearish</span>
                  <input
                    type="color"
                    value={colors.bearishCandle}
                    onChange={(e) => updateColor('bearishCandle', e.target.value)}
                    className="w-12 h-6 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setColors(defaultColors)
                localStorage.removeItem('chartColors')
              }}
              className={`w-full mt-3 px-3 py-2 rounded text-xs font-medium transition-all ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      <div className={`overflow-x-auto w-full ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <svg 
          width={chartWidth + padding.left + padding.right} 
          height={height} 
          className="block"
        >
          {/* Chart background area - TradingView style */}
          <rect
            x={padding.left}
            y={padding.top}
            width={chartWidth}
            height={chartHeight}
            fill={theme === 'dark' ? '#131722' : '#ffffff'}
            rx="0"
          />
          
          {/* Subtle border around chart area for definition */}
          <rect
            x={padding.left}
            y={padding.top}
            width={chartWidth}
            height={chartHeight}
            fill="none"
            stroke={theme === 'dark' ? '#2a2e39' : '#e5e7eb'}
            strokeWidth="1"
            opacity={theme === 'dark' ? '0.5' : '1'}
          />
          
          {/* Grid lines - TradingView style */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + chartHeight * (1 - ratio)
            const price = minPrice + priceRange * ratio
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth + padding.left}
                  y2={y}
                  stroke={theme === 'dark' ? '#2a2e39' : '#e5e7eb'}
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  opacity={theme === 'dark' ? '0.5' : '0.8'}
                />
                <text
                  x={padding.left - 12}
                  y={y + 4}
                  fill={theme === 'dark' ? '#868993' : '#6b7280'}
                  fontSize="11"
                  textAnchor="end"
                  fontWeight="400"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  ${price.toFixed(2)}
                </text>
              </g>
            )
          })}
          
          {/* Vertical grid lines for better readability */}
          {data
            .filter((_, i) => i % Math.ceil(data.length / 8) === 0 || i === data.length - 1)
            .map((d, idx) => {
              const i = data.indexOf(d)
              const x = padding.left + (i + 0.5) * candleSpacing
              return (
                <line
                  key={`vgrid-${i}`}
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + chartHeight}
                  stroke={theme === 'dark' ? '#2a2e39' : '#e5e7eb'}
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  opacity={theme === 'dark' ? '0.3' : '0.5'}
                />
              )
            })}

          {/* Support & Resistance Lines */}
          {patternAnalysis?.supportResistance && (
            <>
              {patternAnalysis.supportResistance.support.map((level, idx) => {
                const y = scaleY(level)
                return (
                  <g key={`support-${idx}`}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth + padding.left}
                      y2={y}
                      stroke={colors.support}
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      opacity="0.7"
                    />
                    <text
                      x={padding.left - 5}
                      y={y - 5}
                      fill={colors.support}
                      fontSize="10"
                      textAnchor="end"
                      fontWeight="600"
                    >
                      S{idx + 1}
                    </text>
                    <text
                      x={chartWidth + padding.left + 8}
                      y={y - 5}
                      fill={colors.support}
                      fontSize="10"
                      fontWeight="600"
                    >
                      ${level.toFixed(2)}
                    </text>
                  </g>
                )
              })}
              {patternAnalysis.supportResistance.resistance.map((level, idx) => {
                const y = scaleY(level)
                return (
                  <g key={`resistance-${idx}`}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth + padding.left}
                      y2={y}
                      stroke={colors.resistance}
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      opacity="0.7"
                    />
                    <text
                      x={padding.left - 5}
                      y={y - 5}
                      fill={colors.resistance}
                      fontSize="10"
                      textAnchor="end"
                      fontWeight="600"
                    >
                      R{idx + 1}
                    </text>
                    <text
                      x={chartWidth + padding.left + 8}
                      y={y - 5}
                      fill={colors.resistance}
                      fontSize="10"
                      fontWeight="600"
                    >
                      ${level.toFixed(2)}
                    </text>
                  </g>
                )
              })}
            </>
          )}

          {/* Bollinger Bands - Only show in 1-day view and properly aligned */}
          {shouldShowBollingerBands && bollingerBands.length > 0 && (
            <>
              {/* Upper Band */}
              <path
                d={`M ${padding.left + (bollingerBands[0].index + 0.5) * candleSpacing},${scaleY(bollingerBands[0].upper)} ${bollingerBands.slice(1).map((bb) => {
                  const x = padding.left + (bb.index + 0.5) * candleSpacing
                  return `L ${x},${scaleY(bb.upper)}`
                }).join(' ')}`}
                fill="none"
                stroke={colors.bollingerUpper}
                strokeWidth="1.5"
                strokeDasharray="4,4"
                opacity="0.8"
              />
              {/* Middle Band (SMA) */}
              <path
                d={`M ${padding.left + (bollingerBands[0].index + 0.5) * candleSpacing},${scaleY(bollingerBands[0].middle)} ${bollingerBands.slice(1).map((bb) => {
                  const x = padding.left + (bb.index + 0.5) * candleSpacing
                  return `L ${x},${scaleY(bb.middle)}`
                }).join(' ')}`}
                fill="none"
                stroke={colors.bollingerMiddle}
                strokeWidth="1.5"
                strokeDasharray="2,2"
                opacity="0.7"
              />
              {/* Lower Band */}
              <path
                d={`M ${padding.left + (bollingerBands[0].index + 0.5) * candleSpacing},${scaleY(bollingerBands[0].lower)} ${bollingerBands.slice(1).map((bb) => {
                  const x = padding.left + (bb.index + 0.5) * candleSpacing
                  return `L ${x},${scaleY(bb.lower)}`
                }).join(' ')}`}
                fill="none"
                stroke={colors.bollingerLower}
                strokeWidth="1.5"
                strokeDasharray="4,4"
                opacity="0.8"
              />
              {/* Fill area between upper and lower bands */}
              <defs>
                <linearGradient id="bollingerFill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={colors.bollingerUpper} stopOpacity="0.1" />
                  <stop offset="100%" stopColor={colors.bollingerLower} stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <path
                d={`M ${padding.left + (bollingerBands[0].index + 0.5) * candleSpacing},${scaleY(bollingerBands[0].upper)} ${bollingerBands.map((bb) => {
                  const x = padding.left + (bb.index + 0.5) * candleSpacing
                  return `L ${x},${scaleY(bb.upper)}`
                }).slice(1).join(' ')} ${[...bollingerBands].reverse().map((bb) => {
                  const x = padding.left + (bb.index + 0.5) * candleSpacing
                  return `L ${x},${scaleY(bb.lower)}`
                }).join(' ')} Z`}
                fill="url(#bollingerFill)"
                opacity="0.3"
              />
            </>
          )}

          {/* Trend Line - Use blue/cyan color to distinguish from pattern lines */}
          {patternAnalysis?.trend && data.length > 0 && (
            (() => {
              // Calculate trend line based on trend direction
              const firstPrice = data[0].close
              const lastPrice = data[data.length - 1].close
              const firstX = padding.left
              const lastX = chartWidth + padding.left
              const firstY = scaleY(firstPrice)
              const lastY = scaleY(lastPrice)
              
              // Use custom colors for trend line
              let trendColor = colors.trendSideways
              if (patternAnalysis.trend.direction === 'uptrend') {
                trendColor = colors.trendUptrend
              } else if (patternAnalysis.trend.direction === 'downtrend') {
                trendColor = colors.trendDowntrend
              }
              
              return (
                <line
                  x1={firstX}
                  y1={firstY}
                  x2={lastX}
                  y2={lastY}
                  stroke={trendColor}
                  strokeWidth="2.5"
                  strokeDasharray="8,4"
                  opacity="0.8"
                />
              )
            })()
          )}

          {/* Pattern Trend Lines (for selected pattern) - Use distinct colors from trend line */}
          {selectedPatternIndex !== null && 
           patternAnalysis?.patterns && 
           patternAnalysis.patterns[selectedPatternIndex] && 
           data.length > 0 && (
            (() => {
              const pattern = patternAnalysis.patterns[selectedPatternIndex]
              const startIdx = pattern.startIndex ?? Math.max(0, data.length - 20)
              const endIdx = pattern.endIndex ?? data.length - 1
              
              if (startIdx >= data.length || endIdx >= data.length) return null
              
              // Use the same spacing calculation as candlesticks
              const startX = padding.left + (startIdx + 0.5) * candleSpacing
              const endX = padding.left + (endIdx + 0.5) * candleSpacing
              const startY = scaleY(data[startIdx].close)
              const endY = scaleY(data[endIdx].close)
              
              // Use custom colors for pattern lines
              const patternColor = pattern.type === 'bullish' 
                ? colors.patternBullish
                : pattern.type === 'bearish'
                ? colors.patternBearish
                : colors.patternNeutral
              
              return (
                <g>
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={patternColor}
                    strokeWidth="3.5"
                    opacity="0.9"
                    strokeDasharray="0"
                  />
                  {/* Pattern label with background for better visibility */}
                  <rect
                    x={endX + 3}
                    y={endY - 18}
                    width={pattern.name.length * 7 + 6}
                    height={16}
                    fill={theme === 'dark' ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)'}
                    rx="3"
                  />
                  <text
                    x={endX + 6}
                    y={endY - 5}
                    fill={patternColor}
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {pattern.name}
                  </text>
                </g>
              )
            })()
          )}

          {/* Area Chart */}
          {chartType === 'area' && data.length > 0 && (
            <>
              {/* Area fill with gradient - TradingView style */}
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={colors.bullishCandle} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={colors.bullishCandle} stopOpacity="0.05" />
                </linearGradient>
              </defs>
              
              {/* Area path */}
              <path
                d={`M ${padding.left + 0.5 * candleSpacing},${scaleY(data[0].close)} ${data.map((d, i) => {
                  const x = padding.left + (i + 0.5) * candleSpacing
                  const y = scaleY(d.close)
                  return `L ${x},${y}`
                }).join(' ')} L ${padding.left + (data.length - 0.5) * candleSpacing},${padding.top + chartHeight} L ${padding.left + 0.5 * candleSpacing},${padding.top + chartHeight} Z`}
                fill="url(#areaGradient)"
                stroke="none"
              />
              
              {/* Line - TradingView style */}
              <path
                d={`M ${padding.left + 0.5 * candleSpacing},${scaleY(data[0].close)} ${data.map((d, i) => {
                  const x = padding.left + (i + 0.5) * candleSpacing
                  const y = scaleY(d.close)
                  return `L ${x},${y}`
                }).join(' ')}`}
                fill="none"
                stroke={colors.bullishCandle}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Candlesticks */}
          {chartType === 'candlestick' && data.map((d, i) => {
            // Calculate x position: center each candle in its allocated space
            // Start from padding.left, then add (i + 0.5) * spacing to center the candle
            const x = padding.left + (i + 0.5) * candleSpacing - candleWidth / 2
            const openY = scaleY(d.open)
            const closeY = scaleY(d.close)
            const highY = scaleY(d.high)
            const lowY = scaleY(d.low)
            const isBullish = d.close >= d.open
            const bodyTop = Math.min(openY, closeY)
            const bodyBottom = Math.max(openY, closeY)
            const bodyHeight = Math.max(1, bodyBottom - bodyTop)
            const color = getCandleColor(d)
            const candleCenterX = padding.left + (i + 0.5) * candleSpacing

            return (
              <g 
                key={i}
                style={{ cursor: onCandleClick ? 'pointer' : 'default' }}
                onClick={() => {
                  if (onCandleClick && !isOneDayView) {
                    onCandleClick(d.date)
                  }
                }}
              >
                {/* Wick - make it more visible and professional */}
                <line
                  x1={candleCenterX}
                  y1={highY}
                  x2={candleCenterX}
                  y2={lowY}
                  stroke={color}
                  strokeWidth={theme === 'dark' ? '1.5' : '2'}
                  opacity={theme === 'dark' ? '1' : '1'}
                  strokeLinecap="round"
                />
                {/* Body - more professional appearance */}
                <rect
                  x={x}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={color}
                  stroke={isBullish 
                    ? (theme === 'dark' ? '#059669' : '#10b981') 
                    : (theme === 'dark' ? '#b91c1c' : '#ef4444')}
                  strokeWidth={theme === 'dark' ? '0.5' : '1'}
                  rx="2"
                  opacity={theme === 'dark' ? '1' : '1'}
                />
              </g>
            )
          })}

          {/* X-axis labels (show every nth label) */}
          {data
            .filter((_, i) => i % Math.ceil(data.length / 8) === 0 || i === data.length - 1)
            .map((d, idx, arr) => {
              const i = data.indexOf(d)
              // Use the same spacing calculation as candlesticks
              const x = padding.left + (i + 0.5) * candleSpacing
              
              // Format date based on view type
              let dateLabel = ''
              if (isOneDayView) {
                // Show hour for 1 day view
                try {
                  const date = new Date(d.date)
                  // Check if date is valid
                  if (!isNaN(date.getTime())) {
                    dateLabel = date.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })
                  } else {
                    // Fallback: try parsing as ISO string or date string
                    const parsedDate = d.date.includes('T') ? new Date(d.date) : new Date(d.date + 'T00:00:00')
                    if (!isNaN(parsedDate.getTime())) {
                      dateLabel = parsedDate.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })
                    } else {
                      dateLabel = d.date.split('T')[1]?.substring(0, 5) || d.date
                    }
                  }
                } catch (e) {
                  // If parsing fails, show the raw time part if available
                  const timeMatch = d.date.match(/T(\d{2}):(\d{2})/)
                  if (timeMatch) {
                    const hour = parseInt(timeMatch[1])
                    const minute = timeMatch[2]
                    const period = hour >= 12 ? 'PM' : 'AM'
                    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)
                    dateLabel = `${displayHour}:${minute} ${period}`
                  } else {
                    dateLabel = d.date
                  }
                }
              } else {
                // Show date for multi-day view
                dateLabel = new Date(d.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })
              }
              
              return (
                <text
                  key={i}
                  x={x}
                  y={height - padding.bottom + 20}
                  fill={theme === 'dark' ? '#868993' : '#6b7280'}
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="400"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {dateLabel}
                </text>
              )
            })}
        </svg>
      </div>
    </div>
  )
}

