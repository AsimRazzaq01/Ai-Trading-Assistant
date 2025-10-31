// frontend/src/app/api/logout/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
    try {
        const backend =
            process.env.API_URL_INTERNAL ||
            process.env.NEXT_PUBLIC_API_URL_BROWSER ||
            "http://ai_backend:8000";

        // ✅ Call FastAPI backend logout
        const response = await fetch(`${backend}/auth/logout`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });

        // ✅ Determine redirect target automatically
        //    In prod → use Vercel URL; in local → use localhost
        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            (process.env.VERCEL_URL
                ? `https://${process.env.VERCEL_URL}`
                : "http://localhost:3000");

        const redirectUrl = `${baseUrl}/`; // 👈 send to homepage

        const redirect = NextResponse.redirect(redirectUrl, 302);

        // ✅ Forward backend's Set-Cookie header to clear cookies client-side
        const setCookie = response.headers.get("set-cookie");
        if (setCookie) redirect.headers.set("set-cookie", setCookie);

        return redirect;
    } catch (err) {
        console.error("❌ Logout API error:", err);

        // Fallback: safe redirect home even if backend call fails
        const fallbackBase =
            process.env.NEXT_PUBLIC_APP_URL ||
            (process.env.VERCEL_URL
                ? `https://${process.env.VERCEL_URL}`
                : "http://localhost:3000");

        return NextResponse.redirect(`${fallbackBase}/`, 302);
    }
}


