"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchStockData } from "@/lib/fetchStockData";
import StockSearchAutocomplete from "@/components/StockSearchAutocomplete";

/* ───────────────── Helper UI ───────────────── */

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin align-middle" />
  );
}

/** Top-center toast that auto-dismisses in 5s (still closable) */
function Toast({
  kind = "info",
  message,
  onClose,
}: {
  kind?: "success" | "error" | "info";
  message: string;
  onClose: () => void;
}) {
  const color =
    kind === "success"
      ? "bg-green-600"
      : kind === "error"
      ? "bg-red-600"
      : "bg-blue-600";
  return (
    <div
      className={`${color} text-white px-5 py-3 rounded-xl shadow-lg flex items-center justify-between min-w-[300px] animate-fadeIn`}
      role="status"
    >
      <span className="text-sm">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 opacity-80 hover:opacity-100 text-lg leading-none"
      >
        ✕
      </button>
    </div>
  );
}

/** Collapsible long text (prevents cutoff of AI text) */
function ExpandableText({
  text,
  previewChars = 380,
  className = "",
}: {
  text: string;
  previewChars?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  const needsToggle = text.length > previewChars;
  const shown = !needsToggle
    ? text
    : open
    ? text
    : text.slice(0, previewChars) + "…";
  return (
    <div className={`${className} leading-relaxed text-sm`}>
      <p className="whitespace-pre-line">{shown}</p>
      {needsToggle && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="mt-1 text-xs underline opacity-80 hover:opacity-100"
        >
          {open ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

/* ───────────────── Page ───────────────── */

export default function MyAssetsPage() {
  const { theme } = useTheme();

  // Data
  const [assets, setAssets] = useState<any[]>([]);
  const [newAsset, setNewAsset] = useState("");
  const [compareList, setCompareList] = useState<string[]>([]);
  const [compareResult, setCompareResult] = useState("");
  const [user, setUser] = useState<any>(null);

  // UI state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Range controls - Load from localStorage
  const [chartRange, setChartRange] = useState(() => {
    const saved = localStorage.getItem("myAssetsChartRange");
    return saved ? parseInt(saved) : 30;
  });
  const [customFrom, setCustomFrom] = useState(() => {
    const saved = localStorage.getItem("myAssetsCustomFrom");
    return saved || "";
  });
  const [customTo, setCustomTo] = useState(() => {
    const saved = localStorage.getItem("myAssetsCustomTo");
    return saved || "";
  });
  const [rangeMode, setRangeMode] = useState<"preset" | "custom">(() => {
    const saved = localStorage.getItem("myAssetsRangeMode");
    return (saved === "custom" ? "custom" : "preset") as "preset" | "custom";
  });

  // Save range controls to localStorage
  useEffect(() => {
    localStorage.setItem("myAssetsChartRange", chartRange.toString());
  }, [chartRange]);

  useEffect(() => {
    localStorage.setItem("myAssetsCustomFrom", customFrom);
  }, [customFrom]);

  useEffect(() => {
    localStorage.setItem("myAssetsCustomTo", customTo);
  }, [customTo]);

  useEffect(() => {
    localStorage.setItem("myAssetsRangeMode", rangeMode);
  }, [rangeMode]);

  // Toasts
  const [toasts, setToasts] = useState<
    { id: number; kind: "success" | "error" | "info"; msg: string }[]
  >([]);

  // Keys - use environment variables
  const polygonKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY || "";
  const openAiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";

  /* ─────────────── Toast helpers (top-center, auto-dismiss) ─────────────── */
  const addToast = (
    msg: string,
    kind: "success" | "error" | "info" = "info"
  ) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, msg }]);
    setTimeout(() => removeToast(id), 5000);
  };
  const removeToast = (id: number) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  // Load user info
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    })();
  }, []);

  /* ─────────────── Load & Save Watchlist ─────────────── */
  useEffect(() => {
    if (!user) return; // Wait for user to load
    
    // Use user-specific localStorage key
    const storageKey = `myAssets_${user.id || user.email || 'default'}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate that it's an array and not empty/invalid
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAssets(parsed);
        } else {
          // Clear invalid data
          localStorage.removeItem(storageKey);
          setAssets([]);
        }
      } catch (e) {
        console.error("Error loading assets:", e);
        // Clear corrupted data
        localStorage.removeItem(storageKey);
        setAssets([]);
      }
    } else {
      // No saved data for this user - ensure empty array
      setAssets([]);
    }
  }, [user]);
  
  useEffect(() => {
    if (!user) return; // Wait for user to load
    
    // Use user-specific localStorage key
    const storageKey = `myAssets_${user.id || user.email || 'default'}`;
    if (assets.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(assets));
    } else {
      // Clear storage when assets are empty
      localStorage.removeItem(storageKey);
    }
  }, [assets, user]);

  // Reset range when all assets removed
  useEffect(() => {
    if (assets.length === 0) {
      setRangeMode("preset");
      setCustomFrom("");
      setCustomTo("");
    }
  }, [assets]);

  /* ─────────────── Polygon helpers ─────────────── */
  const polygonFetch = async (url: string) => {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Polygon error");
    return res.json();
  };

  const validateTicker = async (symbol: string) => {
    if (!polygonKey) return false;
    try {
      const json = await polygonFetch(
        `https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${polygonKey}`
      );
      return !!json?.results?.ticker;
    } catch {
      return false;
    }
  };

  const getPolygonPrice = async (symbol: string) => {
    if (!polygonKey) return undefined;
    try {
      const json = await polygonFetch(
        `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${polygonKey}`
      );
      const c = json?.results?.[0]?.c;
      return Number.isFinite(c) ? Number(c) : undefined;
    } catch {
      return undefined;
    }
  };

  /* ─────────────── AI helpers ─────────────── */
  const generateAISummary = async (symbol: string, name: string) => {
    if (!openAiKey) return "AI summary unavailable.";
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "You are a concise, factual stock analyst. Return short bullets under: Trend, Drivers, Risks.",
            },
            {
              role: "user",
              content: `Summarize ${name} (${symbol}) over the last ${chartRange} days with 2–4 bullets total.`,
            },
          ],
          max_tokens: 160,
        }),
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "No insight.";
    } catch {
      return "Error fetching AI summary.";
    }
  };

  const getAIRating = async (symbol: string, name: string) => {
    if (!openAiKey) return "Recommendation: Hold — AI key missing.";
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.1,
          messages: [
            {
              role: "system",
              content:
                "Classify to one of: Strong Buy, Buy, Hold, Sell, Strong Sell. Output must start with 'Recommendation:' and include 1 short reason.",
            },
            {
              role: "user",
              content: `Rate ${name} (${symbol}) based on ${chartRange}-day trend, volatility, and sentiment. Format: "Recommendation: <Label> — <reason>."`,
            },
          ],
          max_tokens: 50,
        }),
      });
      const data = await res.json();
      const txt =
        data.choices?.[0]?.message?.content?.trim() ||
        "Recommendation: Hold — insufficient data.";
      if (!/^Recommendation:/i.test(txt)) {
        return `Recommendation: Hold — ${txt}`;
      }
      return txt;
    } catch {
      return "Recommendation: Hold — error fetching rating.";
    }
  };

  const summarizeNews = async (symbol: string, news: any[]) => {
    if (!news?.length || !openAiKey) return "No recent news.";
    const headlines = news.map((n: any) => n.title).join("; ");
    try {
      const ai = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content: "Summarize in 3–4 short, factual sentences.",
            },
            {
              role: "user",
              content: `Summarize news for ${symbol}: ${headlines}`,
            },
          ],
          max_tokens: 120,
        }),
      });
      const json = await ai.json();
      return json.choices?.[0]?.message?.content || "No summary available.";
    } catch {
      return "Unable to fetch news.";
    }
  };

  /* ─────────────── Add asset ─────────────── */
  const handleStockSelect = async (ticker: string, name: string) => {
    if (!ticker) {
      addToast("Please select a stock from the dropdown.", "error");
      return;
    }

    if (!polygonKey) {
      addToast("Polygon API key not configured.", "error");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const symbol = ticker.toUpperCase();
      const data = await fetchStockData(symbol, chartRange, polygonKey);
      if (!data) {
        addToast("Could not load stock.", "error");
        setError("Failed to load stock data.");
        return;
      }

      let price: number | undefined =
        typeof data.price === "number" ? data.price : undefined;
      if (!Number.isFinite(price)) {
        price = await getPolygonPrice(symbol);
      }

      const aiInsight = await generateAISummary(symbol, data.name ?? symbol);
      const aiRating = await getAIRating(symbol, data.name ?? symbol);
      const aiNews = await summarizeNews(symbol, data.news);

      setAssets((prev) => [
        ...prev,
        {
          symbol,
          name: data.name ?? name ?? symbol,
          price,
          chart: data.chart,
          aiInsight,
          aiRating,
          aiNews,
        },
      ]);
      setNewAsset("");
      addToast(`Added ${symbol} to your dashboard.`, "success");
    } catch (e) {
      console.error(e);
      addToast("Unexpected error adding stock.", "error");
      setError("Unexpected error adding stock.");
    } finally {
      setLoading(false);
    }
  };

  const addAsset = async () => {
    // Legacy function for Enter key support - will be handled by autocomplete
    if (newAsset.trim()) {
      // If user types and presses Enter, try to use the value as-is
      // The autocomplete will handle selection
      handleStockSelect(newAsset.trim(), "");
    }
  };

  /* ─────────────── Refresh all ─────────────── */
  const refreshAll = async () => {
    if (!polygonKey) {
      addToast("Polygon API key not configured.", "error");
      return;
    }
    
    setRefreshing(true);
    try {
      const updated = await Promise.all(
        assets.map(async (a) => {
          const data = await fetchStockData(a.symbol, chartRange, polygonKey);
          if (!data) return a;

          let price: number | undefined =
            typeof data.price === "number" ? data.price : undefined;
          if (!Number.isFinite(price)) {
            price = await getPolygonPrice(a.symbol);
          }

          const aiInsight = await generateAISummary(
            a.symbol,
            data.name ?? a.symbol
          );
          const aiRating = await getAIRating(a.symbol, data.name ?? a.symbol);
          const aiNews = await summarizeNews(a.symbol, data.news);

          return {
            symbol: a.symbol,
            name: data.name ?? a.symbol,
            price,
            chart: data.chart,
            aiInsight,
            aiRating,
            aiNews,
          };
        })
      );
      setAssets(updated);
      addToast("All assets refreshed.", "success");
    } catch {
      addToast("Error refreshing data.", "error");
    } finally {
      setRefreshing(false);
    }
  };

  /* ─────────────── Remove asset ─────────────── */
  const removeAsset = (symbol: string) => {
    setAssets((prev) => prev.filter((a) => a.symbol !== symbol));
    setCompareList((prev) => prev.filter((s) => s !== symbol));
  };

  /* ─────────────── Compare multi (2+) ─────────────── */
  const compareStocks = async () => {
    if (compareList.length < 2 || !openAiKey) return;
    setCompareResult("Running comparison…");
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "Compare multiple tickers in 3 tight bullets and end with a best→worst ranking.",
            },
            {
              role: "user",
              content: `Compare ${compareList.join(", ")} by recent performance, volatility, valuation feel, notable news, and give a final ranked pick.`,
            },
          ],
          max_tokens: 280,
        }),
      });
      const data = await res.json();
      setCompareResult(
        data.choices?.[0]?.message?.content || "No comparison result."
      );
    } catch {
      setCompareResult("Error running comparison.");
    }
  };

  /* ─────────────── UI ─────────────── */
  return (
    <main
      className={`min-h-screen px-8 py-20 transition-colors duration-500 relative overflow-hidden ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white"
          : "bg-gradient-to-br from-blue-100 via-purple-50 to-pink-50 text-[#2d3748]"
      }`}
    >
      {/* Animated background elements */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${
        theme === "dark" ? "opacity-20" : "opacity-10"
      }`}>
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl ${
          theme === "dark" ? "bg-blue-500" : "bg-blue-400"
        } animate-pulse`} style={{ animationDuration: '4s' }}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl ${
          theme === "dark" ? "bg-purple-500" : "bg-purple-400"
        } animate-pulse`} style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
      </div>
      <div className="relative z-10">
      {/* Toasts: top-center */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 space-y-2">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            kind={t.kind}
            message={t.msg}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          My Assets Dashboard (AI-Enhanced)
        </h1>

        {/* Add + Range Controls */}
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          {/* Input + Add */}
          <div className="flex items-center gap-2">
            <StockSearchAutocomplete
              value={newAsset}
              onChange={setNewAsset}
              onSelect={handleStockSelect}
              placeholder="Enter stock symbol or company name (e.g. AAPL or Apple)"
              disabled={loading}
              polygonKey={polygonKey}
              className="flex-1"
            />
            <button
              onClick={addAsset}
              disabled={loading || !newAsset.trim()}
              className={`px-4 py-2 rounded-lg disabled:opacity-50 transition-all flex items-center gap-2 ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {loading ? <Spinner /> : null}
              <span>{loading ? "Adding…" : "Add"}</span>
            </button>
          </div>

          {/* Range selector (7/30/90) */}
          <div className="flex flex-wrap gap-2 items-center">
            <label className="text-sm font-medium">Range Mode:</label>
            <select
              value={chartRange}
              onChange={(e) => {
                setChartRange(Number(e.target.value));
                setRangeMode("preset");
                setCustomFrom("");
                setCustomTo("");
              }}
              disabled={rangeMode === "custom"}
              className={`px-3 py-2 rounded-lg border ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white disabled:opacity-50"
                  : "bg-white border-gray-300 text-black disabled:opacity-50"
              }`}
            >
              <option value={7}>7 Days</option>
              <option value={30}>30 Days</option>
              <option value={90}>90 Days</option>
            </select>

            <span className="text-sm font-medium">or</span>

            {/* Custom range */}
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomFrom(val);
                  if (val && customTo) setRangeMode("custom");
                  else setRangeMode("preset");
                }}
                className={`px-3 py-2 rounded-lg border ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-black"
                }`}
              />
              <span>→</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomTo(val);
                  if (customFrom && val) setRangeMode("custom");
                  else setRangeMode("preset");
                }}
                className={`px-3 py-2 rounded-lg border ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-black"
                }`}
              />
            </div>

            {/* Mode indicator */}
            <span
              className={`ml-3 text-sm px-3 py-1 rounded-full ${
                rangeMode === "custom"
                  ? theme === "dark"
                    ? "bg-purple-700 text-white"
                    : "bg-purple-200 text-purple-800"
                  : theme === "dark"
                  ? "bg-blue-700 text-white"
                  : "bg-blue-200 text-blue-800"
              }`}
            >
              {rangeMode === "custom"
                ? `Custom Range Active`
                : `${chartRange}-Day Preset Active`}
            </span>
          </div>

          <button
            onClick={refreshAll}
            disabled={refreshing || assets.length === 0}
            className={`px-4 py-2 rounded-lg disabled:opacity-50 transition-all flex items-center gap-2 ${
              theme === "dark"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {refreshing ? <Spinner /> : null}
            <span>{refreshing ? "Refreshing…" : "Refresh All"}</span>
          </button>
        </div>

        {/* Error banner */}
        {error && <p className={`mb-4 ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>{error}</p>}

        {/* Watchlist */}
        {assets.length === 0 ? (
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>No assets added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((a) => (
              <div
                key={a.symbol}
                className={`p-5 rounded-xl border shadow-md flex flex-col transition-transform transform hover:-translate-y-1 ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-[#eaf5f3] border-[#cde3dd]"
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h2 className={`text-lg font-semibold ${
                      theme === "dark" ? "text-white" : "text-[#2d3748]"
                    }`}>
                      {a.name} <span className="opacity-70">({a.symbol})</span>
                    </h2>
                    <div className={`text-xs opacity-75 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {rangeMode === "custom" && customFrom && customTo
                        ? `Custom: ${customFrom} → ${customTo}`
                        : `Preset: Last ${chartRange} days`}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-green-500 font-semibold">
                      {Number.isFinite(Number(a.price))
                        ? `$${Number(a.price).toFixed(2)}`
                        : "$N/A"}
                    </p>
                    <button
                      onClick={() => removeAsset(a.symbol)}
                      className="text-red-500 hover:text-red-700 text-lg"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Chart */}
                {a.chart?.length > 0 && (() => {
                  // Calculate proper Y-axis domain
                  const prices = a.chart
                    .map((d: any) => typeof d.price === 'number' ? d.price : parseFloat(d.price) || 0)
                    .filter((p: number) => isFinite(p) && p > 0);
                  
                  if (prices.length === 0) return null;
                  
                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);
                  const priceRange = maxPrice - minPrice;
                  const padding = priceRange * 0.1 || maxPrice * 0.05; // 10% padding or 5% of max
                  
                  const yAxisMin = Math.max(0, minPrice - padding);
                  const yAxisMax = maxPrice + padding;
                  
                  return (
                    <div className="h-40 w-full mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={a.chart}>
                          <XAxis
                            dataKey="date"
                            tick={{ fill: theme === "dark" ? "#ccc" : "#333", fontSize: 10 }}
                          />
                          <YAxis
                            domain={[yAxisMin, yAxisMax]}
                            tick={{
                              fill: theme === "dark" ? "#ccc" : "#333",
                              fontSize: 10,
                            }}
                            tickFormatter={(value: number) => {
                              if (!isFinite(value) || value <= 0) return '';
                              if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
                              return `$${value.toFixed(2)}`;
                            }}
                            allowDataOverflow={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor:
                                theme === "dark" ? "#1f1f1f" : "#eaf5f3",
                              border: "none",
                              color: theme === "dark" ? "#fff" : "#000",
                            }}
                            formatter={(value: any) => {
                              const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
                              return isFinite(numValue) ? `$${numValue.toFixed(2)}` : 'N/A';
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke={theme === "dark" ? "#3b82f6" : "#2563eb"}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={true}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })()}

                {/* AI sections */}
                <div className="space-y-2">
                  <div>
                    <div className={`text-xs font-semibold opacity-80 mb-1 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>
                      AI Insight
                    </div>
                    <ExpandableText text={a.aiInsight} />
                  </div>
                  <div>
                    <div className={`text-xs font-semibold opacity-80 mb-1 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Recommendation
                    </div>
                    <p className={`italic text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {a.aiRating || "Recommendation: Hold — no data."}
                    </p>
                  </div>
                  <div>
                    <div className={`text-xs font-semibold opacity-80 mb-1 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}>
                      AI News Summary
                    </div>
                    <ExpandableText text={a.aiNews} />
                  </div>
                </div>

                {/* Compare checkbox */}
                <label className={`flex items-center gap-2 text-sm mt-4 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  <input
                    type="checkbox"
                    checked={compareList.includes(a.symbol)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCompareList((prev) =>
                          prev.includes(a.symbol) ? prev : [...prev, a.symbol]
                        );
                      } else {
                        setCompareList((prev) =>
                          prev.filter((s) => s !== a.symbol)
                        );
                      }
                    }}
                  />
                  Select for comparison
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Comparison (supports unlimited; show when >=2) */}
        {compareList.length >= 2 && (
          <div
            className={`mt-10 p-5 rounded-xl border shadow-md transition-colors ${
              theme === "dark"
                ? "bg-gray-900 border-gray-700"
                : "bg-[#eaf5f3] border-[#cde3dd]"
            }`}
          >
            <h3 className={`text-2xl font-semibold mb-3 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              AI Stock Comparison
            </h3>
            <p className={`mb-3 text-sm ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
              Comparing:{" "}
              <span className="font-mono">{compareList.join(", ")}</span>
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={compareStocks}
                className={`px-4 py-2 rounded-lg transition-all ${
                  theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Run Comparison
              </button>
              <button
                onClick={() => setCompareList([])}
                className={`px-4 py-2 rounded-lg transition-all ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-300 hover:bg-gray-400 text-black"
                }`}
              >
                Clear Selection
              </button>
            </div>
            {compareResult && (
              <div className="mt-4">
                <ExpandableText text={compareResult} previewChars={800} />
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </main>
  );
}

