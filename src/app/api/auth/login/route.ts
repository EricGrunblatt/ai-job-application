import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { loginUser } from "@/lib/auth/store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const identifier = String(body.identifier ?? "").trim();
    const password = String(body.password ?? "").trim();

    const user = await loginUser({ identifier, password });

    if (!user) {
      return NextResponse.json({ error: "Invalid email/username or password." }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set("session_user", user.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign in.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
