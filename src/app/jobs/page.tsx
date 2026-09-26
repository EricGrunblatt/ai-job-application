"use client";

import { useMemo, useState } from "react";
import { sampleJob } from "@/lib/jobs/sample";

function formatLabel(value: string | undefined, fallback: string) {
  if (!value) return fallback;

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function formatDate(value: string | undefined) {
  if (!value) return "Not specified";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not specified";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

const jobQueue = [
  sampleJob,
  {
    ...sampleJob,
    id: "job-demo-2",
    company: "Signal Forge",
    title: "Senior Site Reliability Engineer",
    description:
      "Lead reliability improvements, observability strategy, and operational automation across production systems in a cloud-native environment.",
    salary: { min: 185000, max: 220000, currency: "USD", period: "annual" },
    requiredSkills: ["Kubernetes", "Observability", "Terraform", "Go"],
    preferredSkills: ["Grafana", "Prometheus", "AWS", "Leadership"],
    publishedAt: "2026-09-20T00:00:00Z",
  },
  {
    ...sampleJob,
    id: "job-demo-3",
    company: "North Harbor",
    title: "DevOps Engineer",
    description:
      "Own CI/CD pipelines, configuration management, and infrastructure reliability for product teams shipping customer-facing services.",
    salary: { min: 145000, max: 180000, currency: "USD", period: "annual" },
    requiredSkills: ["GitHub Actions", "Docker", "AWS", "Linux"],
    preferredSkills: ["Python", "Terraform", "Monitoring"],
    publishedAt: "2026-09-18T00:00:00Z",
  },
];

export default function JobsPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const currentCriteria = {
    roles: ["Senior Platform Engineer", "Senior Software Engineer"],
    locations: ["Remote - United States"],
    remote: "Remote",
    salary: "$150,000+",
  };

  const allSelected = selectedIds.length === jobQueue.length && jobQueue.length > 0;

  const toggleSelect = (jobId: string) => {
    setSelectedIds((current) =>
      current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId],
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds((current) => (current.length === jobQueue.length ? [] : jobQueue.map((job) => job.id)));
  };

  const selectedCount = selectedIds.length;

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-sky-700">
              Job review queue
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Opportunities</h1>
            <p className="mt-2 text-lg text-slate-600">
              Review matches, decide to apply or pass, and batch-select several roles at once.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Selected: {selectedCount}</div>
            <div>Batch actions ready</div>
          </div>
        </div>

        <section className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-lg font-semibold">Current job criteria</h2>
          <p className="mt-2 text-sm text-slate-600">
            This app is still in its profile-driven prototype stage. There is not yet a dedicated job-search form, so the current criteria are derived from the candidate profile and the next milestone will add a real search UI.
          </p>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <div>
              <span className="font-semibold">Roles:</span> {currentCriteria.roles.join(", ")}
            </div>
            <div>
              <span className="font-semibold">Locations:</span> {currentCriteria.locations.join(", ")}
            </div>
            <div>
              <span className="font-semibold">Remote:</span> {currentCriteria.remote}
            </div>
            <div>
              <span className="font-semibold">Minimum salary:</span> {currentCriteria.salary}
            </div>
          </div>
        </section>

        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
            <span className="relative inline-flex h-5 w-5 items-center justify-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="peer sr-only"
              />
              <span className="absolute inset-0 rounded-md border border-slate-300 bg-white transition peer-checked:border-sky-600 peer-checked:bg-sky-600 peer-focus-visible:ring-4 peer-focus-visible:ring-sky-200" />
              <svg
                viewBox="0 0 16 16"
                className="absolute h-3.5 w-3.5 fill-none stroke-white stroke-[2.5] opacity-0 transition peer-checked:opacity-100"
                aria-hidden="true"
              >
                <path d="M3.5 8.5 6.5 11.5 12.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Select all jobs
          </label>
          <div className="flex gap-2">
            <button className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
              Skip selected
            </button>
            <button className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
              Apply selected
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {jobQueue.map((job) => {
            const isSelected = selectedIds.includes(job.id);

            return (
              <article
                key={job.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-sky-200 hover:shadow-md"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
                    <span className="relative inline-flex h-5 w-5 items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(job.id)}
                        className="peer sr-only"
                      />
                      <span className="absolute inset-0 rounded-md border border-slate-300 bg-white transition peer-checked:border-sky-600 peer-checked:bg-sky-600 peer-focus-visible:ring-4 peer-focus-visible:ring-sky-200" />
                      <svg
                        viewBox="0 0 16 16"
                        className="absolute h-3.5 w-3.5 fill-none stroke-white stroke-[2.5] opacity-0 transition peer-checked:opacity-100"
                        aria-hidden="true"
                      >
                        <path d="M3.5 8.5 6.5 11.5 12.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    Select
                  </label>

                  <div className="flex gap-2">
                    <button className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-rose-700 hover:bg-rose-100">
                      Deny
                    </button>
                    <button className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-emerald-700">
                      Apply
                    </button>
                  </div>
                </div>

                <div className="mb-5 flex items-start justify-between gap-6 border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-sky-700">
                      {formatLabel(job.source, "Source")}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">{job.title}</h2>
                    <p className="mt-1 text-lg text-slate-600">
                      {job.company} · {job.location.join(", ")}
                    </p>
                  </div>

                  <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                    <div className="font-semibold">{formatLabel(job.remotePolicy, "Unknown")}</div>
                    <div>{formatLabel(job.employmentType, "Unknown")}</div>
                  </div>
                </div>

                <section className="grid gap-6 md:grid-cols-4">
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
                    <div className="mt-2 text-lg font-semibold">
                      {formatLabel(job.seniority, "Not specified")}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Posted
                    </div>
                    <div className="mt-2 text-lg font-semibold">{formatDate(job.publishedAt)}</div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Match
                    </div>
                    <div className="mt-2 text-lg font-semibold">Strong fit</div>
                  </div>
                </section>

                <section className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <h3 className="text-lg font-semibold">Why it matches</h3>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
                      <li>Strong alignment with platform and cloud infrastructure work.</li>
                      <li>Remote-first role with salary above your preferred threshold.</li>
                      <li>Relevant CI/CD and infrastructure tooling overlap.</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-lg font-semibold">Required skills</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.requiredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
