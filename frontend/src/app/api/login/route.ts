//frontend/src/app/api/login/route.ts

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // ✅ Ensures it runs on the server

export async function POST(req: NextRequest) {
    try {
        // ✅ Use the right backend URL (internal when in Docker)
        const backend =
            process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000";

        const body = await req.json();

        // ✅ Send login request to FastAPI
        const res = await fetch(`${backend}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            credentials: "include", // Important for cookie auth
        });

        // ✅ Try parsing backend response safely
        let data;
        try {
            data = await res.json();
        } catch {
            data = { message: "Invalid JSON response from backend" };
        }

        // ✅ Forward backend JSON + status
        const next = NextResponse.json(data, { status: res.status });

        // ✅ Mirror backend Set-Cookie header so SSR components see auth state
        const setCookie = res.headers.get("set-cookie");
        if (setCookie) {
            next.headers.set("set-cookie", setCookie);
        }

        return next;
    } catch (err: any) {
        console.error("❌ Login API error:", err);
        return NextResponse.json(
            { error: "Login failed. Backend may be unreachable." },
            { status: 500 }
        );
    }
}
