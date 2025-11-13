'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'

export default function SettingsPage() {
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
      className={`min-h-screen transition-colors duration-500 ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-black via-gray-950 to-black text-white'
          : 'bg-gradient-to-b from-[#f5f7fa] via-[#c3e0dc] to-[#9ad0c2] text-gray-900'
      }`}
    >
      <div className="max-w-7xl mx-auto p-6 pt-24">
        <div className="text-center">
          <h1
            className={`text-3xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-blue-600'
            }`}
          >
            Account Settings ⚙️
          </h1>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="inline-block h-8 w-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
            </div>
          ) : user ? (
            <>
              <div
                className={`rounded-lg shadow-md p-6 mb-6 transition-all duration-300 ${
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
                  Account Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email || ''}
                      readOnly
                      className={`w-full border rounded p-2 ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-gray-300'
                          : 'bg-gray-50 border-gray-300 text-gray-700'
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      User ID
                    </label>
                    <input
                      type="text"
                      value={user.id || ''}
                      readOnly
                      className={`w-full border rounded p-2 ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-gray-300'
                          : 'bg-gray-50 border-gray-300 text-gray-700'
                      }`}
                    />
                  </div>
                </div>
              </div>

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
            </>
          ) : (
            <div
              className={`rounded-lg p-6 ${
                theme === 'dark'
                  ? 'bg-red-900/20 border border-red-800'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <p
                className={theme === 'dark' ? 'text-red-300' : 'text-red-600'}
              >
                Could not load user data. Please try again later.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
