// frontend/src/app/api/me/route.ts

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // ✅ Needed for cookies to work properly

export async function GET(req: NextRequest) {
    try {
        // ✅ Dynamically pick backend
        const backend =
            process.env.API_URL_INTERNAL?.trim() ||
            process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
            "http://localhost:8000";

        // ✅ Grab both cookie + Authorization header (supports both login methods)
        const cookie = req.headers.get("cookie") ?? "";
        const authHeader = req.headers.get("authorization");

        // ✅ Call FastAPI backend /auth/me
        const response = await fetch(`${backend}/auth/me`, {
            method: "GET",
            headers: {
                ...(authHeader ? { Authorization: authHeader } : {}),
                ...(cookie ? { Cookie: cookie } : {}),
            },
            credentials: "include",
            cache: "no-store",
        });

        // ✅ Attempt to parse backend response safely
        let data;
        try {
            data = await response.json();
        } catch {
            data = { message: await response.text() };
        }

        // ✅ If backend says unauthorized, normalize the message
        if (response.status === 401) {
            console.warn("⚠️ Unauthorized from backend: clearing session");
            return NextResponse.json(
                { detail: "Session expired. Please log in again." },
                { status: 401 }
            );
        }

        return NextResponse.json(data, { status: response.status });
    } catch (err) {
        console.error("❌ /api/me proxy error:", err);
        return NextResponse.json(
            { detail: "Unable to verify session. Please try again later." },
            { status: 500 }
        );
    }
}
























// //frontend/src/app/api/me/route.ts
//
// import { NextRequest, NextResponse } from "next/server";
//
// export const runtime = "nodejs";
//
// export async function GET(req: NextRequest) {
//     const backend =
//         process.env.API_URL_INTERNAL?.trim() ||
//         process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
//         "http://localhost:8000";
//
//     const cookie = req.headers.get("cookie");
//
//     const res = await fetch(`${backend}/auth/me`, {
//         method: "GET",
//         headers: {
//             "Content-Type": "application/json",
//             ...(cookie ? { Cookie: cookie } : {}),
//         },
//         credentials: "include",
//         cache: "no-store",
//     });
//
//     const data = await res.json();
//     return NextResponse.json(data, { status: res.status });
// }
//

