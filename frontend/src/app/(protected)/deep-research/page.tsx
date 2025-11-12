"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
export default function DeepResearchPage() {
  const { theme } = useTheme();
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
  const analyzeStock = async () => {
    const sym = symbol.trim().toUpperCase();
    if (!sym) return;

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
        price: d.c,
        h: d.h,
        l: d.l,
        o: d.o,
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

      // 4️⃣ AI Technical Summary
      const aiPrompt = `
Analyze ${sym}'s last ${chartRange}-day performance.
Pattern detected: ${patternText}.
Summarize technical outlook, momentum, and risk in 5 sentences.
      `;
      
      let aiInsight = "AI insight unavailable.";
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
                { role: "system", content: "You are a concise market analyst." },
                { role: "user", content: aiPrompt },
              ],
              max_tokens: 200,
            }),
          });
          const aiJson = await aiRes.json();
          aiInsight = aiJson.choices?.[0]?.message?.content || "No AI insight available.";
        } catch (e) {
          console.error("AI error:", e);
        }
      }

      // 5️⃣ Save all results at once
      setResults({ sym, chartData, snapshot, patternText, aiInsight });
      addToast(`Analysis for ${sym} complete.`, "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to analyze symbol. Check ticker and try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const clearResearch = () => {
    setSymbol("");
    setResults(null);
    setToast(null);
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
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}>Deep Research</h1>
        <p className={`mb-8 text-sm opacity-80 ${
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        }`}>
          Enter a ticker symbol to fetch data, detect chart patterns, and generate an AI-driven projection.
        </p>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-10 items-center">
          <input
            type="text"
            placeholder="Enter stock symbol (e.g. TSLA)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyzeStock()}
            className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-300 text-black"
            }`}
          />

          <button
            onClick={analyzeStock}
            disabled={loading}
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
            <>
              {/* Snapshot */}
              <div
                className={`p-5 rounded-xl border shadow-md mb-8 ${
                  theme === "dark"
                    ? "bg-gray-900 border-gray-700"
                    : "bg-[#eaf5f3] border-[#cde3dd]"
                }`}
              >
                <h2 className={`text-xl font-semibold mb-4 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  {results.sym} — Daily Snapshot
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className={`opacity-75 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>Open</p>
                    <p className={`font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
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
                      theme === "dark" ? "text-white" : "text-gray-900"
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
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>Detected Pattern</h2>
                <p className={`text-sm opacity-90 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>{results.patternText}</p>
              </div>

              {/* AI Insight */}
              <div
                className={`p-5 rounded-xl border shadow-md mb-8 ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-[#eaf5f3] border-[#cde3dd]"
                }`}
              >
                <h2 className={`text-lg font-semibold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>AI Technical Insight</h2>
                <p className={`text-sm whitespace-pre-line leading-relaxed ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  {results.aiInsight}
                </p>
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
                  theme === "dark" ? "text-white" : "text-gray-900"
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
            </>
          )
        )}
      </div>
    </main>
  );
}
