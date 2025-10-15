import { NextRequest, NextResponse } from "next/server";


export async function POST(_req: NextRequest) {
    const backend = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${backend}/auth/logout`, {
        method: "POST",
        credentials: "include",
    });


    const next = NextResponse.json({ ok: true }, { status: 200 });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) next.headers.set("set-cookie", setCookie);
    next.headers.set("Location", "/login");
    return next;
}