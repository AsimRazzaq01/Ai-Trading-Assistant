// frontend/src/app/(auth)/login/page.tsx

"use client";

import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <div className="w-full max-w-md">
            <h1 className="text-3xl font-extrabold mb-6 text-blue-600 text-center">
                Welcome Back
            </h1>

            <LoginForm />

            <div className="text-center mt-6">
                <Link
                    href="/"
                    className="text-blue-600 hover:underline hover:text-blue-800 transition"
                >
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}

