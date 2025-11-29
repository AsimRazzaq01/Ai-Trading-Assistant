"use client";

import { useTheme } from "@/context/ThemeContext";

export default function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { theme } = useTheme();
    return (
        <button
            className={`w-full rounded-lg py-3 px-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl ${
                theme === "dark"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            }`}
            {...props}
        >
            {children}
        </button>
    );
}