<<<<<<< HEAD:frontend/app/api/login/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, user.hashedPassword);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  return NextResponse.json({ message: "Login successful", user: { id: user.id, email: user.email } });
=======
//frontend/src/app/api/login/route.ts

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // ✅ Ensures it runs on the server

export async function POST(req: NextRequest) {
    try {
        // ✅ Use the right backend URL (internal when in Docker)
        const backend =
            process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000";

        const body = await req.json();

        // ✅ Send login request to FastAPI
        const res = await fetch(`${backend}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            credentials: "include", // Important for cookie auth
        });

        // ✅ Try parsing backend response safely
        let data;
        try {
            data = await res.json();
        } catch {
            data = { message: "Invalid JSON response from backend" };
        }

        // ✅ Forward backend JSON + status
        const next = NextResponse.json(data, { status: res.status });

        // ✅ Mirror backend Set-Cookie header so SSR components see auth state
        const setCookie = res.headers.get("set-cookie");
        if (setCookie) {
            next.headers.set("set-cookie", setCookie);
        }

        return next;
    } catch (err: any) {
        console.error("❌ Login API error:", err);
        return NextResponse.json(
            { error: "Login failed. Backend may be unreachable." },
            { status: 500 }
        );
    }
>>>>>>> main:frontend/src/app/api/login/route.ts
}
