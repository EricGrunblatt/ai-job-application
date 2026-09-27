import { NextResponse } from "next/server";

import { ericGrunblattProfile } from "@/lib/candidate/profile";
import { sampleJob } from "@/lib/jobs/sample";
import { tailorResumeForJob, validateTailoredResume } from "@/lib/resume/tailor";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      profile?: typeof ericGrunblattProfile;
      job?: typeof sampleJob;
    };

    const profile = body.profile ?? ericGrunblattProfile;
    const job = body.job ?? sampleJob;
    const resume = tailorResumeForJob({ profile, job });
    const validation = validateTailoredResume(resume, profile);

    return NextResponse.json({
      ok: validation.valid,
      resume,
      validation,
    });
  } catch (error) {
    console.error("Resume tailoring failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Resume tailoring failed.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  const resume = tailorResumeForJob({
    profile: ericGrunblattProfile,
    job: sampleJob,
  });

  const validation = validateTailoredResume(resume, ericGrunblattProfile);

  return NextResponse.json({
    ok: validation.valid,
    resume,
    validation,
  });
}
