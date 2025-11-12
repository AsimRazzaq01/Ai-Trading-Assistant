//frontend/src/app/(protected)/layout.tsx

import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function fetchMe() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("access_token")?.value;

        if (!token) return null;

        // ✅ Determine backend URL: use internal URL if available, otherwise public URL
        // In Vercel production, API_URL_INTERNAL should be set to Railway backend URL
        // In local dev, NEXT_PUBLIC_API_URL_BROWSER should be set to localhost:8000
        const backend =
            process.env.API_URL_INTERNAL?.trim() ||
            process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
            "http://localhost:8000";

        // ✅ Call backend directly from server component (more reliable than internal API route)
        const res = await fetch(`${backend}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Cookie: `access_token=${token}`, // Also send as cookie for backend compatibility
            },
            cache: "no-store",
        });

        if (!res.ok) {
            console.error(`❌ Failed to fetch user: ${res.status}`);
            return null;
        }

        return await res.json();
    } catch (err) {
        console.error("❌ Error fetching current user:", err);
        return null;
    }
}

export default async function ProtectedLayout({
                                                  children,
                                              }: {
    children: React.ReactNode;
}) {
    const me = await fetchMe();

    if (!me) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <a className="underline text-blue-600" href="/login">
                    Session expired. Go to Login →
                </a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <a href="/dashboard" className="font-semibold text-xl text-gray-800 hover:text-blue-600 transition">
                            Profit Path 🚀
                        </a>
                        <nav className="flex gap-2 flex-wrap items-center">
                            <a className="px-3 py-1 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition" href="/dashboard">
                                Dashboard
                            </a>
                            <a className="px-3 py-1 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition" href="/my-assets">
                                My Assets
                            </a>
                            <a className="px-3 py-1 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition" href="/watchlist">
                                Watchlist
                            </a>
                            <a className="px-3 py-1 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition" href="/deep-research">
                                Deep Research
                            </a>
                            <a className="px-3 py-1 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition" href="/news-brief">
                                News Brief
                            </a>
                            <a className="px-3 py-1 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition" href="/pattern-trends">
                                Pattern Trends
                            </a>
                            <a className="px-3 py-1 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition" href="/risk-management">
                                Risk Management
                            </a>
                            <a className="px-3 py-1 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition" href="/market-chat">
                                Market Chat
                            </a>
                            <a className="px-3 py-1 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition" href="/settings">
                                Settings
                            </a>
                            <form action="/api/logout" method="post" className="ml-2">
                                <button className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition">
                                    Logout
                                </button>
                            </form>
                        </nav>
                    </div>
                </div>
            </header>
            <main className="min-h-[calc(100vh-64px)]">{children}</main>
        </div>
    );
}












// import { cookies } from "next/headers";
// import React from "react";
//
// export const dynamic = "force-dynamic";
//
// async function fetchMe() {
//     const backend =
//         process.env.NODE_ENV === "production"
//             ? process.env.API_URL_INTERNAL || "http://ai_backend:8000"
//             : process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000";
//
//     const cookieStore = await cookies();
//     const token = cookieStore.get("access_token")?.value;
//     if (!token) return null;
//
//     const res = await fetch(`${backend}/auth/me`, {
//         headers: { Authorization: `Bearer ${token}` },
//         cache: "no-store",
//     });
//     if (!res.ok) return null;
//     return res.json();
// }
//
// export default async function ProtectedLayout({
//                                                   children,
//                                               }: {
//     children: React.ReactNode;
// }) {
//     const me = await fetchMe();
//
//     if (!me) {
//         return (
//             <div className="min-h-screen flex items-center justify-center">
//                 <a className="underline" href="/login">
//                     Session expired. Go to Login
//                 </a>
//             </div>
//         );
//     }
//
//     return (
//         <div className="min-h-screen">
//             <header className="border-b p-4 flex items-center justify-between">
//                 <div className="font-semibold">Profit Path</div>
//                 <nav className="flex gap-4">
//                     <a className="underline" href="/dashboard">
//                         Dashboard
//                     </a>
//                     <a className="underline" href="/settings">
//                         Settings
//                     </a>
//                     <form action="/api/logout" method="post">
//                         <button className="underline">Logout</button>
//                     </form>
//                 </nav>
//             </header>
//             <main className="p-6">{children}</main>
//         </div>
//     );
// }
