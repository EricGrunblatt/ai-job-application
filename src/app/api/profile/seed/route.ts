import { NextResponse } from "next/server";
import { ericGrunblattProfile } from "@/lib/candidate/profile";

export async function POST() {
  return NextResponse.json({
    message: "Profile seed loaded.",
    profile: ericGrunblattProfile,
  });
}
