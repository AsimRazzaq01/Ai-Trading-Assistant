// frontend/src/app/(auth)/register/page.tsx

"use client";

import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";
import { useTheme } from "@/context/ThemeContext";

export default function RegisterPage() {
    const { theme } = useTheme();
    
    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h1 className={`text-4xl font-semibold mb-2 transition-all duration-300 ${
                    theme === "dark" 
                        ? "bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent" 
                        : "text-gray-900"
                }`}>
                    Create Your Account
                </h1>
                <p className={`text-sm mt-2 transition-colors ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                    Join Profit Path and start your trading journey
                </p>
            </div>

            <RegisterForm />

            <div className="text-center mt-8">
                <p className={`text-sm mb-2 transition-colors ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className={`font-semibold hover:underline transition ${
                            theme === "dark"
                                ? "text-blue-400 hover:text-blue-300"
                                : "text-blue-600 hover:text-blue-800"
                        }`}
                    >
                        Sign in
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

