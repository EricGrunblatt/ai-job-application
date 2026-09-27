import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getUserById } from "@/lib/auth/store";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;

  if (!userId) {
    return NextResponse.json({ user: null });
  }

  const user = await getUserById(userId);
  return NextResponse.json({ user: user ?? null });
}
