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
        <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
            theme === "dark"
                ? "bg-gradient-to-b from-black via-gray-950 to-black"
                : "bg-gray-100"
        }`}>
            <div className={`w-full max-w-md p-6 rounded-xl shadow-md transition-colors duration-500 ${
                theme === "dark"
                    ? "bg-gray-900 border border-gray-800"
                    : "bg-white"
            }`}>
                {/* Dark mode toggle */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-xl transition-all ${
                            theme === 'dark'
                                ? 'bg-white/10 border border-white/20 hover:bg-white/15 text-white'
                                : 'bg-[#e8ebef] border border-[#2d3748]/20 hover:bg-[#dfe3e8] text-[#2d3748]'
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