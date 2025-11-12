// frontend/src/app/api/market-chat/route.ts

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message } = body;

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // ✅ Determine backend URL: use internal URL if available, otherwise public URL
        const backend =
            process.env.API_URL_INTERNAL?.trim() ||
            process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
            "http://localhost:8000";

        // ✅ Forward cookies for authentication
        const cookie = req.headers.get("cookie") ?? "";

        // ✅ Call backend chat endpoint (to be implemented)
        // For now, return a placeholder response
        const response = await fetch(`${backend}/chat/message`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(cookie ? { Cookie: cookie } : {}),
            },
            body: JSON.stringify({ message }),
            credentials: "include",
        }).catch(() => null);

        // If backend endpoint doesn't exist yet, return a helpful response
        if (!response || !response.ok) {
            return NextResponse.json({
                response: `I received your message: "${message}". The chat backend endpoint is being set up. This is a placeholder response.`,
            });
        }

        const data = await response.json().catch(() => ({
            response: "I'm processing your request...",
        }));

        const nextRes = NextResponse.json(data, { status: 200 });

        // ✅ Forward cookies
        const setCookie = response.headers.get("set-cookie");
        if (setCookie) {
            nextRes.headers.set("set-cookie", setCookie);
        }

        return nextRes;
    } catch (err) {
        console.error("❌ Market Chat API error:", err);
        return NextResponse.json(
            { error: "Failed to process chat message" },
            { status: 500 }
        );
    }
}

