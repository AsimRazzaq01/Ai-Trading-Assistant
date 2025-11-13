'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'

export default function PatternTrendsPage() {
  const { theme } = useTheme()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    (async () => {
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
            className={`mb-4 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Identify trading patterns, trends, and opportunities using advanced AI-powered
            pattern recognition algorithms.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
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
                className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
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
                className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Automated level detection and validation
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3
              className={`font-semibold mb-3 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              Pattern Alerts
            </h3>
            <div className="space-y-2">
              <div
                className={`flex items-center justify-between p-3 rounded transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <span
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  Bullish Pattern Detected
                </span>
                <span className="text-xs text-green-600 font-semibold">High Confidence</span>
              </div>
              <div
                className={`flex items-center justify-between p-3 rounded transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <span
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  Trend Reversal Signal
                </span>
                <span className="text-xs text-yellow-600 font-semibold">Medium Confidence</span>
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
              className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
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
              className={`text-xs mt-2 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`}
            >
              Backend connection verified ✅
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
