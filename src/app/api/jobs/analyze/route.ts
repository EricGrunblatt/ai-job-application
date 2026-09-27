import { NextResponse } from "next/server";

import { analyzeJobDescription } from "@/lib/ai/services/jobAnalyzer";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      source?: string;
      sourceJobId?: string;
      url?: string;
      company?: string;
      title?: string;
      description?: string;
    };

    const description = body.description?.trim();
    if (!description) {
      return NextResponse.json({ error: "A job description is required." }, { status: 400 });
    }

    const job = await analyzeJobDescription({
      ...body,
      description,
    });
    return NextResponse.json(job);
  } catch (error) {
    console.error("Job analysis failed", error);
    return NextResponse.json({ error: "Job analysis failed." }, { status: 500 });
  }
}
