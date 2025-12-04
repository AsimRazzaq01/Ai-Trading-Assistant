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
  disableAutocomplete?: boolean // New prop to disable autocomplete dropdown
}

export default function StockSearchAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Enter stock symbol or company name (e.g. AAPL or Apple)",
  className = "",
  disabled = false,
  polygonKey,
  disableAutocomplete = false, // Default to false (autocomplete enabled)
}: StockSearchAutocompleteProps) {
  const { theme } = useTheme()
  const [suggestions, setSuggestions] = useState<StockSearchResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    if (showSuggestions && !disableAutocomplete) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showSuggestions, disableAutocomplete])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!value.trim() || value.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      setSelectedIndex(-1)
      return
    }

    if (disableAutocomplete) {
      // If autocomplete is disabled, don't search
      return
    }

    setLoading(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchStock(value, polygonKey)
        setSuggestions(results)
        // Show dropdown only if there are multiple results (2 or more)
        setShowSuggestions(results.length > 1)
        setSelectedIndex(-1)
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
  }, [value, polygonKey, disableAutocomplete])

  const handleSelect = (result: StockSearchResult) => {
    onChange(result.ticker)
    onSelect(result.ticker, result.name)
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disableAutocomplete || !showSuggestions || suggestions.length === 0) {
      // If autocomplete is disabled or no suggestions, just handle Enter
      if (e.key === 'Enter') {
        // Let the parent handle the search
        return
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex])
        } else if (suggestions.length > 0) {
          // If no selection, use first result
          handleSelect(suggestions[0])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && containerRef.current) {
      const selectedElement = containerRef.current.querySelector(
        `[data-suggestion-index="${selectedIndex}"]`
      ) as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (!disableAutocomplete && suggestions.length > 1) {
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

      {/* Autocomplete dropdown - only show if enabled and multiple results */}
      {!disableAutocomplete && showSuggestions && suggestions.length > 1 && (
        <div className={`absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-lg border shadow-lg ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-300"
        }`}>
          {suggestions.map((result, index) => (
            <button
              key={`${result.ticker}-${index}`}
              data-suggestion-index={index}
              type="button"
              onClick={() => handleSelect(result)}
              className={`w-full text-left px-4 py-2 hover:bg-opacity-80 transition-colors ${
                index === selectedIndex
                  ? theme === "dark"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-900"
                  : theme === "dark"
                  ? "text-white hover:bg-gray-700"
                  : "text-gray-900 hover:bg-gray-100"
              } ${index === 0 ? "rounded-t-lg" : ""} ${
                index === suggestions.length - 1 ? "rounded-b-lg" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>
                    {result.ticker}
                  </div>
                  <div className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {result.name}
                  </div>
                </div>
                {result.market && (
                  <div className={`text-xs px-2 py-1 rounded ${
                    theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
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

