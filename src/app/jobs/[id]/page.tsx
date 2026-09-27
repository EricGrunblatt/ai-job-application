"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { ericGrunblattProfile } from "@/lib/candidate/profile";
import { sampleJobs } from "@/lib/jobs/sample";
import { matchJobToProfile } from "@/lib/jobs/matching";

function buildCoverLetter(job: (typeof sampleJobs)[number]) {
  return `Dear Hiring Team,\n\nI am excited to apply for the ${job.title} role at ${job.company}. My background in software engineering, platform automation, and developer tooling aligns closely with the technical and operational challenges described in this position.\n\nAt GEICO, I have built and standardized CI/CD workflows, release governance systems, and observability improvements that helped teams ship faster with more reliable deployments. I have also supported large-scale migration efforts and platform enablement programs that improved developer experience while reducing manual overhead.\n\nI would welcome the opportunity to bring that experience to ${job.company}, particularly around platform reliability, delivery automation, and engineering enablement. Thank you for your time and consideration.\n\nSincerely,\n${ericGrunblattProfile.firstName} ${ericGrunblattProfile.lastName}`;
}

function JobReviewPage() {
  const params = useParams<{ id: string }>();
  const [isReviewing, setIsReviewing] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeDraft, setResumeDraft] = useState<{
    professionalSummary: string;
    skills: string[];
    experience: Array<{ company: string; role: string; bullets: Array<{ text: string }> }>;
  } | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isApproved, setIsApproved] = useState(false);

  const job = sampleJobs.find((entry) => entry.id === params.id) ?? sampleJobs[0];
  const match = matchJobToProfile(ericGrunblattProfile, job);

  const handlePrepareApplication = async () => {
    setResumeLoading(true);
    setIsReviewing(true);

    try {
      const tailoredResponse = await fetch("/api/resume/tailor", { method: "POST" });
      const tailoredPayload = (await tailoredResponse.json()) as { resume?: typeof resumeDraft };
      if (tailoredPayload.resume) {
        setResumeDraft(tailoredPayload.resume);
      }

      const coverLetterResponse = await fetch("/api/resume/cover-letter", { method: "POST" });
      const coverLetterPayload = (await coverLetterResponse.json()) as { letter?: string };
      if (coverLetterPayload.letter) {
        setCoverLetter(coverLetterPayload.letter);
      }

      const response = await fetch("/api/resume/generate", { method: "POST" });
      const payload = (await response.json()) as { url?: string };
      setResumeUrl(payload.url ?? "/generated/resume.pdf");
    } catch {
      setResumeUrl("/generated/resume.pdf");
      setCoverLetter(buildCoverLetter(job));
    }

    setResumeLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Job review</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{job.title}</h1>
            <p className="mt-2 text-lg text-slate-600">{job.company} · {job.location.join(", ")}</p>
          </div>
          <Link href="/jobs" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Back to jobs
          </Link>
        </div>

        <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Analyzed match score</p>
              <p className="mt-2 text-3xl font-semibold text-sky-900">{match.skillMatchScore}%</p>
            </div>
            <div className="w-full max-w-xs">
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-sky-900">
                <span>Skill alignment</span>
                <span>{match.skillMatchScore}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-sky-100">
                <div className="h-full rounded-full bg-sky-600" style={{ width: `${match.skillMatchScore}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold">Company overview</h2>
              <p className="mt-3 text-slate-700">
                {job.companySummary ||
                  `${job.company} is a company operating in the software and infrastructure space, with a focus on building tools that support engineering teams and product delivery.`}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold">Why this role matches</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
                {match.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold">Matched skills</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {match.matchedSkills.length ? (
                  match.matchedSkills.map((skill) => (
                    <span key={skill} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-600">No direct skill overlap detected.</span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold">Potential gaps</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
                {match.gaps.length ? (
                  match.gaps.map((gap) => <li key={gap}>{gap}</li>)
                ) : (
                  <li>No major gaps identified.</li>
                )}
              </ul>
            </div>

            {isReviewing && (
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-5">
                <h2 className="text-lg font-semibold text-sky-900">Application package review</h2>
                <div className="mt-4 space-y-4">
                  <div className="rounded-lg border border-sky-200 bg-white p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h3 className="font-medium text-slate-800">Resume</h3>
                      {resumeUrl ? (
                        <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-sky-700 hover:text-sky-800">
                          Open PDF
                        </a>
                      ) : null}
                    </div>
                    {resumeLoading ? (
                      <p className="text-sm text-slate-600">Generating resume preview…</p>
                    ) : resumeDraft ? (
                      <div className="space-y-2 text-sm text-slate-700">
                        <p>{resumeDraft.professionalSummary}</p>
                        <div className="flex flex-wrap gap-2">
                          {resumeDraft.skills.slice(0, 6).map((skill) => (
                            <span key={skill} className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                              {skill}
                            </span>
                          ))}
                        </div>
                        <ul className="list-disc space-y-1 pl-4">
                          {resumeDraft.experience.slice(0, 2).flatMap((entry) =>
                            entry.bullets.slice(0, 2).map((bullet) => <li key={`${entry.company}-${bullet.text}`}>{bullet.text}</li>),
                          )}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">No preview generated yet.</p>
                    )}
                  </div>

                  <div className="rounded-lg border border-sky-200 bg-white p-3">
                    <h3 className="mb-2 font-medium text-slate-800">Cover letter</h3>
                    <textarea
                      value={coverLetter}
                      onChange={(event) => setCoverLetter(event.target.value)}
                      rows={10}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    />
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <h3 className="font-medium text-amber-900">Attention items</h3>
                    <p className="mt-1 text-sm text-amber-800">Review the generated materials before submitting. This is the final human approval point.</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold">Role snapshot</h2>
              <dl className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-slate-500">Remote</dt>
                  <dd>{job.remotePolicy}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-slate-500">Salary</dt>
                  <dd>
                    {job.salary?.min && job.salary?.max
                      ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`
                      : "Not disclosed"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-slate-500">Seniority</dt>
                  <dd>{job.seniority ?? "Unknown"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-slate-500">Required skills</dt>
                  <dd>{job.requiredSkills.length}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-medium text-slate-500">Match score</dt>
                  <dd>{match.skillMatchScore}%</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold">Decision</h2>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handlePrepareApplication}
                  className="flex-1 rounded-full bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-400"
                  disabled={resumeLoading}
                >
                  {resumeLoading ? "Preparing…" : isReviewing ? "Refresh review" : "Prepare application"}
                </button>
                <button type="button" className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  Skip
                </button>
              </div>

              {isReviewing && (
                <button
                  type="button"
                  onClick={() => setIsApproved(true)}
                  className="mt-3 w-full rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {isApproved ? "Approved for review" : "Approve application package"}
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default JobReviewPage;
