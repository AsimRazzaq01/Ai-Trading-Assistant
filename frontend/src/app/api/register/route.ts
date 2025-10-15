// frontend/src/app/api/register/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // ✅ Use the correct backend URL depending on environment:
        const backend =
            process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000";

        const body = await req.json();

        const res = await fetch(`${backend}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            // Include cookies for same-origin credentials (if backend sets them)
            credentials: "include",
        });

        // Try parsing backend response safely
        let data;
        try {
            data = await res.json();
        } catch {
            data = { message: "Invalid JSON response from backend" };
        }

        return NextResponse.json(data, { status: res.status });
    } catch (err: any) {
        console.error("❌ Register API error:", err);
        return NextResponse.json(
            { error: "Registration failed. Backend may be unreachable." },
            { status: 500 },
        );
    }
}
