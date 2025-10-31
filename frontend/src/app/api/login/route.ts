// frontend/src/app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        // ✅ Dynamically choose backend depending on environment
        const backend =
            process.env.API_URL_INTERNAL?.trim() || // inside Docker/Next.js
            process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() || // from browser
            "http://localhost:8000"; // fallback for local dev

        const body = await req.json();

        const response = await fetch(`${backend}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            credentials: "include",
        });

        let data;
        try {
            data = await response.json();
        } catch {
            data = { message: await response.text() };
        }

        const next = NextResponse.json(data, { status: response.status });

        const setCookie = response.headers.get("set-cookie");
        if (setCookie) next.headers.set("set-cookie", setCookie);

        return next;
    } catch (err) {
        console.error("❌ Login API error:", err);
        return NextResponse.json(
            { error: "Login failed. Backend may be unreachable." },
            { status: 500 }
        );
    }
}











// frontend/src/app/api/login/route.ts
// import { NextRequest, NextResponse } from "next/server";
//
// export const runtime = "nodejs"; // ensure runs on server
//
// export async function POST(req: NextRequest) {
//     try {
//         // ✅ Use same environment logic as register route
//         const backend =
//             process.env.NEXT_PUBLIC_API_URL ||
//             "http://127.0.0.1:8000"; // fallback only for local dev
//
//         const body = await req.json();
//
//         // ✅ Send login request to FastAPI backend
//         const response = await fetch(`${backend}/auth/login`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(body),
//             credentials: "include", // keep cookies if backend sets session
//         });
//
//         // ✅ Try to parse JSON safely
//         let data;
//         try {
//             data = await response.json();
//         } catch {
//             data = { message: await response.text() };
//         }
//
//         // ✅ Create NextResponse with same status as backend
//         const next = NextResponse.json(data, { status: response.status });
//
//         // ✅ Forward backend cookies (for JWT/session login)
//         const setCookie = response.headers.get("set-cookie");
//         if (setCookie) {
//             next.headers.set("set-cookie", setCookie);
//         }
//
//         return next;
//     } catch (err) {
//         console.error("❌ Login API error:", err);
//         return NextResponse.json(
//             { error: "Login failed. Backend may be unreachable." },
//             { status: 500 }
//         );
//     }
// }









// //frontend/src/app/api/login/route.ts
//
// import { NextRequest, NextResponse } from "next/server";
//
// export const runtime = "nodejs"; // ✅ Ensures it runs on the server
//
// export async function POST(req: NextRequest) {
//     try {
//         // ✅ Use the right backend URL (internal when in Docker)
//         const backend =
//             process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000";
//
//         const body = await req.json();
//
//         // ✅ Send login request to FastAPI
//         const res = await fetch(`${backend}/auth/login`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(body),
//             credentials: "include", // Important for cookie auth
//         });
//
//         // ✅ Try parsing backend response safely
//         let data;
//         try {
//             data = await res.json();
//         } catch {
//             data = { message: "Invalid JSON response from backend" };
//         }
//
//         // ✅ Forward backend JSON + status
//         const next = NextResponse.json(data, { status: res.status });
//
//         // ✅ Mirror backend Set-Cookie header so SSR components see auth state
//         const setCookie = res.headers.get("set-cookie");
//         if (setCookie) {
//             next.headers.set("set-cookie", setCookie);
//         }
//
//         return next;
//     } catch (err: any) {
//         console.error("❌ Login API error:", err);
//         return NextResponse.json(
//             { error: "Login failed. Backend may be unreachable." },
//             { status: 500 }
//         );
//     }
// }
