import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
          AI Job Application Assistant
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
          Manage your profile and job search from one place.
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          This app is intentionally simple right now: review your candidate profile and jump into the job pipeline.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/profile"
            className="rounded-xl border border-slate-200 bg-slate-50 p-6 transition hover:border-sky-300 hover:bg-sky-50"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Profile
            </div>
            <div className="mt-3 text-2xl font-semibold text-slate-900">View your profile</div>
            <p className="mt-2 text-slate-600">Review candidate details, work history, skills, and preferences.</p>
          </Link>

          <Link
            href="/jobs"
            className="rounded-xl border border-slate-200 bg-slate-50 p-6 transition hover:border-sky-300 hover:bg-sky-50"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Jobs
            </div>
            <div className="mt-3 text-2xl font-semibold text-slate-900">Search and review roles</div>
            <p className="mt-2 text-slate-600">Browse normalized job postings and inspect the match details.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
