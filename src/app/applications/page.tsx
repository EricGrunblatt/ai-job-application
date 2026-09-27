"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { generateCoverLetter } from "@/lib/ai/services/coverLetter";
import { ericGrunblattProfile } from "@/lib/candidate/profile";
import { matchJobToProfile } from "@/lib/jobs/matching";
import { sampleJob } from "@/lib/jobs/sample";
import { tailorResumeForJob } from "@/lib/resume/tailor";

const job = sampleJob;
const baseMatch = matchJobToProfile(ericGrunblattProfile, job);

const initialResume = tailorResumeForJob({
  profile: ericGrunblattProfile,
  job,
});

const initialCoverLetter = generateCoverLetter({
  profile: ericGrunblattProfile,
  job,
});

const sampleQuestions = [
  {
    question: "Describe your experience with CI/CD and release governance.",
    answer:
      "I have built reusable CI/CD workflows, release governance controls, and deployment automation across Azure DevOps and GitHub, with a focus on platform safety and developer enablement.",
    confidence: "High confidence",
    requiresReview: false,
  },
  {
    question: "How many years of Kubernetes experience do you have?",
    answer: null,
    confidence: "Low confidence",
    requiresReview: true,
    reason: "No verified Kubernetes experience is currently stored in the profile.",
  },
  {
    question: "What observability tooling are you strongest in?",
    answer:
      "My strongest experience is in Grafana Loki, Prometheus, and LogQL-based observability delivery, including large-scale migration work from Splunk.",
    confidence: "High confidence",
    requiresReview: false,
  },
];

export default function ApplicationsDashboardPage() {
  const [resume, setResume] = useState(initialResume);
  const [coverLetter, setCoverLetter] = useState(initialCoverLetter);
  const [approved, setApproved] = useState(false);
  const [resumePdfUrl, setResumePdfUrl] = useState<string | null>(null);
  const [coverLetterPdfUrl, setCoverLetterPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const match = useMemo(() => matchJobToProfile(ericGrunblattProfile, job), []);

  const handleGenerateFinalPreview = async () => {
    setIsGenerating(true);

    try {
      const [resumeResponse, coverResponse] = await Promise.all([
        fetch("/api/resume/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile: ericGrunblattProfile,
            job,
            resumeDraft: resume,
            fileName: "final-review-resume.pdf",
          }),
        }),
        fetch("/api/resume/cover-letter/pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile: ericGrunblattProfile,
            job,
            coverLetterText: coverLetter,
            fileName: "final-review-cover-letter.pdf",
          }),
        }),
      ]);

      const resumePayload = (await resumeResponse.json()) as { ok?: boolean; url?: string; error?: string };
      const coverPayload = (await coverResponse.json()) as { ok?: boolean; url?: string; error?: string };

      if (!resumeResponse.ok || !resumePayload.ok || !resumePayload.url) {
        throw new Error(resumePayload.error ?? "Resume preview could not be generated.");
      }

      if (!coverResponse.ok || !coverPayload.ok || !coverPayload.url) {
        throw new Error(coverPayload.error ?? "Cover letter preview could not be generated.");
      }

      setResumePdfUrl(resumePayload.url);
      setCoverLetterPdfUrl(coverPayload.url);
    } catch (error) {
      console.error("Final preview generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                Application dashboard
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">{job.title}</h1>
              <p className="mt-2 text-lg text-slate-600">
                {job.company} · {job.location.join(", ")}
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/jobs/${job.id}`}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Back to job
              </Link>
              <button
                type="button"
                onClick={() => setApproved((current) => !current)}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                {approved ? "Approved" : "Approve package"}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Salary</div>
              <div className="mt-2 text-lg font-semibold">
                {job.salary?.min && job.salary?.max
                  ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`
                  : "Not disclosed"}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Remote</div>
              <div className="mt-2 text-lg font-semibold">{job.remotePolicy}</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Seniority</div>
              <div className="mt-2 text-lg font-semibold">{job.seniority ?? "Unknown"}</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Match</div>
              <div className="mt-2 text-lg font-semibold">{match.skillMatchScore}%</div>
            </div>

            <button
              type="button"
              onClick={handleGenerateFinalPreview}
              disabled={isGenerating}
              className="rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-400"
            >
              {isGenerating ? "Generating…" : "Generate final PDFs"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Tailored resume</h2>
                <button
                  type="button"
                  onClick={() => setResume(tailorResumeForJob({ profile: ericGrunblattProfile, job }))}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 hover:bg-slate-100"
                >
                  Refresh
                </button>
              </div>

              {resumePdfUrl ? (
                <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 p-3">
                  <a href={resumePdfUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-sky-700 hover:text-sky-800">
                    Open final resume PDF
                  </a>
                </div>
              ) : null}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-base font-medium text-slate-800">Professional summary</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{resume.professionalSummary}</p>
              </div>

              <div className="mt-4">
                <p className="text-base font-medium text-slate-800">Top skills</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {resume.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {resume.experience.map((entry) => (
                  <div key={`${entry.company}-${entry.role}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-slate-800">{entry.company}</p>
                        <p className="text-sm text-slate-600">{entry.role}</p>
                      </div>
                      <span className="text-xs uppercase tracking-[0.14em] text-slate-500">{entry.dates}</span>
                    </div>

                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                      {entry.bullets.map((bullet) => (
                        <li key={bullet.text}>{bullet.text}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Cover letter</h2>
                {coverLetterPdfUrl ? (
                  <a href={coverLetterPdfUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-sky-700 hover:text-sky-800">
                    Open final cover-letter PDF
                  </a>
                ) : null}
              </div>
              <textarea
                value={coverLetter}
                onChange={(event) => setCoverLetter(event.target.value)}
                rows={12}
                className="mt-4 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-700 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Application questions</h2>
              <div className="mt-4 space-y-4">
                {sampleQuestions.map((item) => (
                  <div key={item.question} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-800">{item.question}</p>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                          item.requiresReview
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {item.confidence}
                      </span>
                    </div>

                    {item.answer ? (
                      <p className="mt-2 text-sm leading-6 text-slate-700">{item.answer}</p>
                    ) : (
                      <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        {item.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-amber-900">Attention items</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-amber-800">
                <li>Kubernetes experience needs human confirmation before application submission.</li>
                <li>Resume and cover letter are ready for review but not yet approved.</li>
                <li>Final submission should remain gated until the user approves the package.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
