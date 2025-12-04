'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import { Moon, Sun, Menu, X } from 'lucide-react'

export default function Header() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname?.startsWith(href))

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/my-assets', label: 'My Assets' },
    { href: '/watchlist', label: 'Watchlist' },
    { href: '/deep-research', label: 'Deep Research' },
    { href: '/news-brief', label: 'News Brief' },
    { href: '/pattern-trends', label: 'Pattern Trends' },
    { href: '/risk-management', label: 'Risk Management' },
    { href: '/market-chat', label: 'Market Chat' },
    { href: '/settings', label: 'Settings' },
  ]

  const navLinkClasses = (href: string) => {
    const baseClasses = 'px-3 py-1.5 rounded-xl text-sm transition-colors'
    const activeClasses = isActive(href)
      ? theme === 'dark'
        ? 'bg-white/15 text-white'
        : 'bg-blue-100 text-blue-700'
      : theme === 'dark'
        ? 'hover:bg-white/10 text-gray-300'
        : 'hover:bg-gray-100 text-gray-700'
    return `${baseClasses} ${activeClasses}`
  }

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      theme === 'dark'
        ? 'backdrop-blur-md bg-black/40 border-b border-white/10'
        : 'bg-white border-b border-gray-200 shadow-sm'
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

          {/* Desktop Navigation - Hidden on mobile/tablet */}
          <div className="hidden lg:flex items-center gap-1 flex-wrap justify-center flex-1 mx-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={navLinkClasses(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side: Theme Toggle + Logout (Desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all ${
                theme === 'dark'
                  ? 'bg-white/10 border border-white/20 hover:bg-white/15 text-white'
                  : 'bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-700'
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

          {/* Mobile Menu Button - Visible on mobile/tablet */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all ${
                theme === 'dark'
                  ? 'bg-white/10 border border-white/20 hover:bg-white/15 text-white'
                  : 'bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-700'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl transition-all ${
                theme === 'dark'
                  ? 'bg-white/10 border border-white/20 hover:bg-white/15 text-white'
                  : 'bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-700'
              }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 top-[64px] z-40 transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? 'opacity-100 visible'
            : 'opacity-0 invisible'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            theme === 'dark'
              ? 'bg-black/60 backdrop-blur-sm'
              : 'bg-black/40 backdrop-blur-sm'
          } ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Mobile Menu Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] transform transition-transform duration-300 ease-in-out ${
            theme === 'dark'
              ? 'bg-gray-900 backdrop-blur-md border-l border-gray-700 shadow-2xl'
              : 'bg-white backdrop-blur-md border-l border-gray-200 shadow-2xl'
          } ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Navigation Links - Scrollable for light, static for dark */}
            <nav className={`px-4 pt-6 pb-4 space-y-2 ${
              theme === 'dark'
                ? 'flex-1 overflow-visible'
                : 'flex-1 overflow-y-auto min-h-0'
            }`}>
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive(link.href)
                      ? theme === 'dark'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-blue-100 text-blue-700'
                      : theme === 'dark'
                        ? 'text-gray-200 hover:bg-gray-800 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Footer - Logout - Fixed at bottom */}
            <div className={`flex-shrink-0 px-4 pt-4 pb-6 border-t ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <form action="/api/logout" method="post">
                <button
                  type="submit"
                  className={`w-full px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                      : 'bg-red-50 border border-red-200 hover:bg-red-100 text-red-600'
                  }`}
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

