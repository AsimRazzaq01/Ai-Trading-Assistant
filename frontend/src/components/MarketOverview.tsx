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
      className={`relative flex items-center justify-between text-sm cursor-pointer transition-colors duration-150 rounded-lg p-2 overflow-hidden group/item ${
        theme === 'dark'
          ? 'hover:bg-white/5 border border-transparent'
          : 'hover:bg-white/60 border border-transparent'
      } will-change-transform`}
      style={{ transform: 'translateZ(0)' }}
    >
      {/* Ripple effect */}
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
            willChange: 'width, height, opacity',
          }}
        />
      )}
      
      {/* Border glow on hover - simplified for performance */}
      <div className={`absolute inset-0 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 ${
        (row.changePct ?? 0) >= 0
          ? 'bg-green-500/5'
          : 'bg-red-500/5'
      } pointer-events-none will-change-opacity`} />
      
      <div className="relative flex items-center gap-2 z-10">
        <span className="font-mono font-semibold">{row.symbol}</span>
        <span className="opacity-70">{row.name?.slice(0,28)}</span>
      </div>
      <div className="relative text-right z-10">
        <div className="opacity-80">${(row.price ?? 0).toFixed(2)}</div>
        <div className={`transition-all duration-300 ${(row.changePct ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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
      <div className={`h-full flex flex-col rounded-xl transition-shadow duration-200 overflow-hidden relative group ${
        theme === 'dark'
          ? 'glass-dark bg-gray-900/40 backdrop-blur-md border border-white/10 shadow-lg'
          : 'glass-light bg-white/30 backdrop-blur-md border border-gray-200/50 shadow-md'
      } hover:shadow-xl will-change-shadow`}
      style={{ transform: 'translateZ(0)', contain: 'layout style paint' }}>
        {/* Glow effect on hover */}
        <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent'
            : 'bg-gradient-to-br from-blue-200/20 via-purple-200/10 to-transparent'
        } pointer-events-none will-change-opacity`} />
        
        <div className={`relative flex items-center justify-between px-4 py-3 border-b ${
          theme === 'dark' ? 'border-white/10' : 'border-gray-300/50'
        }`}
        style={{ contain: 'layout style paint' }}>
          <h3 className={`text-base font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{title}</h3>
        </div>
        <div className="relative flex-1 overflow-auto max-h-[72vh] will-change-scroll">
          <div className="p-4 space-y-2">
            {displayItems.map(r => (
              <StockItem 
                key={r.symbol}
                row={r}
                onClick={handleStockClick}
                theme={theme}
              />
            ))}
            {!displayItems.length && <div className={`text-sm ${
              theme === 'dark' ? 'opacity-60 text-gray-400' : 'opacity-60 text-gray-600'
            }`}>No data.</div>}
          </div>
          {/* Fade hint when scrolled */}
          {displayItems.length > 10 && (
            <div className={`pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t ${
              theme === 'dark' ? 'from-gray-900/40' : 'from-[#eaf5f3]/40'
            } to-transparent`} />
          )}
        </div>
      </div>
    );
  }
  
  return (
    <>
      {err && <div className={`md:col-span-3 p-4 rounded-xl text-red-300 text-sm ${
        theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-red-50 border border-red-200'
      }`}>Market data error: {err}</div>}
      <List title="Top Gainers" items={gainers} />
      <List title="Top Losers"  items={losers} />
    </>
  )
}

