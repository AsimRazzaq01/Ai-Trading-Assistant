'use client'
import { useEffect, useState, useRef } from 'react'
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

// News Item Component with ripple effect
const NewsItem = ({ 
  item, 
  onClick, 
  theme 
}: { 
  item: Item; 
  onClick: (item: Item) => void; 
  theme: string;
}) => {
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setRipple({ x, y });
    timeoutRef.current = setTimeout(() => {
      setRipple(null);
      timeoutRef.current = null;
    }, 400);
    
    onClick(item);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      onClick={handleClick}
      data-theme={theme}
      className={`relative block rounded-xl p-3 border cursor-pointer overflow-hidden group/item news-item-hover ${
        theme === 'dark'
          ? 'border-white/10'
          : 'border-gray-300/50'
      }`}
      style={{ 
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Ripple effect - optimized */}
      {ripple && (
        <span
          className={`absolute rounded-full pointer-events-none ${
            theme === 'dark' ? 'bg-white/20' : 'bg-gray-400/20'
          }`}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            transform: 'translate(-50%, -50%) translateZ(0)',
            animation: 'ripple 0.4s ease-out',
            willChange: 'transform, opacity',
          }}
        />
      )}
      
      {/* Border glow on hover - GPU accelerated with CSS */}
      <div 
        className={`absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover/item:opacity-100 ${
          theme === 'dark'
            ? 'bg-blue-500/5'
            : 'bg-blue-200/10'
        }`}
        style={{
          transform: 'translateZ(0)',
          transition: 'opacity 120ms cubic-bezier(0.4, 0, 0.2, 1)',
          backfaceVisibility: 'hidden',
        }}
      />
      
      <div className="relative flex gap-3 z-10">
        {item.image ? (
          <img
            src={item.image}
            alt=""
            className="w-16 h-16 object-cover rounded-md flex-shrink-0"
            style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
            loading="lazy"
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
          }`}>{item.title}</div>
          <div className={`text-xs mt-0.5 ${
            theme === 'dark' ? 'opacity-70 text-gray-400' : 'opacity-70 text-gray-600'
          }`}>
            {item.source ? `${item.source} • ` : ''}
            {item.publishedAt ? new Date(item.publishedAt).toLocaleString() : ''}
          </div>
          {item.summary && (
            <div className={`text-xs mt-1 line-clamp-2 ${
              theme === 'dark' ? 'opacity-80 text-gray-300' : 'opacity-80 text-gray-700'
            }`}>
              {item.summary}
            </div>
          )}
          <div className={`text-xs mt-2 flex items-center gap-1 ${
            theme === 'dark' ? 'text-blue-400 group-hover/item:text-blue-300' : 'text-blue-600 group-hover/item:text-blue-700'
          }`}
          style={{
            transition: 'color 120ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Click for AI Analysis
          </div>
        </div>
      </div>
    </div>
  );
};

export default function NewsFeed({ q }: { q?: string }) {
  const { theme } = useTheme();
  const [items, setItems] = useState<Item[]>([])
  const [err, setErr] = useState<string | null>(null)
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
    <div 
      className={`h-full flex flex-col rounded-xl overflow-hidden relative group ${
        theme === 'dark'
          ? 'glass-dark bg-gray-900/40 backdrop-blur-md border border-white/10 shadow-lg'
          : 'glass-light bg-white/30 backdrop-blur-md border border-gray-200/50 shadow-md'
      }`}
      style={{ 
        transform: 'translateZ(0)', 
        contain: 'layout style paint',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Glow effect on hover - optimized with CSS */}
      <div 
        className={`absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent'
            : 'bg-gradient-to-br from-blue-200/20 via-purple-200/10 to-transparent'
        }`}
        style={{
          transform: 'translateZ(0)',
          transition: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          backfaceVisibility: 'hidden',
        }}
      />
      {/* Header */}
      <div 
        className={`relative flex items-center justify-between px-4 py-3 border-b ${
          theme === 'dark' ? 'border-white/10' : 'border-gray-300/50'
        }`}
        style={{ contain: 'layout style paint' }}
      >
        <h3 className={`text-base font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Market News</h3>
      </div>

      {/* Scrollable content */}
      <div 
        className="relative flex-1 overflow-auto max-h-[72vh]"
        style={{
          transform: 'translateZ(0)',
          contain: 'layout style paint',
          WebkitOverflowScrolling: 'touch',
        }}
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
            <NewsItem
              key={i}
              item={n}
              onClick={(item) => {
                setSelectedNews(item)
                setIsModalOpen(true)
              }}
              theme={theme}
            />
          ))}
        </div>
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

