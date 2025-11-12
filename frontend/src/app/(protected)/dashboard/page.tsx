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
        className={`max-w-7xl mx-auto p-6 grid gap-6 md:grid-cols-3 pt-20 transition-colors duration-500`}
      >
        {/* Left: Top Performing Stocks */}
        <section
          className={`md:col-span-2 space-y-6 p-4 rounded-xl transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gray-900 border border-gray-800 shadow-md'
              : 'bg-[#eaf5f3] border border-[#cde3dd] shadow-sm'
          }`}
        >
          <h2
            className={`text-2xl font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Top Performing Stocks
          </h2>
          <MarketOverview />
        </section>

        {/* Right: Latest Market News */}
        <aside
          className={`md:col-span-1 p-4 rounded-xl transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gray-900 border border-gray-800 shadow-md'
              : 'bg-[#eaf5f3] border border-[#cde3dd] shadow-sm'
          }`}
        >
          <h2
            className={`text-2xl font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Latest Market News
          </h2>
          <NewsFeed />
        </aside>
      </div>
    </main>
  );
}
