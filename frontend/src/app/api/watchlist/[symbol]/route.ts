// frontend/src/app/api/watchlist/[symbol]/route.ts

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const backend =
    process.env.API_URL_INTERNAL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
    "http://localhost:8000";

// DELETE - Remove symbol from watchlist
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ symbol: string }> }
) {
    try {
        const { symbol } = await params;
        const cookie = req.headers.get("cookie") ?? "";
        const authHeader = req.headers.get("authorization");

        const response = await fetch(`${backend}/watchlist/${symbol}`, {
            method: "DELETE",
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
        console.error("❌ /api/watchlist/[symbol] DELETE error:", err);
        return NextResponse.json(
            { detail: "Failed to remove from watchlist" },
            { status: 500 }
        );
    }
}

