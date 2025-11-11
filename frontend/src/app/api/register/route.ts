// frontend/src/app/api/register/route.ts

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // ✅ Run in Node.js runtime (not Edge)

export async function POST(req: NextRequest) {
    try {
        // ✅ Dynamically choose correct backend URL
        const backend =
            process.env.API_URL_INTERNAL?.trim() || // e.g. http://ai_backend:8000 (Docker)
            process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() || // e.g. Railway public URL
            "http://localhost:8000"; // fallback for local dev

        // ✅ Parse request body
        const body = await req.json();

        // ✅ Forward registration request to FastAPI backend
        const response = await fetch(`${backend}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            credentials: "include", // not strictly needed, but keeps session handling consistent
        });

        // ✅ Safely parse backend response
        let data;
        try {
            data = await response.json();
        } catch {
            data = { message: await response.text() };
        }

        // ✅ Mirror backend response
        const next = NextResponse.json(data, { status: response.status });

        // ✅ Forward any cookies from backend (rare for register, but consistent)
        const setCookie = response.headers.get("set-cookie");
        if (setCookie) {
            next.headers.set("set-cookie", setCookie);
            console.log("🍪 Set-Cookie passed during register:", setCookie.split(";")[0]);
        }

        return next;
    } catch (err) {
        console.error("❌ Register API error:", err);
        return NextResponse.json(
            { error: "Registration failed. Backend may be unreachable." },
            { status: 500 }
        );
    }
}
























// // frontend/src/app/api/register/route.ts
//
// import { NextRequest, NextResponse } from "next/server";
//
// export const runtime = "nodejs"; // ensures this runs on the server, not in edge runtime
//
// export async function POST(req: NextRequest) {
//     try {
//         // ✅ Dynamically choose the correct backend URL
//         //    - Inside Docker (Next.js container) → uses internal hostname
//         //    - In browser / local dev → uses localhost:8000
//         //    - On production (Vercel) → uses public Railway backend URL
//         const backend =
//             process.env.API_URL_INTERNAL?.trim() || // used when running in Docker
//             process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() || // used in browser/Next dev
//             "http://localhost:8000"; // fallback for local host dev
//
//         // ✅ Parse the request body from the client
//         const body = await req.json();
//
//         // ✅ Forward the login request to FastAPI backend
//         const res = await fetch(`${backend}/auth/login`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(body),
//             credentials: "include", // important for cookies/session tokens
//         });
//
//         // ✅ Try parsing JSON safely
//         let data;
//         try {
//             data = await res.json();
//         } catch {
//             data = { message: await res.text() };
//         }
//
//         // ✅ Forward backend response to client
//         const next = NextResponse.json(data, { status: res.status });
//
//         // ✅ Mirror any Set-Cookie headers from backend (for auth persistence)
//         const setCookie = res.headers.get("set-cookie");
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








// import { NextRequest, NextResponse } from "next/server";
//
// export async function POST(req: NextRequest) {
//     try {
//         // ✅ Use the correct backend URL depending on environment:
//         const backend =
//             process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000";
//
//         const body = await req.json();
//
//         const res = await fetch(`${backend}/auth/register`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(body),
//             // Include cookies for same-origin credentials (if backend sets them)
//             credentials: "include",
//         });
//
//         // Try parsing backend response safely
//         let data;
//         try {
//             data = await res.json();
//         } catch {
//             data = { message: "Invalid JSON response from backend" };
//         }
//
//         return NextResponse.json(data, { status: res.status });
//     } catch (err: any) {
//         console.error("❌ Register API error:", err);
//         return NextResponse.json(
//             { error: "Registration failed. Backend may be unreachable." },
//             { status: 500 },
//         );
//     }
// }
