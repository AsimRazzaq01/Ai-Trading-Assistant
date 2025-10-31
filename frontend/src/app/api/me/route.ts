//frontend/src/app/api/me/route.ts

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    const backend =
        process.env.API_URL_INTERNAL?.trim() ||
        process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
        "http://localhost:8000";

    const cookie = req.headers.get("cookie");

    const res = await fetch(`${backend}/auth/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(cookie ? { Cookie: cookie } : {}),
        },
        credentials: "include",
        cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}


