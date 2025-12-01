'use client'

import { useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { X, AlertTriangle } from 'lucide-react'

interface DisclaimerModalProps {
  isOpen: boolean
  onAccept: () => void
  onClose?: () => void
}

export default function DisclaimerModal({ isOpen, onAccept, onClose }: DisclaimerModalProps) {
  const { theme } = useTheme()
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleAccept = async () => {
    if (!accepted) return

    setLoading(true)
    try {
      const res = await fetch('/api/accept-disclaimer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ accepted: true }),
      })

      if (res.ok) {
        onAccept()
      } else {
        const error = await res.json()
        alert(error.detail || 'Failed to accept disclaimer. Please try again.')
      }
    } catch (err) {
      console.error('Error accepting disclaimer:', err)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - non-clickable when onClose is not provided */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose || undefined}
        style={{ cursor: onClose ? 'pointer' : 'default' }}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-2xl rounded-xl shadow-2xl transition-all ${
          theme === 'dark'
            ? 'bg-gray-900 border border-gray-800'
            : 'bg-white border border-gray-200'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle
              className={`w-6 h-6 ${
                theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
              }`}
            />
            <h2
              className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Important Disclaimer
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div
            className={`space-y-4 text-sm leading-relaxed ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            <p>
              <strong>Profit Path provides market insights, trading signals, and AI-generated suggestions for informational and educational purposes only.</strong>
            </p>
            <p>
              We do not offer financial, investment, or trading advice, and we are not registered financial advisors or brokers. All trading decisions you make are solely your responsibility.
            </p>
            <p>
              Any actions you take based on our platform's recommendations, analysis, or content are done entirely at your own risk. Profit Path and its creators are not liable for any losses, damages, or outcomes resulting from trades or investment decisions made by users.
            </p>
          </div>

          {/* Checkbox */}
          <div className="mt-6 flex items-start gap-3">
            <input
              type="checkbox"
              id="disclaimer-checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className={`mt-1 w-5 h-5 rounded border-2 cursor-pointer transition-colors ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-800 checked:bg-blue-600 checked:border-blue-600'
                  : 'border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600'
              }`}
            />
            <label
              htmlFor="disclaimer-checkbox"
              className={`flex-1 cursor-pointer select-none ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              <span className="font-semibold">I understand and accept the disclaimer.</span>
              <span className="block text-xs mt-1 opacity-75">
                By checking this box, you acknowledge that you have read, understood, and agree to the terms above.
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-end gap-3 p-6 border-t ${
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          }`}
        >
          <button
            onClick={handleAccept}
            disabled={!accepted || loading}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Accepting...' : 'Accept & Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

