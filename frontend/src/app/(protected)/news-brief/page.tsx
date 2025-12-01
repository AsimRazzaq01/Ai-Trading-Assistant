'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import NewsFeed from '@/components/NewsFeed'

export default function NewsBriefPage() {
  const { theme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <main
      className={`min-h-screen transition-colors duration-500 relative overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white'
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-[#2d3748]'
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
          News Brief 📰
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
            Latest Market News & Updates
          </h2>
          <p
            className={`mb-4 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Stay informed with real-time financial news, market updates, and breaking stories
            that impact your trading decisions.
          </p>

          <div className="space-y-4 mb-6">
            <div
              className={`border-l-4 p-4 rounded transition-all ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-blue-500 bg-blue-50'
              }`}
            >
              <h3
                className={`font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}
              >
                Breaking News
              </h3>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Real-time breaking news alerts and market-moving events
              </p>
            </div>
            <div
              className={`border-l-4 p-4 rounded transition-all ${
                theme === 'dark'
                  ? 'border-green-500 bg-green-900/20'
                  : 'border-green-500 bg-green-50'
              }`}
            >
              <h3
                className={`font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}
              >
                Market Analysis
              </h3>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Expert analysis and commentary on market trends and movements
              </p>
            </div>
            <div
              className={`border-l-4 p-4 rounded transition-all ${
                theme === 'dark'
                  ? 'border-yellow-500 bg-yellow-900/20'
                  : 'border-yellow-500 bg-yellow-50'
              }`}
            >
              <h3
                className={`font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}
              >
                Earnings Reports
              </h3>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Company earnings announcements and financial results
              </p>
            </div>
            <div
              className={`border-l-4 p-4 rounded transition-all ${
                theme === 'dark'
                  ? 'border-purple-500 bg-purple-900/20'
                  : 'border-purple-500 bg-purple-50'
              }`}
            >
              <h3
                className={`font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}
              >
                Economic Indicators
              </h3>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Key economic data releases and their market impact
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3
              className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}
            >
              Live News Feed
            </h3>
            <NewsFeed />
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
      </div>
    </main>
  )
}
