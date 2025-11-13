// frontend/src/app/api/watchlist/route.ts

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const backend =
    process.env.API_URL_INTERNAL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
    "http://localhost:8000";

// GET - Fetch user's watchlist
export async function GET(req: NextRequest) {
    try {
        const cookie = req.headers.get("cookie") ?? "";
        const authHeader = req.headers.get("authorization");

        const response = await fetch(`${backend}/watchlist`, {
            method: "GET",
            headers: {
                ...(authHeader ? { Authorization: authHeader } : {}),
                ...(cookie ? { Cookie: cookie } : {}),
            },
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
        console.error("❌ /api/watchlist GET error:", err);
        return NextResponse.json(
            { detail: "Failed to fetch watchlist" },
            { status: 500 }
        );
    }
}

// POST - Add symbol to watchlist
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const cookie = req.headers.get("cookie") ?? "";
        const authHeader = req.headers.get("authorization");

        const response = await fetch(`${backend}/watchlist`, {
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
        console.error("❌ /api/watchlist POST error:", err);
        return NextResponse.json(
            { detail: "Failed to add to watchlist" },
            { status: 500 }
        );
    }
}

