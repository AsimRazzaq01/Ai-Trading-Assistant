// ============================================================
// 💻 frontend/src/app/api/me/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // ✅ ensures Node runtime (not Edge)

export async function GET(req: NextRequest) {
    try {
        // ============================================================
        // 🌍 Dynamically pick backend (local vs prod)
        // ============================================================
        const backend =
            process.env.API_URL_INTERNAL?.trim() ||
            process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
            (process.env.NODE_ENV === "production"
                ? "https://ai-trading-assistant-backend-production.up.railway.app" // ✅ replace with your Railway backend URL
                : "http://localhost:8000");

        // ============================================================
        // 🍪 Forward cookies and headers to backend
        // ============================================================
        const cookie = req.headers.get("cookie") ?? "";
        const authHeader = req.headers.get("authorization");

        const res = await fetch(`${backend}/auth/me`, {
            method: "GET",
            headers: {
                ...(authHeader ? { Authorization: authHeader } : {}),
                ...(cookie ? { Cookie: cookie } : {}),
                "Content-Type": "application/json",
            },
            credentials: "include", // ✅ allows backend to read HttpOnly cookie
            cache: "no-store",
        });

        // ============================================================
        // 🧠 Parse backend response safely
        // ============================================================
        let data: any;
        try {
            data = await res.json();
        } catch {
            data = { message: await res.text() };
        }

        // ============================================================
        // ❌ Normalize unauthorized responses
        // ============================================================
        if (res.status === 401) {
            console.warn("⚠️ Unauthorized: clearing local session cookie");
            const out = NextResponse.json(
                { detail: "Session expired. Please log in again." },
                { status: 401 }
            );
            out.cookies.delete("access_token"); // clears client-side cookie (just in case)
            return out;
        }

        // ============================================================
        // ✅ Forward backend data to frontend
        // ============================================================
        return NextResponse.json(data, { status: res.status });
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

