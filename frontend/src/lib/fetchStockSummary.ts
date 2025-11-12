export interface StockSummary {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

export async function fetchStockSummary(
  tickers: string[],
  polygonKey: string
): Promise<StockSummary[]> {
  try {
    const results: StockSummary[] = [];

    // Fetch all tickers in parallel
    await Promise.all(
      tickers.map(async (symbol) => {
        const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?apiKey=${polygonKey}`;
        const infoUrl = `https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${polygonKey}`;

        const [aggRes, infoRes] = await Promise.all([fetch(url), fetch(infoUrl)]);
        if (!aggRes.ok || !infoRes.ok) throw new Error("Polygon API error");

        const aggData = await aggRes.json();
        const infoData = await infoRes.json();

        const result = aggData.results?.[0];
        const name = infoData?.results?.name || symbol;
        const close = result?.c ?? null;
        const open = result?.o ?? null;
        const changePercent =
          open && close ? ((close - open) / open) * 100 : 0;

        if (close !== null) {
          results.push({
            symbol,
            name,
            price: close,
            changePercent,
          });
        }
      })
    );

    return results;
  } catch (err) {
    console.error("Error fetching stock summary:", err);
    return [];
  }
}

