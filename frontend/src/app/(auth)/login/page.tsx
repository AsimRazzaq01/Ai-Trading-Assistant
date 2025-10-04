// // frontend/src/app/(auth)/login/page.tsx
// import Link from "next/link";
// import LoginForm from "@/components/auth/LoginForm";
//
// export const runtime = "nodejs";
//
// export default function LoginPage() {
//     return (
//         <div className="flex flex-col items-center">
//             <h1 className="text-3xl font-bold mb-6">Login</h1>
//             <LoginForm />
//             <Link
//                 href="/"
//                 className="mt-6 text-blue-600 hover:underline hover:text-blue-800 transition"
//             >
//                 ← Back to Home
//             </Link>
//         </div>
//     );
// }
//



"use client";

import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
                <h1 className="text-3xl font-bold mb-6 text-blue-600 text-center">
                    Login
                </h1>

                {/* Reuse your LoginForm component */}
                <LoginForm />

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
