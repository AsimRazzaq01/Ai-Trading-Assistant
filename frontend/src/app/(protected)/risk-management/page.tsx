'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'

export default function RiskManagementPage() {
  const { theme } = useTheme()
  const [user, setUser] = useState<any>(null)
  
  // Load saved settings from localStorage
  const [maxPositionSize, setMaxPositionSize] = useState(() => {
    const saved = localStorage.getItem("riskMaxPositionSize");
    return saved ? parseFloat(saved) : 10;
  });
  const [stopLoss, setStopLoss] = useState(() => {
    const saved = localStorage.getItem("riskStopLoss");
    return saved ? parseFloat(saved) : 5;
  });
  const [takeProfit, setTakeProfit] = useState(() => {
    const saved = localStorage.getItem("riskTakeProfit");
    return saved ? parseFloat(saved) : 15;
  });

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("riskMaxPositionSize", maxPositionSize.toString());
  }, [maxPositionSize]);

  useEffect(() => {
    localStorage.setItem("riskStopLoss", stopLoss.toString());
  }, [stopLoss]);

  useEffect(() => {
    localStorage.setItem("riskTakeProfit", takeProfit.toString());
  }, [takeProfit]);

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
          Risk Management 🛡️
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div
            className={`rounded-lg shadow-md p-6 transition-all duration-300 ${
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
              Portfolio Risk Metrics
            </h2>
            <div className="space-y-4">
              <div
                className={`flex justify-between items-center p-3 rounded transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <span
                  className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                >
                  Total Portfolio Value
                </span>
                <span
                  className={`font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  $125,430.00
                </span>
              </div>
              <div
                className={`flex justify-between items-center p-3 rounded transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <span
                  className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                >
                  Risk Score
                </span>
                <span className="font-semibold text-yellow-600">Medium</span>
              </div>
              <div
                className={`flex justify-between items-center p-3 rounded transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <span
                  className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                >
                  Max Drawdown
                </span>
                <span className="font-semibold text-red-600">-8.5%</span>
              </div>
              <div
                className={`flex justify-between items-center p-3 rounded transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <span
                  className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                >
                  Sharpe Ratio
                </span>
                <span className="font-semibold text-green-600">1.42</span>
              </div>
            </div>
          </div>

          <div
            className={`rounded-lg shadow-md p-6 transition-all duration-300 ${
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
              Position Limits
            </h2>
            <div className="space-y-4">
                            <div>
                                <label
                                  className={`block text-sm font-medium mb-2 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                  }`}
                                >
                                  Max Position Size (%)
                                </label>
                                <input
                                  type="number"
                                  value={maxPositionSize}
                                  onChange={(e) => setMaxPositionSize(parseFloat(e.target.value) || 0)}
                                  className={`w-full border rounded p-2 ${
                                    theme === 'dark'
                                      ? 'bg-gray-800 border-gray-700 text-white'
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                />
                              </div>
                              <div>
                                <label
                                  className={`block text-sm font-medium mb-2 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                  }`}
                                >
                                  Stop Loss (%)
                                </label>
                                <input
                                  type="number"
                                  value={stopLoss}
                                  onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                                  className={`w-full border rounded p-2 ${
                                    theme === 'dark'
                                      ? 'bg-gray-800 border-gray-700 text-white'
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                />
                              </div>
                              <div>
                                <label
                                  className={`block text-sm font-medium mb-2 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                  }`}
                                >
                                  Take Profit (%)
                                </label>
                                <input
                                  type="number"
                                  value={takeProfit}
                                  onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
                                  className={`w-full border rounded p-2 ${
                                    theme === 'dark'
                                      ? 'bg-gray-800 border-gray-700 text-white'
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                />
                              </div>
              <button
                className={`w-full px-4 py-2 rounded transition ${
                  theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>

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
            Risk Alerts & Warnings
          </h2>
          <div className="space-y-3">
            <div
              className={`flex items-start p-4 border-l-4 rounded transition-all ${
                theme === 'dark'
                  ? 'bg-yellow-900/20 border-yellow-500'
                  : 'bg-yellow-50 border-yellow-500'
              }`}
            >
              <div className="flex-1">
                <h3
                  className={`font-semibold mb-1 ${
                    theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800'
                  }`}
                >
                  Portfolio Concentration Warning
                </h3>
                <p
                  className={`text-sm ${
                    theme === 'dark' ? 'text-yellow-200' : 'text-yellow-700'
                  }`}
                >
                  Your portfolio is heavily weighted in technology stocks. Consider diversifying.
                </p>
              </div>
            </div>
            <div
              className={`flex items-start p-4 border-l-4 rounded transition-all ${
                theme === 'dark'
                  ? 'bg-green-900/20 border-green-500'
                  : 'bg-green-50 border-green-500'
              }`}
            >
              <div className="flex-1">
                <h3
                  className={`font-semibold mb-1 ${
                    theme === 'dark' ? 'text-green-300' : 'text-green-800'
                  }`}
                >
                  Risk Level: Acceptable
                </h3>
                <p
                  className={`text-sm ${
                    theme === 'dark' ? 'text-green-200' : 'text-green-700'
                  }`}
                >
                  Your current risk management settings are within recommended parameters.
                </p>
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
