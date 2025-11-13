// frontend/src/app/api/risk-management/route.ts

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const backend =
    process.env.API_URL_INTERNAL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8000";

// GET - Fetch risk management settings
export async function GET(req: NextRequest) {
    try {
        const cookie = req.headers.get("cookie") ?? "";
        const authHeader = req.headers.get("authorization");

        const response = await fetch(`${backend}/risk-management/settings`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader ? { Authorization: authHeader } : {}),
                ...(cookie ? { Cookie: cookie } : {}),
            },
            credentials: "include",
            cache: "no-store",
        });

        if (!response.ok) {
            if (response.status === 401) {
                return NextResponse.json(
                    { detail: "Unauthorized" },
                    { status: 401 }
                );
            }
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { detail: errorData.detail || "Failed to fetch risk settings" },
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
    } catch (err) {
        console.error("❌ /api/risk-management GET error:", err);
        return NextResponse.json(
            { detail: "Failed to fetch risk settings" },
            { status: 500 }
        );
    }
}

// PUT - Update risk management settings
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const cookie = req.headers.get("cookie") ?? "";
        const authHeader = req.headers.get("authorization");

        const response = await fetch(`${backend}/risk-management/settings`, {
            method: "PUT",
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
        console.error("❌ /api/risk-management PUT error:", err);
        return NextResponse.json(
            { detail: "Failed to update risk settings" },
            { status: 500 }
        );
    }
}

