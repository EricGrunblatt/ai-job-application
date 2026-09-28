import Link from "next/link";

const workflowSteps = [
  "Create your account and complete the onboarding resume upload.",
  "Review the imported profile and correct any incorrect fields.",
  "Search roles and inspect transparent match reasons.",
  "Prepare the tailored resume and cover letter.",
  "Review the final application package and approve it before any submission.",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
          AI Job Application Assistant
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
          Complete your profile, then move through a guided review workflow.
        </h1>

        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Start by creating your profile from a real resume PDF, review the imported details, and then move through the job search and application package flow with explicit approval at each decision point.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/onboarding"
            className="rounded-xl border border-slate-200 bg-slate-50 p-6 transition hover:border-sky-300 hover:bg-sky-50"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              1. Onboard
            </div>
            <div className="mt-3 text-2xl font-semibold text-slate-900">Upload your resume</div>
            <p className="mt-2 text-slate-600">Create your profile from a real PDF and let the app extract the baseline details for you.</p>
          </Link>

          <Link
            href="/profile"
            className="rounded-xl border border-slate-200 bg-slate-50 p-6 transition hover:border-sky-300 hover:bg-sky-50"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              2. Profile
            </div>
            <div className="mt-3 text-2xl font-semibold text-slate-900">Review and edit experience</div>
            <p className="mt-2 text-slate-600">Update your work history, skills, goals, and projects before applying to jobs.</p>
          </Link>

          <Link
            href="/jobs"
            className="rounded-xl border border-slate-200 bg-slate-50 p-6 transition hover:border-sky-300 hover:bg-sky-50"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              3. Jobs
            </div>
            <div className="mt-3 text-2xl font-semibold text-slate-900">Search and review roles</div>
            <p className="mt-2 text-slate-600">Browse normalized job postings and inspect the transparent match details.</p>
          </Link>

          <Link
            href="/applications"
            className="rounded-xl border border-slate-200 bg-slate-50 p-6 transition hover:border-sky-300 hover:bg-sky-50"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              4. Review
            </div>
            <div className="mt-3 text-2xl font-semibold text-slate-900">Approve the final package</div>
            <p className="mt-2 text-slate-600">Check the tailored resume, cover letter, and answer drafts before proceeding.</p>
          </Link>
        </div>

        <div className="mt-10 rounded-2xl border border-sky-200 bg-sky-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Linear workflow</p>
          <ol className="mt-4 space-y-3 text-slate-700">
            {workflowSteps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
}
