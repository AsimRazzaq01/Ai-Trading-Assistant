// frontend/src/app/(protected)/dashboard/page.tsx

"use client";

import React, { useEffect, useState } from "react";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const backend =
            process.env.NEXT_PUBLIC_API_URL_BROWSER ||
            "http://localhost:8000";

        (async () => {
            try {
                const res = await fetch(`${backend}/auth/me`, {
                    method: "GET",
                    credentials: "include", // ✅ send cookie to backend
                    cache: "no-store",
                });

                if (!res.ok) {
                    setError("Session expired. Go to Login →");
                    return;
                }

                const data = await res.json();
                setUser(data);
            } catch (err) {
                console.error("❌ Dashboard fetch error:", err);
                setError("Server error. Please try again later.");
            }
        })();
    }, []);

    if (error) {
        return (
            <div className="p-6 text-center">
                <a
                    href="/login"
                    className="text-blue-600 hover:underline text-lg"
                >
                    {error}
                </a>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-6 text-center text-gray-600">Loading...</div>
        );
    }

    return (
        <div className="p-6 text-center">
            <h1 className="text-3xl font-bold text-blue-600">
                Welcome to Profit Path 🚀
            </h1>
            <p className="text-gray-600 mt-2">
                Logged in as:{" "}
                <span className="font-semibold text-gray-800">
          {user.email}
        </span>
            </p>
            <p className="text-gray-500 mt-1 text-sm">
                Backend connection verified ✅
            </p>
        </div>
    );
}


















// import { cookies } from "next/headers";
// import React from "react";
//
// export default async function DashboardPage() {
//     try {
//         // ✅ Select backend:
//         // - Docker/Production SSR → internal FastAPI container
//         // - Local dev / Vercel → public URL
//         const backend =
//             process.env.NODE_ENV === "production"
//                 ? process.env.API_URL_INTERNAL || "http://ai_backend:8000"
//                 : process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000";
//
//         const cookieStore = await cookies();
//         const token = cookieStore.get("access_token")?.value;
//
//         if (!token) {
//             return (
//                 <div className="p-6 text-center">
//                     <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
//                     <p className="text-gray-600 mt-2">Please log in to continue.</p>
//                 </div>
//             );
//         }
//
//         // ✅ Fetch user info securely
//         const res = await fetch(`${backend}/auth/me`, {
//             headers: { Authorization: `Bearer ${token}` },
//             cache: "no-store",
//         });
//
//         if (!res.ok) {
//             console.error(`❌ Backend responded ${res.status}`);
//             return (
//                 <div className="p-6 text-center">
//                     <h1 className="text-2xl font-bold text-red-600">Server Error</h1>
//                     <p className="text-gray-600 mt-2">
//                         Could not load user data. Please try again later.
//                     </p>
//                 </div>
//             );
//         }
//
//         const user = await res.json();
//
//         return (
//             <div className="p-6 text-center">
//                 <h1 className="text-3xl font-bold text-blue-600">
//                     Welcome to Profit Path 🚀
//                 </h1>
//                 <p className="text-gray-600 mt-2">
//                     Logged in as:{" "}
//                     <span className="font-semibold text-gray-800">{user.email}</span>
//                 </p>
//                 <p className="text-gray-500 mt-1 text-sm">
//                     Backend connection verified ✅
//                 </p>
//             </div>
//         );
//     } catch (err) {
//         console.error("❌ Dashboard SSR error:", err);
//         return (
//             <div className="p-6 text-center">
//                 <h1 className="text-2xl font-bold text-red-600">Server Error</h1>
//                 <p className="text-gray-600 mt-2">
//                     Could not load user data. Please try again later.
//                 </p>
//             </div>
//         );
//     }
// }








// import { cookies } from "next/headers";
// import React from "react";
//
// export default async function DashboardPage() {
//     try {
//         // ✅ Choose backend:
//         // - Docker/Production SSR → internal FastAPI container
//         // - Local dev / Vercel → public URL
//         const backend =
//             process.env.NODE_ENV === "production"
//                 ? process.env.API_URL_INTERNAL || "http://ai_backend:8000"
//                 : process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000";
//
//         const cookieStore = await cookies();
//         const token = cookieStore.get("access_token")?.value;
//
//         if (!token) {
//             return (
//                 <div className="p-6 text-center">
//                     <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
//                     <p className="text-gray-600 mt-2">Please log in to continue.</p>
//                 </div>
//             );
//         }
//
//         const res = await fetch(`${backend}/auth/me`, {
//             headers: { Authorization: `Bearer ${token}` },
//             cache: "no-store",
//         });
//
//         if (!res.ok) throw new Error(`Backend responded ${res.status}`);
//         const user = await res.json();
//
//         return (
//             <div className="p-6 text-center">
//                 <h1 className="text-3xl font-bold text-blue-600">
//                     Welcome to Profit Path 🚀
//                 </h1>
//                 <p className="text-gray-600 mt-2">
//                     Logged in as:{" "}
//                     <span className="font-semibold text-gray-800">{user.email}</span>
//                 </p>
//                 <p className="text-gray-500 mt-1 text-sm">
//                     Backend connection verified ✅
//                 </p>
//             </div>
//         );
//     } catch (err) {
//         console.error("❌ Dashboard SSR error:", err);
//         return (
//             <div className="p-6 text-center">
//                 <h1 className="text-2xl font-bold text-red-600">Server Error</h1>
//                 <p className="text-gray-600 mt-2">
//                     Could not load user data. Please try again later.
//                 </p>
//             </div>
//         );
//     }
// }
