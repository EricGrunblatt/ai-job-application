import { sampleJob } from "@/lib/jobs/sample";

export default function JobsPage() {
  const job = sampleJob;

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-sky-700">
              Job snapshot
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{job.title}</h1>
            <p className="mt-2 text-lg text-slate-600">
              {job.company} · {job.location.join(", ")}
            </p>
          </div>

          <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            <div className="font-semibold">{job.remotePolicy}</div>
            <div>{job.employmentType ?? "unknown"}</div>
          </div>
        </div>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Salary
            </div>
            <div className="mt-2 text-lg font-semibold">
              {job.salary?.min && job.salary?.max
                ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`
                : job.salary?.min
                  ? `$${job.salary.min.toLocaleString()}+`
                  : "Not disclosed"}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Seniority
            </div>
            <div className="mt-2 text-lg font-semibold">{job.seniority ?? "Not specified"}</div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Source
            </div>
            <div className="mt-2 text-lg font-semibold">{job.source}</div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
          <div>
            <h2 className="text-xl font-semibold">Description</h2>
            <p className="mt-3 whitespace-pre-line text-slate-700">{job.description}</p>

            <h2 className="mt-8 text-xl font-semibold">Responsibilities</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
              {job.responsibilities.length ? (
                job.responsibilities.map((item) => <li key={item}>{item}</li>)
              ) : (
                <li>No responsibilities captured.</li>
              )}
            </ul>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-lg font-semibold">Required skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.requiredSkills.length ? (
                  job.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No required skills listed.</span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-lg font-semibold">Preferred skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.preferredSkills.length ? (
                  job.preferredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm text-sky-800"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No preferred skills listed.</span>
                )}
              </div>
            </div>

            {job.url ? (
              <a
                href={job.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                View original posting
              </a>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
