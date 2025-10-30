// frontend/src/app/api/register/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // ✅ Choose backend URL:
        // Use public Railway URL in production, localhost in dev
        const backend =
            process.env.NEXT_PUBLIC_API_URL ||
            "http://127.0.0.1:8000"; // Only used locally

        const body = await req.json();

        const response = await fetch(`${backend}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            credentials: "include", // optional if you use cookies
        });

        // Handle JSON or text fallback
        let data;
        try {
            data = await response.json();
        } catch {
            data = { message: await response.text() };
        }

        return NextResponse.json(data, { status: response.status });
    } catch (err) {
        console.error("❌ Register API error:", err);
        return NextResponse.json(
            { error: "Registration failed. Backend may be unreachable." },
            { status: 500 }
        );
    }
}







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
