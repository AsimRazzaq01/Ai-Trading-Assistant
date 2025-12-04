'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'

type Row = { symbol: string; name?: string; price?: number|null; changePct?: number|null }

// Stock Item Component with ripple effect
const StockItem = ({ 
  row, 
  onClick, 
  theme 
}: { 
  row: Row; 
  onClick: (symbol: string) => void; 
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
    
    onClick(row.symbol);
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
      className={`relative flex items-center justify-between text-sm cursor-pointer rounded-lg p-2 overflow-hidden group/item stock-item-hover ${
        theme === 'dark'
          ? 'border border-transparent'
          : 'border border-transparent'
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
            theme === 'dark' ? 'bg-white/20' : 'bg-[#2d3748]/15'
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
        className={`absolute inset-0 rounded-lg pointer-events-none opacity-0 group-hover/item:opacity-100 ${
          (row.changePct ?? 0) >= 0
            ? 'bg-green-500/5'
            : 'bg-red-500/5'
        }`}
        style={{
          transform: 'translateZ(0)',
          transition: 'opacity 120ms cubic-bezier(0.4, 0, 0.2, 1)',
          backfaceVisibility: 'hidden',
        }}
      />
      
      <div className="relative flex items-center gap-2 z-10">
        <span className="font-mono font-semibold">{row.symbol}</span>
        <span className="opacity-70">{row.name?.slice(0,28)}</span>
      </div>
      <div className="relative text-right z-10">
        <div className="opacity-80">${(row.price ?? 0).toFixed(2)}</div>
        <div className={`${(row.changePct ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {(row.changePct ?? 0) >= 0 ? '+' : ''}{(row.changePct ?? 0).toFixed(2)}%
        </div>
      </div>
    </div>
  );
};

export default function MarketOverview() {
  const { theme } = useTheme();
  const router = useRouter();
  const [gainers, setGainers] = useState<Row[]>([])
  const [losers, setLosers] = useState<Row[]>([])
  const [err, setErr] = useState<string | null>(null)
  
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/market/top', { cache: 'no-store' })
        const j = await r.json()
        if (!r.ok) throw new Error(j?.error || 'Failed')
        setGainers(j.gainers || [])
        setLosers(j.losers || [])
      } catch (e: any) { setErr(e.message) }
    })()
  }, [])

  const handleStockClick = (symbol: string) => {
    router.push(`/deep-research?symbol=${encodeURIComponent(symbol)}`)
  }
  
  const List = ({ title, items }: { title: string; items: Row[] }) => {
    // Ensure we show all items (up to 50)
    const displayItems = items.slice(0, 50);
    
    return (
      <div 
        className={`h-full flex flex-col rounded-xl overflow-hidden relative ${
          theme === 'dark'
            ? 'glass-dark bg-gray-900/40 backdrop-blur-md border border-white/10 shadow-lg'
            : 'bg-white border border-gray-200 shadow-sm hover:shadow-lg transition'
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
              : 'bg-gradient-to-br from-blue-300/10 via-slate-300/8 to-transparent'
          }`}
          style={{
            transform: 'translateZ(0)',
            transition: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
            backfaceVisibility: 'hidden',
          }}
        />
        
        <div 
          className={`relative flex items-center justify-between px-5 py-3 border-b ${
            theme === 'dark' ? 'border-white/10' : 'border-gray-200'
          }`}
          style={{ contain: 'layout style paint' }}
        >
          <h3 className={`text-base font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{title}</h3>
        </div>
        <div 
          className="relative flex-1 overflow-auto max-h-[72vh]"
          style={{
            transform: 'translateZ(0)',
            contain: 'layout style paint',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="p-5 space-y-2">
            {displayItems.map(r => (
              <StockItem 
                key={r.symbol}
                row={r}
                onClick={handleStockClick}
                theme={theme}
              />
            ))}
            {!displayItems.length && <div className={`text-sm ${
              theme === 'dark' ? 'opacity-60 text-gray-400' : 'text-gray-600'
            }`}>No data.</div>}
          </div>
          {/* Fade hint when scrolled */}
          {displayItems.length > 10 && (
            <div className={`pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t ${
              theme === 'dark' ? 'from-gray-900/40' : 'from-[#e8ebef]/40'
            } to-transparent`} />
          )}
        </div>
      </div>
    );
  }
  
  return (
    <>
      {err && <div className={`md:col-span-3 p-5 rounded-xl text-sm ${
        theme === 'dark' ? 'bg-gray-900 border border-gray-800 text-red-300' : 'bg-white border border-red-200 text-red-600 shadow-sm'
      }`}>Market data error: {err}</div>}
      <List title="Top Gainers" items={gainers} />
      <List title="Top Losers"  items={losers} />
    </>
  )
}

