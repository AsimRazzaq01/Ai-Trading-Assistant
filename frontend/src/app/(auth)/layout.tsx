"use client";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const { theme, toggleTheme } = useTheme();
    
    return (
        <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 relative overflow-hidden ${
            theme === "dark"
                ? "bg-gradient-to-br from-gray-950/95 via-black/95 to-gray-900/95"
                : "bg-gradient-to-b from-white/60 to-[#f0f4ff]/60 backdrop-blur-[2px]"
        }`}>
            {/* Animated background elements - Updated to Lapis Blue and Emerald for light theme */}
            <div className={`absolute inset-0 overflow-hidden pointer-events-none ${
                theme === "dark" ? "opacity-20" : "opacity-15"
            }`}>
                <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl ${
                    theme === "dark" ? "bg-blue-500" : "bg-lapis-500"
                } animate-pulse`} style={{ animationDuration: '4s' }}></div>
                <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${
                    theme === "dark" ? "bg-purple-500" : "bg-emerald-500"
                } animate-pulse`} style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
            </div>

            <div className={`w-full max-w-md p-8 rounded-xl shadow-md transition-all duration-500 relative z-10 ${
                theme === "dark"
                    ? "bg-gray-900/90 border border-gray-800/50 shadow-blue-500/10"
                    : "bg-white border border-gray-200"
            }`}>
                {/* Dark mode toggle */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={toggleTheme}
                        className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${
                            theme === 'dark'
                                ? 'bg-white/10 border border-white/20 hover:bg-white/15 text-white hover:border-white/30'
                                : 'bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-5 h-5" />
                        ) : (
                            <Moon className="w-5 h-5" />
                        )}
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}