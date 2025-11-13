// frontend/src/app/api/pattern-trends/route.ts

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const backend =
    process.env.API_URL_INTERNAL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8000";

// GET - Fetch pattern trends
export async function GET(req: NextRequest) {
    try {
        const cookie = req.headers.get("cookie") ?? "";
        const authHeader = req.headers.get("authorization");

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        let response: Response;
        try {
            response = await fetch(`${backend}/pattern-trends`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...(authHeader ? { Authorization: authHeader } : {}),
                    ...(cookie ? { Cookie: cookie } : {}),
                },
                credentials: "include",
                cache: "no-store",
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
        } catch (fetchError: any) {
            clearTimeout(timeoutId);
            
            if (fetchError.name === 'AbortError') {
                console.error("❌ Request timeout - backend not responding");
                return NextResponse.json(
                    { detail: `Backend connection timeout. The backend at ${backend} is not responding.` },
                    { status: 504 }
                );
            }
            
            // Check if it's a network error
            if (fetchError.code === 'ECONNREFUSED' || fetchError.message?.includes('fetch failed')) {
                console.error(`❌ Connection refused to ${backend}`);
                return NextResponse.json(
                    { detail: `Cannot connect to backend at ${backend}. Please ensure FastAPI is running.` },
                    { status: 503 }
                );
            }
            
            throw fetchError;
        }

        if (!response.ok) {
            if (response.status === 401) {
                return NextResponse.json(
                    { detail: "Unauthorized" },
                    { status: 401 }
                );
            }
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { detail: errorData.detail || "Failed to fetch pattern trends" },
                { status: response.status }
            );
        }

        const data = await response.json();
        const nextRes = NextResponse.json(data, { status: response.status });

        // Forward cookies
        const setCookie = response.headers.get("set-cookie");
        if (setCookie) {
            nextRes.headers.set("set-cookie", setCookie);
        }

        return nextRes;
    } catch (err: any) {
        console.error("❌ /api/pattern-trends GET error:", err);
        return NextResponse.json(
            { detail: err.message || "Failed to fetch pattern trends" },
            { status: 500 }
        );
    }
}

// POST - Add symbol to pattern trends
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const cookie = req.headers.get("cookie") ?? "";
        const authHeader = req.headers.get("authorization");

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        let response: Response;
        try {
            response = await fetch(`${backend}/pattern-trends`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(authHeader ? { Authorization: authHeader } : {}),
                    ...(cookie ? { Cookie: cookie } : {}),
                },
                body: JSON.stringify(body),
                credentials: "include",
                cache: "no-store",
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
        } catch (fetchError: any) {
            clearTimeout(timeoutId);
            
            if (fetchError.name === 'AbortError') {
                console.error("❌ Request timeout - backend not responding");
                return NextResponse.json(
                    { detail: `Backend connection timeout. The backend at ${backend} is not responding.` },
                    { status: 504 }
                );
            }
            
            // Check if it's a network error
            if (fetchError.code === 'ECONNREFUSED' || fetchError.message?.includes('fetch failed')) {
                console.error(`❌ Connection refused to ${backend}`);
                return NextResponse.json(
                    { detail: `Cannot connect to backend at ${backend}. Please ensure FastAPI is running.` },
                    { status: 503 }
                );
            }
            
            throw fetchError;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { detail: errorData.detail || "Failed to add to pattern trends" },
                { status: response.status }
            );
        }

        const data = await response.json();
        const nextRes = NextResponse.json(data, { status: response.status });

        // Forward cookies
        const setCookie = response.headers.get("set-cookie");
        if (setCookie) {
            nextRes.headers.set("set-cookie", setCookie);
        }

        return nextRes;
    } catch (err: any) {
        console.error("❌ /api/pattern-trends POST error:", err);
        return NextResponse.json(
            { detail: err.message || "Failed to add to pattern trends" },
            { status: 500 }
        );
    }
}

