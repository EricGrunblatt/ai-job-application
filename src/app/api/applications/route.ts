import { NextResponse } from "next/server";

import { createApplicationRecord, listApplicationRecords, saveApplicationRecord } from "@/lib/applications/service";
import { sampleJob } from "@/lib/jobs/sample";

export async function GET() {
  const applications = await listApplicationRecords();
  return NextResponse.json({
    ok: true,
    applications,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      job?: typeof sampleJob;
      resumeText?: string;
      coverLetterText?: string;
      resumePdfUrl?: string;
      coverLetterPdfUrl?: string;
      status?: "DISCOVERED" | "SELECTED" | "PREPARING" | "READY_FOR_REVIEW" | "SUBMITTED" | "WITHDRAWN" | "REJECTED" | "INTERVIEWING" | "OFFER";
      approved?: boolean;
      notes?: string;
      metadata?: Record<string, unknown>;
    };

    const job = body.job ?? sampleJob;
    const record = createApplicationRecord({
      job,
      resumeText: body.resumeText,
      coverLetterText: body.coverLetterText,
      resumePdfUrl: body.resumePdfUrl,
      coverLetterPdfUrl: body.coverLetterPdfUrl,
      status: body.status ?? "READY_FOR_REVIEW",
      approved: body.approved ?? false,
      notes: body.notes,
      metadata: body.metadata,
    });

    const saved = await saveApplicationRecord(record);
    return NextResponse.json({ ok: true, application: saved });
  } catch (error) {
    console.error("Application record creation failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Application could not be saved.",
      },
      { status: 500 },
    );
  }
}
