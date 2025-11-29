"use client";

import { forwardRef } from "react";
import { useTheme } from "@/context/ThemeContext";

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className = "", ...props }, ref) => {
        const { theme } = useTheme();
        return (
            <input
                ref={ref}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring transition-colors ${
                    theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-gray-600"
                        : "bg-white border-gray-300 text-black placeholder-gray-400 focus:border-gray-400"
                } ${className}`}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";
export default Input;