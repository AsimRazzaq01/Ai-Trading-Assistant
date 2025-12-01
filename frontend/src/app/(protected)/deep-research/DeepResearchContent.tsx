"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useSearchParams } from "next/navigation";
import { Bookmark, Plus, Check, Download, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* Spinner + Toast helpers */
function Spinner() {
  return (
    <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin align-middle" />
  );
}

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

/* ─────────────── Deep Research Page ─────────────── */
export default function DeepResearchContent() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const polygonKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY || "";
  const openAiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";

  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [toast, setToast] = useState<{ id: number; kind: string; msg: string } | null>(null);
  const [chartRange, setChartRange] = useState(30);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [rangeMode, setRangeMode] = useState<"preset" | "custom">("preset");
  const [user, setUser] = useState<any>(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [inMyAssets, setInMyAssets] = useState(false);
  const [inPatternTrends, setInPatternTrends] = useState(false);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);
  const [addingToAssets, setAddingToAssets] = useState(false);
  const [addingToPatternTrends, setAddingToPatternTrends] = useState(false);
  const [newsData, setNewsData] = useState<any[]>([]);
  const [confidence, setConfidence] = useState<number>(0);
  const [strategies, setStrategies] = useState<any[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

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

  // Load saved state from localStorage (only if no URL symbol)
  useEffect(() => {
    const urlSymbol = searchParams.get("symbol");
    if (!urlSymbol) {
      const saved = localStorage.getItem("deepResearchSymbol");
      if (saved) setSymbol(saved);
    }
    
    // Always load range settings
    const savedRange = localStorage.getItem("deepResearchChartRange");
    if (savedRange) setChartRange(parseInt(savedRange));
    
    const savedFrom = localStorage.getItem("deepResearchCustomFrom");
    if (savedFrom) setCustomFrom(savedFrom);
    
    const savedTo = localStorage.getItem("deepResearchCustomTo");
    if (savedTo) setCustomTo(savedTo);
    
    const savedMode = localStorage.getItem("deepResearchRangeMode");
    if (savedMode === "custom") setRangeMode("custom");
  }, [searchParams]);

  // Save state to localStorage
  useEffect(() => {
    if (symbol && !searchParams.get("symbol")) {
      localStorage.setItem("deepResearchSymbol", symbol);
    }
  }, [symbol, searchParams]);

  useEffect(() => {
    localStorage.setItem("deepResearchChartRange", chartRange.toString());
  }, [chartRange]);

  useEffect(() => {
    localStorage.setItem("deepResearchCustomFrom", customFrom);
  }, [customFrom]);

  useEffect(() => {
    localStorage.setItem("deepResearchCustomTo", customTo);
  }, [customTo]);

  useEffect(() => {
    localStorage.setItem("deepResearchRangeMode", rangeMode);
  }, [rangeMode]);

  /* Toast Handler */
  const addToast = (msg: string, kind = "info") => {
    const id = Date.now();
    setToast({ id, kind, msg });
    setTimeout(() => setToast(null), 5000);
  };

  /* Pattern Detection */
  const detectPattern = (ohlc: any[]): string => {
    if (ohlc.length < 6) return "Not enough data";
    const closes = ohlc.map((d) => d.c);
    const last = closes.slice(-5);
    const high = Math.max(...last);
    const low = Math.min(...last);
    if (last[0] < last[2] && last[1] > last[3])
      return "Possible Head and Shoulders (Bearish)";
    if (last[4] > high * 0.98) return "Possible Ascending Triangle (Bullish)";
    if (last[4] < low * 1.02) return "Possible Descending Triangle (Bearish)";
    return "No clear pattern detected";
  };

  /* Main Analysis Logic */
  const analyzeStockWithSymbol = async (ticker: string) => {
    if (!ticker) return;

    if (!polygonKey) {
      addToast("Polygon API key not configured.", "error");
      return;
    }

    if (rangeMode === "custom" && (!customFrom || !customTo)) {
      addToast("Please select both start and end dates for custom range.", "error");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const sym = ticker.toUpperCase();

      let from = new Date();
      const today = new Date().toISOString().split("T")[0];
      if (rangeMode === "preset") from.setDate(from.getDate() - chartRange);
      else if (customFrom) from = new Date(customFrom);

      const fromStr = from.toISOString().split("T")[0];

      // 1️⃣ Polygon OHLC data
      const res = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${sym}/range/1/day/${fromStr}/${today}?adjusted=true&apiKey=${polygonKey}`
      );
      if (!res.ok) throw new Error("Invalid Symbol");
      const json = await res.json();
      const ohlc = json.results || [];
      if (!ohlc.length) throw new Error("No data available");

      const chartData = ohlc.map((d: any) => ({
        date: new Date(d.t).toLocaleDateString(),
        price: Number(d.c) || 0,
        h: Number(d.h) || 0,
        l: Number(d.l) || 0,
        o: Number(d.o) || 0,
      }));

      // 2️⃣ Pattern Detection
      const patternText = detectPattern(ohlc);

      // 3️⃣ Snapshot
      let snapshot: any = {};
      try {
        const snapRes = await fetch(
          `https://api.polygon.io/v1/open-close/${sym}/${today}?adjusted=true&apiKey=${polygonKey}`
        );
        snapshot = await snapRes.json();
      } catch {}
      if (!snapshot.open) {
        const prevRes = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${sym}/prev?adjusted=true&apiKey=${polygonKey}`
        );
        const prevJson = await prevRes.json();
        const prev = prevJson.results?.[0];
        if (prev) {
          snapshot = { open: prev.o, high: prev.h, low: prev.l, close: prev.c };
        }
      }

      // 4️⃣ Fetch Latest News
      let newsItems: any[] = [];
      try {
        const newsRes = await fetch(`/api/news?tickers=${sym}&limit=5`);
        if (newsRes.ok) {
          const newsJson = await newsRes.json();
          newsItems = newsJson.items || [];
        }
      } catch (e) {
        console.error("News fetch error:", e);
      }

      // 5️⃣ Enhanced AI Technical Summary with structured format (concise)
      const aiPrompt = `
Analyze ${sym}'s last ${chartRange}-day performance in 3-4 key bullet points.
Pattern: ${patternText}
Price: $${snapshot.close?.toFixed(2)} (H: $${snapshot.high?.toFixed(2)}, L: $${snapshot.low?.toFixed(2)})

Provide a SHORT, concise analysis with:
- 📈 Trend direction & strength (1 line)
- 🎯 Key support/resistance levels (1 line)
- ⚠️ Risk assessment (1 line)
- 📊 Key takeaway (1 line)

Keep each point to ONE sentence. Use emojis: 📈 bullish, 📉 bearish, ⚠️ risk, 🎯 targets, 📊 metrics.
Maximum 150 words total.
      `;
      
      let aiInsight = "AI insight unavailable.";
      let confidenceScore = 70; // Default confidence
      let strategyOptions: any[] = [];
      
      if (openAiKey) {
        try {
          const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openAiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: "You are an expert technical analyst. Provide SHORT, concise bullet points (max 4 points). Be brief and actionable. Use emojis for visual indicators." },
                { role: "user", content: aiPrompt },
              ],
              max_tokens: 200,
              temperature: 0.3,
            }),
          });
          const aiJson = await aiRes.json();
          aiInsight = aiJson.choices?.[0]?.message?.content || "No AI insight available.";
          
          // Calculate confidence based on data quality and pattern detection
          if (ohlc.length >= 30) confidenceScore += 10;
          if (patternText !== "No clear pattern detected") confidenceScore += 10;
          if (snapshot.open && snapshot.close) confidenceScore += 10;
          confidenceScore = Math.min(95, confidenceScore);

          // Generate Strategy Options
          const strategyPrompt = `
Based on the following analysis for ${sym}:
- Pattern: ${patternText}
- Current Price: $${snapshot.close?.toFixed(2)}
- Trend: ${aiInsight.includes("bullish") ? "Bullish" : aiInsight.includes("bearish") ? "Bearish" : "Neutral"}

Provide 3-5 trading strategy options/opportunities. Format your response as a JSON object with a "strategies" array:
{
  "strategies": [
    {
      "strategy": "Strategy Name",
      "type": "long|short|neutral",
      "entry": "Entry price or condition",
      "target": "Target price",
      "stop": "Stop loss price",
      "confidence": "high|medium|low",
      "description": "Brief description"
    }
  ]
}
          `;

          try {
            const strategyRes = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${openAiKey}`,
              },
              body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                  { role: "system", content: "You are a trading strategy expert. Provide structured JSON object responses with a 'strategies' array." },
                  { role: "user", content: strategyPrompt },
                ],
                max_tokens: 800,
                temperature: 0.3,
                response_format: { type: "json_object" },
              }),
            });
            const strategyJson = await strategyRes.json();
            const strategyText = strategyJson.choices?.[0]?.message?.content || "{}";
            try {
              const parsed = JSON.parse(strategyText);
              // Handle both array and object responses
              if (Array.isArray(parsed)) {
                strategyOptions = parsed;
              } else if (parsed.strategies && Array.isArray(parsed.strategies)) {
                strategyOptions = parsed.strategies;
              } else if (parsed.data && Array.isArray(parsed.data)) {
                strategyOptions = parsed.data;
              } else {
                strategyOptions = [];
              }
            } catch {
              // Fallback if parsing fails
              strategyOptions = [];
            }
          } catch (e) {
            console.error("Strategy generation error:", e);
          }
        } catch (e) {
          console.error("AI error:", e);
        }
      }

      // 6️⃣ Save all results at once
      setSymbol(sym); // Ensure symbol state is set
      setResults({ sym, chartData, snapshot, patternText, aiInsight });
      setNewsData(newsItems);
      setConfidence(confidenceScore);
      setStrategies(strategyOptions);
      addToast(`Analysis for ${sym} complete.`, "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to analyze symbol. Check ticker and try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const analyzeStock = async () => {
    if (symbol.trim()) {
      await analyzeStockWithSymbol(symbol.trim());
    }
  };

  const handleStockSelect = (ticker: string, name: string) => {
    setSymbol(ticker);
    analyzeStockWithSymbol(ticker);
  };

  // Check if symbol is in watchlist or My Assets
  const checkWatchlistStatus = useCallback(async () => {
    // Guard for SSR/production safety
    if (typeof window === 'undefined') return;
    
    const symToCheck = symbol || (results?.sym as string) || "";
    if (!symToCheck) return;
    
    try {
      // Check watchlist from API
      const res = await fetch("/api/watchlist", {
        credentials: "include",
        cache: "no-store",
      });
      
      if (res.ok) {
        const data = await res.json();
        const watchlistSymbols = data.items?.map((item: any) => item.symbol) || [];
        setInWatchlist(watchlistSymbols.includes(symToCheck.toUpperCase()));
      }
      
      // Check My Assets from localStorage (user-specific)
      if (user) {
        const storageKey = `myAssets_${user.id || user.email || 'default'}`;
        const myAssets = JSON.parse(localStorage.getItem(storageKey) || "[]");
        setInMyAssets(Array.isArray(myAssets) && myAssets.some((a: any) => a.symbol === symToCheck.toUpperCase()));
      }
    } catch (e) {
      console.error("Error checking watchlist status:", e);
    }
  }, [symbol, results]);

  useEffect(() => {
    checkWatchlistStatus();
  }, [checkWatchlistStatus, results, symbol, user]);

  // Listen for watchlist updates to refresh status
  useEffect(() => {
    // Guard for SSR/production safety
    if (typeof window === 'undefined') return;
    
    const handleWatchlistUpdate = () => {
      checkWatchlistStatus();
    };

    window.addEventListener('watchlistUpdated', handleWatchlistUpdate);

    return () => {
      window.removeEventListener('watchlistUpdated', handleWatchlistUpdate);
    };
  }, [checkWatchlistStatus]);

  // Check for symbol in URL query params
  useEffect(() => {
    const urlSymbol = searchParams.get("symbol");
    if (urlSymbol) {
      const query = urlSymbol.trim();
      setSymbol(query);
      // Auto-analyze if symbol is provided via URL
      if (query && polygonKey) {
        setTimeout(() => {
          analyzeStockWithSymbol(query);
        }, 100);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Add to watchlist
  const addToWatchlist = async () => {
    // Guard for SSR/production safety
    if (typeof window === 'undefined') return;
    
    // Use results.sym if symbol state is empty (fallback)
    const symToUse = symbol || (results?.sym as string) || "";
    if (!symToUse || addingToWatchlist) return;
    setAddingToWatchlist(true);
    
    try {
      const sym = symToUse.toUpperCase().trim();
      if (!sym) {
        addToast("Invalid symbol", "error");
        setAddingToWatchlist(false);
        return;
      }
      
      // Add to backend API
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ symbol: sym }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 400 && errorData.detail?.includes("already")) {
          addToast(`${sym} is already in watchlist`, "info");
          await checkWatchlistStatus(); // Refresh status
          setAddingToWatchlist(false);
          return;
        }
        throw new Error(errorData.detail || "Failed to add to watchlist");
      }

      setInWatchlist(true);
      addToast(`Added ${sym} to watchlist`, "success");
      
      // Trigger custom event for same-tab updates
      window.dispatchEvent(new CustomEvent('watchlistUpdated', { 
        detail: { symbol: sym, action: 'add' } 
      }));
    } catch (e: any) {
      console.error("Error adding to watchlist:", e);
      addToast(e.message || "Failed to add to watchlist", "error");
    } finally {
      setAddingToWatchlist(false);
    }
  };

  // Check pattern trends status
  const checkPatternTrendsStatus = useCallback(async () => {
    if (typeof window === 'undefined' || !symbol) return;
    
    try {
      const res = await fetch("/api/pattern-trends", {
        credentials: "include",
        cache: "no-store",
      });
      
      if (res.ok) {
        const data = await res.json();
        const symbols = data.items?.map((item: any) => item.symbol) || [];
        setInPatternTrends(symbols.includes(symbol.toUpperCase()));
      }
    } catch (e) {
      console.error("Error checking pattern trends status:", e);
    }
  }, [symbol]);

  // Check pattern trends on mount and when symbol changes
  useEffect(() => {
    if (symbol) {
      checkPatternTrendsStatus();
    }
  }, [symbol, checkPatternTrendsStatus]);

  // Add to Pattern Trends
  const addToPatternTrends = async () => {
    if (typeof window === 'undefined') return;
    
    const symToUse = symbol || (results?.sym as string) || "";
    if (!symToUse || addingToPatternTrends) return;
    setAddingToPatternTrends(true);
    
    try {
      const sym = symToUse.toUpperCase().trim();
      if (!sym) {
        addToast("Invalid symbol", "error");
        setAddingToPatternTrends(false);
        return;
      }
      
      // Add to backend API
      const res = await fetch("/api/pattern-trends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ symbol: sym }),
      });

      if (!res.ok) {
        let errorData: any = {};
        try {
          errorData = await res.json();
        } catch (e) {
          // If response is not JSON, use status text
          errorData = { detail: res.statusText || "Failed to add to pattern trends" };
        }
        
        if (res.status === 400 && errorData.detail?.includes("already")) {
          addToast(`${sym} is already in Pattern Trends`, "info");
          await checkPatternTrendsStatus();
          setAddingToPatternTrends(false);
          return;
        }
        throw new Error(errorData.detail || "Failed to add to pattern trends");
      }

      setInPatternTrends(true);
      addToast(`Added ${sym} to Pattern Trends`, "success");
      
      // Navigate to pattern trends page with symbol
      window.location.href = `/pattern-trends?symbol=${encodeURIComponent(sym)}`;
    } catch (e: any) {
      console.error("Error adding to pattern trends:", e);
      addToast(e.message || "Failed to add to pattern trends", "error");
    } finally {
      setAddingToPatternTrends(false);
    }
  };

  // Add to My Assets
  const addToMyAssets = async () => {
    if (!symbol || !results || addingToAssets || !user) return;
    setAddingToAssets(true);
    try {
      const sym = symbol.toUpperCase();
      const storageKey = `myAssets_${user.id || user.email || 'default'}`;
      const myAssets = JSON.parse(localStorage.getItem(storageKey) || "[]");
      
      // Check if already exists
      if (myAssets.some((a: any) => a.symbol === sym)) {
        addToast(`${sym} is already in My Assets`, "info");
        setAddingToAssets(false);
        return;
      }

      // Fetch additional data for My Assets
      if (!polygonKey) {
        addToast("Polygon API key not configured", "error");
        setAddingToAssets(false);
        return;
      }

      const stockData = await fetchStockData(sym, chartRange, polygonKey);
      if (!stockData) {
        addToast("Failed to fetch stock data", "error");
        setAddingToAssets(false);
        return;
      }

      const asset = {
        symbol: sym,
        name: stockData.name || sym,
        price: results.snapshot.close || results.snapshot.open || stockData.price,
        chart: results.chartData || stockData.chart || [],
        aiInsight: results.aiInsight || "",
        aiRating: "",
        aiNews: "",
      };

      myAssets.push(asset);
      localStorage.setItem(storageKey, JSON.stringify(myAssets));
      setInMyAssets(true);
      addToast(`Added ${sym} to My Assets`, "success");
    } catch (e) {
      console.error("Error adding to My Assets:", e);
      addToast("Failed to add to My Assets", "error");
    } finally {
      setAddingToAssets(false);
    }
  };

  const clearResearch = () => {
    setSymbol("");
    setResults(null);
    setToast(null);
    setNewsData([]);
    setConfidence(0);
    setStrategies([]);
  };

  // Format AI Insight into bullet points
  const formatAIInsight = (insight: string): string[] => {
    if (!insight) return [];
    
    // Split by common section headers and bullet points
    const lines = insight.split(/\n/).filter(line => line.trim());
    const formatted: string[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed) {
        // Keep section headers
        if (trimmed.match(/^\d+\.\s+[A-Z]/) || trimmed.match(/^[A-Z][^:]+:/)) {
          formatted.push(trimmed);
        } else if (trimmed.startsWith("-") || trimmed.startsWith("•") || trimmed.startsWith("*")) {
          formatted.push(trimmed);
        } else if (trimmed.match(/^[📈📉⚠️🎯📊]/)) {
          formatted.push(trimmed);
        } else {
          formatted.push(`• ${trimmed}`);
        }
      }
    });
    
    return formatted.length > 0 ? formatted : [insight];
  };

  // Download PDF Report
  const downloadPDF = async () => {
    if (!reportRef.current || !results) return;
    
    try {
      addToast("Generating PDF report...", "info");
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Deep-Research-${results.sym}-${new Date().toISOString().split("T")[0]}.pdf`);
      addToast("PDF report downloaded successfully!", "success");
    } catch (error) {
      console.error("PDF generation error:", error);
      addToast("Failed to generate PDF report.", "error");
    }
  };

  /* ─────────────── Render ─────────────── */
  return (
    <main
      className={`min-h-screen px-8 py-20 transition-colors duration-500 relative overflow-hidden ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white"
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50 text-[#2d3748]"
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
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
          <Toast
            kind={toast.kind as any}
            message={toast.msg}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <h1 className={`text-3xl font-bold mb-6 ${
          theme === "dark" ? "text-white" : "text-[#2d3748]"
        }`}>Deep Research</h1>
        <p className={`mb-8 text-sm opacity-80 ${
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        }`}>
          Enter a ticker symbol or company name to fetch data, detect chart patterns, and generate an AI-driven projection.
        </p>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-10 items-center">
          <StockSearchAutocomplete
            value={symbol}
            onChange={setSymbol}
            onSelect={handleStockSelect}
            placeholder="Enter stock symbol or company name (e.g. TSLA or Tesla)"
            disabled={loading}
            polygonKey={polygonKey}
            className="flex-1 min-w-[300px]"
          />

          <button
            onClick={analyzeStock}
            disabled={loading || !symbol.trim()}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 ${
              theme === "dark"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {loading && <Spinner />}
            <span>{loading ? `Analyzing ${symbol || ""}...` : "Analyze"}</span>
          </button>

          {/* 🔁 Refresh Button */}
          {results && (
            <button
              onClick={analyzeStock}
              disabled={loading}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                theme === "dark"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-green-400 hover:bg-green-500 text-white"
              }`}
            >
              {loading ? <Spinner /> : "Refresh Analysis"}
            </button>
          )}

          {/* Range Controls */}
          <div className="flex flex-wrap gap-2 items-center">
            <label className={`text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>Range:</label>
            <select
              value={chartRange}
              onChange={(e) => {
                setChartRange(Number(e.target.value));
                setRangeMode("preset");
              }}
              className={`px-3 py-2 rounded-lg border ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            >
              <option value={1}>1 Day</option>
              <option value={3}>3 Days</option>
              <option value={7}>7 Days</option>
              <option value={30}>30 Days</option>
              <option value={90}>90 Days</option>
            </select>

            <span className={`text-sm ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>or</span>

            <input
              type="date"
              value={customFrom}
              onChange={(e) => {
                setCustomFrom(e.target.value);
                if (e.target.value && customTo) setRangeMode("custom");
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
                setCustomTo(e.target.value);
                if (customFrom && e.target.value) setRangeMode("custom");
              }}
              className={`px-3 py-2 rounded-lg border ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            />

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

          {/* Clear */}
          {results && (
            <button
              onClick={clearResearch}
              className={`px-4 py-2 rounded-lg ml-auto transition-all ${
                theme === "dark"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Main Display */}
        {loading ? (
          <p className={`text-center mt-10 text-sm opacity-80 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}>
            <Spinner /> Fetching all data and insights...
          </p>
        ) : (
          results && (
            <div ref={reportRef}>
              {/* Header with Download PDF Button */}
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-[#2d3748]"
                }`}>
                  {results.sym} — Deep Research Report
                </h2>
                <button
                  onClick={downloadPDF}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    theme === "dark"
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-purple-500 hover:bg-purple-600 text-white"
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Download PDF Report
                </button>
              </div>

              {/* Confidence Bar */}
              <div
                className={`p-5 rounded-xl border shadow-md mb-8 ${
                  theme === "dark"
                    ? "bg-gray-900 border-gray-700"
                    : "bg-[#eaf5f3] border-[#cde3dd]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-semibold ${
                    theme === "dark" ? "text-white" : "text-[#2d3748]"
                  }`}>
                    Analysis Confidence
                  </h3>
                  <span className={`text-lg font-bold ${
                    confidence >= 80 ? "text-green-500" : confidence >= 60 ? "text-yellow-500" : "text-orange-500"
                  }`}>
                    {confidence}%
                  </span>
                </div>
                <div className={`h-3 rounded-full overflow-hidden ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                }`}>
                  <div
                    className={`h-full transition-all duration-500 ${
                      confidence >= 80 ? "bg-green-500" : confidence >= 60 ? "bg-yellow-500" : "bg-orange-500"
                    }`}
                    style={{ width: `${confidence}%` }}
                  />
                </div>
                <p className={`text-xs mt-2 opacity-75 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  Based on data quality, pattern detection, and technical analysis
                </p>
              </div>

              {/* Snapshot */}
              <div
                className={`p-5 rounded-xl border shadow-md mb-8 ${
                  theme === "dark"
                    ? "bg-gray-900 border-gray-700"
                    : "bg-[#eaf5f3] border-[#cde3dd]"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-semibold ${
                    theme === "dark" ? "text-white" : "text-[#2d3748]"
                  }`}>
                    {results.sym} — Daily Snapshot
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={addToWatchlist}
                      disabled={addingToWatchlist || inWatchlist}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-all disabled:opacity-50 ${
                        inWatchlist
                          ? theme === "dark"
                            ? "bg-green-700 text-white"
                            : "bg-green-100 text-green-800"
                          : theme === "dark"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      {inWatchlist ? (
                        <>
                          <Check className="w-4 h-4" />
                          In Watchlist
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          {addingToWatchlist ? "Adding..." : "Add to Watchlist"}
                        </>
                      )}
                    </button>
                    <button
                      onClick={addToMyAssets}
                      disabled={addingToAssets || inMyAssets}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-all disabled:opacity-50 ${
                        inMyAssets
                          ? theme === "dark"
                            ? "bg-green-700 text-white"
                            : "bg-green-100 text-green-800"
                          : theme === "dark"
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "bg-purple-500 hover:bg-purple-600 text-white"
                      }`}
                    >
                      {inMyAssets ? (
                        <>
                          <Check className="w-4 h-4" />
                          In My Assets
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          {addingToAssets ? "Adding..." : "Add to My Assets"}
                        </>
                      )}
                    </button>
                    <button
                      onClick={addToPatternTrends}
                      disabled={addingToPatternTrends || inPatternTrends}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-all disabled:opacity-50 ${
                        inPatternTrends
                          ? theme === "dark"
                            ? "bg-green-700 text-white"
                            : "bg-green-100 text-green-800"
                          : theme === "dark"
                          ? "bg-orange-600 hover:bg-orange-700 text-white"
                          : "bg-orange-500 hover:bg-orange-600 text-white"
                      }`}
                    >
                      {inPatternTrends ? (
                        <>
                          <Check className="w-4 h-4" />
                          In Pattern Trends
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          {addingToPatternTrends ? "Adding..." : "Add to Pattern Trends"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className={`opacity-75 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>Open</p>
                    <p className={`font-semibold ${
                      theme === "dark" ? "text-white" : "text-[#2d3748]"
                    }`}>${results.snapshot.open?.toFixed?.(2) || "N/A"}</p>
                  </div>
                  <div>
                    <p className={`opacity-75 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>High</p>
                    <p className="font-semibold text-green-500">${results.snapshot.high?.toFixed?.(2) || "N/A"}</p>
                  </div>
                  <div>
                    <p className={`opacity-75 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>Low</p>
                    <p className="font-semibold text-red-400">${results.snapshot.low?.toFixed?.(2) || "N/A"}</p>
                  </div>
                  <div>
                    <p className={`opacity-75 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>Close</p>
                    <p className={`font-semibold ${
                      theme === "dark" ? "text-white" : "text-[#2d3748]"
                    }`}>${results.snapshot.close?.toFixed?.(2) || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Pattern */}
              <div
                className={`p-5 rounded-xl border shadow-md mb-8 ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-[#eaf5f3] border-[#cde3dd]"
                }`}
              >
                <h2 className={`text-lg font-semibold mb-2 ${
                  theme === "dark" ? "text-white" : "text-[#2d3748]"
                }`}>Detected Pattern</h2>
                <p className={`text-sm opacity-90 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>{results.patternText}</p>
              </div>

              {/* Latest News Synopsis */}
              {newsData.length > 0 && (
                <div
                  className={`p-5 rounded-xl border shadow-md mb-8 ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-[#eaf5f3] border-[#cde3dd]"
                  }`}
                >
                  <h2 className={`text-lg font-semibold mb-4 ${
                    theme === "dark" ? "text-white" : "text-[#2d3748]"
                  }`}>
                    Latest News Synopsis
                  </h2>
                  <div className="space-y-4">
                    {newsData.slice(0, 3).map((news: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${
                          theme === "dark"
                            ? "bg-gray-900 border-gray-700"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <h3 className={`font-semibold mb-2 ${
                          theme === "dark" ? "text-white" : "text-[#2d3748]"
                        }`}>
                          {news.title}
                        </h3>
                        {news.summary && (
                          <p className={`text-sm mb-2 ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>
                            {news.summary.length > 200 ? `${news.summary.substring(0, 200)}...` : news.summary}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs">
                          <span className={`opacity-75 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {news.source} • {news.publishedAt ? new Date(news.publishedAt).toLocaleDateString() : ""}
                          </span>
                          {news.url && (
                            <a
                              href={news.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-blue-500 hover:underline ${
                                theme === "dark" ? "text-blue-400" : "text-blue-600"
                              }`}
                            >
                              Read more →
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategy Options/Opportunities */}
              {strategies && strategies.length > 0 && (
                <div
                  className={`p-5 rounded-xl border shadow-md mb-8 ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-[#eaf5f3] border-[#cde3dd]"
                  }`}
                >
                  <h2 className={`text-lg font-semibold mb-4 ${
                    theme === "dark" ? "text-white" : "text-[#2d3748]"
                  }`}>
                    Strategy Options & Opportunities
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {strategies.map((strategy: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${
                          strategy.type === "long" || strategy.type === "bullish"
                            ? theme === "dark"
                              ? "bg-green-900/30 border-green-700"
                              : "bg-green-50 border-green-200"
                            : strategy.type === "short" || strategy.type === "bearish"
                            ? theme === "dark"
                              ? "bg-red-900/30 border-red-700"
                              : "bg-red-50 border-red-200"
                            : theme === "dark"
                            ? "bg-gray-900 border-gray-700"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-semibold flex items-center gap-2 ${
                            theme === "dark" ? "text-white" : "text-[#2d3748]"
                          }`}>
                            {strategy.type === "long" || strategy.type === "bullish" ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : strategy.type === "short" || strategy.type === "bearish" ? (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-yellow-500" />
                            )}
                            {strategy.strategy || `Strategy ${idx + 1}`}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            strategy.confidence === "high"
                              ? "bg-green-500/20 text-green-500"
                              : strategy.confidence === "medium"
                              ? "bg-yellow-500/20 text-yellow-500"
                              : "bg-orange-500/20 text-orange-500"
                          }`}>
                            {strategy.confidence || "medium"} confidence
                          </span>
                        </div>
                        {strategy.description && (
                          <p className={`text-sm mb-3 ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}>
                            {strategy.description}
                          </p>
                        )}
                        <div className="space-y-1 text-sm">
                          {strategy.entry && (
                            <div className={`flex justify-between ${
                              theme === "dark" ? "text-gray-300" : "text-gray-700"
                            }`}>
                              <span className="opacity-75">Entry:</span>
                              <span className="font-semibold">{strategy.entry}</span>
                            </div>
                          )}
                          {strategy.target && (
                            <div className={`flex justify-between ${
                              theme === "dark" ? "text-green-400" : "text-green-600"
                            }`}>
                              <span className="opacity-75">Target:</span>
                              <span className="font-semibold">{strategy.target}</span>
                            </div>
                          )}
                          {strategy.stop && (
                            <div className={`flex justify-between ${
                              theme === "dark" ? "text-red-400" : "text-red-600"
                            }`}>
                              <span className="opacity-75">Stop Loss:</span>
                              <span className="font-semibold">{strategy.stop}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Insight with Bullet Points - Improved Visual Design */}
              <div
                className={`p-6 rounded-xl border shadow-md mb-8 ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
                    : "bg-gradient-to-br from-[#eaf5f3] to-white border-[#cde3dd]"
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-1 h-6 rounded-full ${
                    theme === "dark" ? "bg-blue-500" : "bg-blue-600"
                  }`} />
                  <h2 className={`text-lg font-bold ${
                    theme === "dark" ? "text-white" : "text-[#2d3748]"
                  }`}>AI Technical Insight</h2>
                </div>
                <div className="space-y-3 pl-2">
                  {formatAIInsight(results.aiInsight).slice(0, 6).map((line, idx) => {
                    const isHeader = line.match(/^\d+\.\s+[A-Z]/) || line.match(/^[A-Z][^:]+:/);
                    const isBullish = line.includes("📈") || line.toLowerCase().includes("bullish") || line.toLowerCase().includes("up");
                    const isBearish = line.includes("📉") || line.toLowerCase().includes("bearish") || line.toLowerCase().includes("down");
                    const isWarning = line.includes("⚠️") || line.toLowerCase().includes("warning") || line.toLowerCase().includes("risk");
                    const isTarget = line.includes("🎯") || line.toLowerCase().includes("target") || line.toLowerCase().includes("support") || line.toLowerCase().includes("resistance");
                    const isMetric = line.includes("📊") || line.toLowerCase().includes("volume") || line.toLowerCase().includes("momentum");
                    
                    // Skip headers if they're too generic
                    if (isHeader && line.length < 20 && idx > 0) return null;
                    
                    const cleanLine = line.replace(/^[📈📉⚠️🎯📊•\-\*]\s*/, "").replace(/^\d+\.\s*/, "").trim();
                    if (!cleanLine) return null;
                    
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                          theme === "dark"
                            ? isBullish ? "bg-green-900/20 border border-green-800/30" :
                            isBearish ? "bg-red-900/20 border border-red-800/30" :
                            isWarning ? "bg-yellow-900/20 border border-yellow-800/30" :
                            isTarget ? "bg-purple-900/20 border border-purple-800/30" :
                            "bg-gray-800/50 border border-gray-700/30"
                            : isBullish ? "bg-green-50 border border-green-200" :
                            isBearish ? "bg-red-50 border border-red-200" :
                            isWarning ? "bg-yellow-50 border border-yellow-200" :
                            isTarget ? "bg-purple-50 border border-purple-200" :
                            "bg-white border border-gray-200"
                        }`}
                      >
                        <span className={`text-xl flex-shrink-0 mt-0.5 ${
                          isBullish ? "text-green-500" :
                          isBearish ? "text-red-500" :
                          isWarning ? "text-yellow-500" :
                          isTarget ? "text-purple-500" :
                          isMetric ? "text-blue-500" :
                          theme === "dark" ? "text-gray-500" : "text-gray-400"
                        }`}>
                          {isBullish ? "📈" : isBearish ? "📉" : isWarning ? "⚠️" : isTarget ? "🎯" : isMetric ? "📊" : "•"}
                        </span>
                        <span className={`text-sm leading-relaxed flex-1 ${
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        } ${isHeader ? "font-semibold" : ""}`}>
                          {cleanLine}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart */}
              <div
                className={`p-5 rounded-xl border shadow-md ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-[#eaf5f3] border-[#cde3dd]"
                }`}
              >
                <h2 className={`text-lg font-semibold mb-4 ${
                  theme === "dark" ? "text-white" : "text-[#2d3748]"
                }`}>
                  {rangeMode === "custom"
                    ? `Custom Range (${customFrom} → ${customTo})`
                    : `${chartRange}-Day Price Chart`}
                </h2>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.chartData}>
                      <XAxis
                        dataKey="date"
                        tick={{ fill: theme === "dark" ? "#ccc" : "#333", fontSize: 10 }}
                      />
                      <YAxis
                        domain={[
                          (dataMin: number) => dataMin * 0.98,
                          (dataMax: number) => dataMax * 1.02,
                        ]}
                        tick={{ fill: theme === "dark" ? "#ccc" : "#333", fontSize: 10 }}
                        tickFormatter={(value: number) => `$${value.toFixed(2)}`}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme === "dark" ? "#1f1f1f" : "#eaf5f3",
                          border: "none",
                          color: theme === "dark" ? "#fff" : "#000",
                        }}
                        formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Close"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={theme === "dark" ? "#22c55e" : "#2563eb"}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )
        )}
      </div>
      </div>
    </main>
  );
}

