'use client'
import { useEffect, useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import NewsAnalysisModal from './NewsAnalysisModal'

type Item = {
  title: string
  url: string
  source?: string
  publishedAt?: string
  image?: string
  summary?: string
}

export default function NewsFeed({ q }: { q?: string }) {
  const { theme } = useTheme();
  const [items, setItems] = useState<Item[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [selectedNews, setSelectedNews] = useState<Item | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        setErr(null)
        const r = await fetch(`/api/news${q ? `?q=${encodeURIComponent(q)}` : ''}`, { cache: 'no-store' })
        const j = await r.json()
        if (!r.ok) throw new Error(j?.detail || j?.error || 'Failed')
        setItems(j.items || [])
      } catch (e: any) {
        setErr(e.message)
      }
    })()
  }, [q])

  return (
    <div className={`h-full flex flex-col rounded-xl transition-all duration-300 overflow-hidden ${
      theme === 'dark'
        ? 'bg-gray-900 border border-gray-800 shadow-md'
        : 'bg-[#eaf5f3] border border-[#cde3dd] shadow-sm'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
      }`}>
        <h3 className={`text-base font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Market News</h3>
        <button
          onClick={() => setExpanded(v => !v)}
          className={`text-xs px-3 py-1 rounded-lg transition-all ${
            theme === 'dark'
              ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white'
              : 'bg-white hover:bg-gray-50 border border-gray-300 text-gray-900'
          }`}
          aria-expanded={expanded}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {/* Scrollable content */}
      <div
        className={[
          'relative flex-1 overflow-auto',
          expanded ? 'max-h-[72vh]' : 'max-h-[500px]'
        ].join(' ')}
      >
        <div className="p-4 space-y-3">
          {err && (
            <div className={`text-sm ${
              theme === 'dark' ? 'text-red-300' : 'text-red-600'
            }`}>
              News error: {err}
            </div>
          )}

          {items.length === 0 && !err && (
            <div className={`text-sm ${
              theme === 'dark' ? 'opacity-70 text-gray-400' : 'opacity-70 text-gray-600'
            }`}>No news right now.</div>
          )}

          {items.map((n, i) => (
            <div
              key={i}
              className={`block rounded-xl p-3 border transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'hover:bg-gray-800 border-gray-700'
                  : 'hover:bg-white border-gray-300'
              }`}
              onClick={() => {
                setSelectedNews(n)
                setIsModalOpen(true)
              }}
            >
              <div className="flex gap-3">
                {n.image ? (
                  <img
                    src={n.image}
                    alt=""
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                  />
                ) : (
                  <div className={`w-16 h-16 rounded-md flex items-center justify-center text-xs ${
                    theme === 'dark'
                      ? 'bg-gray-800 border border-gray-700 opacity-60'
                      : 'bg-gray-100 border border-gray-300 opacity-60'
                  }`}>
                    News
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-medium line-clamp-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{n.title}</div>
                  <div className={`text-xs mt-0.5 ${
                    theme === 'dark' ? 'opacity-70 text-gray-400' : 'opacity-70 text-gray-600'
                  }`}>
                    {n.source ? `${n.source} • ` : ''}
                    {n.publishedAt ? new Date(n.publishedAt).toLocaleString() : ''}
                  </div>
                  {n.summary && (
                    <div className={`text-xs mt-1 line-clamp-2 ${
                      theme === 'dark' ? 'opacity-80 text-gray-300' : 'opacity-80 text-gray-700'
                    }`}>
                      {n.summary}
                    </div>
                  )}
                  <div className={`text-xs mt-2 flex items-center gap-1 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Click for AI Analysis
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fade hint when collapsed */}
        {!expanded && items.length > 0 && (
          <div className={`pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t ${
            theme === 'dark' ? 'from-gray-900/40' : 'from-[#eaf5f3]/40'
          } to-transparent`} />
        )}
      </div>

      {/* News Analysis Modal */}
      {selectedNews && (
        <NewsAnalysisModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedNews(null)
          }}
          newsItem={selectedNews}
        />
      )}
    </div>
  )
}

