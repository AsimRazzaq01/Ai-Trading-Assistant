'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { AlertTriangle, TrendingDown, TrendingUp, Shield, Info, Activity, PieChart, BarChart3, GitBranch, Droplets } from 'lucide-react'

interface Asset {
  symbol: string
  name: string
  price: number
  chart?: Array<{ date: string; price: number }>
  shares?: number
}

interface RiskAlert {
  type: 'warning' | 'error' | 'info' | 'success'
  title: string
  message: string
}

interface RiskBreakdownItem {
  name: string
  icon: React.ReactNode
  severity: 'Low' | 'Medium' | 'High'
  explanation: string
}

export default function RiskManagementPage() {
  const { theme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [shareAmounts, setShareAmounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
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

  // Load assets from localStorage (user-specific)
  useEffect(() => {
    if (!user) return

    const storageKey = `myAssets_${user.id || user.email || 'default'}`
    const sharesKey = `riskManagementShares_${user.id || user.email || 'default'}`
    const saved = localStorage.getItem(storageKey)
    const savedShares = localStorage.getItem(sharesKey)

    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const validAssets = parsed
          .filter((a: any) => a.symbol && a.price && !isNaN(Number(a.price)))
          .map((a: any) => ({
            symbol: a.symbol,
            name: a.name || a.symbol,
            price: typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0,
            chart: a.chart || [],
          }))
        setAssets(validAssets)

        if (savedShares) {
          try {
            const shares = JSON.parse(savedShares)
            setShareAmounts(shares)
          } catch (e) {
            console.error('Error loading share amounts:', e)
            const defaultShares: Record<string, number> = {}
            validAssets.forEach((a: Asset) => {
              defaultShares[a.symbol] = 1
            })
            setShareAmounts(defaultShares)
          }
        } else {
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
      setAssets([])
      setShareAmounts({})
    }
    setLoading(false)
  }, [user])

  // Save share amounts to localStorage whenever they change (user-specific)
  useEffect(() => {
    if (!user) return
    const sharesKey = `riskManagementShares_${user.id || user.email || 'default'}`
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
        riskScore: 'Low' as const,
        maxDrawdown: 0,
        sharpeRatio: 0,
        positionCount: 0,
        positionValues: {} as Record<string, number>,
        avgVolatility: 0,
        concentrationRisk: 0,
        volatilityRisk: 0,
        drawdownRisk: 0,
        maxPositionPct: 0,
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

    // Calculate max position percentage
    const positionValuesArray = Object.values(positionValues)
    const maxPosition = positionValuesArray.length > 0 ? Math.max(...positionValuesArray) : 0
    const maxPositionPct = totalValue > 0 ? (maxPosition / totalValue) * 100 : 0

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
    const sharpeRatio = avgVolatility > 0 ? Math.abs(1.0 / avgVolatility) : 0

    // Risk scores based on multiple factors
    const concentrationRisk = assets.length < 3 ? 1 : assets.length < 5 ? 0.5 : 0
    const volatilityRisk = avgVolatility > 3 ? 1 : avgVolatility > 1.5 ? 0.5 : 0
    const drawdownRisk = Math.abs(maxDrawdown) > 15 ? 1 : Math.abs(maxDrawdown) > 8 ? 0.5 : 0

    // Risk Score based on multiple factors
    let riskScore: 'Low' | 'Medium' | 'High' = 'Low'
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
      concentrationRisk,
      volatilityRisk,
      drawdownRisk,
      maxPositionPct,
    }
  }

  // Generate portfolio risk breakdown
  const generateRiskBreakdown = (metrics: ReturnType<typeof calculateMetrics>): RiskBreakdownItem[] => {
    const breakdown: RiskBreakdownItem[] = []

    // Concentration Risk - based on number of positions and weight distribution
    const concentrationSeverity: 'Low' | 'Medium' | 'High' =
      metrics.positionCount < 3 ? 'High' : metrics.positionCount < 5 ? 'Medium' : 'Low'
    const concentrationExplanation =
      metrics.positionCount === 0
        ? 'No positions tracked. Add assets to analyze concentration.'
        : metrics.positionCount < 3
        ? `Only ${metrics.positionCount} position(s) tracked. High exposure to individual asset movements.`
        : metrics.positionCount < 5
        ? `${metrics.positionCount} positions. Consider adding more assets for better diversification.`
        : `Well diversified with ${metrics.positionCount} positions across your portfolio.`

    breakdown.push({
      name: 'Concentration Risk',
      icon: <PieChart className="w-5 h-5" />,
      severity: concentrationSeverity,
      explanation: concentrationExplanation,
    })

    // Volatility Risk - based on average volatility from price movements
    const volatilitySeverity: 'Low' | 'Medium' | 'High' =
      metrics.avgVolatility > 3 ? 'High' : metrics.avgVolatility > 1.5 ? 'Medium' : 'Low'
    const volatilityExplanation =
      metrics.positionCount === 0
        ? 'No price data available. Add assets with historical data.'
        : metrics.avgVolatility > 3
        ? `High daily price swings averaging ${metrics.avgVolatility.toFixed(1)}%. Expect significant value fluctuations.`
        : metrics.avgVolatility > 1.5
        ? `Moderate volatility at ${metrics.avgVolatility.toFixed(1)}%. Normal market movements expected.`
        : `Low volatility at ${metrics.avgVolatility.toFixed(1)}%. Portfolio shows stable price behavior.`

    breakdown.push({
      name: 'Volatility Risk',
      icon: <Activity className="w-5 h-5" />,
      severity: volatilitySeverity,
      explanation: volatilityExplanation,
    })

    // Drawdown Risk - based on maximum observed drawdown
    const drawdownSeverity: 'Low' | 'Medium' | 'High' =
      Math.abs(metrics.maxDrawdown) > 15 ? 'High' : Math.abs(metrics.maxDrawdown) > 8 ? 'Medium' : 'Low'
    const drawdownExplanation =
      metrics.positionCount === 0
        ? 'No drawdown data available. Add assets with historical data.'
        : Math.abs(metrics.maxDrawdown) > 15
        ? `Max drawdown of ${metrics.maxDrawdown.toFixed(1)}% indicates high peak-to-trough decline risk.`
        : Math.abs(metrics.maxDrawdown) > 8
        ? `Moderate drawdown of ${metrics.maxDrawdown.toFixed(1)}%. Some capital preservation risk exists.`
        : `Low drawdown at ${metrics.maxDrawdown.toFixed(1)}%. Portfolio has shown resilience to declines.`

    breakdown.push({
      name: 'Drawdown Risk',
      icon: <TrendingDown className="w-5 h-5" />,
      severity: drawdownSeverity,
      explanation: drawdownExplanation,
    })

    // Correlation Risk - estimated based on portfolio composition
    // Without detailed correlation data, we estimate based on position count and sector diversity
    const correlationSeverity: 'Low' | 'Medium' | 'High' =
      metrics.positionCount < 2 ? 'High' : metrics.positionCount < 4 ? 'Medium' : 'Low'
    const correlationExplanation =
      metrics.positionCount === 0
        ? 'No positions to analyze. Add multiple assets from different sectors.'
        : metrics.positionCount < 2
        ? 'Single asset portfolio. All risk concentrated in one position with no diversification benefit.'
        : metrics.positionCount < 4
        ? `Limited diversification with ${metrics.positionCount} assets. Consider adding uncorrelated positions.`
        : `Good diversification potential with ${metrics.positionCount} assets. Monitor sector overlap.`

    breakdown.push({
      name: 'Correlation Risk',
      icon: <GitBranch className="w-5 h-5" />,
      severity: correlationSeverity,
      explanation: correlationExplanation,
    })

    // Liquidity Risk - estimated based on position concentration
    const liquiditySeverity: 'Low' | 'Medium' | 'High' =
      metrics.maxPositionPct > 50 ? 'High' : metrics.maxPositionPct > 30 ? 'Medium' : 'Low'
    const liquidityExplanation =
      metrics.positionCount === 0
        ? 'No positions to analyze. Liquidity risk depends on asset selection.'
        : metrics.maxPositionPct > 50
        ? `Largest position is ${metrics.maxPositionPct.toFixed(0)}% of portfolio. Large exits may impact prices.`
        : metrics.maxPositionPct > 30
        ? `Top position at ${metrics.maxPositionPct.toFixed(0)}%. Monitor position sizes for smooth exits.`
        : `Positions well distributed (max ${metrics.maxPositionPct.toFixed(0)}%). Lower impact on exit execution.`

    breakdown.push({
      name: 'Liquidity Risk',
      icon: <Droplets className="w-5 h-5" />,
      severity: liquiditySeverity,
      explanation: liquidityExplanation,
    })

    return breakdown
  }

  // Generate dynamic alerts
  const generateAlerts = (metrics: ReturnType<typeof calculateMetrics>) => {
    const newAlerts: RiskAlert[] = []

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
        message: 'Your portfolio risk score is High. Consider reducing position sizes or diversifying your holdings.',
      })
    } else if (metrics.riskScore === 'Medium') {
      newAlerts.push({
        type: 'warning',
        title: 'Moderate Risk Portfolio',
        message: 'Your portfolio risk score is Medium. Monitor your positions and consider rebalancing if needed.',
      })
    } else {
      newAlerts.push({
        type: 'success',
        title: 'Risk Level: Acceptable',
        message: 'Your current portfolio composition is within recommended risk parameters.',
      })
    }

    // Diversification success
    if (metrics.positionCount >= 5 && metrics.riskScore !== 'High') {
      newAlerts.push({
        type: 'success',
        title: 'Well Diversified',
        message: `Your portfolio is well diversified with ${metrics.positionCount} positions, which helps reduce overall risk.`,
      })
    }

    return newAlerts
  }

  // Memoize metrics calculation - recalculates when assets or shareAmounts change
  const metrics = useMemo(() => calculateMetrics(), [assets, shareAmounts])

  // Memoize risk breakdown - recalculates when metrics change
  const riskBreakdown = useMemo(() => generateRiskBreakdown(metrics), [metrics])

  // Update alerts when metrics change
  useEffect(() => {
    setAlerts(generateAlerts(metrics))
  }, [metrics])

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

  const getSeverityColor = (severity: 'Low' | 'Medium' | 'High') => {
    switch (severity) {
      case 'High':
        return {
          bg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50',
          border: theme === 'dark' ? 'border-red-500/50' : 'border-red-200',
          text: theme === 'dark' ? 'text-red-400' : 'text-red-700',
          badge: theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-800',
          icon: theme === 'dark' ? 'text-red-400' : 'text-red-600',
        }
      case 'Medium':
        return {
          bg: theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-50',
          border: theme === 'dark' ? 'border-yellow-500/50' : 'border-yellow-200',
          text: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700',
          badge: theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800',
          icon: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600',
        }
      case 'Low':
        return {
          bg: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50',
          border: theme === 'dark' ? 'border-green-500/50' : 'border-green-200',
          text: theme === 'dark' ? 'text-green-400' : 'text-green-700',
          badge: theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-800',
          icon: theme === 'dark' ? 'text-green-400' : 'text-green-600',
        }
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

  // Calculate position risk level based on portfolio percentage
  const getPositionRiskLevel = (positionPct: number): 'Low' | 'Medium' | 'High' => {
    if (positionPct > 25) return 'High'
    if (positionPct > 15) return 'Medium'
    return 'Low'
  }

  return (
    <main
      className={`min-h-screen transition-colors duration-500 relative overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-950/95 via-black/95 to-gray-900/95 text-white'
          : 'bg-gradient-to-b from-white/60 to-[#f0f4ff]/60 text-gray-900 backdrop-blur-[2px]'
      }`}
    >
      {/* Animated background elements */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${
        theme === 'dark' ? 'opacity-20' : 'opacity-15'
      }`}>
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl ${
          theme === 'dark' ? 'bg-blue-500' : 'bg-lapis-500'
        } animate-pulse`} style={{ animationDuration: '4s' }}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl ${
          theme === 'dark' ? 'bg-purple-500' : 'bg-emerald-500'
        } animate-pulse`} style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
      </div>
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 pt-24">
        <h1
          className={`text-3xl font-semibold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          Risk Management 🛡️
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}>
              Loading risk management data...
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Portfolio Risk Metrics */}
              <div
                className={`rounded-xl shadow-sm p-5 border transition-all duration-300 hover:shadow-lg ${
                  theme === 'dark'
                    ? 'bg-gray-900 border-gray-800'
                    : 'bg-white border-gray-200'
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

              {/* Portfolio Risk Breakdown */}
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
                  Portfolio Risk Breakdown
                </h2>
                <div className="space-y-3">
                  {riskBreakdown.map((item, idx) => {
                    const colors = getSeverityColor(item.severity)
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border transition-all ${colors.bg} ${colors.border}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={colors.icon}>{item.icon}</span>
                            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                              {item.name}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colors.badge}`}>
                            {item.severity}
                          </span>
                        </div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.explanation}
                        </p>
                      </div>
                    )
                  })}
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
                        const riskLevel = getPositionRiskLevel(positionPct)
                        
                        const updateShares = (newShares: number) => {
                          setShareAmounts((prev) => ({
                            ...prev,
                            [asset.symbol]: Math.max(0, newShares),
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
                                riskLevel === 'High' ? 'text-red-600' : 
                                riskLevel === 'Medium' ? 'text-yellow-600' : 'text-gray-600'
                              }`}
                            >
                              {positionPct.toFixed(1)}%
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  riskLevel === 'High'
                                    ? 'bg-red-100 text-red-800'
                                    : riskLevel === 'Medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {riskLevel}
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
