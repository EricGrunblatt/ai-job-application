import Link from "next/link";

import { ericGrunblattProfile } from "@/lib/candidate/profile";
import { sampleJobs } from "@/lib/jobs/sample";
import { matchJobToProfile } from "@/lib/jobs/matching";

export default async function JobReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = sampleJobs.find((entry) => entry.id === id) ?? sampleJobs[0];
  const match = matchJobToProfile(ericGrunblattProfile, job);

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
                <button type="button" className="flex-1 rounded-full bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700">
                  Prepare application
                </button>
                <button type="button" className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  Skip
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
