// frontend/src/app/api/logout/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
    try {
        const backend = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

        // ✅ Call backend logout endpoint
        const response = await fetch(`${backend}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });

        // ✅ Prepare redirect back to main screen (e.g., /login)
        const redirect = NextResponse.redirect(new URL("/login", _req.url), 302);

        // ✅ Forward any cookie deletion headers from backend
        const setCookie = response.headers.get("set-cookie");
        if (setCookie) redirect.headers.set("set-cookie", setCookie);

        return redirect;
    } catch (err) {
        console.error("❌ Logout API error:", err);
        // Fallback to redirect to login even if backend call fails
        return NextResponse.redirect(new URL("/login", _req.url), 302);
    }
}










// import { NextRequest, NextResponse } from "next/server";
//
//
// export async function POST(_req: NextRequest) {
//     const backend = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
//     const res = await fetch(`${backend}/auth/logout`, {
//         method: "POST",
//         credentials: "include",
//     });
//
//
//     const next = NextResponse.json({ ok: true }, { status: 200 });
//     const setCookie = res.headers.get("set-cookie");
//     if (setCookie) next.headers.set("set-cookie", setCookie);
//     next.headers.set("Location", "/login");
//     return next;
// }