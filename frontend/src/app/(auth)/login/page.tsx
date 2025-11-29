// frontend/src/app/(auth)/login/page.tsx

"use client";

import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";
import { useTheme } from "@/context/ThemeContext";

export default function LoginPage() {
    const { theme } = useTheme();
    
    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300 ${
                    theme === "dark" 
                        ? "from-blue-400 to-purple-400" 
                        : "from-blue-600 to-purple-600"
                }`}>
                    Welcome Back
                </h1>
                <p className={`text-sm mt-2 transition-colors ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                    Sign in to continue to Profit Path
                </p>
            </div>

            <LoginForm />

            <div className="text-center mt-8">
                <p className={`text-sm mb-2 transition-colors ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                    Don't have an account?{" "}
                    <Link
                        href="/register"
                        className={`font-semibold hover:underline transition ${
                            theme === "dark"
                                ? "text-blue-400 hover:text-blue-300"
                                : "text-blue-600 hover:text-blue-800"
                        }`}
                    >
                        Sign up
                    </Link>
                </p>
                <Link
                    href="/"
                    className={`text-sm hover:underline transition inline-flex items-center gap-1 ${
                        theme === "dark"
                            ? "text-gray-500 hover:text-gray-400"
                            : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}

