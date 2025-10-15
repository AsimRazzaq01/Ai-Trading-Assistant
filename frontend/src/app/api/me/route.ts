import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    const backend = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${backend}/auth/me`, {
        method: "GET",
        headers: { Cookie: req.headers.get("cookie") ?? "" },
        credentials: "include",
        cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}