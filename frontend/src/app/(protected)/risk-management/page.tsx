'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { AlertTriangle, TrendingDown, TrendingUp, Shield, Info } from 'lucide-react'

interface Asset {
  symbol: string
  name: string
  price: number
  chart?: Array<{ date: string; price: number }>
  shares?: number // Number of shares owned (can be partial)
}

interface RiskSettings {
  max_position_size: number
  stop_loss: number
  take_profit: number
}

interface RiskAlert {
  type: 'warning' | 'error' | 'info' | 'success'
  title: string
  message: string
}

export default function RiskManagementPage() {
  const { theme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [shareAmounts, setShareAmounts] = useState<Record<string, number>>({}) // symbol -> shares
  const [riskSettings, setRiskSettings] = useState<RiskSettings>({
    max_position_size: 10,
    stop_loss: 5,
    take_profit: 15,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alerts, setAlerts] = useState<RiskAlert[]>([])

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

  // Load risk settings from backend
  const loadRiskSettings = async () => {
    try {
      const res = await fetch('/api/risk-management', {
        credentials: 'include',
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        setRiskSettings({
          max_position_size: data.max_position_size || 10,
          stop_loss: data.stop_loss || 5,
          take_profit: data.take_profit || 15,
        })
      }
    } catch (err) {
      console.error('Error loading risk settings:', err)
    }
  }

  // Load assets from localStorage (user-specific)
  useEffect(() => {
    if (!user) return; // Wait for user to load
    
    const storageKey = `myAssets_${user.id || user.email || 'default'}`;
    const sharesKey = `riskManagementShares_${user.id || user.email || 'default'}`;
    const saved = localStorage.getItem(storageKey)
    const savedShares = localStorage.getItem(sharesKey)
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Filter out invalid assets and ensure price is a number
        const validAssets = parsed
          .filter((a: any) => a.symbol && a.price && !isNaN(Number(a.price)))
          .map((a: any) => ({
            symbol: a.symbol,
            name: a.name || a.symbol,
            price: typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0,
            chart: a.chart || [],
          }))
        setAssets(validAssets)
        
        // Load share amounts from localStorage
        if (savedShares) {
          try {
            const shares = JSON.parse(savedShares)
            setShareAmounts(shares)
          } catch (e) {
            console.error('Error loading share amounts:', e)
            // Initialize with default of 1 share for each asset
            const defaultShares: Record<string, number> = {}
            validAssets.forEach((a: Asset) => {
              defaultShares[a.symbol] = 1
            })
            setShareAmounts(defaultShares)
          }
        } else {
          // Initialize with default of 1 share for each asset
          const defaultShares: Record<string, number> = {}
          validAssets.forEach((a: Asset) => {
            defaultShares[a.symbol] = 1
          })
          setShareAmounts(defaultShares)
        }
      } catch (e) {
        console.error('Error loading assets:', e)
        setAssets([])
        setShareAmounts({})
      }
    } else {
      // No saved assets for this user
      setAssets([])
      setShareAmounts({})
    }
    loadRiskSettings().finally(() => setLoading(false))
  }, [user])

  // Save share amounts to localStorage whenever they change (user-specific)
  useEffect(() => {
    if (!user) return; // Wait for user to load
    const sharesKey = `riskManagementShares_${user.id || user.email || 'default'}`;
    if (Object.keys(shareAmounts).length > 0) {
      localStorage.setItem(sharesKey, JSON.stringify(shareAmounts))
    } else {
      localStorage.removeItem(sharesKey)
    }
  }, [shareAmounts, user])

  // Update share amounts when assets change (add new assets with 1 share)
  useEffect(() => {
    const updatedShares = { ...shareAmounts }
    let hasChanges = false
    
    assets.forEach((asset) => {
      if (!(asset.symbol in updatedShares)) {
        updatedShares[asset.symbol] = 1
        hasChanges = true
      }
    })
    
    // Remove shares for assets that no longer exist
    Object.keys(updatedShares).forEach((symbol) => {
      if (!assets.find((a) => a.symbol === symbol)) {
        delete updatedShares[symbol]
        hasChanges = true
      }
    })
    
    if (hasChanges) {
      setShareAmounts(updatedShares)
    }
  }, [assets])

  // Calculate portfolio metrics
  const calculateMetrics = () => {
    if (assets.length === 0) {
      return {
        totalValue: 0,
        riskScore: 'Low',
        maxDrawdown: 0,
        sharpeRatio: 0,
        positionCount: 0,
        positionValues: {},
      }
    }

    // Calculate position values: shares × price for each asset
    const positionValues: Record<string, number> = {}
    assets.forEach((asset) => {
      const shares = shareAmounts[asset.symbol] || 0
      positionValues[asset.symbol] = shares * asset.price
    })

    // Total Portfolio Value: sum of all position values (shares × price)
    const totalValue = Object.values(positionValues).reduce((sum, value) => sum + value, 0)

    // Calculate Max Drawdown from chart data
    let maxDrawdown = 0
    assets.forEach((asset) => {
      if (asset.chart && asset.chart.length > 0) {
        const prices = asset.chart.map((d) => d.price).filter((p) => p > 0)
        if (prices.length > 0) {
          let peak = prices[0]
          let maxDD = 0
          prices.forEach((price) => {
            if (price > peak) peak = price
            const drawdown = ((price - peak) / peak) * 100
            if (drawdown < maxDD) maxDD = drawdown
          })
          if (Math.abs(maxDD) > Math.abs(maxDrawdown)) {
            maxDrawdown = maxDD
          }
        }
      }
    })

    // Calculate volatility (standard deviation of returns)
    let volatility = 0
    let returnCount = 0
    assets.forEach((asset) => {
      if (asset.chart && asset.chart.length > 1) {
        const prices = asset.chart.map((d) => d.price).filter((p) => p > 0)
        if (prices.length > 1) {
          const returns = []
          for (let i = 1; i < prices.length; i++) {
            const ret = ((prices[i] - prices[i - 1]) / prices[i - 1]) * 100
            returns.push(ret)
          }
          if (returns.length > 0) {
            const mean = returns.reduce((a, b) => a + b, 0) / returns.length
            const variance =
              returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
            volatility += Math.sqrt(variance)
            returnCount++
          }
        }
      }
    })
    const avgVolatility = returnCount > 0 ? volatility / returnCount : 0

    // Calculate Sharpe Ratio (simplified - assumes risk-free rate of 0)
    // Sharpe = (Portfolio Return - Risk Free Rate) / Volatility
    const sharpeRatio = avgVolatility > 0 ? Math.abs(1.0 / avgVolatility) : 0

    // Risk Score based on multiple factors
    let riskScore = 'Low'
    const concentrationRisk = assets.length < 3 ? 1 : assets.length < 5 ? 0.5 : 0
    const volatilityRisk = avgVolatility > 3 ? 1 : avgVolatility > 1.5 ? 0.5 : 0
    const drawdownRisk = Math.abs(maxDrawdown) > 15 ? 1 : Math.abs(maxDrawdown) > 8 ? 0.5 : 0

    const totalRisk = concentrationRisk + volatilityRisk + drawdownRisk
    if (totalRisk >= 2) riskScore = 'High'
    else if (totalRisk >= 1) riskScore = 'Medium'
    else riskScore = 'Low'

    return {
      totalValue,
      riskScore,
      maxDrawdown,
      sharpeRatio,
      positionCount: assets.length,
      avgVolatility,
      positionValues,
    }
  }

  // Generate dynamic alerts
  const generateAlerts = (metrics: ReturnType<typeof calculateMetrics>) => {
    const newAlerts: RiskAlert[] = []

    // Portfolio value alerts
    if (metrics.totalValue === 0) {
      newAlerts.push({
        type: 'info',
        title: 'No Assets Tracked',
        message: 'Add assets to "My Assets" to see portfolio risk metrics.',
      })
      return newAlerts
    }

    // Concentration risk
    if (metrics.positionCount < 3) {
      newAlerts.push({
        type: 'warning',
        title: 'Portfolio Concentration Warning',
        message: `Your portfolio has only ${metrics.positionCount} position(s). Consider diversifying across at least 5-10 different assets to reduce risk.`,
      })
    }

    // Position size risk (based on actual position values)
    if (assets.length > 0 && metrics.totalValue > 0) {
      const positionValues = Object.values(metrics.positionValues || {}) as number[]
      if (positionValues.length > 0) {
        const maxPosition = Math.max(...positionValues)
        const maxPositionPct = (maxPosition / metrics.totalValue) * 100
        const maxPositionSymbol = Object.entries(metrics.positionValues || {}).find(
          ([_, value]) => value === maxPosition
        )?.[0]
        
        if (maxPositionPct > riskSettings.max_position_size) {
          newAlerts.push({
            type: 'warning',
            title: 'Position Size Exceeds Limit',
            message: `Your largest position ${maxPositionSymbol ? `(${maxPositionSymbol})` : ''} (${maxPositionPct.toFixed(1)}%) exceeds your maximum position size limit (${riskSettings.max_position_size}%). Consider reducing position size.`,
          })
        }
      }
    }

    // Drawdown alert
    if (Math.abs(metrics.maxDrawdown) > 15) {
      newAlerts.push({
        type: 'error',
        title: 'High Drawdown Detected',
        message: `Your portfolio has experienced a maximum drawdown of ${metrics.maxDrawdown.toFixed(1)}%. This indicates high volatility and risk.`,
      })
    } else if (Math.abs(metrics.maxDrawdown) > 8) {
      newAlerts.push({
        type: 'warning',
        title: 'Moderate Drawdown',
        message: `Your portfolio has a maximum drawdown of ${metrics.maxDrawdown.toFixed(1)}%. Monitor your positions closely.`,
      })
    }

    // Risk score alert
    if (metrics.riskScore === 'High') {
      newAlerts.push({
        type: 'error',
        title: 'High Risk Portfolio',
        message: 'Your portfolio risk score is High. Consider reducing position sizes, diversifying, or adjusting your risk management settings.',
      })
    } else if (metrics.riskScore === 'Medium') {
      newAlerts.push({
        type: 'warning',
        title: 'Moderate Risk Portfolio',
        message: 'Your portfolio risk score is Medium. Monitor your positions and consider adjusting risk management settings if needed.',
      })
    } else {
      newAlerts.push({
        type: 'success',
        title: 'Risk Level: Acceptable',
        message: 'Your current risk management settings and portfolio composition are within recommended parameters.',
      })
    }

    // Diversification alert
    if (metrics.positionCount >= 5 && metrics.riskScore !== 'High') {
      newAlerts.push({
        type: 'success',
        title: 'Well Diversified',
        message: `Your portfolio is well diversified with ${metrics.positionCount} positions, which helps reduce overall risk.`,
      })
    }

    return newAlerts
  }

  const metrics = calculateMetrics()
  useEffect(() => {
    setAlerts(generateAlerts(metrics))
  }, [assets, riskSettings, shareAmounts])

  // Save settings to backend
  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/risk-management', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(riskSettings),
      })

      if (res.ok) {
        // Show success message (you could add a toast here)
        alert('Risk management settings saved successfully!')
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (err) {
      console.error('Error saving risk settings:', err)
      alert('Failed to save risk management settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getRiskScoreColor = (score: string) => {
    switch (score) {
      case 'High':
        return 'text-red-600'
      case 'Medium':
        return 'text-yellow-600'
      case 'Low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'success':
        return <Shield className="w-5 h-5 text-green-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getAlertBorderColor = (type: string) => {
    switch (type) {
      case 'error':
        return theme === 'dark' ? 'border-red-500 bg-red-900/20' : 'border-red-500 bg-red-50'
      case 'warning':
        return theme === 'dark' ? 'border-yellow-500 bg-yellow-900/20' : 'border-yellow-500 bg-yellow-50'
      case 'success':
        return theme === 'dark' ? 'border-green-500 bg-green-900/20' : 'border-green-500 bg-green-50'
      default:
        return theme === 'dark' ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50'
    }
  }

  const getAlertTextColor = (type: string) => {
    switch (type) {
      case 'error':
        return theme === 'dark' ? 'text-red-300' : 'text-red-800'
      case 'warning':
        return theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800'
      case 'success':
        return theme === 'dark' ? 'text-green-300' : 'text-green-800'
      default:
        return theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
    }
  }

  return (
    <main
      className={`min-h-screen transition-colors duration-500 relative overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white'
          : 'bg-gradient-to-br from-blue-100 via-purple-50 to-pink-50 text-[#2d3748]'
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
          Risk Management 🛡️
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Loading risk management data...
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Portfolio Risk Metrics */}
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
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Total Portfolio Value
                    </span>
                    <span
                      className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      ${metrics.totalValue.toFixed(2)}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between items-center p-3 rounded transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Number of Positions
                    </span>
                    <span
                      className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {metrics.positionCount}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between items-center p-3 rounded transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Risk Score
                    </span>
                    <span className={`font-semibold ${getRiskScoreColor(metrics.riskScore)}`}>
                      {metrics.riskScore}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between items-center p-3 rounded transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Max Drawdown
                    </span>
                    <span className="font-semibold text-red-600">
                      {metrics.maxDrawdown.toFixed(1)}%
                    </span>
                  </div>
                  <div
                    className={`flex justify-between items-center p-3 rounded transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Sharpe Ratio
                    </span>
                    <span className="font-semibold text-green-600">
                      {metrics.sharpeRatio.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Position Limits */}
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
                      min="0"
                      max="100"
                      step="0.1"
                      value={riskSettings.max_position_size}
                      onChange={(e) =>
                        setRiskSettings({
                          ...riskSettings,
                          max_position_size: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`w-full border rounded p-2 ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-[#2d3748]/20 text-[#2d3748]'
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
                      min="0"
                      max="100"
                      step="0.1"
                      value={riskSettings.stop_loss}
                      onChange={(e) =>
                        setRiskSettings({
                          ...riskSettings,
                          stop_loss: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`w-full border rounded p-2 ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-[#2d3748]/20 text-[#2d3748]'
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
                      min="0"
                      max="100"
                      step="0.1"
                      value={riskSettings.take_profit}
                      onChange={(e) =>
                        setRiskSettings({
                          ...riskSettings,
                          take_profit: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`w-full border rounded p-2 ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-[#2d3748]/20 text-[#2d3748]'
                      }`}
                    />
                  </div>
                  <button
                    onClick={saveSettings}
                    disabled={saving}
                    className={`w-full px-4 py-2 rounded transition disabled:opacity-50 ${
                      theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>

            {/* Position-Level Analysis */}
            {assets.length > 0 && (
              <div
                className={`rounded-lg shadow-md p-6 mb-6 transition-all duration-300 ${
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
                    Position-Level Risk Analysis
                  </h2>
                  <p
                    className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    Enter share amounts (partial shares allowed, e.g., 0.5)
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr
                        className={`border-b ${
                          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                        }`}
                      >
                        <th
                          className={`text-left py-3 px-4 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Symbol
                        </th>
                        <th
                          className={`text-left py-3 px-4 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Name
                        </th>
                        <th
                          className={`text-right py-3 px-4 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Price
                        </th>
                        <th
                          className={`text-right py-3 px-4 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Shares
                        </th>
                        <th
                          className={`text-right py-3 px-4 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Value
                        </th>
                        <th
                          className={`text-right py-3 px-4 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          % of Portfolio
                        </th>
                        <th
                          className={`text-right py-3 px-4 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          Risk Level
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.map((asset) => {
                        const shares = shareAmounts[asset.symbol] || 0
                        const positionValue = shares * asset.price
                        const positionPct = metrics.totalValue > 0 
                          ? (positionValue / metrics.totalValue) * 100 
                          : 0
                        const exceedsLimit = positionPct > riskSettings.max_position_size
                        
                        const updateShares = (newShares: number) => {
                          setShareAmounts((prev) => ({
                            ...prev,
                            [asset.symbol]: Math.max(0, newShares), // Ensure non-negative
                          }))
                        }
                        
                        return (
                          <tr
                            key={asset.symbol}
                            className={`border-b last:border-none ${
                              theme === 'dark'
                                ? 'border-gray-800 hover:bg-gray-800/60'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <td
                              className={`py-3 px-4 font-semibold ${
                                theme === 'dark' ? 'text-white' : 'text-[#2d3748]'
                              }`}
                            >
                              {asset.symbol}
                            </td>
                            <td
                              className={`py-3 px-4 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                              }`}
                            >
                              {asset.name}
                            </td>
                            <td
                              className={`py-3 px-4 text-right ${
                                theme === 'dark' ? 'text-white' : 'text-[#2d3748]'
                              }`}
                            >
                              ${asset.price.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={shares}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0
                                  updateShares(value)
                                }}
                                onBlur={(e) => {
                                  const value = parseFloat(e.target.value) || 0
                                  updateShares(value)
                                }}
                                className={`w-24 px-2 py-1 border rounded text-right ${
                                  theme === 'dark'
                                    ? 'bg-gray-800 border-gray-700 text-white'
                                    : 'bg-white border-[#2d3748]/20 text-[#2d3748]'
                                }`}
                                placeholder="0.00"
                              />
                            </td>
                            <td
                              className={`py-3 px-4 text-right font-semibold ${
                                theme === 'dark' ? 'text-white' : 'text-[#2d3748]'
                              }`}
                            >
                              ${positionValue.toFixed(2)}
                            </td>
                            <td
                              className={`py-3 px-4 text-right font-medium ${
                                exceedsLimit ? 'text-red-600' : 'text-gray-600'
                              }`}
                            >
                              {positionPct.toFixed(1)}%
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  exceedsLimit
                                    ? 'bg-red-100 text-red-800'
                                    : positionPct > riskSettings.max_position_size * 0.8
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {exceedsLimit
                                  ? 'High'
                                  : positionPct > riskSettings.max_position_size * 0.8
                                  ? 'Medium'
                                  : 'Low'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Risk Alerts & Warnings */}
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
                {alerts.length === 0 ? (
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    No alerts at this time.
                  </p>
                ) : (
                  alerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start p-4 border-l-4 rounded transition-all ${getAlertBorderColor(
                        alert.type
                      )}`}
                    >
                      <div className="mr-3 mt-0.5">{getAlertIcon(alert.type)}</div>
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-1 ${getAlertTextColor(alert.type)}`}>
                          {alert.title}
                        </h3>
                        <p className={`text-sm ${getAlertTextColor(alert.type)} opacity-90`}>
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

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
