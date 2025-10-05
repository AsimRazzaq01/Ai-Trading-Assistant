import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    const backend = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const body = await req.json();
    const res = await fetch(`${backend}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return NextResponse.json(await res.json(), { status: res.status });
}