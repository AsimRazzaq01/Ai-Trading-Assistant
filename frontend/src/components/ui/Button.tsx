"use client";

import { useTheme } from "@/context/ThemeContext";

export default function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { theme } = useTheme();
    return (
        <button
            className={`w-full rounded-md py-2 px-4 hover:opacity-90 disabled:opacity-50 transition-colors ${
                theme === "dark"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-black text-white hover:bg-gray-800"
            }`}
            {...props}
        >
            {children}
        </button>
    );
}