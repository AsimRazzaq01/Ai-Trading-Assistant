'use client'

import { useTheme } from '@/context/ThemeContext'

interface CandlestickData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

interface CandlestickChartProps {
  data: CandlestickData[]
  symbol?: string
  height?: number
}

export default function CandlestickChart({ data, symbol, height = 400 }: CandlestickChartProps) {
  const { theme } = useTheme()

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

  // Calculate chart dimensions
  const padding = { top: 20, right: 20, bottom: 40, left: 60 }
  const chartWidth = 800
  const chartHeight = height - padding.top - padding.bottom
  const candleWidth = Math.max(2, (chartWidth - padding.left - padding.right) / data.length - 2)

  // Find min/max for scaling
  const allValues = data.flatMap((d) => [d.high, d.low])
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
    return d.close >= d.open
      ? theme === 'dark'
        ? '#10b981' // green-500
        : '#059669' // green-600
      : theme === 'dark'
        ? '#ef4444' // red-500
        : '#dc2626' // red-600
  }

  return (
    <div
      className={`rounded-lg border overflow-hidden ${
        theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {symbol && (
        <div
          className={`px-4 py-2 border-b ${
            theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'
          }`}
        >
          <h3 className="font-semibold">{symbol}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <svg width={chartWidth + padding.left + padding.right} height={height} className="block">
          {/* Grid lines */}
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
                  stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                  fontSize="12"
                  textAnchor="end"
                >
                  ${price.toFixed(2)}
                </text>
              </g>
            )
          })}

          {/* Candlesticks */}
          {data.map((d, i) => {
            const x = padding.left + (i * (chartWidth - padding.left - padding.right)) / data.length
            const openY = scaleY(d.open)
            const closeY = scaleY(d.close)
            const highY = scaleY(d.high)
            const lowY = scaleY(d.low)
            const isBullish = d.close >= d.open
            const bodyTop = Math.min(openY, closeY)
            const bodyBottom = Math.max(openY, closeY)
            const bodyHeight = Math.max(1, bodyBottom - bodyTop)
            const color = getCandleColor(d)

            return (
              <g key={i}>
                {/* Wick */}
                <line
                  x1={x + candleWidth / 2}
                  y1={highY}
                  x2={x + candleWidth / 2}
                  y2={lowY}
                  stroke={color}
                  strokeWidth="1"
                />
                {/* Body */}
                <rect
                  x={x}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={color}
                  stroke={color}
                  strokeWidth="1"
                />
              </g>
            )
          })}

          {/* X-axis labels (show every nth label) */}
          {data
            .filter((_, i) => i % Math.ceil(data.length / 8) === 0 || i === data.length - 1)
            .map((d, idx, arr) => {
              const i = data.indexOf(d)
              const x = padding.left + (i * (chartWidth - padding.left - padding.right)) / data.length
              return (
                <text
                  key={i}
                  x={x + candleWidth / 2}
                  y={height - padding.bottom + 20}
                  fill={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                  fontSize="10"
                  textAnchor="middle"
                >
                  {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
              )
            })}
        </svg>
      </div>
    </div>
  )
}

