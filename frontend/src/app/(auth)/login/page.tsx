// frontend/src/app/(auth)/login/page.tsx

"use client";

import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";
import { useTheme } from "@/context/ThemeContext";

export default function LoginPage() {
    const { theme } = useTheme();
    
    return (
        <div className="w-full max-w-md">
            <h1 className={`text-3xl font-extrabold mb-6 text-center transition-colors ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
            }`}>
                Welcome Back
            </h1>

            <LoginForm />

            <div className="text-center mt-6">
                <Link
                    href="/"
                    className={`hover:underline transition ${
                        theme === "dark"
                            ? "text-blue-400 hover:text-blue-300"
                            : "text-blue-600 hover:text-blue-800"
                    }`}
                >
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}

