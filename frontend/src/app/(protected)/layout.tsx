//frontend/src/app/(protected)/layout.tsx

import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function fetchMe() {
    try {
        // ✅ Resolve backend intelligently:
        // - Docker SSR → internal ai_backend
        // - Local Dev / Vercel → public API
        const backend =
            process.env.NODE_ENV === "production"
                ? process.env.API_URL_INTERNAL || "http://ai_backend:8000"
                : process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000";

        const cookieStore = await cookies();
        const token = cookieStore.get("access_token")?.value;

        if (!token) return null;

        // ✅ Directly query backend for the current user
        const res = await fetch(`${backend}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
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
        <div className="min-h-screen">
            <header className="border-b p-4 flex items-center justify-between bg-gray-50">
                <div className="font-semibold text-gray-800">Profit Path 🚀</div>
                <nav className="flex gap-4">
                    <a className="underline text-blue-600" href="/dashboard">
                        Dashboard
                    </a>
                    <a className="underline text-blue-600" href="/settings">
                        Settings
                    </a>
                    <form action="/api/logout" method="post">
                        <button className="underline text-red-600">Logout</button>
                    </form>
                </nav>
            </header>
            <main className="p-6">{children}</main>
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
