'use client'

import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { searchStock, StockSearchResult } from '@/lib/searchStock'

interface StockSearchAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (ticker: string, name: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  polygonKey: string
}

export default function StockSearchAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Enter stock symbol or company name (e.g. AAPL or Apple)",
  className = "",
  disabled = false,
  polygonKey,
}: StockSearchAutocompleteProps) {
  const { theme } = useTheme()
  const [suggestions, setSuggestions] = useState<StockSearchResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!value.trim() || value.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setLoading(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchStock(value, polygonKey)
        setSuggestions(results)
        setShowSuggestions(results.length > 0)
      } catch (error) {
        console.error('Error searching stocks:', error)
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setLoading(false)
      }
    }, 300) // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [value, polygonKey])

  const handleSelect = (result: StockSearchResult) => {
    onChange(result.ticker)
    onSelect(result.ticker, result.name)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false)
    } else if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault()
      handleSelect(suggestions[0])
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true)
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 transition-all ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-gray-600"
            : "bg-white border-gray-300 text-black placeholder-gray-400 focus:border-blue-500"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      />
      
      {loading && (
        <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        }`}>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className={`absolute z-50 w-full mt-1 rounded-lg border shadow-lg max-h-60 overflow-auto ${
          theme === "dark"
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-300"
        }`}>
          {suggestions.map((result, index) => (
            <button
              key={`${result.ticker}-${index}`}
              type="button"
              onClick={() => handleSelect(result)}
              className={`w-full text-left px-4 py-3 hover:bg-opacity-80 transition-colors ${
                theme === "dark"
                  ? "hover:bg-gray-800 text-white"
                  : "hover:bg-gray-100 text-gray-900"
              } ${index !== suggestions.length - 1 ? "border-b" : ""} ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold font-mono">{result.ticker}</div>
                  <div className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {result.name}
                  </div>
                </div>
                {result.market && (
                  <div className={`text-xs px-2 py-1 rounded ${
                    theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"
                  }`}>
                    {result.market}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

