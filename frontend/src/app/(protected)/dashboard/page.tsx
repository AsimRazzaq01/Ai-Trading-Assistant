// frontend/src/app/(protected)/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { TrendingUp, TrendingDown, Newspaper, BarChart3, Sparkles } from 'lucide-react';
import MarketOverview from '@/components/MarketOverview';
import NewsFeed from '@/components/NewsFeed';
import { getMarketStatus, getMarketStatusSubtitle } from '@/lib/marketStatus';

interface User {
  email?: string;
  username?: string;
  name?: string;
}

export default function DashboardPage() {
  const { theme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [marketStatus, setMarketStatus] = useState(getMarketStatus());
  const [marketSubtitle, setMarketSubtitle] = useState(getMarketStatusSubtitle());

  useEffect(() => {
    // Fetch user info
    fetch('/api/me', { credentials: 'include', cache: 'no-store' })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data))
      .catch(() => {});

    // Update time and market status every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setMarketStatus(getMarketStatus());
      setMarketSubtitle(getMarketStatusSubtitle());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const userName = user?.name || user?.username || user?.email?.split('@')[0] || 'Trader';

  return (
    <main
      className={`min-h-screen transition-colors duration-500 relative overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white'
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-[#2d3748]'
      }`}
    >
      {/* Animated background elements */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${
        theme === 'dark' ? 'opacity-20' : 'opacity-10'
      }`}>
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl ${
          theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'
        } animate-pulse`} style={{ animationDuration: '4s' }}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl ${
          theme === 'dark' ? 'bg-purple-500' : 'bg-purple-400'
        } animate-pulse`} style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto p-6 pt-24 relative z-10">
        {/* Welcome Header Section */}
        <div className="mb-8">
          <div className={`rounded-2xl p-6 backdrop-blur-sm border transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gray-900/60 border-white/10 shadow-xl'
              : 'bg-white/80 border-gray-200/50 shadow-lg'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className={`text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${
                  theme === 'dark'
                    ? 'from-blue-400 to-purple-400'
                    : 'from-blue-600 to-purple-600'
                }`}>
                  {greeting()}, {userName}! 👋
                </h1>
                <p className={`text-sm md:text-base ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} • {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`p-3 rounded-xl ${
                  theme === 'dark'
                    ? 'bg-blue-500/20 border border-blue-500/30'
                    : 'bg-blue-100 border border-blue-200'
                }`}>
                  <Sparkles className={`w-6 h-6 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="Top Gainers"
            value="20+"
            subtitle="Stocks trending up"
            icon={TrendingUp}
            color="green"
            theme={theme}
          />
          <SummaryCard
            title="Top Losers"
            value="20+"
            subtitle="Stocks trending down"
            icon={TrendingDown}
            color="red"
            theme={theme}
          />
          <SummaryCard
            title="Market News"
            value="Live"
            subtitle="Latest updates"
            icon={Newspaper}
            color="blue"
            theme={theme}
          />
          <SummaryCard
            title="Market Status"
            value={marketStatus}
            subtitle={marketSubtitle}
            icon={BarChart3}
            color="purple"
            theme={theme}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <MarketOverview />
          <NewsFeed />
        </div>
      </div>
    </main>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: 'green' | 'red' | 'blue' | 'purple';
  theme: string;
}

function SummaryCard({ title, value, subtitle, icon: Icon, color, theme }: SummaryCardProps) {
  const colorClasses = {
    green: {
      bg: theme === 'dark' ? 'bg-green-500/20 border-green-500/30' : 'bg-green-50 border-green-200',
      icon: theme === 'dark' ? 'text-green-400' : 'text-green-600',
      accent: theme === 'dark' ? 'from-green-500/20 to-green-600/10' : 'from-green-100 to-green-50',
    },
    red: {
      bg: theme === 'dark' ? 'bg-red-500/20 border-red-500/30' : 'bg-red-50 border-red-200',
      icon: theme === 'dark' ? 'text-red-400' : 'text-red-600',
      accent: theme === 'dark' ? 'from-red-500/20 to-red-600/10' : 'from-red-100 to-red-50',
    },
    blue: {
      bg: theme === 'dark' ? 'bg-blue-500/20 border-blue-500/30' : 'bg-blue-50 border-blue-200',
      icon: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      accent: theme === 'dark' ? 'from-blue-500/20 to-blue-600/10' : 'from-blue-100 to-blue-50',
    },
    purple: {
      bg: theme === 'dark' ? 'bg-purple-500/20 border-purple-500/30' : 'bg-purple-50 border-purple-200',
      icon: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
      accent: theme === 'dark' ? 'from-purple-500/20 to-purple-600/10' : 'from-purple-100 to-purple-50',
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`rounded-xl p-5 border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
        theme === 'dark'
          ? 'bg-gray-900/60 border-white/10'
          : 'bg-white/80 border-gray-200/50'
      } ${colors.bg}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${
          theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'
        }`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
        <div className={`w-16 h-16 rounded-full blur-xl absolute -top-4 -right-4 bg-gradient-to-br ${colors.accent} opacity-50`}></div>
      </div>
      <div>
        <p className={`text-sm font-medium mb-1 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {title}
        </p>
        <p className={`text-2xl font-bold mb-1 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {value}
        </p>
        <p className={`text-xs ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
        }`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}
