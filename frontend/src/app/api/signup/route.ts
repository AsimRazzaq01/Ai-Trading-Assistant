import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: { email, hashedPassword },
      select: { id: true, email: true, createdAt: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }
}
