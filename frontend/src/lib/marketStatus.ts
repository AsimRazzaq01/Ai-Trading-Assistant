/**
 * Check if US stock market is currently open
 * US market hours: 9:30 AM - 4:00 PM ET (Eastern Time)
 * Market is closed on weekends
 * @returns {boolean} true if market is open, false otherwise
 */
export function isMarketOpen(): boolean {
  const now = new Date()
  
  // Convert to Eastern Time
  const etTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
  
  const day = etTime.getDay() // 0 = Sunday, 6 = Saturday
  const hour = etTime.getHours()
  const minute = etTime.getMinutes()
  const timeInMinutes = hour * 60 + minute
  
  // Market is closed on weekends
  if (day === 0 || day === 6) {
    return false
  }
  
  // Market hours: 9:30 AM (570 minutes) to 4:00 PM (960 minutes) ET
  const marketOpen = 9 * 60 + 30 // 9:30 AM
  const marketClose = 16 * 60 // 4:00 PM (4:00 PM = 16:00)
  
  return timeInMinutes >= marketOpen && timeInMinutes < marketClose
}

/**
 * Get market status text
 * @returns {string} "Open" or "Closed"
 */
export function getMarketStatus(): string {
  return isMarketOpen() ? "Open" : "Closed"
}

/**
 * Get market status subtitle
 * @returns {string} Status description
 */
export function getMarketStatusSubtitle(): string {
  return isMarketOpen() ? "Trading active" : "Market closed"
}

