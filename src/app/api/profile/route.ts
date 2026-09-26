import { NextResponse } from "next/server";
import { getCandidateProfile } from "@/lib/candidate/service";

export async function GET() {
  const profile = await getCandidateProfile();
  return NextResponse.json(profile);
}
