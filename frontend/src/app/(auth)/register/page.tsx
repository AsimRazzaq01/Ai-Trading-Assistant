// frontend/src/app/(auth)/register/page.tsx

"use client";

import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
    return (
        <div className="w-full max-w-md">
            <h1 className="text-3xl font-extrabold mb-6 text-blue-600 text-center">
                Create Your Account
            </h1>

            <RegisterForm />

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

