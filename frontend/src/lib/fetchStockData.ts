// lib/fetchStockData.ts
export async function fetchStockData(symbol: string, rangeDays: number, polygonKey: string) {
  try {
    const now = new Date();
    const past = new Date();
    past.setDate(now.getDate() - rangeDays);
    const from = past.toISOString().split("T")[0];
    const to = now.toISOString().split("T")[0];

    // 🧠 Batch API calls concurrently to save time
    const [refRes, tradeRes, chartRes, newsRes] = await Promise.all([
      fetch(`https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${polygonKey}`),
      fetch(`https://api.polygon.io/v2/last/trade/${symbol}?apiKey=${polygonKey}`),
      fetch(`https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=${polygonKey}`),
      fetch(`https://api.polygon.io/v2/reference/news?ticker=${symbol}&limit=5&apiKey=${polygonKey}`)
    ]);

    // Parse all JSONs together
    const [refData, tradeData, chartData, newsData] = await Promise.all([
      refRes.json(),
      tradeRes.json(),
      chartRes.json(),
      newsRes.json()
    ]);

    // ✅ Return a single bundled object
    return {
      name: refData?.results?.name || symbol,
      price: tradeData?.results?.p || "N/A",
      chart: chartData?.results
        ? chartData.results.map((d: any) => ({
            date: new Date(d.t).toLocaleDateString(),
            price: d.c,
          }))
        : [],
      news: newsData?.results || []
    };
  } catch (error) {
    console.error(`❌ Error fetching data for ${symbol}:`, error);
    return null;
  }
}

