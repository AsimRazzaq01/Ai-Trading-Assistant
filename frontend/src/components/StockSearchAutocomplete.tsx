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
  const [showSuggestions] = useState(false) // Always false - dropdown removed
  const [loading, setLoading] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

    // Dropdown removed - no need for click outside handler

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!value.trim() || value.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchStock(value, polygonKey)
        setSuggestions(results)
        // Dropdown removed - suggestions stored but not displayed
      } catch (error) {
        console.error('Error searching stocks:', error)
        setSuggestions([])
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
    setSuggestions([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
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

      {/* Dropdown removed - users can type and press Enter to search */}
    </div>
  )
}

