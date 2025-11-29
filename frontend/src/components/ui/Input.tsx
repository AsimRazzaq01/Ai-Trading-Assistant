"use client";

import { forwardRef } from "react";
import { useTheme } from "@/context/ThemeContext";

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className = "", ...props }, ref) => {
        const { theme } = useTheme();
        return (
            <input
                ref={ref}
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    theme === "dark"
                        ? "bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20 hover:border-gray-600"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-400 shadow-sm"
                } ${className}`}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";
export default Input;