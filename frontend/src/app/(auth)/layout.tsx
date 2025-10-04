//
// export default function AuthLayout({
//                                        children,
//                                    }: {
//     children: React.ReactNode;
// }) {
//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-100">
//             <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
//                 {children}
//             </div>
//         </div>
//     );
// }


"use client";

import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
                <h1 className="text-3xl font-bold mb-6 text-green-600 text-center">
                    Register
                </h1>

                {/* Reuse your RegisterForm component */}
                <RegisterForm />

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link
                        href="/"
                        className="text-blue-600 hover:underline hover:text-blue-800 transition"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
