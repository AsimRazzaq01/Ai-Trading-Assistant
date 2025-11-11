// ============================================================
// 💻 frontend/src/app/api/me/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        const backend =
            process.env.API_URL_INTERNAL?.trim() ||
            process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
            "http://localhost:8000";

        const cookie = req.headers.get("cookie") ?? "";
        const authHeader = req.headers.get("authorization");

        const response = await fetch(`${backend}/auth/me`, {
            method: "GET",
            headers: {
                ...(authHeader ? { Authorization: authHeader } : {}),
                ...(cookie ? { Cookie: cookie } : {}),
                "Content-Type": "application/json",
            },
            credentials: "include",
            cache: "no-store",
        });

        const data = await response.json();

        if (response.status === 401) {
            console.warn("⚠️ Unauthorized from backend");
            const res = NextResponse.json(
                { detail: "Session expired. Please log in again." },
                { status: 401 }
            );
            res.cookies.delete("access_token");
            return res;
        }

        return NextResponse.json(data, { status: response.status });
    } catch (err) {
        console.error("❌ /api/me proxy error:", err);
        return NextResponse.json(
            { detail: "Unable to verify session" },
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

