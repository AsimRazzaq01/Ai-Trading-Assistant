// frontend/src/app/api/market-chat/route.ts

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        // ✅ Determine backend URL: use internal URL if available, otherwise public URL
        const backend =
            process.env.API_URL_INTERNAL?.trim() ||
            process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
            "http://localhost:8000";

        // ✅ Forward cookies for authentication
        const cookie = req.headers.get("cookie") ?? "";

        // ✅ Call backend to get chat messages
        const response = await fetch(`${backend}/chat/messages`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(cookie ? { Cookie: cookie } : {}),
            },
            credentials: "include",
        }).catch((err) => {
            console.error("❌ Network error calling backend:", err);
            return null;
        });

        // Handle network errors or failed responses
        if (!response) {
            return NextResponse.json(
                { messages: [] },
                { status: 200 }
            );
        }

        if (!response.ok) {
            // Return empty messages on error
            return NextResponse.json(
                { messages: [] },
                { status: 200 }
            );
        }

        const data = await response.json().catch(() => ({
            messages: [],
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
            { messages: [] },
            { status: 200 }
        );
    }
}

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

        // ✅ Call backend chat endpoint with OpenAI integration
        const response = await fetch(`${backend}/chat/message`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(cookie ? { Cookie: cookie } : {}),
            },
            body: JSON.stringify({ message }),
            credentials: "include",
        }).catch((err) => {
            console.error("❌ Network error calling backend:", err);
            return null;
        });

        // Handle network errors or failed responses
        if (!response) {
            return NextResponse.json(
                { 
                    error: "Failed to connect to chat service. Please try again later.",
                    response: "I'm having trouble connecting right now. Please check your connection and try again."
                },
                { status: 503 }
            );
        }

        if (!response.ok) {
            // Try to get error details from backend
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || errorData.error || "Failed to process chat message";
            
            return NextResponse.json(
                { 
                    error: errorMessage,
                    response: `Sorry, I encountered an error: ${errorMessage}. Please try again.`
                },
                { status: response.status }
            );
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

