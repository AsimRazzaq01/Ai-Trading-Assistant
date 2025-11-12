"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { fetchStockSummary, StockSummary } from "@/lib/fetchStockSummary";

export default function WatchlistPage() {
  const { theme } = useTheme();
  const [tickers, setTickers] = useState<string[]>([]);
  const [stockData, setStockData] = useState<StockSummary[]>([]);
  const [newTicker, setNewTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ✅ Use your Polygon key from .env
  const polygonKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY || "";

  /* ─────────────── Load Saved Watchlist ─────────────── */
  useEffect(() => {
    const saved = localStorage.getItem("watchlist");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setTickers(parsed);
      } catch (e) {
        console.error("Error loading watchlist:", e);
      }
    }
  }, []);

  /* ─────────────── Save Watchlist ─────────────── */
  useEffect(() => {
    if (tickers.length > 0) {
      localStorage.setItem("watchlist", JSON.stringify(tickers));
    }
  }, [tickers]);

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
    loadStockData();
  }, [tickers]);

  /* ─────────────── Add / Remove ─────────────── */
  const addTicker = async () => {
    const symbol = newTicker.trim().toUpperCase();
    if (!symbol) return;
    if (tickers.includes(symbol)) {
      setError("Ticker already in watchlist.");
      return;
    }
    
    if (!polygonKey) {
      setError("Polygon API key not configured.");
      return;
    }
    
    setError("");
    setLoading(true);
    try {
      // ✅ Quick validation via Polygon API
      const check = await fetchStockSummary([symbol], polygonKey);
      if (check.length === 0) throw new Error("Invalid ticker.");
      setTickers((prev) => [...prev, symbol]);
      setNewTicker("");
    } catch (err) {
      console.error(err);
      setError("Invalid or unknown stock symbol.");
    } finally {
      setLoading(false);
    }
  };

  const removeTicker = (symbol: string) => {
    setTickers((prev) => prev.filter((t) => t !== symbol));
  };

  /* ─────────────── Render ─────────────── */
  return (
    <main
      className={`min-h-screen px-8 py-20 transition-colors duration-500 ${
        theme === "dark"
          ? "bg-gradient-to-b from-black via-gray-950 to-black text-white"
          : "bg-gradient-to-b from-[#f5f7fa] via-[#c3e0dc] to-[#9ad0c2] text-gray-900"
      }`}
    >
      <div className="max-w-5xl mx-auto">
        <h1 className={`text-3xl font-bold mb-6 ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}>My Watchlist</h1>
        <p className={`text-sm mb-6 opacity-80 ${
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        }`}>
          Keep track of your favorite stocks at a glance.
        </p>

        {/* Add Ticker */}
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter ticker (e.g. AAPL)"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTicker()}
              className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            />
            <button
              onClick={addTicker}
              disabled={loading}
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
            onClick={loadStockData}
            disabled={refreshing || tickers.length === 0}
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

        {/* Watchlist Table */}
        {stockData.length === 0 ? (
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            No stocks in your watchlist yet. Add one above to get started.
          </p>
        ) : (
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
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>{s.symbol}</td>
                    <td className={`py-3 px-4 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>{s.name}</td>
                    <td className={`py-3 px-4 text-right ${
                      theme === "dark" ? "text-white" : "text-gray-900"
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
    </main>
  );
}
