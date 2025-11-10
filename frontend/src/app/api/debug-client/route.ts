import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
    const backend =
        process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
        "https://profitpath-api-production.up.railway.app";

    const echo = await fetch(`${backend}/debug/echo`, {
        method: "GET",
        credentials: "include",
    }).then((r) => r.json());

    const decode = await fetch(`${backend}/debug/decode`, {
        method: "GET",
        credentials: "include",
    }).then((r) => r.json());

    return NextResponse.json({
        backend_used: backend,
        echo,
        decode,
    });
}
