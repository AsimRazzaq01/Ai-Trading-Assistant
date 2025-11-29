// lib/searchStock.ts
// Utility function to search for stocks by company name or ticker symbol

export interface StockSearchResult {
  ticker: string;
  name: string;
  market?: string;
  primary_exchange?: string;
}

/**
 * Search for stocks by company name or ticker symbol using Polygon API
 * @param query - Company name (e.g., "Apple") or ticker (e.g., "AAPL")
 * @param polygonKey - Polygon API key
 * @returns Promise<StockSearchResult[]> - Array of matching stocks
 */
export async function searchStock(
  query: string,
  polygonKey: string
): Promise<StockSearchResult[]> {
  if (!query.trim() || !polygonKey) {
    return [];
  }

  try {
    // Use Polygon's tickers search endpoint
    const searchUrl = `https://api.polygon.io/v3/reference/tickers?search=${encodeURIComponent(query)}&active=true&limit=10&apiKey=${polygonKey}`;
    
    const response = await fetch(searchUrl, { cache: 'no-store' });
    
    if (!response.ok) {
      console.error('Polygon search API error:', response.status);
      return [];
    }

    const data = await response.json();
    
    if (data.status === 'ERROR' || !data.results) {
      return [];
    }

    // Map results to our interface
    return data.results.map((ticker: any) => ({
      ticker: ticker.ticker || '',
      name: ticker.name || '',
      market: ticker.market,
      primary_exchange: ticker.primary_exchange,
    }));
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
}

/**
 * Resolve a company name or ticker to a ticker symbol
 * If query is already a valid ticker, returns it
 * Otherwise, searches for matching companies and returns the best match
 * @param query - Company name or ticker
 * @param polygonKey - Polygon API key
 * @returns Promise<string | null> - Ticker symbol or null if not found
 */
export async function resolveTicker(
  query: string,
  polygonKey: string
): Promise<string | null> {
  if (!query.trim() || !polygonKey) {
    return null;
  }

  const trimmedQuery = query.trim().toUpperCase();

  // First, try direct ticker lookup (fast path)
  try {
    const tickerUrl = `https://api.polygon.io/v3/reference/tickers/${trimmedQuery}?apiKey=${polygonKey}`;
    const tickerRes = await fetch(tickerUrl, { cache: 'no-store' });
    
    if (tickerRes.ok) {
      const tickerData = await tickerRes.json();
      if (tickerData.results?.ticker) {
        return tickerData.results.ticker;
      }
    }
  } catch (error) {
    // Fall through to search
  }

  // If direct lookup fails, search by name
  const results = await searchStock(query, polygonKey);
  
  if (results.length === 0) {
    return null;
  }

  // Prefer exact ticker match if query looks like a ticker
  const exactMatch = results.find(r => r.ticker === trimmedQuery);
  if (exactMatch) {
    return exactMatch.ticker;
  }

  // Otherwise, return the first result (best match)
  return results[0].ticker;
}

