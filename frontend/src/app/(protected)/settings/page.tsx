// frontend/src/app/(protected)/settings/page.tsx

import { cookies } from "next/headers";
import React from "react";

export default async function SettingsPage() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("access_token")?.value;

        if (!token) {
            return (
                <div className="p-6 text-center">
                    <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
                    <p className="text-gray-600 mt-2">Please log in to continue.</p>
                </div>
            );
        }

        // ✅ Determine backend URL: use internal URL if available, otherwise public URL
        const backend =
            process.env.API_URL_INTERNAL?.trim() ||
            process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
            "http://localhost:8000";

        // ✅ Call backend directly from server component
        const res = await fetch(`${backend}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Cookie: `access_token=${token}`, // Also send as cookie for backend compatibility
            },
            cache: "no-store",
        });

        if (!res.ok) {
            console.error(`❌ Backend returned ${res.status}`);
            return (
                <div className="p-6 text-center">
                    <h1 className="text-2xl font-bold text-red-600">Server Error</h1>
                    <p className="text-gray-600 mt-2">
                        Could not load user data. Please try again later.
                    </p>
                </div>
            );
        }

        const user = await res.json();

        return (
            <div className="p-6 text-center">
                <h1 className="text-3xl font-bold text-blue-600">
                    Account Settings ⚙️
                </h1>
                <p className="text-gray-600 mt-2">
                    Logged in as:{" "}
                    <span className="font-semibold text-gray-800">{user.email}</span>
                </p>
                <p className="text-gray-500 mt-1 text-sm">
                    Backend connection verified ✅
                </p>
            </div>
        );
    } catch (err) {
        console.error("❌ Settings page error:", err);
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold text-red-600">Server Error</h1>
                <p className="text-gray-600 mt-2">
                    Could not load user data. Please try again later.
                </p>
            </div>
        );
    }
}








// import { cookies } from "next/headers";
// import React from "react";
//
// export default async function SettingsPage() {
//     try {
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
//         if (!res.ok) throw new Error(`Backend returned ${res.status}`);
//         const user = await res.json();
//
//         return (
//             <div className="p-6 text-center">
//                 <h1 className="text-3xl font-bold text-blue-600">
//                     Account Settings ⚙️
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
//         console.error("❌ Settings page error:", err);
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
