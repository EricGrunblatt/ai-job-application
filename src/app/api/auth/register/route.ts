import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { registerUser } from "@/lib/auth/store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = String(body.email ?? "").trim();
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "").trim();

    const user = await registerUser({ firstName, lastName, email, username, password });
    const cookieStore = await cookies();

    cookieStore.set("session_user", user.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
