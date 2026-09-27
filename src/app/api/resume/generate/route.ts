import { NextResponse } from "next/server";

import { ericGrunblattProfile } from "@/lib/candidate/profile";
import { sampleJob } from "@/lib/jobs/sample";
import { generateResumePdfPreview } from "@/lib/resume/pdf";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      profile?: typeof ericGrunblattProfile;
      job?: typeof sampleJob;
      fileName?: string;
    };

    const profile = body.profile ?? ericGrunblattProfile;
    const job = body.job ?? sampleJob;

    const result = await generateResumePdfPreview({
      profile,
      job,
      fileName: body.fileName,
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error("Resume PDF generation failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Resume PDF could not be generated.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  const result = await generateResumePdfPreview({
    profile: ericGrunblattProfile,
    job: sampleJob,
  });

  return NextResponse.json({
    ok: true,
    ...result,
  });
}
