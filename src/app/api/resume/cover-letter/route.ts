import { NextResponse } from "next/server";

import { ericGrunblattProfile } from "@/lib/candidate/profile";
import { buildCoverLetterDraft } from "@/lib/ai/services/coverLetter";
import { sampleJob } from "@/lib/jobs/sample";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      profile?: typeof ericGrunblattProfile;
      job?: typeof sampleJob;
    };

    const profile = body.profile ?? ericGrunblattProfile;
    const job = body.job ?? sampleJob;
    const draft = buildCoverLetterDraft({ profile, job });

    return NextResponse.json({
      ok: true,
      subject: draft.subject,
      letter: draft.body,
      draft,
    });
  } catch (error) {
    console.error("Cover letter generation failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Cover letter could not be generated.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  const draft = buildCoverLetterDraft({
    profile: ericGrunblattProfile,
    job: sampleJob,
  });

  return NextResponse.json({
    ok: true,
    subject: draft.subject,
    letter: draft.body,
    draft,
  });
}
