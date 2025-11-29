// frontend/src/app/(auth)/register/page.tsx

"use client";

import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";
import { useTheme } from "@/context/ThemeContext";

export default function RegisterPage() {
    const { theme } = useTheme();
    
    return (
        <div className="w-full max-w-md">
            <h1 className={`text-3xl font-extrabold mb-6 text-center transition-colors ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
            }`}>
                Create Your Account
            </h1>

            <RegisterForm />

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

