// export default function HomePage() {
//     return (
//         <main className="min-h-screen flex items-center justify-center">
//             <div className="space-y-4 text-center">
//                 <h1 className="text-3xl font-bold">AI Trading Assistant</h1>
//                 <p className="text-gray-600">Login or Register to continue</p>
//                 <div className="flex gap-4 justify-center">
//                     <a className="underline" href="/(auth)/login">Login</a>
//                     <a className="underline" href="/(auth)/register">Register</a>
//                 </div>
//             </div>
//         </main>
//     );
// }
//


import Link from "next/link";

export default function HomePage() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <h1 className="text-4xl font-bold mb-8">AI Trading Assistant</h1>

            <div className="flex space-x-4">
                {/* ✅ Login Button */}
                <Link
                    href="/login"
                    className="px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
                >
                    Login
                </Link>

                {/* ✅ Register Button */}
                <Link
                    href="/register"
                    className="px-6 py-3 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition"
                >
                    Register
                </Link>
            </div>
        </main>
    );
}
