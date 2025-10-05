import { NextRequest, NextResponse } from "next/server";


export const runtime = "nodejs";


export async function POST(req: NextRequest) {
    const body = await req.json();
    const backend = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";


    const res = await fetch(`${backend}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
    });


    const next = NextResponse.json(await res.json(), { status: res.status });


// Mirror backend Set-Cookie to frontend domain so server components can see it
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) next.headers.set("set-cookie", setCookie);


    return next;
}
