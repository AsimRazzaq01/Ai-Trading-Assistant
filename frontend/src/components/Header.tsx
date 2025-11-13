'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import { Moon, Sun } from 'lucide-react'

export default function Header() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname?.startsWith(href))

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      theme === 'dark'
        ? 'backdrop-blur-md bg-black/40 border-b border-white/10'
        : 'backdrop-blur-md bg-white/90 border-b border-gray-200 shadow-sm'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link 
            href="/dashboard" 
            className={`font-semibold text-xl transition ${
              theme === 'dark' 
                ? 'text-white hover:text-gray-300' 
                : 'text-gray-900 hover:text-blue-600'
            }`}
          >
            Profit Path 🚀
          </Link>

          {/* Center Navigation */}
          <div className="flex items-center gap-1 flex-wrap justify-center flex-1 mx-4">
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
                isActive('/dashboard')
                  ? theme === 'dark' 
                    ? 'bg-white/15 text-white' 
                    : 'bg-blue-100 text-blue-700'
                  : theme === 'dark'
                    ? 'hover:bg-white/10 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/my-assets"
              className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
                isActive('/my-assets')
                  ? theme === 'dark' 
                    ? 'bg-white/15 text-white' 
                    : 'bg-blue-100 text-blue-700'
                  : theme === 'dark'
                    ? 'hover:bg-white/10 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              My Assets
            </Link>
            <Link
              href="/watchlist"
              className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
                isActive('/watchlist')
                  ? theme === 'dark' 
                    ? 'bg-white/15 text-white' 
                    : 'bg-blue-100 text-blue-700'
                  : theme === 'dark'
                    ? 'hover:bg-white/10 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Watchlist
            </Link>
            <Link
              href="/deep-research"
              className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
                isActive('/deep-research')
                  ? theme === 'dark' 
                    ? 'bg-white/15 text-white' 
                    : 'bg-blue-100 text-blue-700'
                  : theme === 'dark'
                    ? 'hover:bg-white/10 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Deep Research
            </Link>
            <Link
              href="/news-brief"
              className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
                isActive('/news-brief')
                  ? theme === 'dark' 
                    ? 'bg-white/15 text-white' 
                    : 'bg-blue-100 text-blue-700'
                  : theme === 'dark'
                    ? 'hover:bg-white/10 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              News Brief
            </Link>
            <Link
              href="/pattern-trends"
              className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
                isActive('/pattern-trends')
                  ? theme === 'dark' 
                    ? 'bg-white/15 text-white' 
                    : 'bg-blue-100 text-blue-700'
                  : theme === 'dark'
                    ? 'hover:bg-white/10 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Pattern Trends
            </Link>
            <Link
              href="/risk-management"
              className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
                isActive('/risk-management')
                  ? theme === 'dark' 
                    ? 'bg-white/15 text-white' 
                    : 'bg-blue-100 text-blue-700'
                  : theme === 'dark'
                    ? 'hover:bg-white/10 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Risk Management
            </Link>
            <Link
              href="/market-chat"
              className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
                isActive('/market-chat')
                  ? theme === 'dark' 
                    ? 'bg-white/15 text-white' 
                    : 'bg-blue-100 text-blue-700'
                  : theme === 'dark'
                    ? 'hover:bg-white/10 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Market Chat
            </Link>
            <Link
              href="/settings"
              className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
                isActive('/settings')
                  ? theme === 'dark' 
                    ? 'bg-white/15 text-white' 
                    : 'bg-blue-100 text-blue-700'
                  : theme === 'dark'
                    ? 'hover:bg-white/10 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Settings
            </Link>
          </div>

          {/* Right Side: Theme Toggle + Logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all ${
                theme === 'dark'
                  ? 'bg-white/10 border border-white/20 hover:bg-white/15 text-white'
                  : 'bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-900'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <form action="/api/logout" method="post">
              <button 
                className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                  theme === 'dark'
                    ? 'bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-400'
                    : 'bg-red-50 border border-red-200 hover:bg-red-100 text-red-600'
                }`}
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>
    </header>
  )
}

