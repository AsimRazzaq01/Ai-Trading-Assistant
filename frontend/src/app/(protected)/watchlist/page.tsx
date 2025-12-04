"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { fetchStockSummary, StockSummary } from "@/lib/fetchStockSummary";
import StockSearchAutocomplete from "@/components/StockSearchAutocomplete";

interface WatchlistItem {
  id: number;
  symbol: string;
  created_at: string;
}

export default function WatchlistPage() {
  const { theme } = useTheme();
  const [tickers, setTickers] = useState<string[]>([]);
  const [stockData, setStockData] = useState<StockSummary[]>([]);
  const [newTicker, setNewTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);
  const [error, setError] = useState("");

  // ✅ Use your Polygon key from .env
  const polygonKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY || "";

  /* ─────────────── Load Watchlist from API ─────────────── */
  const loadWatchlist = async () => {
    setLoadingWatchlist(true);
    setError("");
    
    try {
      const res = await fetch("/api/watchlist", {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("Please log in to view your watchlist.");
          setTickers([]);
          return;
        }
        throw new Error(`Failed to load watchlist: ${res.status}`);
      }

      const data = await res.json();
      const symbols = data.items?.map((item: WatchlistItem) => item.symbol) || [];
      setTickers(symbols);
    } catch (e) {
      console.error("Error loading watchlist:", e);
      setError("Failed to load watchlist. Please try again.");
      setTickers([]);
    } finally {
      setLoadingWatchlist(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
    
    // Listen for watchlist updates from other components
    const handleWatchlistUpdate = () => {
      loadWatchlist();
    };
    
    window.addEventListener('watchlistUpdated', handleWatchlistUpdate);
    
    return () => {
      window.removeEventListener('watchlistUpdated', handleWatchlistUpdate);
    };
  }, []);

  /* ─────────────── Fetch Stock Data ─────────────── */
  const loadStockData = async () => {
    if (!tickers.length) {
      setStockData([]);
      return;
    }
    
    if (!polygonKey) {
      setError("Polygon API key not configured.");
      return;
    }
    
    setRefreshing(true);
    try {
      const data = await fetchStockSummary(tickers, polygonKey);
      setStockData(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch stock data.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!loadingWatchlist && tickers.length > 0) {
      loadStockData();
    } else if (!loadingWatchlist) {
      setStockData([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickers, loadingWatchlist]);

  /* ─────────────── Add / Remove ─────────────── */
  const handleStockSelect = async (ticker: string, name: string) => {
    if (!ticker) {
      setError("Please select a stock from the dropdown.");
      return;
    }
    
    if (!polygonKey) {
      setError("Polygon API key not configured.");
      return;
    }
    
    setError("");
    setLoading(true);
    try {
      // Check if already in local state
      if (tickers.includes(ticker)) {
        setError("Ticker already in watchlist.");
        setLoading(false);
        return;
      }
      
      // ✅ Quick validation via Polygon API
      const check = await fetchStockSummary([ticker], polygonKey);
      if (check.length === 0) {
        throw new Error("Invalid ticker.");
      }
      
      // Add to backend
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ symbol: ticker }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 400 && errorData.detail?.includes("already")) {
          setError("Ticker already in watchlist.");
          await loadWatchlist(); // Reload to sync
          return;
        }
        throw new Error(errorData.detail || "Failed to add to watchlist");
      }

      // Reload watchlist from API
      await loadWatchlist();
      setNewTicker("");
      setError(""); // Clear any previous errors
      
      // Trigger event for other components
      window.dispatchEvent(new CustomEvent('watchlistUpdated'));
    } catch (err: any) {
      console.error("Error adding ticker:", err);
      setError(err.message || "Invalid or unknown stock symbol. Please check the symbol and try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeTicker = async (symbol: string) => {
    setError("");
    
    try {
      const res = await fetch(`/api/watchlist/${encodeURIComponent(symbol)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to remove from watchlist");
      }

      // Reload watchlist from API
      await loadWatchlist();
      
      // Trigger event for other components
      window.dispatchEvent(new CustomEvent('watchlistUpdated'));
    } catch (err) {
      console.error("Error removing ticker:", err);
      setError("Failed to remove ticker. Please try again.");
    }
  };

  /* ─────────────── Render ─────────────── */
  return (
    <main
      className={`min-h-screen px-8 py-20 transition-colors duration-500 relative overflow-hidden ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-950/95 via-black/95 to-gray-900/95 text-white"
          : "bg-gradient-to-b from-white/60 to-[#f0f4ff]/60 text-gray-900 backdrop-blur-[2px]"
      }`}
    >
      {/* Animated background elements - Updated to Cyan and Emerald for light theme */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${
        theme === "dark" ? "opacity-20" : "opacity-15"
      }`}>
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl ${
          theme === "dark" ? "bg-blue-500" : "bg-cyan-500"
        } animate-pulse`} style={{ animationDuration: '4s' }}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl ${
          theme === "dark" ? "bg-purple-500" : "bg-emerald-500"
        } animate-pulse`} style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
      </div>
      <div className="relative z-10">
      <div className="max-w-5xl mx-auto">
        <h1 className={`text-3xl font-bold mb-6 ${
          theme === "dark" ? "text-white" : "text-[#2d3748]"
        }`}>My Watchlist</h1>
        <p className={`text-sm mb-6 opacity-80 ${
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        }`}>
          Keep track of your favorite stocks at a glance.
        </p>

        {/* Add Ticker */}
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[300px]">
            <StockSearchAutocomplete
              value={newTicker}
              onChange={setNewTicker}
              onSelect={handleStockSelect}
              placeholder="Enter ticker or company name (e.g. AAPL or Apple)"
              disabled={loading || loadingWatchlist}
              polygonKey={polygonKey}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => handleStockSelect(newTicker.trim(), "")}
              disabled={loading || loadingWatchlist || !newTicker.trim()}
              className={`px-4 py-2 rounded-lg disabled:opacity-50 transition-all ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-400 hover:bg-blue-500 text-white"
              }`}
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>

          <button
            type="button"
            onClick={loadStockData}
            disabled={refreshing || tickers.length === 0 || loadingWatchlist}
            className={`px-4 py-2 rounded-lg disabled:opacity-50 transition-all ${
              theme === "dark"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-green-400 hover:bg-green-500 text-white"
            }`}
          >
            {refreshing ? "Refreshing..." : "Refresh Prices"}
          </button>
        </div>

        {error && <p className={`mb-4 ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>{error}</p>}

        {/* Loading State */}
        {loadingWatchlist && (
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            Loading watchlist...
          </p>
        )}

        {/* Watchlist Table */}
        {!loadingWatchlist && stockData.length === 0 && tickers.length === 0 && (
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            No stocks in your watchlist yet. Add one above to get started.
          </p>
        )}

        {!loadingWatchlist && stockData.length > 0 && (
          <div
            className={`rounded-xl border shadow-md overflow-x-auto transition-colors ${
              theme === "dark"
                ? "bg-gray-900 border-gray-700"
                : "bg-[#eaf5f3] border-[#cde3dd]"
            }`}
          >
            <table className="min-w-full text-sm">
              <thead>
                <tr
                  className={`text-left border-b ${
                    theme === "dark" ? "border-gray-700" : "border-gray-300"
                  }`}
                >
                  <th className={`py-3 px-4 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>Symbol</th>
                  <th className={`py-3 px-4 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>Name</th>
                  <th className={`py-3 px-4 text-right ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>Price</th>
                  <th className={`py-3 px-4 text-right ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>Change</th>
                  <th className={`py-3 px-4 text-right ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stockData.map((s) => (
                  <tr
                    key={s.symbol}
                    className={`border-b last:border-none ${
                      theme === "dark"
                        ? "border-gray-800 hover:bg-gray-800/60"
                        : "border-gray-200 hover:bg-[#d9ebe7]"
                    }`}
                  >
                    <td className={`py-3 px-4 font-semibold ${
                      theme === "dark" ? "text-white" : "text-[#2d3748]"
                    }`}>{s.symbol}</td>
                    <td className={`py-3 px-4 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>{s.name}</td>
                    <td className={`py-3 px-4 text-right ${
                      theme === "dark" ? "text-white" : "text-[#2d3748]"
                    }`}>${s.price.toFixed(2)}</td>
                    <td
                      className={`py-3 px-4 text-right font-medium ${
                        s.changePercent >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {s.changePercent >= 0 ? "+" : ""}
                      {s.changePercent.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => removeTicker(s.symbol)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </main>
  );
}
