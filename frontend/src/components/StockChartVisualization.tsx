'use client'

import { useTheme } from '@/context/ThemeContext'

export default function StockChartVisualization() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Generate candlestick data
  const candles = Array.from({ length: 20 }, (_, i) => ({
    x: i * 30 + 50,
    open: 100 + Math.sin(i * 0.3) * 20 + i * 2,
    close: 100 + Math.sin(i * 0.3 + 0.1) * 20 + i * 2,
    high: 100 + Math.sin(i * 0.3) * 25 + i * 2,
    low: 100 + Math.sin(i * 0.3) * 15 + i * 2,
  }))

  // Generate line graph points
  const linePoints = Array.from({ length: 30 }, (_, i) => ({
    x: i * 20 + 50,
    y: 200 - (Math.sin(i * 0.2) * 30 + i * 1.5),
  }))

  // Generate glowing nodes
  const nodes = [
    { x: 100, y: 150, delay: 0 },
    { x: 250, y: 120, delay: 0.5 },
    { x: 400, y: 180, delay: 1 },
    { x: 550, y: 100, delay: 1.5 },
  ]

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Glowing background effect */}
      <div className={`absolute inset-0 opacity-20 blur-3xl ${
        isDark ? 'bg-blue-500' : 'bg-blue-400'
      }`} style={{
        animation: 'pulse 4s ease-in-out infinite',
      }} />

      {/* Main chart container */}
      <svg
        width="600"
        height="400"
        viewBox="0 0 600 400"
        className="relative z-10"
        style={{
          filter: isDark ? 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))' : 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.2))',
        }}
      >
        {/* Grid lines */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isDark ? '#3b82f6' : '#2563eb'} stopOpacity="0.8" />
            <stop offset="100%" stopColor={isDark ? '#10b981' : '#059669'} stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#3b82f6' : '#2563eb'} stopOpacity="0.6" />
            <stop offset="100%" stopColor={isDark ? '#10b981' : '#059669'} stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[50, 100, 150, 200, 250, 300, 350].map((y) => (
          <line
            key={y}
            x1="50"
            y1={y}
            x2="550"
            y2={y}
            stroke={isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}
            strokeWidth="1"
          />
        ))}

        {/* Candlestick chart - animated sideways movement */}
        <g className="candlestick-group">
          {candles.map((candle, i) => {
            const isGreen = candle.close > candle.open
            const bodyHeight = Math.abs(candle.close - candle.open)
            const bodyY = Math.min(candle.open, candle.close)
            
            return (
              <g key={i}>
                {/* Wick */}
                <line
                  x1={candle.x}
                  y1={candle.low}
                  x2={candle.x}
                  y2={candle.high}
                  stroke={isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
                  strokeWidth="2"
                />
                {/* Body */}
                <rect
                  x={candle.x - 8}
                  y={bodyY}
                  width="16"
                  height={Math.max(bodyHeight, 2)}
                  fill={isGreen ? (isDark ? '#10b981' : '#059669') : (isDark ? '#ef4444' : '#dc2626')}
                  opacity="0.8"
                  style={{
                    filter: isGreen ? 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.5))' : 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))',
                  }}
                />
              </g>
            )
          })}
        </g>

        {/* Line graph - subtle rising animation */}
        <g className="rise-subtle-group">
          <polyline
            points={linePoints.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))',
            }}
          />
          {/* Glowing dots on line */}
          {linePoints.filter((_, i) => i % 5 === 0).map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={isDark ? '#3b82f6' : '#2563eb'}
              className="glow-dot"
              style={{
                animationDelay: `${i * 0.2}s`,
                filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.8))',
              }}
            />
          ))}
        </g>

        {/* Glowing nodes connected by lines */}
        <g>
          {/* Connection lines */}
          {nodes.slice(0, -1).map((node, i) => {
            const nextNode = nodes[i + 1]
            return (
              <line
                key={`line-${i}`}
                x1={node.x}
                y1={node.y}
                x2={nextNode.x}
                y2={nextNode.y}
                stroke={isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(37, 99, 235, 0.3)'}
                strokeWidth="2"
                strokeDasharray="5,5"
                className="pulse-line"
                style={{
                  animationDelay: `${node.delay}s`,
                }}
              />
            )
          })}
          {/* Nodes */}
          {nodes.map((node, i) => (
            <g key={`node-${i}`}>
              {/* Outer glow */}
              <circle
                cx={node.x}
                cy={node.y}
                r="12"
                fill="url(#glowGradient)"
                opacity="0.4"
                className="pulse-glow-node"
                style={{
                  animationDelay: `${node.delay}s`,
                }}
              />
              {/* Inner node */}
              <circle
                cx={node.x}
                cy={node.y}
                r="6"
                fill={isDark ? '#3b82f6' : '#2563eb'}
                className="pulse-glow-node"
                style={{
                  animationDelay: `${node.delay}s`,
                  filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.8))',
                }}
              />
            </g>
          ))}
        </g>
      </svg>

    </div>
  )
}

