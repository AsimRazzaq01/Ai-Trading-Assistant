"use client";

import { useTheme } from "@/context/ThemeContext";

export default function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { theme } = useTheme();
    return (
        <button
            className={`w-full rounded-lg py-2 px-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                theme === "dark"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
            }`}
            {...props}
        >
            {children}
        </button>
    );
}