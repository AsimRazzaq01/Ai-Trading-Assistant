// frontend/src/app/api/change-password/route.ts

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const backend =
    process.env.API_URL_INTERNAL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8000";

// POST - Change password
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const cookie = req.headers.get("cookie") ?? "";
        const authHeader = req.headers.get("authorization");

        const response = await fetch(`${backend}/auth/change-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader ? { Authorization: authHeader } : {}),
                ...(cookie ? { Cookie: cookie } : {}),
            },
            body: JSON.stringify(body),
            credentials: "include",
            cache: "no-store",
        });

        const data = await response.json();
        const nextRes = NextResponse.json(data, { status: response.status });

        // Forward cookies
        const setCookie = response.headers.get("set-cookie");
        if (setCookie) {
            nextRes.headers.set("set-cookie", setCookie);
        }

        return nextRes;
    } catch (err) {
        console.error("❌ /api/change-password POST error:", err);
        return NextResponse.json(
            { detail: "Failed to change password" },
            { status: 500 }
        );
    }
}

