// ============================================================
// 💻 frontend/src/app/api/me/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // ✅ Required for cookies to persist properly

export async function GET(req: NextRequest) {
    try {
        // ✅ Dynamically pick backend target (local / Docker / production)
        const backend =
            process.env.API_URL_INTERNAL?.trim() ||
            process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
            "http://localhost:8000";

        // ✅ Forward both auth headers and cookies (if available)
        const cookie = req.headers.get("cookie") ?? "";
        const authHeader = req.headers.get("authorization");

        const response = await fetch(`${backend}/auth/me`, {
            method: "GET",
            headers: {
                ...(authHeader ? { Authorization: authHeader } : {}),
                ...(cookie ? { Cookie: cookie } : {}),
            },
            credentials: "include",
            cache: "no-store", // always fetch fresh session info
        });

        // ✅ Attempt to safely parse backend response
        let data;
        try {
            data = await response.json();
        } catch {
            data = { message: await response.text() };
        }

        // ✅ Pass through backend cookies *only if valid for frontend domain*
        const nextRes = NextResponse.json(data, { status: response.status });
        const setCookie = response.headers.get("set-cookie");

        if (
            setCookie &&
            setCookie.includes("ai-trading-assistant-steel.vercel.app")
        ) {
            nextRes.headers.set("set-cookie", setCookie);
            console.log("🍪 Forwarded valid cookie:", setCookie.split(";")[0]);
        }

        return nextRes;
    } catch (err) {
        console.error("❌ /api/me proxy error:", err);

        return NextResponse.json(
            { detail: "Unable to fetch user info — backend may be unreachable." },
            { status: 500 }
        );
    }
}






















// import { NextRequest, NextResponse } from "next/server";
//
// export const runtime = "nodejs";
//
// export async function GET(req: NextRequest) {
//     try {
//         const backend =
//             process.env.API_URL_INTERNAL?.trim() ||
//             process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
//             "http://localhost:8000";
//
//         const cookie = req.headers.get("cookie") ?? "";
//         const authHeader = req.headers.get("authorization");
//
//         const response = await fetch(`${backend}/auth/me`, {
//             method: "GET",
//             headers: {
//                 ...(authHeader ? { Authorization: authHeader } : {}),
//                 ...(cookie ? { Cookie: cookie } : {}),
//                 "Content-Type": "application/json",
//             },
//             credentials: "include",
//             cache: "no-store",
//         });
//
//         const data = await response.json();
//
//         if (response.status === 401) {
//             console.warn("⚠️ Unauthorized from backend");
//             const res = NextResponse.json(
//                 { detail: "Session expired. Please log in again." },
//                 { status: 401 }
//             );
//             res.cookies.delete("access_token");
//             return res;
//         }
//
//         return NextResponse.json(data, { status: response.status });
//     } catch (err) {
//         console.error("❌ /api/me proxy error:", err);
//         return NextResponse.json(
//             { detail: "Unable to verify session" },
//             { status: 500 }
//         );
//     }
// }




























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

