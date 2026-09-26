import { NextResponse } from "next/server";
import { getCandidateProfile, saveCandidateProfile } from "@/lib/candidate/service";
import type { CandidateProfile } from "@/types/candidate";

export async function GET() {
  const profile = await getCandidateProfile();
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Partial<CandidateProfile>;
    const profile = await saveCandidateProfile(body as CandidateProfile);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile save failed", error);
    return NextResponse.json(
      { error: "Profile could not be saved." },
      { status: 500 },
    );
  }
}
