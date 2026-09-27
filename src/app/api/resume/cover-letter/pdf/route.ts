import { NextResponse } from "next/server";

import { ericGrunblattProfile } from "@/lib/candidate/profile";
import { sampleJob } from "@/lib/jobs/sample";
import { generateCoverLetterPdfPreview } from "@/lib/resume/pdf";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      profile?: typeof ericGrunblattProfile;
      job?: typeof sampleJob;
      coverLetterText?: string;
      fileName?: string;
    };

    const profile = body.profile ?? ericGrunblattProfile;
    const job = body.job ?? sampleJob;
    const coverLetterText = body.coverLetterText ?? "";

    const result = await generateCoverLetterPdfPreview({
      profile,
      job,
      coverLetterText,
      fileName: body.fileName,
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error("Cover letter PDF generation failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Cover letter PDF could not be generated.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  const result = await generateCoverLetterPdfPreview({
    profile: ericGrunblattProfile,
    job: sampleJob,
    coverLetterText: "This is a sample cover letter preview.",
  });

  return NextResponse.json({
    ok: true,
    ...result,
  });
}
