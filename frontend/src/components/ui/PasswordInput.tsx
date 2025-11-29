"use client";

import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Input from "./Input";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    showToggle?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className = "", showToggle = true, ...props }, ref) => {
        const { theme } = useTheme();
        const [showPassword, setShowPassword] = useState(false);

        return (
            <div className="relative">
                <Input
                    ref={ref}
                    type={showPassword ? "text" : "password"}
                    className={`pr-12 ${className}`}
                    {...props}
                />
                {showToggle && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all duration-200 ${
                            theme === "dark"
                                ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 active:scale-95"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:scale-95"
                        }`}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                )}
            </div>
        );
    }
);
PasswordInput.displayName = "PasswordInput";
export default PasswordInput;

