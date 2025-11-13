'use client'

import { useEffect, useState, useCallback, ReactElement } from 'react'
import { useTheme } from '@/context/ThemeContext'

interface NewsAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  newsItem: {
    title: string
    url?: string
    source?: string
    publishedAt?: string
    summary?: string
  }
}

interface AnalysisData {
  breakingNews: string
  marketAnalysis: string
  earningsReport: string
  economicIndicators: string
  fullAnalysis?: string
}

export default function NewsAnalysisModal({
  isOpen,
  onClose,
  newsItem,
}: NewsAnalysisModalProps) {
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalysis = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/news-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsTitle: newsItem.title,
          newsUrl: newsItem.url,
          newsSummary: newsItem.summary,
          newsSource: newsItem.source,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch analysis')
      }

      const data = await response.json()
      setAnalysis(data)
    } catch (err: any) {
      setError(err.message || 'Failed to generate analysis')
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
    }
  }, [newsItem.title, newsItem.url, newsItem.summary, newsItem.source])

  useEffect(() => {
    if (isOpen && newsItem.title) {
      // Reset state when modal opens with a new news item
      setAnalysis(null)
      setError(null)
      fetchAnalysis()
    }
  }, [isOpen, newsItem.title, fetchAnalysis])

  const handleClose = () => {
    setAnalysis(null)
    setError(null)
    onClose()
  }

  // Helper function to format text with better parsing
  const formatText = (text: string) => {
    if (!text) return []
    
    // Split by lines and process
    const lines = text.split('\n').filter(line => line.trim())
    const formatted: ReactElement[] = []
    
    lines.forEach((line, index) => {
      const trimmed = line.trim()
      
      // Handle bold text (**text** or **text**:)
      const boldMatch = trimmed.match(/^\*\*(.+?)\*\*:?\s*(.*)$/)
      if (boldMatch) {
        formatted.push(
          <div key={index} className="mb-2">
            <strong className={`font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {boldMatch[1]}
            </strong>
            {boldMatch[2] && (
              <span className={`ml-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {boldMatch[2]}
              </span>
            )}
          </div>
        )
        return
      }
      
      // Handle bullet points (- or •)
      if (trimmed.match(/^[-•]\s+/)) {
        const content = trimmed.replace(/^[-•]\s+/, '')
        formatted.push(
          <div key={index} className="ml-4 mb-2 flex items-start">
            <span className="mr-2 mt-1.5">•</span>
            <span className={`flex-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {content}
            </span>
          </div>
        )
        return
      }
      
      // Handle numbered lists
      if (trimmed.match(/^\d+\.\s+/)) {
        const content = trimmed.replace(/^\d+\.\s+/, '')
        formatted.push(
          <div key={index} className="ml-4 mb-2 flex items-start">
            <span className={`mr-2 font-semibold ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {trimmed.match(/^\d+/)?.[0]}.
            </span>
            <span className={`flex-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {content}
            </span>
          </div>
        )
        return
      }
      
      // Regular paragraph
      if (trimmed) {
        formatted.push(
          <p key={index} className={`mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {trimmed}
          </p>
        )
      }
    })
    
    return formatted.length > 0 ? formatted : [<p key="default" className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{text}</p>]
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 ${
          theme === 'dark' ? 'bg-black/70' : 'bg-black/50'
        } backdrop-blur-sm`}
      />

      {/* Modal */}
      <div
        className={`relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl ${
          theme === 'dark'
            ? 'bg-gray-900 border border-gray-800'
            : 'bg-white border border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div className="flex-1 min-w-0">
            <h2
              className={`text-xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              News Analysis
            </h2>
            <p
              className={`text-sm truncate ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {newsItem.title}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`ml-4 p-2 rounded-lg transition-all ${
              theme === 'dark'
                ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
            }`}
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div
                  className={`inline-block animate-spin rounded-full h-8 w-8 border-b-2 ${
                    theme === 'dark' ? 'border-white' : 'border-gray-900'
                  }`}
                />
                <p
                  className={`mt-4 text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Generating comprehensive analysis...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div
              className={`p-4 rounded-lg mb-4 ${
                theme === 'dark'
                  ? 'bg-red-900/20 border border-red-800 text-red-300'
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}
            >
              <p className="font-semibold mb-1">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {analysis && !loading && (
            <div className="space-y-6">
              {/* Breaking News - Only in blue box */}
              <section className="relative">
                <div
                  className={`p-5 rounded-xl shadow-sm ${
                    theme === 'dark'
                      ? 'bg-blue-950/30 border-l-4 border-blue-500'
                      : 'bg-blue-50 border-l-4 border-blue-500'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-2 rounded-lg ${
                        theme === 'dark'
                          ? 'bg-blue-500/20'
                          : 'bg-blue-100'
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className={`text-xl font-bold ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      Breaking News Summary
                    </h3>
                  </div>
                  <div className="text-sm leading-relaxed space-y-2">
                    {formatText(analysis.breakingNews || 'No summary available.')}
                  </div>
                </div>
              </section>

              {/* Market Analysis - Only show if content exists */}
              {analysis.marketAnalysis && analysis.marketAnalysis.trim() && (
                <section className="relative">
                  <div
                    className={`flex items-center gap-3 mb-4 pb-3 border-b-2 ${
                      theme === 'dark'
                        ? 'border-green-500/50 text-green-400'
                        : 'border-green-500 text-green-600'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        theme === 'dark'
                          ? 'bg-green-500/20'
                          : 'bg-green-100'
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold">Market Analysis</h3>
                  </div>
                  <div
                    className={`p-5 rounded-xl shadow-sm ${
                      theme === 'dark'
                        ? 'bg-green-950/30 border-l-4 border-green-500'
                        : 'bg-green-50 border-l-4 border-green-500'
                    }`}
                  >
                    <div className="text-sm leading-relaxed space-y-2">
                      {formatText(analysis.marketAnalysis)}
                    </div>
                  </div>
                </section>
              )}

              {/* Earnings Report - Only show if content exists */}
              {analysis.earningsReport && analysis.earningsReport.trim() && (
                <section className="relative">
                  <div
                    className={`flex items-center gap-3 mb-4 pb-3 border-b-2 ${
                      theme === 'dark'
                        ? 'border-yellow-500/50 text-yellow-400'
                        : 'border-yellow-500 text-yellow-600'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        theme === 'dark'
                          ? 'bg-yellow-500/20'
                          : 'bg-yellow-100'
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold">Earnings Report</h3>
                  </div>
                  <div
                    className={`p-5 rounded-xl shadow-sm ${
                      theme === 'dark'
                        ? 'bg-yellow-950/30 border-l-4 border-yellow-500'
                        : 'bg-yellow-50 border-l-4 border-yellow-500'
                    }`}
                  >
                    <div className="text-sm leading-relaxed space-y-2">
                      {formatText(analysis.earningsReport)}
                    </div>
                  </div>
                </section>
              )}

              {/* Economic Indicators - Only show if content exists */}
              {analysis.economicIndicators && analysis.economicIndicators.trim() && (
                <section className="relative">
                  <div
                    className={`flex items-center gap-3 mb-4 pb-3 border-b-2 ${
                      theme === 'dark'
                        ? 'border-purple-500/50 text-purple-400'
                        : 'border-purple-500 text-purple-600'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        theme === 'dark'
                          ? 'bg-purple-500/20'
                          : 'bg-purple-100'
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold">Economic Indicators</h3>
                  </div>
                  <div
                    className={`p-5 rounded-xl shadow-sm ${
                      theme === 'dark'
                        ? 'bg-purple-950/30 border-l-4 border-purple-500'
                        : 'bg-purple-50 border-l-4 border-purple-500'
                    }`}
                  >
                    <div className="text-sm leading-relaxed space-y-2">
                      {formatText(analysis.economicIndicators)}
                    </div>
                  </div>
                </section>
              )}

              {/* Source Link */}
              {newsItem.url && (
                <div className={`pt-6 mt-6 border-t ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <a
                    href={newsItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm font-medium inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      theme === 'dark'
                        ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'
                        : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    <span>Read full article</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

