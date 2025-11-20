// frontend/src/app/(protected)/dashboard/page.tsx

'use client';

import { useTheme } from '@/context/ThemeContext';
import MarketOverview from '@/components/MarketOverview';
import NewsFeed from '@/components/NewsFeed';

export default function DashboardPage() {
  const { theme } = useTheme();

  return (
    <main
      className={`min-h-screen transition-colors duration-500 ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-black via-gray-950 to-black text-white'
          : 'bg-gradient-to-b from-[#f5f7fa] via-[#c3e0dc] to-[#9ad0c2] text-gray-900'
      }`}
    >
      {/* Main Content */}
      <div
        className={`max-w-7xl mx-auto p-6 grid gap-6 md:grid-cols-3 pt-24 transition-colors duration-500`}
      >
        {/* Three Equal Columns: Top Gainers, Top Losers, Market News */}
        <MarketOverview />
        <NewsFeed />
      </div>
    </main>
  );
}
